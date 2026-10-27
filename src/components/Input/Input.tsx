import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import styles from './Input.module.css'

interface FieldProps {
  label?: string
  error?: string
}

export function Input({ label, error, id, className, ...props }: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      {label && <label htmlFor={inputId}>{label}</label>}
      <input id={inputId} className={`${styles.control} ${error ? styles.invalid : ''}`} {...props} />
      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}

export function TextArea({ label, error, id, ...props }: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <div className={styles.field}>
      {label && <label htmlFor={inputId}>{label}</label>}
      <textarea id={inputId} className={`${styles.control} ${styles.textarea} ${error ? styles.invalid : ''}`} {...props} />
      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}
