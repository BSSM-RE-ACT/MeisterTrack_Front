import { Bell, Search } from 'lucide-react'
import styles from './Header.module.css'

interface HeaderProps {
  name: string
  /** 학생은 학년반, 교사는 직위 */
  subtitle: string
  hasNotification?: boolean
}

export function Header({ name, subtitle, hasNotification }: HeaderProps) {
  return (
    <header className={styles.header}>
      <label className={styles.search}>
        <Search size={18} />
        <input placeholder="검색" />
      </label>
      <div className={styles.right}>
        <button className={styles.bell} aria-label="알림">
          <Bell size={20} />
          {hasNotification && <span className={styles.dot} />}
        </button>
        <div className={styles.profile}>
          <div className={styles.avatar}>{name.slice(0, 1)}</div>
          <div>
            <div className={styles.name}>{name}</div>
            <div className={styles.subtitle}>{subtitle}</div>
          </div>
        </div>
      </div>
    </header>
  )
}
