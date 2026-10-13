import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
let client = null
let configurationError = ''
if (!url || !key) {
  configurationError = 'Prisijungimas nesukonfigūruotas. Patikrinkite Supabase nustatymus .env.local faile ir iš naujo paleiskite aplikaciją.'
} else {
  try {
    client = createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  } catch {
    configurationError = 'Supabase nustatymai neteisingi. Patikrinkite projekto URL ir viešąjį raktą.'
  }
}
export const supabase = client
export const supabaseConfigurationError = configurationError
