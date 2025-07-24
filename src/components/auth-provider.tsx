import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { authService, type UserProfile } from '@/lib/firebase'
import type { User } from 'firebase/auth'

interface AuthContextType {
  currentUser: UserProfile | null
  firebaseUser: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  register: (email: string, password: string, userData: { full_name: string; phone?: string }) => Promise<{ success: boolean; error?: string }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state
  useEffect(() => {
    const unsubscribe = authService.onAuthChange(async (user) => {
      setFirebaseUser(user)
      
      if (user) {
        // Get user profile from Firestore
        const userProfile = await authService.getUserProfile(user.uid)
        setCurrentUser(userProfile)
      } else {
        setCurrentUser(null)
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      
      console.log('Attempting login with:', { email, passwordLength: password.length })
      
      const result = await authService.login(email, password)
      
      console.log('Login response:', result)
      
      if (result.success && result.user) {
        setCurrentUser(result.user)
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
      
      const result = await authService.register(email, password, userData)
      
      console.log('Registration response:', result)
      
      if (result.success && result.user) {
        setCurrentUser(result.user)
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
      await authService.logout()
      setCurrentUser(null)
      setFirebaseUser(null)
    } catch (error: any) {
      console.error('Logout error:', error)
    }
  }

  return (
    <AuthContext.Provider value={{
      currentUser,
      firebaseUser,
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
