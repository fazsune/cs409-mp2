import './App.css'
import { SearchQuery, GetMaster } from './API'
import Details from './pages/Details'
import Gallery from './pages/Gallery'
import List from './pages/List'
import { NavLink, Route, Routes } from 'react-router-dom'

function App() {
  const handleQuery = async (query: string) => {
    try {
      const response = await SearchQuery(query)
      if (response) {
        console.log(response.data)
        const thumb = await GetMaster(response.data.results[0].master_id)
        if (thumb) {
          console.log(thumb.data)
        }
      }
    } catch (error) {
      console.warn(error)
    }
  }
  return (
    <>
      <h1>Discseeker for Discogs</h1>
      <nav>
        <NavLink to='/list'>List</NavLink>
        <NavLink to='/gallery'>Gallery</NavLink>
      </nav>
      <button onClick={() => handleQuery('nirvana')}>hello</button>
      <Routes>
        <Route path='/' element={<List />} />
        <Route path='/list' element={<List />} />
        <Route path='/gallery' element={<Gallery />} />
        <Route path='*' element={<List />} />
      </Routes>
      <footer>
        Created by <a href='https://github.com/fazsune'>Fazsune</a>. Powered by Vite React TSX.
      </footer>
    </>
  )
}

export default App
