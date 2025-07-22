import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { Profile, AuthState } from '@/types'
import { auth, db } from '@/lib/supabase'

interface AuthContextType {
  auth: AuthState
  currentUser: Profile | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  register: (email: string, password: string, userData: { full_name: string; phone: string; role?: string }) => Promise<{ success: boolean; error?: string }>
  updateProfile: (userData: Partial<Profile>) => Promise<{ success: boolean; error?: string }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true
  })
  const [loading, setLoading] = useState(true)

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    auth.getUser().then(({ data: { user }, error }) => {
      if (user && !error) {
        loadUserProfile(user.id)
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          loading: false
        })
        setLoading(false)
      }
    })

    // Listen for auth state changes
    const { data: { subscription } } = auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user.id)
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          loading: false
        })
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await db.profiles.get(userId)
      
      if (error) {
        console.error('Error loading profile:', error)
        setAuthState({
          user: null,
          isAuthenticated: false,
          loading: false
        })
      } else if (profile) {
        setAuthState({
          user: profile as Profile,
          isAuthenticated: true,
          loading: false
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false
      })
    }
    setLoading(false)
  }

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      
      console.log('Attempting login with:', { email, passwordLength: password.length })
      
      const { data, error } = await auth.signIn(email, password)
      
      console.log('Login response:', { data, error })
      
      if (error) {
        console.error('Login error:', error)
        setLoading(false)
        return { success: false, error: error.message }
      }

      if (data.user) {
        await loadUserProfile(data.user.id)
      }

      setLoading(false)
      return { success: true }
    } catch (error: any) {
      console.error('Login exception:', error)
      setLoading(false)
      return { success: false, error: error.message }
    }
  }

  const register = async (email: string, password: string, userData: { full_name: string; phone: string; role?: string }) => {
    try {
      setLoading(true)
      
      console.log('Attempting registration with:', { email, userData })
      
      const { data, error } = await auth.signUp(email, password, userData)
      
      console.log('Registration response:', { data, error })
      
      if (error) {
        console.error('Registration error:', error)
        setLoading(false)
        return { success: false, error: error.message }
      }

      if (data.user) {
        // Profile will be created automatically by the database trigger
        // Wait a moment and then load the profile
        setTimeout(() => {
          loadUserProfile(data.user!.id)
        }, 1000)
      }

      setLoading(false)
      return { success: true }
    } catch (error: any) {
      console.error('Registration exception:', error)
      setLoading(false)
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      await auth.signOut()
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false
      })
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const updateProfile = async (userData: Partial<Profile>) => {
    if (!authState.user) {
      return { success: false, error: 'No user logged in' }
    }

    try {
      const { error } = await db.profiles.update(authState.user.id, userData)
      
      if (error) {
        return { success: false, error: error.message }
      }

      // Update local state
      const updatedUser = { ...authState.user, ...userData }
      setAuthState(prev => ({ ...prev, user: updatedUser }))
      
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  return (
    <AuthContext.Provider value={{
      auth: authState,
      currentUser: authState.user,
      login,
      logout,
      register,
      updateProfile,
      loading
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
