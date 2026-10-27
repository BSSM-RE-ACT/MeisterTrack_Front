import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { toYmd } from '../../api/dates'
import styles from './MonthCalendar.module.css'

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

interface MonthNavProps {
  month: Date
  onChange: (month: Date) => void
}

export function MonthNav({ month, onChange }: MonthNavProps) {
  const move = (delta: number) => onChange(new Date(month.getFullYear(), month.getMonth() + delta, 1))
  return (
    <div className={styles.nav}>
      <button aria-label="이전 달" onClick={() => move(-1)}>
        <ChevronLeft size={20} />
      </button>
      <span className="text-h2">
        {month.getFullYear()}년 {month.getMonth() + 1}월
      </span>
      <button aria-label="다음 달" onClick={() => move(1)}>
        <ChevronRight size={20} />
      </button>
    </div>
  )
}

interface MonthCalendarProps {
  month: Date
  /** 날짜 칸 안 내용 (YYYY-MM-DD) */
  renderDay: (date: string) => ReactNode
  onDayClick?: (date: string) => void
}

/** 월 캘린더. 날짜 칸 높이 70 (내용이 많으면 늘어남) */
export function MonthCalendar({ month, renderDay, onDayClick }: MonthCalendarProps) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay()
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const today = toYmd(new Date())

  return (
    <div className={styles.calendar}>
      {DAY_NAMES.map((d) => (
        <div key={d} className={styles.dayName}>
          {d}
        </div>
      ))}
      {Array.from({ length: firstDay }, (_, i) => (
        <div key={`blank-${i}`} />
      ))}
      {Array.from({ length: daysInMonth }, (_, i) => {
        const date = toYmd(new Date(month.getFullYear(), month.getMonth(), i + 1))
        return (
          <div
            key={date}
            className={`${styles.cell} ${date === today ? styles.today : ''} ${onDayClick ? styles.clickable : ''}`}
            onClick={onDayClick ? () => onDayClick(date) : undefined}
          >
            <span>{i + 1}</span>
            {renderDay(date)}
          </div>
        )
      })}
    </div>
  )
}

export function StatusDot({ tone, children }: { tone: 'blue' | 'amber' | 'gray' | 'red' | 'teal'; children: ReactNode }) {
  return (
    <span className={styles.status}>
      <i className={styles[`dot-${tone}`]} />
      {children}
    </span>
  )
}
