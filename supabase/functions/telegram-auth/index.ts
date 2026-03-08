import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function verifyTelegramHash(data: Record<string, string>, botToken: string): boolean {
  const { hash, ...rest } = data
  if (!hash) return false

  const dataCheckString = Object.keys(rest)
    .sort()
    .map(k => `${k}=${rest[k]}`)
    .join('\n')

  // SHA256(bot_token) as HMAC key
  const encoder = new TextEncoder()
  const keyData = encoder.encode(botToken)
  const messageData = encoder.encode(dataCheckString)

  return crypto.subtle
    .importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    .then(key => crypto.subtle.sign('HMAC', key, messageData))
    .then(sig => {
      const hex = Array.from(new Uint8Array(sig))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
      return hex === hash
    }) as unknown as boolean
}

async function verifyTelegramHashAsync(
  data: Record<string, string>,
  botToken: string,
): Promise<boolean> {
  const { hash, ...rest } = data
  if (!hash) return false

  const dataCheckString = Object.keys(rest)
    .sort()
    .map(k => `${k}=${rest[k]}`)
    .join('\n')

  const encoder = new TextEncoder()

  // secret_key = SHA256(bot_token)
  const rawKey = await crypto.subtle.digest('SHA-256', encoder.encode(botToken))

  const hmacKey = await crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const signature = await crypto.subtle.sign('HMAC', hmacKey, encoder.encode(dataCheckString))

  const hex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  return hex === hash
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
    if (!botToken) {
      return new Response(JSON.stringify({ error: 'TELEGRAM_BOT_TOKEN not set' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json()
    const { id, first_name, last_name, username, photo_url, auth_date, hash } = body

    if (!id || !hash || !auth_date) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Build data object for verification (only non-null fields)
    const tgData: Record<string, string> = { id: String(id), auth_date: String(auth_date), hash }
    if (first_name) tgData.first_name = first_name
    if (last_name) tgData.last_name = last_name
    if (username) tgData.username = username
    if (photo_url) tgData.photo_url = photo_url

    // Verify hash
    const valid = await verifyTelegramHashAsync(tgData, botToken)
    if (!valid) {
      return new Response(JSON.stringify({ error: 'Invalid hash' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check auth_date not older than 1 hour
    if (Date.now() / 1000 - Number(auth_date) > 3600) {
      return new Response(JSON.stringify({ error: 'Auth data expired' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Connect to Supabase (service role for admin operations)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const telegramId = String(id)
    const name = [first_name, last_name].filter(Boolean).join(' ') || 'Клиент'

    // Upsert user
    const { data: user, error: userError } = await supabase
      .from('users')
      .upsert(
        {
          telegram_id: telegramId,
          name,
          username: username || null,
          photo_url: photo_url || null,
        },
        { onConflict: 'telegram_id' },
      )
      .select()
      .single()

    if (userError) {
      console.error('[telegram-auth] upsert error:', userError)
      return new Response(JSON.stringify({ error: 'DB error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create session
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .insert({ user_id: user.id })
      .select()
      .single()

    if (sessionError) {
      console.error('[telegram-auth] session error:', sessionError)
      return new Response(JSON.stringify({ error: 'Session error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(
      JSON.stringify({
        userId: user.id,
        token: session.token,
        user: {
          id: user.id,
          telegram_id: user.telegram_id,
          name: user.name,
          username: user.username,
          photo_url: user.photo_url,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (err) {
    console.error('[telegram-auth] unexpected error:', err)
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
