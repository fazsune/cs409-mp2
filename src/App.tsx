import './App.css'
import { useRef, useState } from 'react'
import { SearchQuery, GetMaster } from './API'
import { NavLink, Route, Routes } from 'react-router-dom'

interface Record {
  id: number,
  title: string | any;
  country: string | any;
  genre: string | any;
  year: string | any;
  image: string | any;
}

function App() {

  return (
    <>
      <h1>Discseeker for Discogs</h1>
      <nav>
        <NavLink className='nav-btn' to='/list'>List</NavLink>
        <NavLink className='nav-btn' to='/gallery'>Gallery</NavLink>
      </nav>
      <div className='main'>
        <Routes>
          <Route path='/' element={<List />} />
          <Route path='/list' element={<List />} />
          <Route path='/gallery' element={<Gallery />} />
          <Route path='/record/:id' element={<Details />} />
          <Route path='*' element={<List />} />
        </Routes>
      </div>
      <footer>
        Created by <a href='https://github.com/fazsune'>Fazsune</a>. Powered by Vite React TSX.
      </footer>
    </>
  )
}


function List() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [results, setResults] = useState<Record[]>([])

  const populate = async () => {
    try {
      const query = inputRef?.current?.value
      if (query) {
        setResults([])
        const response = await SearchQuery(query)
        if (response) {
          console.log(response.data)
          var newResults: Record[] = []
          for (const result of response.data.results) {
            const thumb = await GetMaster(result.master_id)
            var image: string = '';
            if (thumb) {
              image = thumb.data.images[0].resource_url
            }
            newResults.push({
              id: result.master_id,
              title: result.title,
              country: result.country,
              genre: result.genre,
              year: result.year,
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

	return (
    <>
      <div className='search'>
        <div className='search-item'>Album Name <input placeholder='Search..' id='query' ref={inputRef}></input></div>
        <div className='search-item'>Sort by
          <select>
            <option value="album">Album Name</option>
            <option value="artist">Artist Name</option>
            <option value="date">Release Date</option>
            <option value="ratings">Ratings</option>
          </select>
        </div>
        <div className='search-item'>
          <form>
          <label>Ascending
            <input name='sort' type='radio' value='asc'></input>
          </label>
          <label>Descending
            <input name='sort' type='radio' value='desc'></input>
          </label>
          </form>
        </div>
        <button className='search-item' onClick={() => populate()}>
          Search
        </button>
      </div>
      <div className='results'>
        {
          results.map((result) => (
            <div key={result.id} className="result">
              <div className='title'>{result.title} ({result.year})</div>
              <div className='genre'>Genre: {result.genre}</div>
              <div className='country'>Country: {result.country}</div>
              <img className='image' src={result.image}></img>
            </div>
          ))
        }
      </div>
		</>
	)
}


function Gallery() {
	return (
    <>
      gallery
		</>
	)
}


function Details() {
	return (
    <>
      details
		</>
	)
}


export default App
