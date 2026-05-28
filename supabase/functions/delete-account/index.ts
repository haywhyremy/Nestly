// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req: Request) => {
  // 1. Handle CORS preflight options request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // 2. Reject non-POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method Not Allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // 3. Extract and validate JWT authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Missing internal environment configuration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. Create user client to authenticate user session securely
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false }
    })

    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized user session token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = user.id

    // 5. Create admin client bypassing RLS policies using service role key
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    })

    // ==========================================
    // GDPR CLEANUP TRANSACTIONS
    // ==========================================

    // A. Update profile: set display name to 'Deleted user' and clear display label
    const { error: profileError } = await adminClient
      .from('profiles')
      .update({ display_name: 'Deleted user', display_label: null })
      .eq('id', userId)

    if (profileError) {
      throw new Error(`Profile anonymization failed: ${profileError.message}`)
    }

    // B. Anonymize all logged events: override author's logged_by_name
    const { error: eventsError } = await adminClient
      .from('events')
      .update({ logged_by_name: 'Deleted user' })
      .eq('logged_by', userId)

    if (eventsError) {
      throw new Error(`Events log anonymization failed: ${eventsError.message}`)
    }

    // C. Remove all household connections from roster
    const { error: membersError } = await adminClient
      .from('household_members')
      .delete()
      .eq('user_id', userId)

    if (membersError) {
      throw new Error(`Household memberships removal failed: ${membersError.message}`)
    }

    // D. Delete auth record from Supabase authentication table
    const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(userId)

    if (deleteUserError) {
      throw new Error(`Auth account deletion failed: ${deleteUserError.message}`)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('GDPR Account Deletion Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Server Error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
