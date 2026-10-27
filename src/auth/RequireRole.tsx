import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import type { Role } from '../api/types'
import { homePath, useAuth } from './useAuth'

export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to={homePath(user.role)} replace />
  return children
}
