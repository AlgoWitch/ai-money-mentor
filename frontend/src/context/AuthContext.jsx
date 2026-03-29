import { createContext, useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'

// Use the same backend URL as the shared api.js utility
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://ai-money-mentor-1-o1q6.onrender.com'
// Token key must match App.jsx and api.js
const TOKEN_KEY = 'niveshak_token'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
      fetch(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if (!res.ok) throw new Error('Invalid token')
        return res.json()
      })
      .then(data => {
        setUser(data)
        setLoading(false)
      })
      .catch(() => {
        logout()
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [token])

  // Login uses OAuth2 password flow (x-www-form-urlencoded)
  const login = async (email, password) => {
    const params = new URLSearchParams()
    params.append('username', email)
    params.append('password', password)
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    })
    if (!res.ok) throw new Error('Login failed')
    const data = await res.json()
    localStorage.setItem(TOKEN_KEY, data.access_token)
    setToken(data.access_token)
    navigate('/')
  }

  const register = async (email, password, name) => {
    const res = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name: name || email })
    })
    if (!res.ok) throw new Error('Registration failed')
    const data = await res.json()
    localStorage.setItem(TOKEN_KEY, data.access_token)
    setToken(data.access_token)
    navigate('/')
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
