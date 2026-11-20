/* global process, Buffer */
import { createClient } from '@supabase/supabase-js'

export const config = { api: { bodyParser: false } }

const MAX_BODY_BYTES = 8192
const MAX_UPSTREAM_BYTES = 65536
const MAX_MESSAGE_LENGTH = 1000
const MAX_REPLY_LENGTH = 4000

async function readBody(request) {
  const chunks = []
  let size = 0
  for await (const chunk of request) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += bytes.length
    if (size > MAX_BODY_BYTES) throw new Error('body_too_large')
    chunks.push(bytes)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Leidžiamos tik POST užklausos.' })
  }

  const authorization = request.headers.authorization || ''
  const token = /^Bearer\s+(\S+)$/i.exec(authorization)?.[1]
  if (!token) return response.status(401).json({ error: 'Prisijunkite, kad galėtumėte naudotis asistentu.' })

  const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim()
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
  const apiKey = process.env.OPENROUTER_API_KEY?.trim()
  const model = process.env.OPENROUTER_MODEL?.trim()
  if (!supabaseUrl || !supabaseKey || !apiKey || model !== 'openrouter/free') {
    return response.status(503).json({ error: 'Asistentas dar nesukonfigūruotas.' })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data.user) {
      return response.status(401).json({ error: 'Prisijungimo sesija negalioja. Prisijunkite iš naujo.' })
    }
  } catch {
    return response.status(503).json({ error: 'Nepavyko patikrinti prisijungimo. Bandykite dar kartą.' })
  }

  let body
  try {
    body = await readBody(request)
  } catch (error) {
    return error.message === 'body_too_large'
      ? response.status(413).json({ error: 'Užklausa per didelė.' })
      : response.status(400).json({ error: 'Neteisingas užklausos formatas.' })
  }
  if (!body || typeof body !== 'object' || Array.isArray(body) ||
      typeof body.message !== 'string' || !body.message.trim() ||
      body.message.length > MAX_MESSAGE_LENGTH) {
    return response.status(400).json({ error: 'Įveskite žinutę iki 1000 simbolių.' })
  }

  try {
    const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'Atsakyk lietuviškai. Padėk vartotojui pasirinkti knygas.' },
          { role: 'user', content: body.message.trim() },
        ],
        max_tokens: 500,
      }),
      signal: AbortSignal.timeout(20000),
    })
    if (upstream.status === 429) {
      return response.status(429).json({ error: 'Per daug užklausų. Palaukite ir bandykite dar kartą.' })
    }
    if (!upstream.ok) return response.status(502).json({ error: 'DI paslauga laikinai nepasiekiama.' })
    const chunks = []
    let responseSize = 0
    if (!upstream.body) throw new Error('empty_response')
    for await (const chunk of upstream.body) {
      responseSize += chunk.byteLength
      if (responseSize > MAX_UPSTREAM_BYTES) throw new Error('response_too_large')
      chunks.push(Buffer.from(chunk))
    }
    const result = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    const reply = result?.choices?.[0]?.message?.content
    if (typeof reply !== 'string' || !reply.trim()) {
      return response.status(502).json({ error: 'DI paslauga pateikė netinkamą atsakymą.' })
    }
    return response.status(200).json({ reply: reply.slice(0, MAX_REPLY_LENGTH) })
  } catch {
    return response.status(502).json({ error: 'Nepavyko gauti DI atsakymo. Bandykite dar kartą.' })
  }
}