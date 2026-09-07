import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'
import postgres from 'npm:postgres@3'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const password = Deno.env.get('ADMIN_LEADS_PASSWORD')
    if (!password) throw new Error('ADMIN_LEADS_PASSWORD secret not set')
    if (password.length < 6) throw new Error('Password must be at least 6 characters')

    const email = 'leads-admin@madmonkeyhostels.com'
    const sql = postgres(Deno.env.get('SUPABASE_DB_URL')!, { max: 1 })

    const updated = await sql`
      update auth.users
      set encrypted_password = crypt(${password}, gen_salt('bf')),
          email_confirmed_at = coalesce(email_confirmed_at, now()),
          updated_at = now()
      where email = ${email}
      returning id
    `
    await sql.end()
    if (updated.length === 0) throw new Error('Admin user not found')

    // Verify sign-in works with the new password
    const anon = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      auth: { persistSession: false },
    })
    const { error: signInErr } = await anon.auth.signInWithPassword({ email, password })

    return new Response(
      JSON.stringify({ updated: true, signInWorks: !signInErr, signInError: signInErr?.message ?? null }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
