import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

// Types for user and authentication
export interface User {
  id: string
  email: string
  name: string
  phone?: string
  isEmailVerified: boolean
  role: 'user' | 'admin'
  createdAt: string
}

interface AuthContextType {
  currentUser: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, userData: { name: string; phone?: string }) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  sendEmailVerification: () => Promise<{ success: boolean; error?: string }>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  updateProfile: (userData: Partial<User>) => Promise<{ success: boolean; error?: string }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Simple localStorage-based user storage (for demo purposes)
// In production, this would be connected to Google Sheets API
const STORAGE_KEY = 'spirithub_users'
const CURRENT_USER_KEY = 'spirithub_current_user'

// Demo users for testing
const DEMO_USERS: User[] = [
  {
    id: '1',
    email: 'miladsoft@yahoo.com',
    name: 'Milad',
    phone: '+96812345678',
    isEmailVerified: true,
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: '2', 
    email: 'user@example.com',
    name: 'Test User',
    phone: '+96887654321',
    isEmailVerified: true,
    role: 'user',
    createdAt: new Date().toISOString()
  }
]

// Initialize demo users in localStorage if not exists
const initializeUsers = () => {
  const existingUsers = localStorage.getItem(STORAGE_KEY)
  if (!existingUsers) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_USERS))
  }
}

// Get all users from localStorage
const getUsers = (): User[] => {
  try {
    const users = localStorage.getItem(STORAGE_KEY)
    return users ? JSON.parse(users) : []
  } catch (error) {
    console.error('Error loading users:', error)
    return []
  }
}

// Save users to localStorage
const saveUsers = (users: User[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
  } catch (error) {
    console.error('Error saving users:', error)
  }
}

// Find user by email
const findUserByEmail = (email: string): User | null => {
  const users = getUsers()
  return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null
}

// Simple password validation (in production, passwords would be hashed)
const validatePassword = (email: string, password: string): boolean => {
  // Demo passwords
  if (email === 'miladsoft@yahoo.com') return password === '12332120'
  if (email === 'user@example.com') return password === 'user123'
  
  // For other users, accept any password with minimum 6 characters
  return password.length >= 6
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize users and check for existing session
  useEffect(() => {
    initializeUsers()
    
    // Check for existing session
    const savedUser = localStorage.getItem(CURRENT_USER_KEY)
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        // Verify user still exists in storage
        const user = findUserByEmail(userData.email)
        if (user) {
          setCurrentUser(user)
        } else {
          localStorage.removeItem(CURRENT_USER_KEY)
        }
      } catch (error) {
        console.error('Error loading saved user:', error)
        localStorage.removeItem(CURRENT_USER_KEY)
      }
    }
    
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const user = findUserByEmail(email)
      
      if (!user) {
        return { success: false, error: 'User not found' }
      }
      
      if (!validatePassword(email, password)) {
        return { success: false, error: 'Invalid password' }
      }
      
      setCurrentUser(user)
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
      
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Login failed' }
    }
  }

  const register = async (
    email: string, 
    password: string, 
    userData: { name: string; phone?: string }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Check if user already exists
      const existingUser = findUserByEmail(email)
      if (existingUser) {
        return { success: false, error: 'User already exists' }
      }
      
      // Validate password
      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' }
      }
      
      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        email: email.toLowerCase(),
        name: userData.name,
        phone: userData.phone,
        isEmailVerified: false,
        role: 'user',
        createdAt: new Date().toISOString()
      }
      
      // Add to users list
      const users = getUsers()
      users.push(newUser)
      saveUsers(users)
      
      // Log in the new user
      setCurrentUser(newUser)
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser))
      
      return { success: true }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Registration failed' }
    }
  }

  const logout = async (): Promise<void> => {
    setCurrentUser(null)
    localStorage.removeItem(CURRENT_USER_KEY)
  }

  const sendEmailVerification = async (): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'No user logged in' }
    }
    
    // In production, this would send an actual email
    // For now, we'll just mark as verified
    const updatedUser = { ...currentUser, isEmailVerified: true }
    const users = getUsers()
    const userIndex = users.findIndex(u => u.id === currentUser.id)
    
    if (userIndex !== -1) {
      users[userIndex] = updatedUser
      saveUsers(users)
      setCurrentUser(updatedUser)
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser))
    }
    
    return { success: true }
  }

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const user = findUserByEmail(email)
    
    if (!user) {
      return { success: false, error: 'User not found' }
    }
    
    // In production, this would send a password reset email
    // For now, we'll just return success
    return { success: true }
  }

  const updateProfile = async (userData: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'No user logged in' }
    }
    
    try {
      const updatedUser = { ...currentUser, ...userData }
      const users = getUsers()
      const userIndex = users.findIndex(u => u.id === currentUser.id)
      
      if (userIndex !== -1) {
        users[userIndex] = updatedUser
        saveUsers(users)
        setCurrentUser(updatedUser)
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser))
      }
      
      return { success: true }
    } catch (error) {
      console.error('Profile update error:', error)
      return { success: false, error: 'Profile update failed' }
    }
  }

  const value: AuthContextType = {
    currentUser,
    login,
    register,
    logout,
    sendEmailVerification,
    resetPassword,
    updateProfile,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }
