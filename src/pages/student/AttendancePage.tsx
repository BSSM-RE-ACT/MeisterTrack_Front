import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toYm } from '../../api/dates'
import { attendanceApi } from '../../api/endpoints'
import { ATTENDANCE_STATUSES, type AttendanceRecord } from '../../api/types'
import { useUser } from '../../auth/useAuth'
import {
  attendanceTone,
  Badge,
  Card,
  ErrorState,
  Loading,
  MonthCalendar,
  MonthNav,
  StatusDot,
  statusTone,
  SummaryCard,
  Table,
  type Column,
} from '../../components'
import { PageHeader } from '../../layouts/PageHeader'
import styles from './AttendancePage.module.css'


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
  const byDate = new Map(data?.records.map((r) => [r.date, r]))

  return (
    <>
      <PageHeader title="출결" />
      <div className={styles.summary}>
        {ATTENDANCE_STATUSES.map((s) => (
          <SummaryCard key={s} title={s} value={data?.counts[s] ?? '-'} accent={attendanceTone[s]} />
        ))}
      </div>

      <Card>
        <MonthNav month={month} onChange={setMonth} />
        {isLoading ? (
          <Loading />
        ) : error ? (
          <ErrorState error={error} />
        ) : (
          <MonthCalendar
            month={month}
            renderDay={(date) => {
              const record = byDate.get(date)
              return record && <StatusDot tone={attendanceTone[record.status]}>{record.status}</StatusDot>
            }}
          />
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
