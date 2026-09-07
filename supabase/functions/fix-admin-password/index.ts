import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const password = Deno.env.get('ADMIN_LEADS_PASSWORD')
    if (!password) throw new Error('ADMIN_LEADS_PASSWORD secret not set')
    if (password.length < 6) throw new Error('Password must be at least 6 characters')

    const url = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } })

    const email = 'leads-admin@madmonkeyhostels.com'
    const { data: list, error: listErr } = await admin.auth.admin.listUsers()
    if (listErr) throw listErr
    const user = list.users.find((u) => u.email === email)
    if (!user) throw new Error('Admin user not found')

    const { error: updErr } = await admin.auth.admin.updateUserById(user.id, { password })
    if (updErr) throw updErr

    // Verify sign-in works with the new password
    const anon = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { auth: { persistSession: false } })
    const { error: signInErr } = await anon.auth.signInWithPassword({ email, password })

    return new Response(JSON.stringify({ updated: true, signInWorks: !signInErr, signInError: signInErr?.message ?? null }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
