import { useQuery } from '@tanstack/react-query'
import { WEEKDAYS, weekdayIndex } from '../../api/dates'
import { timetableApi } from '../../api/endpoints'
import { Card, ErrorState, Loading } from '../../components'
import { PageHeader } from '../../layouts/PageHeader'
import styles from './TimetablePage.module.css'

const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8]

// 6컬럼 × 8행: 교시 60px + 요일 5컬럼 균등, 행 72px 고정
export function TimetablePage() {
  const { data, isLoading, error } = useQuery({ queryKey: ['timetable', 'me'], queryFn: timetableApi.mine })
  const today = weekdayIndex()
  const slot = (weekday: number, period: number) =>
    data?.slots.find((s) => s.weekday === weekday && s.period === period)

  return (
    <>
      <PageHeader title={data ? `시간표 · ${data.grade}학년 ${data.class_no}반` : '시간표'} />
      <Card variant="table">
        {isLoading ? (
          <Loading />
        ) : error ? (
          <ErrorState error={error} />
        ) : (
          <div className={styles.grid}>
            <div className={styles.head} />
            {WEEKDAYS.map((d, i) => (
              <div key={d} className={`${styles.head} ${i === today ? styles.todayHead : ''}`}>
                {d}
              </div>
            ))}
            {PERIODS.map((p) => (
              <Row key={p} period={p} today={today} slot={slot} />
            ))}
          </div>
        )}
      </Card>
    </>
  )
}

function Row({
  period,
  today,
  slot,
}: {
  period: number
  today: number | null
  slot: (weekday: number, period: number) => { subject: string; teacher_name: string | null } | undefined
}) {
  return (
    <>
      <div className={styles.period}>{period}교시</div>
      {WEEKDAYS.map((_, w) => {
        const s = slot(w, period)
        return (
          <div key={w} className={`${styles.cell} ${w === today ? styles.todayCell : ''}`}>
            {s && (
              <>
                <span className={styles.subject}>{s.subject}</span>
                {s.teacher_name && <span className={styles.teacher}>{s.teacher_name}</span>}
              </>
            )}
          </div>
        )
      })}
    </>
  )
}
