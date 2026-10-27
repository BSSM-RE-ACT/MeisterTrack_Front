import type { HTMLAttributes, ReactNode } from 'react'
import type { BadgeTone } from '../Badge/Badge'
import styles from './Card.module.css'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** 표 카드는 패딩 24, 일반 카드는 20 */
  variant?: 'default' | 'table'
  /** 좌측 accent 라인 색 */
  accent?: BadgeTone
}

export function Card({ variant = 'default', accent, className, ...props }: CardProps) {
  return (
    <div
      className={[styles.card, styles[variant], accent && styles.accent, accent && styles[accent], className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
}

interface SummaryCardProps {
  icon?: ReactNode
  title: string
  value: ReactNode
  actions?: ReactNode[]
  accent?: BadgeTone
}

// 요약 카드: [아이콘]제목 + 우측 큰 숫자 + 하위 액션 2줄
export function SummaryCard({ icon, title, value, actions = [], accent = 'blue' }: SummaryCardProps) {
  return (
    <Card accent={accent} className={styles.summary}>
      <div className={styles.summaryTop}>
        <span className={styles.summaryTitle}>
          {icon}
          {title}
        </span>
        <span className={styles.summaryValue}>{value}</span>
      </div>
      {actions.length > 0 && (
        <div className={styles.summaryActions}>
          {actions.map((action, i) => (
            <div key={i}>{action}</div>
          ))}
        </div>
      )}
    </Card>
  )
}
