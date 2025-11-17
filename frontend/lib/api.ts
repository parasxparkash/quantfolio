import axios, { AxiosInstance } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors and extract data
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Create typed API wrapper - interceptor already extracts data
const api = {
  get: <T = any>(url: string): Promise<T> => apiClient.get(url) as Promise<T>,
  post: <T = any>(url: string, data?: any): Promise<T> => apiClient.post(url, data) as Promise<T>,
  put: <T = any>(url: string, data?: any): Promise<T> => apiClient.put(url, data) as Promise<T>,
  delete: <T = any>(url: string): Promise<T> => apiClient.delete(url) as Promise<T>,
}

export { api }

