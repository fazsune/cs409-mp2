import axios from 'axios'
const client = axios.create({
  baseURL: 'https://api.discogs.com/',
  timeout: 5000,
  headers: {
    'User-Agent': 'Discseeker/1.0 +https://fazsune.github.io/cs409-mp2/',
    'Authorization': 'Discogs key=' + import.meta.env.DISCOGS_KEY + ' secret=' + import.meta.env.DISCOGS_SECRET
  },
}) // TODO: respect X-Discogs-Ratelimit

export async function SearchQuery(query: string) {
  const res = await client({
    url: 'database/search',
    params: {
      q: query,
      type: 'master',
      per_page: 10,
    }
  })
  if (res.status == 200) {
    return res
  } else {
    return false
  }
}

export async function GetMaster(id: number) {
  const res = await client({
    url: 'masters/' + id,
  })
  if (res.status == 200) {
    return res
  } else {
    return false
  }
}
