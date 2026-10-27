import { useQuery } from '@tanstack/react-query'
import { mileageApi } from '../../api/endpoints'
import type { MileageRecord } from '../../api/types'
import { useUser } from '../../auth/useAuth'
import { Badge, Card, ErrorState, Loading, SummaryCard, Table, type Column } from '../../components'
import { PageHeader } from '../../layouts/PageHeader'
import styles from './MileagePage.module.css'

const columns: Column<MileageRecord>[] = [
  { key: 'date', header: '날짜', width: 120, render: (r) => r.date },
  {
    key: 'type',
    header: '구분',
    width: 80,
    render: (r) => <Badge tone={r.type === '상점' ? 'teal' : 'red'}>{r.type}</Badge>,
  },
  { key: 'points', header: '점수', width: 80, align: 'center', render: (r) => (r.type === '상점' ? `+${r.points}` : `-${r.points}`) },
  { key: 'reason', header: '사유', render: (r) => r.reason },
  { key: 'teacher', header: '부여 교사', width: 120, render: (r) => r.teacher_name },
]

export function MileagePage() {
  const user = useUser()
  const { data, isLoading, error } = useQuery({ queryKey: ['mileage', user.id], queryFn: () => mileageApi.student(user.id) })

  return (
    <>
      <PageHeader title="상벌점" />
      <div className={styles.summary}>
        <SummaryCard title="상점" value={data?.summary.merit ?? '-'} accent="teal" />
        <SummaryCard title="벌점" value={data?.summary.demerit ?? '-'} accent="red" />
        <SummaryCard title="합계" value={data?.summary.total ?? '-'} accent="blue" />
      </div>
      <Card variant="table">
        <h2 className="text-h2" style={{ margin: '0 0 16px' }}>
          상벌점 내역
        </h2>
        {isLoading ? (
          <Loading />
        ) : error ? (
          <ErrorState error={error} />
        ) : (
          <Table columns={columns} rows={data?.records ?? []} rowKey={(r) => r.id} empty="상벌점 내역이 없습니다" />
        )}
      </Card>
    </>
  )
}
