import { Outlet, useNavigate } from 'react-router-dom'
import { Header, Sidebar, type SidebarItem } from '../components'
import styles from './AppLayout.module.css'

interface AppLayoutProps {
  menu: SidebarItem[]
  user: { name: string; subtitle: string }
}

// 사이드바 240 + 메인(gray-50) 안에 1200 콘텐츠
export function AppLayout({ menu, user }: AppLayoutProps) {
  const navigate = useNavigate()
  return (
    <div className={styles.shell}>
      <Sidebar items={menu} onLogout={() => navigate('/login')} />
      <main className={styles.main}>
        <div className={styles.content}>
          <Header name={user.name} subtitle={user.subtitle} hasNotification />
          <Outlet />
        </div>
      </main>
    </div>
  )
}
