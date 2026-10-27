import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { toYm, toYmd } from '../../api/dates'
import { attendanceApi } from '../../api/endpoints'
import { ATTENDANCE_STATUSES, type AttendanceRecord } from '../../api/types'
import { useUser } from '../../auth/useAuth'
import { Badge, Card, ErrorState, Loading, statusTone, SummaryCard, Table, type Column } from '../../components'
import { PageHeader } from '../../layouts/PageHeader'
import styles from './AttendancePage.module.css'

const accent = { 출석: 'blue', 지각: 'amber', 조퇴: 'gray', 결석: 'red' } as const
const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

const columns: Column<AttendanceRecord>[] = [
  { key: 'date', header: '날짜', width: 160, render: (r) => r.date },
  { key: 'status', header: '상태', width: 120, render: (r) => <Badge tone={statusTone[r.status]}>{r.status}</Badge> },
  { key: 'reason', header: '사유', render: (r) => r.reason ?? '-' },
]

export function AttendancePage() {
  const user = useUser()
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const ym = toYm(month)
  const { data, isLoading, error } = useQuery({
    queryKey: ['attendance', user.id, ym],
    queryFn: () => attendanceApi.monthly(user.id, ym),
  })

  const move = (delta: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1))
  const byDate = new Map(data?.records.map((r) => [r.date, r]))
  const firstDay = month.getDay()
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const today = toYmd(new Date())

  return (
    <>
      <PageHeader title="출결" />
      <div className={styles.summary}>
        {ATTENDANCE_STATUSES.map((s) => (
          <SummaryCard key={s} title={s} value={data?.counts[s] ?? '-'} accent={accent[s]} />
        ))}
      </div>

      <Card>
        <div className={styles.monthNav}>
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
        {isLoading ? (
          <Loading />
        ) : error ? (
          <ErrorState error={error} />
        ) : (
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
              const record = byDate.get(date)
              return (
                <div key={date} className={`${styles.cell} ${date === today ? styles.today : ''}`}>
                  <span>{i + 1}</span>
                  {record && (
                    <span className={styles.status}>
                      <i className={styles[`dot-${accent[record.status]}`]} />
                      {record.status}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <Card variant="table">
        <h2 className="text-h2" style={{ margin: '0 0 16px' }}>
          출결 기록
        </h2>
        <Table
          columns={columns}
          rows={[...(data?.records ?? [])].reverse()}
          rowKey={(r) => r.id}
          empty="이번 달 출결 기록이 없습니다"
        />
      </Card>
    </>
  )
}
