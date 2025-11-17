import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  username: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        localStorage.setItem('access_token', token)
        set({
          user,
          accessToken: token,
          isAuthenticated: true,
        })
      },
      clearAuth: () => {
        localStorage.removeItem('access_token')
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)

