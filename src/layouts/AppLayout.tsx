import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { subtitleOf, useAuth, useUser } from '../auth/useAuth'
import { Button, Header, Modal, Sidebar, type SidebarItem } from '../components'
import styles from './AppLayout.module.css'

// 사이드바 240 + 메인(gray-50) 안에 1200 콘텐츠
export function AppLayout({ menu }: { menu: SidebarItem[] }) {
  const user = useUser()
  const { logout } = useAuth()
  const [confirmLogout, setConfirmLogout] = useState(false)

  return (
    <div className={styles.shell}>
      <Sidebar items={menu} onLogout={() => setConfirmLogout(true)} />
      <main className={styles.main}>
        <div className={styles.content}>
          <Header name={user.name} subtitle={subtitleOf(user)} />
          <Outlet />
        </div>
      </main>
      <Modal
        open={confirmLogout}
        title="로그아웃할까요?"
        onClose={() => setConfirmLogout(false)}
        actions={
          <>
            <Button variant="secondary" onClick={() => setConfirmLogout(false)}>
              취소
            </Button>
            <Button onClick={logout}>로그아웃</Button>
          </>
        }
      >
        다시 사용하려면 Google 계정으로 로그인해야 합니다.
      </Modal>
    </div>
  )
}
