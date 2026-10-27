import { useNavigate } from 'react-router-dom'
import { Button, Card } from '../../components'
import styles from './LoginPage.module.css'

export function LoginPage() {
  const navigate = useNavigate()
  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        <div className={styles.logo}>BSSM ALL</div>
        <p className={styles.sub}>부산소프트웨어마이스터고 통합 관리 시스템</p>
        {/* TODO: FastAPI Google OAuth 연동 */}
        <Button variant="secondary" size="lg" className={styles.google} onClick={() => navigate('/student')}>
          Google 계정으로 로그인
        </Button>
      </Card>
    </div>
  )
}
