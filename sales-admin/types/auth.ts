// Authentication types

export interface User {
  id: string
  email: string
  name: string
  avatarUrl: string
  googleId: string
  role: 'admin' | 'regular'
  createdAt: string
  lastLoginAt: string
}

export interface Session {
  id: string
  userId: string
  token: string
  expiresAt: string
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}
