import { useState } from 'react'
import { Bell, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import styles from './Header.module.css'

export interface SearchTarget {
  label: string
  to: string
}

interface HeaderProps {
  name: string
  /** 학생은 학년반, 교사는 직위 */
  subtitle: string
  /** 검색바에서 찾을 화면 목록 */
  searchTargets?: SearchTarget[]
  onProfileClick?: () => void
}

export function Header({ name, subtitle, searchTargets = [], onProfileClick }: HeaderProps) {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [notificationOpen, setNotificationOpen] = useState(false)
  const matches = keyword.trim() ? searchTargets.filter((t) => t.label.includes(keyword.trim())) : []

  const go = (to: string) => {
    setKeyword('')
    navigate(to)
  }

  return (
    <header className={styles.header}>
      <div className={styles.searchWrap}>
        <label className={styles.search}>
          <Search size={18} />
          <input
            placeholder="메뉴 검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && matches[0]) go(matches[0].to)
              if (e.key === 'Escape') setKeyword('')
            }}
          />
        </label>
        {keyword.trim() && (
          <ul className={styles.results}>
            {matches.length === 0 ? (
              <li className={styles.noResult}>찾는 메뉴가 없습니다</li>
            ) : (
              matches.map((t) => (
                <li key={t.to}>
                  <button onClick={() => go(t.to)}>{t.label}</button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      <div className={styles.right}>
        <div className={styles.bellWrap}>
          <button className={styles.bell} aria-label="알림" onClick={() => setNotificationOpen((v) => !v)}>
            <Bell size={20} />
          </button>
          {notificationOpen && <div className={styles.popover}>새 알림이 없습니다</div>}
        </div>
        <button className={styles.profile} onClick={onProfileClick}>
          <div className={styles.avatar}>{name.slice(0, 1)}</div>
          <div>
            <div className={styles.name}>{name}</div>
            <div className={styles.subtitle}>{subtitle}</div>
          </div>
        </button>
      </div>
    </header>
  )
}
