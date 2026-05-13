import axios from 'axios'

let baseURL = 'http://localhost:8080'

export function setBaseURL(url: string) {
  baseURL = url
}

export function getBaseURL() {
  return baseURL
}

function createClient(withAuth: boolean) {
  const instance = axios.create({ baseURL })

  instance.interceptors.request.use(config => {
    config.baseURL = baseURL
    if (withAuth) {
      const jwt = sessionStorage.getItem('ktf_jwt')
      if (jwt) config.headers.Authorization = `Bearer ${jwt}`
    }
    return config
  })

  return instance
}

export const publicClient = createClient(false)
export const authClient = createClient(true)
