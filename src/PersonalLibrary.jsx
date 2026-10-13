import { useEffect, useRef, useState } from 'react'
import { supabase, supabaseConfigurationError } from './lib/supabase'
import './PersonalLibrary.css'

const statuses = [
  { value: 'Noriu perskaityti', label: 'Noriu perskaityti' },
  { value: 'Skaitoma', label: 'Skaitoma' },
  { value: 'Perskaityta', label: 'Perskaityta' },
]
const columns = 'id,open_library_id,title,cover_url,status,created_at,authors(name),genres(name)'

function databaseMessage(error) {
  if (error?.code === '23505') return 'Ši knyga jau yra jūsų lentynoje.'
  if (['42P01', 'PGRST205', '42703', 'PGRST204', 'PGRST200', 'PGRST202'].includes(error?.code)) return 'Lentynos duomenų bazės nustatymai neatitinka aplikacijos. Patikrinkite lentelių ryšius ir RPC funkcijas.'
  if (['22P02', '23514'].includes(error?.code)) return 'Duomenys neatitinka lentelės apribojimų. Patikrinkite leidžiamas skaitymo būsenas duomenų bazėje.'
  if (error?.code === '42501') return 'Veiksmui trūksta prieigos teisių. Prisijunkite iš naujo arba patikrinkite lentynos RLS nustatymus.'
  return 'Nepavyko atlikti lentynos veiksmo. Patikrinkite interneto ryšį ir bandykite dar kartą.'
}

// Šiuo komponento key App susieja visą lentynos būseną su konkrečiu vartotoju.
function PersonalLibrary({ userId, initializing, searchBooks, BookCard }) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(Boolean(userId))
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [reload, setReload] = useState(0)
  const pending = useRef(false)
  const active = useRef(false)

  useEffect(() => {
    active.current = true
    return () => { active.current = false }
  }, [])

  useEffect(() => {
    if (!userId || !supabase) return
    let cancelled = false
    async function load() {
      try {
        const allBooks = []
        for (let offset = 0; ; offset += 500) {
          const { data, error: queryError } = await supabase.from('books').select(columns)
            .eq('user_id', userId).order('created_at', { ascending: false }).order('id')
            .range(offset, offset + 499)
          if (queryError) throw queryError
          if (cancelled) return
          allBooks.push(...data)
          if (data.length < 500) break
        }
        setBooks(allBooks)
        setLoaded(true)
      } catch (queryError) {
        if (!cancelled) setError(databaseMessage(queryError))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [userId, reload])

  async function mutate(action, successMessage) {
    if (!userId || !supabase || pending.current || !loaded) return
    pending.current = true
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await action()
      if (active.current) setMessage(successMessage)
    } catch (queryError) {
      if (active.current) setError(databaseMessage(queryError))
    } finally {
      pending.current = false
      if (active.current) setBusy(false)
    }
  }

  async function relatedId(functionName, parameter, name) {
    if (!name) return null
    const { data, error: rpcError } = await supabase.rpc(functionName, { [parameter]: name })
    if (rpcError) throw rpcError
    // Priimamas skaliarinis ID arba vienas įrašas su id.
    const result = Array.isArray(data) ? data[0] : data
    const id = result && typeof result === 'object' ? result.id : result
    if (id === null || id === undefined || !['string', 'number'].includes(typeof id)) throw new Error('Invalid RPC result')
    return id
  }

  function addBook(book) {
    if (books.some((saved) => saved.open_library_id === book.key)) return
    mutate(async () => {
      const authorName = Array.isArray(book.author_name) ? book.author_name.find((name) => typeof name === 'string' && name.trim())?.trim() : null
      const genreName = Array.isArray(book.subject) ? book.subject.find((name) => typeof name === 'string' && name.trim())?.trim() : null
      const authorId = await relatedId('get_or_create_author', 'author_name', authorName)
      if (!active.current) return
      const genreId = await relatedId('get_or_create_genre', 'genre_name', genreName)
      if (!active.current) return
      const { data, error: queryError } = await supabase.from('books').insert({
        user_id: userId, author_id: authorId, genre_id: genreId,
        open_library_id: book.key, title: book.title,
        cover_url: Number.isInteger(book.cover_i) && book.cover_i > 0 ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg?default=false` : null,
        status: statuses[0].value,
      }).select(columns).single()
      if (queryError) throw queryError
      if (active.current) setBooks((current) => [data, ...current])
    }, 'Knyga pridėta į jūsų lentyną.')
  }

  function changeStatus(book, status) {
    if (!statuses.some((item) => item.value === status) || status === book.status) return
    mutate(async () => {
      const { data, error: queryError } = await supabase.from('books').update({ status })
        .eq('id', book.id).eq('user_id', userId).select(columns).single()
      if (queryError) throw queryError
      if (active.current) setBooks((current) => current.map((saved) => saved.id === book.id ? data : saved))
    }, 'Skaitymo būsena atnaujinta.')
  }

  function deleteBook(book) {
    if (pending.current || !window.confirm(`Ar tikrai norite pašalinti knygą „${book.title}“ iš lentynos?`)) return
    mutate(async () => {
      const { error: queryError } = await supabase.from('books').delete()
        .eq('id', book.id).eq('user_id', userId).select('id').single()
      if (queryError) throw queryError
      if (active.current) setBooks((current) => current.filter((saved) => saved.id !== book.id))
    }, 'Knyga pašalinta iš lentynos.')
  }

  function retry() {
    setError('')
    setLoading(true)
    setReload((current) => current + 1)
  }

  return (
    <>
      {searchBooks.length > 0 && <div className="book-grid">{searchBooks.map((book) => {
        const saved = books.some((item) => item.open_library_id === book.key)
        return <BookCard key={book.key} book={book}>
          <button className="primary-button add-book" type="button" disabled={!userId || initializing || !loaded || loading || busy || saved} onClick={() => addBook(book)}>{saved ? 'Jau lentynoje' : 'Pridėti į lentyną'}</button>
        </BookCard>
      })}</div>}
      {!userId && searchBooks.length > 0 && <p className="library-hint">Norėdami pridėti knygą, <a href="#paskyra">prisijunkite</a>.</p>}
      <section id="lentyna" className="shelf-section" aria-labelledby="shelf-title">
        <div className="section-heading"><div><span className="eyebrow">TAVO SKAITYMO KELIONĖ</span><h2 id="shelf-title">Mano lentyna</h2></div></div>
        {initializing ? <p role="status">Atkuriama prisijungimo būsena…</p> : !userId ? <div className="shelf-preview"><h3>Vieta jūsų skaitymo istorijoms.</h3><p>{supabaseConfigurationError || 'Prisijunkite, kad galėtumėte išsaugoti knygas ir matyti savo lentyną.'}</p><a href="#paskyra">Prisijungti arba registruotis</a></div> : <>
          {loading && <p role="status">Įkeliama jūsų lentyna…</p>}
          {busy && <p role="status">Išsaugomi lentynos pakeitimai…</p>}
          {error && <div className="library-feedback"><p className="error-message" role="alert">{error}</p>{!loaded && !loading && <button className="primary-button" type="button" onClick={retry}>Bandyti dar kartą</button>}</div>}
          {message && <p className="library-success" role="status">{message}</p>}
          {loaded && !loading && books.length === 0 && <div className="shelf-preview"><h3>Kiekviena lentyna prasideda nuo vienos knygos.</h3><p>Ieškokite knygos ir pasirinkite „Pridėti į lentyną“.</p><a href="#paieska">Atrasti knygą</a></div>}
          {loaded && books.length > 0 && <div className="book-grid">{books.map((book) => <BookCard key={book.id} book={{ key: book.open_library_id, title: book.title, author_name: book.authors?.name ? [book.authors.name] : [], cover_url: book.cover_url }}>
            {book.genres?.name && <p className="book-genre">Žanras: {book.genres.name}</p>}
            <div className="shelf-actions">
              <label htmlFor={`status-${book.id}`}>Skaitymo būsena</label>
              <select id={`status-${book.id}`} value={book.status} disabled={busy} onChange={(event) => changeStatus(book, event.target.value)}>{statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select>
              <button className="delete-book" type="button" disabled={busy} onClick={() => deleteBook(book)}>Pašalinti iš lentynos</button>
            </div>
          </BookCard>)}</div>}
        </>}
      </section>
    </>
  )
}
export default PersonalLibrary
