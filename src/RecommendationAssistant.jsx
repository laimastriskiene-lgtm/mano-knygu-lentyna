import { useState } from 'react'
import './RecommendationAssistant.css'

function RecommendationAssistant({ session, initializing }) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])

  function handleSubmit(event) {
    event.preventDefault()
    const text = message.trim()
    if (!text || !session) return
    setMessages((current) => [...current, text])
    setMessage('')
  }

  return (
    <details className="recommendation-assistant">
      <summary>Knygų rekomendacijų asistentas</summary>
      <div className="assistant-content">
        <p className="assistant-notice">DI atsakymai dar neprijungti. Jūsų žinutės rodomos tik šiame lange ir niekur nesiunčiamos.</p>
        {initializing ? <p role="status">Atkuriama prisijungimo būsena…</p> : !session ? (
          <p>Norėdami naudotis asistentu, <a href="#paskyra">prisijunkite</a>.</p>
        ) : (
          <>
            <div className="assistant-history" aria-label="Pokalbio istorija" aria-live="polite">
              {messages.length === 0 ? <p className="assistant-empty">Čia bus rodomos jūsų žinutės.</p> : (
                <ol>{messages.map((text, index) => <li key={index}><span>Jūs</span><p>{text}</p></li>)}</ol>
              )}
            </div>
            <form className="assistant-form" onSubmit={handleSubmit}>
              <label htmlFor="assistant-message">Jūsų žinutė</label>
              <textarea id="assistant-message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Papasakokite, kokių knygų ieškote…" maxLength={1000} rows={3} />
              <button className="primary-button" type="submit" disabled={!message.trim()}>Siųsti žinutę</button>
            </form>
          </>
        )}
      </div>
    </details>
  )
}

export default RecommendationAssistant