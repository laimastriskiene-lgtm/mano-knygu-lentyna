import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export function useAuth() {
  const [session, setSession] = useState(null)
  const [initializing, setInitializing] = useState(Boolean(supabase))
  const [error, setError] = useState('')
  useEffect(() => {
    if (!supabase) return
    let active = true
    let eventReceived = false
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return
      eventReceived = true
      setSession(nextSession)
      setInitializing(false)
      setError('')
    })
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active || eventReceived) return
      if (sessionError) throw sessionError
      setSession(data.session)
      setInitializing(false)
    }).catch(() => {
      if (!active || eventReceived) return
      setError('Nepavyko atkurti prisijungimo. Patikrinkite interneto ryšį ir perkraukite puslapį.')
      setInitializing(false)
    })
    return () => { active = false; subscription.unsubscribe() }
  }, [])
  return { session, setSession, initializing, error }
}
