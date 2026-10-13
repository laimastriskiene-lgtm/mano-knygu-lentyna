import { useRef, useState } from 'react'
import './App.css'

function BookIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v15M12 5C9 3 5 3 2 4v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Z" /></svg>
}

function BookCard({ book }) {
  const [coverFailed, setCoverFailed] = useState(false)
  return (
    <article className="book-card">
      <div className="book-cover">
        {book.cover_i && !coverFailed ? <img src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg?default=false`} alt={`Knygos „${book.title}“ viršelis`} loading="lazy" onError={() => setCoverFailed(true)} /> : <div className="cover-placeholder"><BookIcon /><span>Viršelio nėra</span></div>}
      </div>
      <div className="book-info">
        <h3>{book.title}</h3>
        <p>{Array.isArray(book.author_name) && book.author_name.length ? book.author_name.join(', ') : 'Autorius nežinomas'}</p>
        <span className="book-year">{book.first_publish_year ? `${book.first_publish_year} m.` : 'Leidimo metai nežinomi'}</span>
        <a className="book-link" href={`https://openlibrary.org${book.key}`} target="_blank" rel="noopener noreferrer" aria-label={`Peržiūrėti „${book.title}“ Open Library (naujame skirtuke)`}>Apie knygą <span aria-hidden="true">↗</span></a>
      </div>
    </article>
  )
}

function App() {
  const [query, setQuery] = useState('')
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchedQuery, setSearchedQuery] = useState('')
  const inputRef = useRef(null)
  const requestRef = useRef(null)

  async function searchBooks(event) {
    event.preventDefault()
    const search = query.trim()
    if (!search) {
      setError('Įveskite knygos pavadinimą arba autorių.')
      inputRef.current?.focus()
      return
    }
    requestRef.current?.abort()
    const controller = new AbortController()
    requestRef.current = controller
    setLoading(true)
    setError('')
    setBooks([])
    setSearchedQuery(search)
    const timeout = setTimeout(() => controller.abort(), 15000)
    try {
      const params = new URLSearchParams({ q: search, limit: '12', fields: 'key,title,author_name,cover_i,first_publish_year', lang: 'lt' })
      const response = await fetch(`https://openlibrary.org/search.json?${params}`, { signal: controller.signal })
      if (!response.ok) throw new Error('Search failed')
      const data = await response.json()
      if (!Array.isArray(data.docs)) throw new Error('Invalid response')
      const seen = new Set()
      setBooks(data.docs.filter((book) => {
        if (!book || typeof book.title !== 'string' || typeof book.key !== 'string' || !/^\/works\/OL\d+W$/.test(book.key) || seen.has(book.key)) return false
        seen.add(book.key)
        return true
      }))
    } catch {
      if (requestRef.current === controller) setError('Nepavyko gauti knygų. Patikrinkite interneto ryšį ir bandykite dar kartą.')
    } finally {
      clearTimeout(timeout)
      if (requestRef.current === controller) setLoading(false)
    }
  }

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#pradzia"><span className="brand-icon"><BookIcon /></span>Mano knygų lentyna</a>
        <nav aria-label="Pagrindinė navigacija"><a href="#paieska">Atrask knygas</a><a href="#lentyna">Mano lentyna</a></nav>
      </header>
      <main id="pradzia">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <span className="eyebrow"><span aria-hidden="true">✦</span> KIEKVIENAI KNYGAI – SAVO VIETA</span>
            <h1 id="hero-title">Kita tavo istorija<br />prasideda <em>čia.</em></h1>
            <p>Atrask knygas, kurios įtraukia. Ir vietą, kurioje tilps<br className="desktop-break" /> visos tavo skaitymo istorijos.</p>
            <a className="primary-button" href="#paieska" onClick={() => inputRef.current?.focus()}>Atrasti knygą <span aria-hidden="true">→</span></a>
            <span className="hero-note">Mažiau pamirštų pavadinimų. Daugiau gerų knygų.</span>
          </div>
          <div className="hero-art" aria-hidden="true">
            <span className="art-spark spark-one">✧</span><span className="art-spark spark-two">✦</span>
            <div className="illustrated-book book-back"><span>VIENAS<br />PUSLAPIS<br />KASDIEN</span><div className="book-lines" /></div>
            <div className="illustrated-book book-front"><span className="cover-kicker">TAVO NAUJA</span><span className="cover-title">skaitymo<br /><i>istorija</i></span><BookIcon /><span className="cover-bottom">PRASIDEDA NUO KNYGOS</span></div>
            <div className="art-caption"><span>♡</span> Dar viena knyga. Dar vienas pasaulis.</div>
          </div>
        </section>
        <section id="paieska" className="search-section" aria-labelledby="search-title">
          <div className="section-heading"><div><span className="eyebrow">ATRASK KAŽKĄ NAUJO</span><h2 id="search-title">Ką norėtum perskaityti?</h2></div><span className="source-note">Knygos iš <a href="https://openlibrary.org" target="_blank" rel="noopener noreferrer">Open Library ↗</a></span></div>
          <form className="search-form" onSubmit={searchBooks} role="search">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
            <label className="sr-only" htmlFor="book-search">Knygos pavadinimas arba autorius</label>
            <input id="book-search" ref={inputRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Įvesk knygos pavadinimą arba autorių…" maxLength={200} />
            <button className="primary-button" type="submit" disabled={loading}>{loading ? 'Ieškoma…' : 'Ieškoti'}<span aria-hidden="true">→</span></button>
          </form>
          <p className="search-hint">Ieškok lietuviškai arba originalo kalba – knygų pasaulis platus.</p>
          <div className="search-feedback" aria-live="polite" aria-atomic="true">
            {error ? <p className="error-message" role="alert">{error}</p> : loading ? <p>Ieškome tavo kitos knygos…</p> : searchedQuery ? <p>{books.length ? `Paieška „${searchedQuery}“: rodoma ${books.length} knygų.` : `Pagal „${searchedQuery}“ knygų neradome. Pabandyk kitą pavadinimą arba autorių.`}</p> : null}
          </div>
          {!loading && !error && books.length > 0 && <div className="book-grid">{books.map((book) => <BookCard key={book.key} book={book} />)}</div>}
        </section>
        <section id="lentyna" className="shelf-section" aria-labelledby="shelf-title">
          <div className="section-heading"><div><span className="eyebrow">TAVO SKAITYMO KELIONĖ</span><h2 id="shelf-title">Vieta tavo knygoms</h2></div><span className="coming-soon">Netrukus</span></div>
          <div className="shelf-preview"><span className="shelf-icon"><BookIcon /></span><h3>Kiekviena lentyna prasideda nuo vienos knygos.</h3><p>Čia galėsi saugoti knygas, kurias nori perskaityti,<br className="desktop-break" /> skaitai dabar ar jau užvertei paskutinį jų puslapį.</p><div className="status-tags"><span><i />Noriu perskaityti</span><span><i />Skaitoma</span><span><i />Perskaityta</span></div><p className="preview-note">Asmeninės lentynos funkcija dar kuriama.</p></div>
        </section>
      </main>
      <footer><a className="footer-brand" href="#pradzia"><BookIcon />Mano knygų lentyna</a><span>Maža vieta didelėms istorijoms.</span></footer>
    </>
  )
}

export default App
