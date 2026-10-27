import type { ReactNode } from 'react'
import styles from './Badge.module.css'

export type BadgeTone = 'blue' | 'amber' | 'red' | 'teal' | 'navy' | 'gray'

export function Badge({ tone = 'gray', children }: { tone?: BadgeTone; children: ReactNode }) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>
}
