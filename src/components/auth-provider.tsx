import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { User, AuthState } from '@/types'
import { DEMO_USERS } from '@/types'

interface AuthContextType {
  auth: AuthState
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (userData: Omit<User, 'id' | 'joinDate'>) => Promise<boolean>
  updateProfile: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true
  })

  // Initialize auth state from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      const user = JSON.parse(savedUser)
      setAuth({
        user,
        isAuthenticated: true,
        loading: false
      })
    } else {
      setAuth(prev => ({ ...prev, loading: false }))
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Demo authentication - check against demo users
    const user = DEMO_USERS.find(u => u.email === email)
    
    if (user && password === 'demo123') {
      setAuth({
        user,
        isAuthenticated: true,
        loading: false
      })
      localStorage.setItem('user', JSON.stringify(user))
      return true
    }
    
    return false
  }

  const logout = () => {
    setAuth({
      user: null,
      isAuthenticated: false,
      loading: false
    })
    localStorage.removeItem('user')
    localStorage.removeItem('cart')
  }

  const register = async (userData: Omit<User, 'id' | 'joinDate'>): Promise<boolean> => {
    // Demo registration - just create user
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      joinDate: new Date().toISOString(),
      role: 'user'
    }

    setAuth({
      user: newUser,
      isAuthenticated: true,
      loading: false
    })
    localStorage.setItem('user', JSON.stringify(newUser))
    return true
  }

  const updateProfile = (userData: Partial<User>) => {
    if (auth.user) {
      const updatedUser = { ...auth.user, ...userData }
      setAuth(prev => ({ ...prev, user: updatedUser }))
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider value={{
      auth,
      login,
      logout,
      register,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
