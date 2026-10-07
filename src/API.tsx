import axios from 'axios'

const client = axios.create({
  baseURL: 'https://api.discogs.com/',
  timeout: 5000,
  headers: {
    'User-Agent': 'Discseeker/1.0 +https://fazsune.github.io/cs409-mp2/',
    'Authorization': 'Discogs key=' + import.meta.env.VITE_DISCOGS_KEY + ' secret=' + import.meta.env.VITE_DISCOGS_SECRET
  },
}) 

export async function SearchQuery(query: string, per_page: number = 10, genre: string = '') {
  const params: Record<string, string | number> = {
    q: query,
    type: 'master',
    per_page: per_page,
  };

  if (genre && genre !== 'All') {
    params.style = genre;
  }

  try {
    const res = await client({
      url: 'database/search',
      params: params
    })
    if (res.status === 200) {
      return res
    } else {
      return false
    }
  } catch (error) {
    console.error("API Search Error:", error);
    return false;
  }
}

export async function GetMaster(id: number) {
  try {
    const res = await client({
      url: 'masters/' + id,
    })
    if (res.status === 200) {
      return res
    } else {
      return false
    }
  } catch (error) {
    console.error("API Master Error:", error);
    return false;
  }
}
