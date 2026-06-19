import axios from 'axios'
import { getToken, getLang, setToken } from './session'

// Normalized error shape thrown to React Query / callers.
export interface ApiError {
  code: string
  message: string
  details?: { path: string; message: string }[]
  status?: number
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
})

// Attach the bearer token and the ?lang param to every request.
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  // Caller-supplied params win over the default lang.
  config.params = { lang: getLang(), ...(config.params ?? {}) }
  return config
})

// Unwrap the backend's { error: { code, message, details } } envelope.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired / invalid — drop it so the UI can react.
      setToken(null)
    }
    const envelope = error.response?.data?.error
    const apiError: ApiError = {
      code: envelope?.code ?? 'NETWORK_ERROR',
      message: envelope?.message ?? error.message ?? 'Erreur réseau.',
      details: envelope?.details,
      status: error.response?.status,
    }
    return Promise.reject(apiError)
  },
)

export default api
