import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import styles from './Modal.module.css'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  /** 버튼은 높이 44 균등 분할. 반려 → 승인 순서로 넘긴다. */
  actions?: ReactNode
  /** 기본 420. 명단 편집처럼 내용이 많은 모달만 넓힌다 */
  width?: number
}

// 폭 420, radius 16, 패딩 32, 오버레이 black 40%
export function Modal({ open, title, onClose, children, actions, width }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} style={width ? { width } : undefined} role="dialog" aria-modal onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.body}>{children}</div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </div>,
    document.body,
  )
}
