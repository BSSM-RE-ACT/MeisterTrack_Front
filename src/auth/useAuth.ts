import { createContext, useContext } from 'react'
import type { Role, TokenResponse, User } from '../api/types'

interface AuthState {
  user: User | null
  loading: boolean
  login: (res: TokenResponse) => void
  logout: () => void
  updateUser: (user: User) => void
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('AuthProvider 안에서 써야 합니다')
  return ctx
}

/** 로그인된 화면에서만 쓴다 (RequireRole 아래) */
export function useUser() {
  const { user } = useAuth()
  if (!user) throw new Error('로그인이 필요합니다')
  return user
}

export function subtitleOf(user: { role: string; grade: number | null; class_no: number | null; position: string | null }) {
  if (user.role === 'teacher') return user.position ?? '교사'
  return `${user.grade}학년 ${user.class_no}반`
}

export function homePath(role: Role) {
  return role === 'teacher' ? '/teacher' : '/student'
}
