import './App.css'
import { useRef, useState, useMemo, useEffect, Dispatch, SetStateAction } from 'react'
import { SearchQuery, GetMaster } from './API'
import { NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom'

interface RecordItem {
  id: number;
  title: string;
  country: string;
  genre: string;
  year: string;
  image: string;
}

interface ViewProps {
  results: RecordItem[];
  setResults: Dispatch<SetStateAction<RecordItem[]>>;
}

function App() {
  const [results, setResults] = useState<RecordItem[]>([])

  return (
    <>
      <h1>Discseeker for Discogs</h1>
      <nav>
        <NavLink className='nav-btn' to='/list'>List</NavLink>
        <NavLink className='nav-btn' to='/gallery'>Gallery</NavLink>
      </nav>
      <div className='main'>
        <Routes>
          <Route path='/' element={<List results={results} setResults={setResults} />} />
          <Route path='/list' element={<List results={results} setResults={setResults} />} />
          <Route path='/gallery' element={<Gallery results={results} setResults={setResults} />} />
          <Route path='/records/:id' element={<Details results={results} />} />
          <Route path='*' element={<List results={results} setResults={setResults} />} />
        </Routes>
      </div>
      <footer>
        Created by <a href='https://github.com/fazsune'>Fazsune</a>. Powered by Vite React TSX.
      </footer>
    </>
  )
}

function List({ results, setResults }: ViewProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  
  const [sortBy, setSortBy] = useState<string>('album')
  const [sortOrder, setSortOrder] = useState<string>('asc')

  const populate = async () => {
    try {
      const query = inputRef?.current?.value
      if (query) {
        setResults([])
        const response = await SearchQuery(query, 10)
        if (response) {
          const newResults: RecordItem[] = response.data.results.map((result: any) => ({
            id: result.master_id || result.id, 
            title: result.title,
            country: result.country || 'Unknown',
            genre: result.genre ? result.genre.join(', ') : 'Unknown',
            year: result.year || 'Unknown',
            image: result.cover_image || result.thumb || '', 
          }))
          setResults(newResults)
        }
      }
    } catch (error) {
      console.warn(error)
    }
  }

  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      switch (sortBy) {
        case 'album':
        case 'artist':
          valA = a.title;
          valB = b.title;
          break;
        case 'date':
          valA = parseInt(a.year) || 0;
          valB = parseInt(b.year) || 0;
          break;
        case 'ratings':
          valA = a.id; 
          valB = b.id;
          break;
        default:
          valA = a.title;
          valB = b.title;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [results, sortBy, sortOrder]);

	return (
    <>
      <div className='search'>
        <div className='search-item'>Album Name <input placeholder='Search..' id='query' ref={inputRef}></input></div>
        <div className='search-item'>Sort by
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="album">Album Name</option>
            <option value="artist">Artist Name</option>
            <option value="date">Release Date</option>
            <option value="ratings">Ratings</option>
          </select>
        </div>
        <div className='search-item'>
          <form>
            <label>Ascending
              <input name='sort' type='radio' value='asc' checked={sortOrder === 'asc'} onChange={(e) => setSortOrder(e.target.value)}></input>
            </label>
            <label>Descending
              <input name='sort' type='radio' value='desc' checked={sortOrder === 'desc'} onChange={(e) => setSortOrder(e.target.value)}></input>
            </label>
          </form>
        </div>
        <button className='search-item' onClick={() => populate()}>
          Search
        </button>
      </div>
      <div className='results'>
        {
          sortedResults.map((result) => (
            <div key={result.id} className="result" onClick={() => navigate(`/records/${result.id}`)}>
              <div className='title'>{result.title} ({result.year})</div>
              <div className='genre'>Genre: {result.genre}</div>
              <div className='country'>Country: {result.country}</div>
              {result.image && <img className='image' src={result.image} alt={result.title} />}
            </div>
          ))
        }
      </div>
		</>
	)
}

function Gallery({ results, setResults }: ViewProps) {
  const [activeGenre, setActiveGenre] = useState<string>('All')
  const genres = ['All', 'Rock', 'Electronic', 'Pop', 'Hip Hop', 'Jazz']
  const navigate = useNavigate()

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setResults([])
        const response = await SearchQuery('', 30, activeGenre)
        if (response) {
          const newResults: RecordItem[] = response.data.results.map((result: any) => ({
            id: result.master_id || result.id,
            title: result.title,
            country: result.country || 'Unknown',
            genre: result.genre ? result.genre.join(', ') : 'Unknown',
            year: result.year || 'Unknown',
            image: result.cover_image || result.thumb || '',
          }))
          setResults(newResults)
        }
      } catch (error) {
        console.warn(error)
      }
    }
    fetchGallery()
  }, [activeGenre, setResults])

	return (
    <>
      <div className="gallery-filters">
        {genres.map((genre) => (
          <button 
            key={genre} 
            className={activeGenre === genre ? 'active-filter' : ''} 
            onClick={() => setActiveGenre(genre)}
          >
            {genre}
          </button>
        ))}
      </div>
      <div className="gallery-grid">
        {results.map((result) => (
          <div key={result.id} className="gallery-item" onClick={() => navigate(`/records/${result.id}`)}>
            {result.image ? (
              <img src={result.image} alt={result.title} />
            ) : (
              <div className="no-image">{result.title}</div>
            )}
          </div>
        ))}
      </div>
		</>
	)
}

function Details({ results }: { results: RecordItem[] }) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const currentIndex = results.findIndex((r) => r.id.toString() === id)
  const record = results[currentIndex]

  if (!record) {
    return <div className="details-error">Record not found in the current session. Please search again.</div>
  }

	return (
    <div className="details-container">
      <div className="details-card">
        {record.image && <img className="details-image" src={record.image} alt={record.title} />}
        <div className="details-info">
          <h2>{record.title}</h2>
          <p><strong>Year:</strong> {record.year}</p>
          <p><strong>Genre:</strong> {record.genre}</p>
          <p><strong>Country:</strong> {record.country}</p>
          <p><strong>ID:</strong> {record.id}</p>
        </div>
      </div>
      <div className="details-navigation">
        <button 
          className="nav-btn" 
          disabled={currentIndex <= 0} 
          onClick={() => navigate(`/records/${results[currentIndex - 1].id}`)}
        >
          Previous
        </button>
        <button 
          className="nav-btn" 
          disabled={currentIndex >= results.length - 1 || currentIndex === -1} 
          onClick={() => navigate(`/records/${results[currentIndex + 1].id}`)}
        >
          Next
        </button>
      </div>
		</div>
	)
}

export default App
