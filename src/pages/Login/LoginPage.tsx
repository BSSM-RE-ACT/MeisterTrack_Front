import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../../api/endpoints'
import { homePath, useAuth } from '../../auth/useAuth'
import { Button, Card, Input } from '../../components'
import styles from './LoginPage.module.css'

// 백엔드 DEBUG=true일 때만 동작하는 개발용 로그인
const DEV_LOGIN = import.meta.env.DEV || import.meta.env.VITE_DEV_LOGIN === 'true'

export function LoginPage() {
  const { user, login } = useAuth()
  const [email, setEmail] = useState('student1@bssm.hs.kr')
  const devLogin = useMutation({ mutationFn: authApi.devLogin, onSuccess: login })

  if (user) return <Navigate to={homePath(user.role)} replace />

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    devLogin.mutate(email)
  }

  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        <div className={styles.logo}>BSSM ALL</div>
        <p className={styles.sub}>부산소프트웨어마이스터고 통합 관리 시스템</p>
        {/* TODO: 데스크톱 Google OAuth (루프백 리디렉트) 연동 후 authApi.google 호출 */}
        <Button variant="secondary" size="lg" className={styles.full} disabled title="준비 중">
          Google 계정으로 로그인
        </Button>

        {DEV_LOGIN && (
          <form className={styles.dev} onSubmit={onSubmit}>
            <p className={styles.devLabel}>개발용 로그인</p>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일"
              error={devLogin.error?.message}
            />
            <Button type="submit" size="lg" className={styles.full} disabled={devLogin.isPending}>
              로그인
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}
