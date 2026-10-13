import { useRef, useState } from 'react'
import { supabase, supabaseConfigurationError } from './lib/supabase'
import './AuthPanel.css'

function authErrorMessage(error) {
  const messages = {
    invalid_credentials: 'Neteisingas el. paštas arba slaptažodis.',
    email_not_confirmed: 'Prieš prisijungdami patvirtinkite el. paštą: paspauskite gautame laiške esančią nuorodą.',
    user_already_exists: 'Šiuo el. paštu paskyra jau užregistruota. Pabandykite prisijungti.',
    email_exists: 'Šiuo el. paštu paskyra jau užregistruota. Pabandykite prisijungti.',
    weak_password: 'Slaptažodis per silpnas. Naudokite ilgesnį slaptažodį su raidėmis, skaičiais ir simboliais.',
    over_email_send_rate_limit: 'Per dažnai siunčiami laiškai. Palaukite ir bandykite dar kartą.',
    over_request_rate_limit: 'Per daug bandymų. Palaukite ir bandykite dar kartą.',
    signup_disabled: 'Naujų paskyrų registracija šiuo metu išjungta.',
    email_address_invalid: 'Įveskite galiojantį el. pašto adresą.',
    email_address_not_authorized: 'Šiuo adresu registruotis kol kas negalima. Susisiekite su aplikacijos administratoriumi.',
  }
  return messages[error?.code] || 'Veiksmo atlikti nepavyko. Patikrinkite interneto ryšį ir bandykite dar kartą.'
}

function AuthPanel({ session, initializing, setSession }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(supabaseConfigurationError)
  const [message, setMessage] = useState('')
  const pending = useRef(false)

  async function submit(event) {
    event.preventDefault()
    if (!supabase || pending.current) return
    pending.current = true
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const credentials = { email: email.trim(), password }
      const { data, error: authError } = mode === 'register'
        ? await supabase.auth.signUp({ ...credentials, options: { emailRedirectTo: window.location.origin + window.location.pathname } })
        : await supabase.auth.signInWithPassword(credentials)
      if (authError) throw authError
      setSession(data.session)
      setPassword('')
      setMessage(mode === 'register'
        ? data.session ? 'Registracija sėkminga. Esate prisijungę.' : 'Patikrinkite el. paštą. Jei registracija galima, gausite patvirtinimo laišką. Paspauskite jo nuorodą ir prisijunkite. Jei laiško nėra, patikrinkite šlamšto aplanką arba bandykite prisijungti turima paskyra.'
        : 'Sėkmingai prisijungėte.')
    } catch (authError) {
      setError(authErrorMessage(authError))
    } finally { pending.current = false; setBusy(false) }
  }

  async function signOut() {
    if (!supabase || pending.current) return
    pending.current = true
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const { error: authError } = await supabase.auth.signOut({ scope: 'local' })
      if (authError) throw authError
      setSession(null)
      setPassword('')
      setMessage('Sėkmingai atsijungėte.')
    } catch (authError) {
      setError(authErrorMessage(authError))
    } finally { pending.current = false; setBusy(false) }
  }

  function changeMode(nextMode) {
    setMode(nextMode)
    setPassword('')
    setError(supabaseConfigurationError)
    setMessage('')
  }

  return (
    <section id="paskyra" className="auth-section" aria-labelledby="auth-title">
      <span className="eyebrow">TAVO PASKYRA</span>
      <h2 id="auth-title">{session ? 'Sveiki sugrįžę!' : mode === 'register' ? 'Sukurti paskyrą' : 'Prisijungti'}</h2>
      {initializing ? <p role="status">Atkuriama prisijungimo būsena…</p> : session ? (
        <div className="auth-account"><p>Prisijungę kaip <strong>{session.user.email}</strong></p><button className="primary-button" type="button" disabled={busy} onClick={signOut}>{busy ? 'Atsijungiama…' : 'Atsijungti'}</button></div>
      ) : (
        <>
          <div className="auth-modes" aria-label="Paskyros veiksmai">
            <button type="button" aria-pressed={mode === 'login'} disabled={busy} onClick={() => changeMode('login')}>Prisijungti</button>
            <button type="button" aria-pressed={mode === 'register'} disabled={busy} onClick={() => changeMode('register')}>Registruotis</button>
          </div>
          <form className="auth-form" onSubmit={submit}>
            <label htmlFor="auth-email">El. paštas</label>
            <input id="auth-email" type="email" autoComplete="email" required value={email} disabled={busy || !supabase} onChange={(event) => setEmail(event.target.value)} />
            <label htmlFor="auth-password">Slaptažodis</label>
            <input id="auth-password" type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} required minLength={mode === 'register' ? 6 : undefined} value={password} disabled={busy || !supabase} onChange={(event) => setPassword(event.target.value)} aria-describedby={mode === 'register' ? 'password-hint' : undefined} />
            {mode === 'register' && <p id="password-hint" className="auth-hint">Bent 6 simboliai. Gali būti taikomi papildomi slaptažodžio stiprumo reikalavimai.</p>}
            <button className="primary-button" type="submit" disabled={busy || !supabase}>{busy ? 'Palaukite…' : mode === 'register' ? 'Registruotis' : 'Prisijungti'}</button>
          </form>
        </>
      )}
      {error && <p className="error-message" role="alert">{error}</p>}
      {message && <p className="auth-success" role="status">{message}</p>}
    </section>
  )
}
export default AuthPanel
