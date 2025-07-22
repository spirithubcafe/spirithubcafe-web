import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { auth, type User } from '@/lib/pocketbase'

interface AuthContextType {
  currentUser: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  register: (email: string, password: string, userData: { full_name: string; phone?: string }) => Promise<{ success: boolean; error?: string }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state
  useEffect(() => {
    const user = auth.getCurrentUser()
    setCurrentUser(user)
    setLoading(false)

    // Listen for auth changes
    const unsubscribe = auth.onAuthChange((user) => {
      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      
      console.log('Attempting login with:', { email, passwordLength: password.length })
      
      const result = await auth.login(email, password)
      
      console.log('Login response:', result)
      
      if (result.success) {
        setCurrentUser(result.user as unknown as User)
      }

      setLoading(false)
      return result
    } catch (error: any) {
      console.error('Login exception:', error)
      setLoading(false)
      return { success: false, error: error.message }
    }
  }

  const register = async (email: string, password: string, userData: { full_name: string; phone?: string }) => {
    try {
      setLoading(true)
      
      console.log('Attempting registration with:', { email, userData })
      
      const result = await auth.register(email, password, userData)
      
      console.log('Registration response:', result)
      
      if (result.success) {
        setCurrentUser(result.user as unknown as User)
      }

      setLoading(false)
      return result
    } catch (error: any) {
      console.error('Registration exception:', error)
      setLoading(false)
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      await auth.logout()
      setCurrentUser(null)
    } catch (error: any) {
      console.error('Logout error:', error)
    }
  }

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      login,
      logout,
      register,
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
