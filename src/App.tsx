import './App.css'
import { useRef, useState, useMemo, useEffect, type Dispatch, type SetStateAction } from 'react'
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
  
  const [sortBy, setSortBy] = useState<string>('title')
  const [sortOrder, setSortOrder] = useState<string>('asc')

  const populate = async () => {
    try {
      const query = inputRef?.current?.value
      if (query) {
        const response = await SearchQuery(query, 10)
        if (response) {
          const newResults: RecordItem[] = []
          for (const result of response.data.results) {
            const masterId = result.master_id || result.id
            let image = ''
            
            // Check cache in existing results array to avoid redundant API queries
            const cachedRecord = results.find(r => r.id === masterId)
            if (cachedRecord && cachedRecord.image) {
              image = cachedRecord.image
            } else {
              const thumb = await GetMaster(masterId)
              if (thumb && thumb.data && thumb.data.images[0]) {
                image = thumb.data.images[0].resource_url
              }
            }

            newResults.push({
              id: masterId, 
              title: result.title,
              country: result.country || 'Unknown',
              genre: result.genre ? result.genre.join(', ') : 'Unknown',
              year: result.year || 'Unknown',
              image: image, 
            })
          }
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
        case 'title':
          valA = a.title;
          valB = b.title;
          break;
        case 'date':
          valA = parseInt(a.year) || 0;
          valB = parseInt(b.year) || 0;
          break;
        case 'country':
          valA = a.country; 
          valB = b.country;
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
            <option value="title">Title</option>
            <option value="date">Release Date</option>
            <option value="country">Country</option>
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
        const response = await SearchQuery('', 10, activeGenre)
        if (response) {
          const newResults: RecordItem[] = []
          for (const result of response.data.results) {
            const masterId = result.master_id || result.id
            let image = ''
            
            // Check cache in existing results array to avoid redundant API queries
            const cachedRecord = results.find(r => r.id === masterId)
            if (cachedRecord && cachedRecord.image) {
              image = cachedRecord.image
            } else {
              const thumb = await GetMaster(masterId)
              if (thumb && thumb.data && thumb.data.images[0]) {
                image = thumb.data.images[0].resource_url
              }
            }

            newResults.push({
              id: masterId,
              title: result.title,
              country: result.country || 'Unknown',
              genre: result.genre ? result.genre.join(', ') : 'Unknown',
              year: result.year || 'Unknown',
              image: image,
            })
          }
          setResults(newResults)
        }
      } catch (error) {
        console.warn(error)
      }
    }
    fetchGallery()
    // Intentionally excluding results from dependency array to prevent effect looping while maintaining closure reference
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  const [fetchedRecord, setFetchedRecord] = useState<RecordItem | null>(null)

  const currentIndex = results.findIndex((r) => r.id.toString() === id)
  const sessionRecord = results[currentIndex]

  useEffect(() => {
    // If accessing details view via direct URL without session results, fetch it.
    if (!sessionRecord && id) {
      const fetchExternalDetails = async () => {
        const response = await GetMaster(Number(id));
        if (response && response.data) {
          setFetchedRecord({
            id: response.data.id,
            title: response.data.title,
            country: response.data.country || 'Unknown',
            genre: response.data.genres ? response.data.genres.join(', ') : 'Unknown',
            year: response.data.year || 'Unknown',
            image: response.data.images?.[0]?.resource_url || ''
          });
        }
      }
      fetchExternalDetails();
    }
  }, [id, sessionRecord]);

  const record = sessionRecord || fetchedRecord;

  if (!record) {
    return <div className="details-error">Loading Record...</div>
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
      
      {/* Only render next/prev navigation arrows if coming from a List/Gallery active query session */}
      {sessionRecord && (
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
      )}
		</div>
	)
}

export default App
