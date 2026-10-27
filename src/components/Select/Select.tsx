import { useId, type SelectHTMLAttributes } from 'react'
import styles from '../Input/Input.module.css'

interface SelectProps<T extends string | number> extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  label?: string
  value: T
  options: readonly { value: T; label: string }[]
  onChange: (value: T) => void
}

export function Select<T extends string | number>({ label, value, options, onChange, id, ...props }: SelectProps<T>) {
  const autoId = useId()
  const selectId = id ?? autoId
  return (
    <div className={styles.field}>
      {label && <label htmlFor={selectId}>{label}</label>}
      <select
        id={selectId}
        className={styles.control}
        value={value}
        onChange={(e) => {
          const raw = e.target.value
          const option = options.find((o) => String(o.value) === raw)
          if (option) onChange(option.value)
        }}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

const GRADES = [1, 2, 3].map((g) => ({ value: g, label: `${g}학년` }))
// 학년당 4반 기준. 반 수가 바뀌면 여기만 고친다.
const CLASSES = [1, 2, 3, 4].map((c) => ({ value: c, label: `${c}반` }))

interface ClassPickerProps {
  grade: number
  classNo: number
  onChange: (grade: number, classNo: number) => void
}

/** 학년·반 선택. 높이 40 */
export function ClassPicker({ grade, classNo, onChange }: ClassPickerProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: 200 }}>
      <Select value={grade} options={GRADES} onChange={(g) => onChange(g, classNo)} aria-label="학년" />
      <Select value={classNo} options={CLASSES} onChange={(c) => onChange(grade, c)} aria-label="반" />
    </div>
  )
}
