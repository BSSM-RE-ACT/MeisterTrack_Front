import styles from './FilterPill.module.css'

interface FilterPillsProps<T extends string> {
  options: readonly T[]
  value: T
  onChange: (value: T) => void
}

// 높이 36, 선택 시 blue-500 + white, gap 16
export function FilterPills<T extends string>({ options, value, onChange }: FilterPillsProps<T>) {
  return (
    <div className={styles.group} role="tablist">
      {options.map((option) => (
        <button
          key={option}
          role="tab"
          aria-selected={option === value}
          className={`${styles.pill} ${option === value ? styles.selected : ''}`}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
