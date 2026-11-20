import { useEffect, useRef, useState } from 'react'
import './RecommendationAssistant.css'

function RecommendationAssistant({ session, initializing }) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const requestRef = useRef(null)

  useEffect(() => () => {
    requestRef.current?.abort()
    requestRef.current = null
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    const text = message.trim()
    if (!text || !session?.access_token || requestRef.current) return

    const controller = new AbortController()
    requestRef.current = controller
    setLoading(true)
    setError('')
    setMessages((current) => [...current, { role: 'user', text }])
    setMessage('')

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ message: text }),
        signal: controller.signal,
      })
      if (response.status === 401) throw new Error('Prisijungimo sesija negalioja. Prisijunkite iš naujo.')
      if (response.status === 429) throw new Error('Per daug užklausų. Palaukite ir bandykite dar kartą.')
      if (!response.ok) throw new Error('Nepavyko gauti atsakymo. Bandykite dar kartą.')
      const data = await response.json()
      if (typeof data.reply !== 'string' || !data.reply.trim()) throw new Error('Gautas netinkamas atsakymas. Bandykite dar kartą.')
      if (requestRef.current === controller) {
        setMessages((current) => [...current, { role: 'assistant', text: data.reply }])
      }
    } catch (requestError) {
      if (requestRef.current === controller && !controller.signal.aborted) {
        setError(requestError instanceof TypeError ? 'Nepavyko prisijungti. Patikrinkite interneto ryšį ir bandykite dar kartą.' : requestError.message)
      }
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null
        setLoading(false)
      }
    }
  }

  return (
    <details className="recommendation-assistant">
      <summary>Knygų rekomendacijų asistentas</summary>
      <div className="assistant-content">
        <p className="assistant-notice">Jūsų žinutės siunčiamos DI paslaugai, kad gautumėte rekomendacijų. Pokalbis saugomas tik šiame lange.</p>
        {initializing ? <p role="status">Atkuriama prisijungimo būsena…</p> : !session ? (
          <p>Norėdami naudotis asistentu, <a href="#paskyra">prisijunkite</a>.</p>
        ) : (
          <>
            <div className="assistant-history" aria-label="Pokalbio istorija" aria-live="polite">
              {messages.length === 0 ? <p className="assistant-empty">Čia bus rodomas jūsų pokalbis.</p> : (
                <ol>{messages.map((item, index) => <li key={index} className={item.role === 'assistant' ? 'assistant-reply' : undefined}><span>{item.role === 'assistant' ? 'Asistentas' : 'Jūs'}</span><p>{item.text}</p></li>)}</ol>
              )}
              {loading && <p className="assistant-thinking" role="status">Asistentas galvoja...</p>}
            </div>
            {error && <p className="error-message" role="alert">{error}</p>}
            <form className="assistant-form" onSubmit={handleSubmit}>
              <label htmlFor="assistant-message">Jūsų žinutė</label>
              <textarea id="assistant-message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Papasakokite, kokių knygų ieškote…" maxLength={1000} rows={3} disabled={loading} />
              <button className="primary-button" type="submit" disabled={loading || !message.trim() || !session.access_token}>Siųsti žinutę</button>
            </form>
          </>
        )}
      </div>
    </details>
  )
}

export default RecommendationAssistant