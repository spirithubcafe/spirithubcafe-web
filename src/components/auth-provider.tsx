import { createContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { authService, type UserProfile } from '@/lib/firebase'
import type { User } from 'firebase/auth'
import { ensureUserDocument } from '@/utils/user-management'

interface AuthContextType {
  currentUser: UserProfile | null
  firebaseUser: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; requiresEmailVerification?: boolean }>
  logout: () => Promise<void>
  register: (email: string, password: string, userData: { full_name: string; phone?: string }) => Promise<{ success: boolean; error?: string; requiresEmailVerification?: boolean }>
  sendEmailVerification: () => Promise<{ success: boolean; error?: string }>
  checkEmailVerification: () => Promise<{ success: boolean; verified: boolean; error?: string }>
  refreshUser: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export { AuthContext }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    if (firebaseUser) {
      try {
        // Reload the Firebase user to get latest verification status
        await firebaseUser.reload()
        
        // Get updated user profile from Firestore
        const userProfile = await authService.getUserProfile(firebaseUser.uid)
        if (userProfile) {
          // Update email verification status with latest from Firebase Auth
          userProfile.email_verified = firebaseUser.emailVerified
          
          // If email was just verified, update Firestore as well
          if (firebaseUser.emailVerified && !userProfile.email_verified) {
            await authService.checkEmailVerification()
          }
        }
        setCurrentUser(userProfile)
      } catch (error) {
        console.error('Error refreshing user:', error)
      }
    }
  }, [firebaseUser])

  // Initialize auth state
  useEffect(() => {
    const unsubscribe = authService.onAuthChange(async (user) => {
      setFirebaseUser(user)
      
      if (user) {
        // Always reload user to get latest verification status
        try {
          await user.reload()
        } catch (error) {
          console.error('Error reloading user:', error)
        }
        
        // Get user profile from Firestore
        const userProfile = await authService.getUserProfile(user.uid)
        if (userProfile) {
          // Update email verification status in profile with latest status from Firebase Auth
          userProfile.email_verified = user.emailVerified
          
          // If email was just verified, update Firestore as well
          if (user.emailVerified && !userProfile.email_verified) {
            await authService.checkEmailVerification()
          }
        } else {
          // If no user profile exists, try to ensure user document is created
          console.log('No user profile found, ensuring user document exists...');
          await ensureUserDocument();
          
          // Try to get user profile again after ensuring document exists
          const newUserProfile = await authService.getUserProfile(user.uid);
          if (newUserProfile) {
            newUserProfile.email_verified = user.emailVerified;
          }
          setCurrentUser(newUserProfile);
          return; // Early return to avoid setting current user twice
        }
        setCurrentUser(userProfile)
      } else {
        setCurrentUser(null)
      }
      
      setLoading(false)
    })

    // Listen for window focus to check verification status when user returns
    const handleWindowFocus = async () => {
      if (firebaseUser && !firebaseUser.emailVerified) {
        await refreshUser()
      }
    }

    window.addEventListener('focus', handleWindowFocus)

    return () => {
      unsubscribe()
      window.removeEventListener('focus', handleWindowFocus)
    }
  }, [firebaseUser, refreshUser])

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

  const sendEmailVerification = async () => {
    try {
      const result = await authService.sendEmailVerification()
      return result
    } catch (error: any) {
      console.error('Send email verification error:', error)
      return { success: false, error: error.message }
    }
  }

  const checkEmailVerification = async () => {
    try {
      const result = await authService.checkEmailVerification()
      if (result.success && result.verified && currentUser) {
        // Update current user profile with verification status
        setCurrentUser({
          ...currentUser,
          email_verified: true
        })
      }
      return result
    } catch (error: any) {
      console.error('Check email verification error:', error)
      return { success: false, verified: false, error: error.message }
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
      sendEmailVerification,
      checkEmailVerification,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
