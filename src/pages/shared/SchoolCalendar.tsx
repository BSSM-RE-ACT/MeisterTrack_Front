import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { monthRange } from '../../api/dates'
import { calendarApi } from '../../api/endpoints'
import type { SchoolEvent } from '../../api/types'
import { Badge, Card, ErrorState, Loading, MonthCalendar, MonthNav, StatusDot, Table, type Column } from '../../components'

const columns: Column<SchoolEvent>[] = [
  {
    key: 'date',
    header: '날짜',
    width: 200,
    render: (e) => (e.start_date === e.end_date ? e.start_date : `${e.start_date} ~ ${e.end_date}`),
  },
  { key: 'title', header: '일정', render: (e) => e.title },
  { key: 'grade', header: '대상', width: 90, align: 'center', render: (e) => (e.grade ? `${e.grade}학년` : '전체') },
  {
    key: 'source',
    header: '구분',
    width: 90,
    align: 'center',
    render: (e) => <Badge tone={e.source === 'neis' ? 'gray' : 'teal'}>{e.source === 'neis' ? 'NEIS' : '학교'}</Badge>,
  },
]

/** 학사일정 월 캘린더 + 목록. 교사 관리 화면은 onEventClick/onDayClick으로 편집을 붙인다 */
export function SchoolCalendar({
  onEventClick,
  onDayClick,
}: {
  onEventClick?: (event: SchoolEvent) => void
  onDayClick?: (date: string) => void
}) {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [start, end] = monthRange(month)
  const { data, isLoading, error } = useQuery({ queryKey: ['calendar', start, end], queryFn: () => calendarApi.list(start, end) })
  const events = data ?? []

  return (
    <>
      <Card>
        <MonthNav month={month} onChange={setMonth} />
        {isLoading ? (
          <Loading />
        ) : error ? (
          <ErrorState error={error} />
        ) : (
          <MonthCalendar
            month={month}
            onDayClick={onDayClick}
            renderDay={(date) =>
              events
                .filter((e) => e.start_date <= date && date <= e.end_date)
                .map((e) => (
                  <StatusDot key={`${e.source}-${e.id}-${e.title}`} tone={e.source === 'neis' ? 'gray' : 'teal'}>
                    {e.title}
                  </StatusDot>
                ))
            }
          />
        )}
      </Card>
      <Card variant="table">
        <h2 className="text-h2" style={{ margin: '0 0 16px' }}>
          이번 달 일정
        </h2>
        <Table
          columns={columns}
          rows={events}
          rowKey={(e) => `${e.source}-${e.id}-${e.start_date}-${e.title}`}
          onRowClick={onEventClick ? (e) => e.source === 'school' && onEventClick(e) : undefined}
          empty="이번 달 일정이 없습니다"
        />
      </Card>
    </>
  )
}
