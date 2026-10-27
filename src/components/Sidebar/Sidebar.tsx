import { useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import styles from './Sidebar.module.css'

export interface SidebarItem {
  label: string
  icon: ReactNode
  /** 단일 메뉴(sidebar_2item) */
  to?: string
  /** 펼침 메뉴(sidebar_1item) */
  children?: { label: string; to: string }[]
}

interface SidebarProps {
  items: SidebarItem[]
  onLogout: () => void
}

export function Sidebar({ items, onLogout }: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>BSSM ALL</div>
      <nav className={styles.nav}>
        {items.map((item) =>
          item.children ? <ExpandableItem key={item.label} item={item} /> : <SingleItem key={item.label} item={item} />,
        )}
      </nav>
      <button className={styles.logout} onClick={onLogout}>
        로그아웃
      </button>
    </aside>
  )
}

function SingleItem({ item }: { item: SidebarItem }) {
  return (
    <NavLink to={item.to!} end className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}>
      <span className={styles.icon}>{item.icon}</span>
      {item.label}
    </NavLink>
  )
}

function ExpandableItem({ item }: { item: SidebarItem }) {
  const { pathname } = useLocation()
  const hasActiveChild = item.children!.some((child) => pathname.startsWith(child.to))
  const [expanded, setExpanded] = useState(hasActiveChild)

  return (
    <div className={styles.group}>
      <button
        className={`${styles.item} ${hasActiveChild ? styles.active : ''}`}
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
      >
        <span className={styles.icon}>{item.icon}</span>
        {item.label}
        <ChevronDown size={16} className={`${styles.arrow} ${expanded ? styles.arrowOpen : ''}`} />
      </button>
      {expanded && (
        <div className={styles.children}>
          {item.children!.map((child) => (
            <NavLink
              key={child.to}
              to={child.to}
              className={({ isActive }) => `${styles.child} ${isActive ? styles.childActive : ''}`}
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}
