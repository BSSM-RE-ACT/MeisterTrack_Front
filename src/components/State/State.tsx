import styles from './State.module.css'

export function Loading() {
  return <div className={styles.state}>불러오는 중…</div>
}

export function ErrorState({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : '문제가 생겼습니다'
  return <div className={`${styles.state} ${styles.error}`}>{message}</div>
}

export function Empty({ children = '데이터가 없습니다' }: { children?: string }) {
  return <div className={styles.state}>{children}</div>
}
