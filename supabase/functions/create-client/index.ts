import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Verify the caller is an authenticated coach
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return errorResponse('No autorizado', 401)
    }

    const callerClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user: callerUser }, error: callerError } = await callerClient.auth.getUser()
    if (callerError || !callerUser) {
      return errorResponse('No autorizado', 401)
    }

    const { data: coachData, error: coachError } = await adminClient
      .from('coaches')
      .select('id')
      .eq('user_id', callerUser.id)
      .single()

    if (coachError || !coachData) {
      return errorResponse('Solo los entrenadores pueden agregar clientes', 403)
    }

    const body = await req.json()
    const {
      email,
      password,
      full_name,
      phone,
      date_of_birth,
      gender,
      height_cm,
      weight_kg,
      fitness_level,
      goals,
      injuries,
      medical_conditions,
    } = body

    if (!email || !password || !full_name) {
      return errorResponse('El correo, contraseña y nombre son obligatorios', 400)
    }

    // Create the auth user (confirmed immediately so the coach doesn't need to wait)
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    })

    if (authError) {
      return errorResponse(authError.message, 400)
    }

    const newUserId = authData.user.id

    // Create the public users record
    const { error: userInsertError } = await adminClient
      .from('users')
      .insert({
        id: newUserId,
        email,
        full_name,
        phone: phone || null,
      })

    if (userInsertError) {
      await adminClient.auth.admin.deleteUser(newUserId)
      return errorResponse(userInsertError.message, 400)
    }

    // Create the clients record linked to the coach
    const { data: clientData, error: clientInsertError } = await adminClient
      .from('clients')
      .insert({
        user_id: newUserId,
        coach_id: coachData.id,
        date_of_birth: date_of_birth || null,
        gender: gender || null,
        height_cm: height_cm ? Number(height_cm) : null,
        weight_kg: weight_kg ? Number(weight_kg) : null,
        fitness_level: fitness_level || null,
        goals: goals ?? [],
        injuries: injuries ?? [],
        medical_conditions: medical_conditions ?? [],
      })
      .select()
      .single()

    if (clientInsertError) {
      await adminClient.auth.admin.deleteUser(newUserId)
      return errorResponse(clientInsertError.message, 400)
    }

    return new Response(
      JSON.stringify({ client: { ...clientData, full_name, email } }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Error inesperado', 500)
  }
})

function errorResponse(message: string, status: number) {
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
