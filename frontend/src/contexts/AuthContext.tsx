import { createContext, useContext, useEffect, useState } from 'react'
import api from '@/lib/api'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('access_token'))
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(!!localStorage.getItem('access_token'))

  useEffect(() => {
    if (!token) {
      setUser(null)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    api.get<User>('/auth/me')
      .then(r => setUser(r.data))
      .catch(() => {
        localStorage.removeItem('access_token')
        setToken(null)
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [token])

  const saveToken = (t: string) => {
    localStorage.setItem('access_token', t)
    setToken(t)
  }

  const login = async (username: string, password: string) => {
    const { data } = await api.post<{ access_token: string }>('/auth/login', { username, password })
    saveToken(data.access_token)
  }

  const register = async (username: string, password: string) => {
    const { data } = await api.post<{ access_token: string }>('/auth/register', { username, password })
    saveToken(data.access_token)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
