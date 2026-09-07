import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'
import bcrypt from 'npm:bcryptjs@2.4.3'
import { SignJWT, jwtVerify } from 'npm:jose@5.9.6'
import { z } from 'npm:zod@3.23.8'

const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' }
const encoder = new TextEncoder()
const BodySchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('login'), password: z.string().min(6).max(200) }),
  z.object({ action: z.literal('list'), token: z.string().min(1) }),
  z.object({
    action: z.literal('change-password'),
    token: z.string().min(1),
    currentPassword: z.string().min(6).max(200),
    newPassword: z.string().min(8).max(200),
  }),
])

const response = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: jsonHeaders })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return response({ error: 'Method not allowed' }, 405)

  try {
    const parsed = BodySchema.safeParse(await req.json())
    if (!parsed.success) return response({ error: 'Invalid request' }, 400)

    const url = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const signingSecret = Deno.env.get('ADMIN_SESSION_SECRET')
    const initialPassword = Deno.env.get('ADMIN_LEADS_PASSWORD')
    if (!url || !serviceKey || !signingSecret || !initialPassword) {
      return response({ error: 'Admin access is not configured' }, 500)
    }

    const db = createClient(url, serviceKey, { auth: { persistSession: false } })
    const signingKey = encoder.encode(signingSecret)
    const { data: security, error: securityError } = await db
      .from('admin_security')
      .select('password_hash, session_version')
      .eq('singleton', true)
      .single()
    if (securityError || !security) return response({ error: 'Admin access is unavailable' }, 500)

    let passwordHash = security.password_hash as string | null
    if (!passwordHash) {
      passwordHash = await bcrypt.hash(initialPassword, 12)
      const { error } = await db
        .from('admin_security')
        .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
        .eq('singleton', true)
        .is('password_hash', null)
      if (error) return response({ error: 'Admin access is unavailable' }, 500)
    }

    const verifyToken = async (token: string) => {
      const { payload } = await jwtVerify(token, signingKey, { issuer: 'all-in-admin', audience: 'admin-leads' })
      if (payload.sub !== 'admin' || payload.version !== security.session_version) throw new Error('Invalid session')
    }

    if (parsed.data.action === 'login') {
      const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
      const fingerprintBytes = await crypto.subtle.digest('SHA-256', encoder.encode(forwarded))
      const fingerprint = Array.from(new Uint8Array(fingerprintBytes)).map((b) => b.toString(16).padStart(2, '0')).join('')
      const { data: attempt } = await db.from('admin_login_attempts').select('*').eq('fingerprint', fingerprint).maybeSingle()
      const now = Date.now()
      if (attempt?.blocked_until && new Date(attempt.blocked_until).getTime() > now) {
        return response({ error: 'Too many attempts. Try again later.' }, 429)
      }

      const valid = await bcrypt.compare(parsed.data.password, passwordHash)
      if (!valid) {
        const windowExpired = !attempt || now - new Date(attempt.window_started_at).getTime() > 15 * 60 * 1000
        const failedCount = windowExpired ? 1 : Number(attempt.failed_count) + 1
        const blockedUntil = failedCount >= 5 ? new Date(now + 15 * 60 * 1000).toISOString() : null
        await db.from('admin_login_attempts').upsert({
          fingerprint,
          failed_count: failedCount,
          window_started_at: windowExpired ? new Date().toISOString() : attempt.window_started_at,
          blocked_until: blockedUntil,
          updated_at: new Date().toISOString(),
        })
        return response({ error: 'Incorrect password.' }, 401)
      }

      await db.from('admin_login_attempts').delete().eq('fingerprint', fingerprint)
      const token = await new SignJWT({ version: security.session_version })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject('admin')
        .setIssuer('all-in-admin')
        .setAudience('admin-leads')
        .setIssuedAt()
        .setExpirationTime('8h')
        .sign(signingKey)
      return response({ token })
    }

    await verifyToken(parsed.data.token)

    if (parsed.data.action === 'list') {
      const { data, error } = await db.from('leads').select('*').order('created_at', { ascending: false })
      if (error) return response({ error: 'Could not load leads' }, 500)
      return response({ leads: data ?? [] })
    }

    const currentValid = await bcrypt.compare(parsed.data.currentPassword, passwordHash)
    if (!currentValid) return response({ error: 'Current password is incorrect.' }, 401)
    if (parsed.data.currentPassword === parsed.data.newPassword) {
      return response({ error: 'Choose a different new password.' }, 400)
    }
    const nextHash = await bcrypt.hash(parsed.data.newPassword, 12)
    const { error } = await db.from('admin_security').update({
      password_hash: nextHash,
      session_version: security.session_version + 1,
      updated_at: new Date().toISOString(),
    }).eq('singleton', true)
    if (error) return response({ error: 'Could not change password' }, 500)
    return response({ changed: true })
  } catch {
    return response({ error: 'Your admin session has expired. Sign in again.' }, 401)
  }
})