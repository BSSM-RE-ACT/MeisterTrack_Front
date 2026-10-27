import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { meisterApi } from '../../api/endpoints'
import { MEISTER_CATEGORIES, type SubmissionStatus, type SubmissionWithStudent } from '../../api/types'
import {
  Badge,
  Card,
  ErrorState,
  FilterPills,
  Loading,
  Pagination,
  statusTone,
  SummaryCard,
  Table,
  type Column,
} from '../../components'
import { PageHeader } from '../../layouts/PageHeader'
import styles from './MeisterReviewPage.module.css'

const STATUS_FILTERS = ['전체', '대기', '승인', '반려'] as const
const PAGE_SIZE = 15

const columns: Column<SubmissionWithStudent>[] = [
  { key: 'student_id', header: '학번', width: 80, render: (r) => r.student.student_id },
  { key: 'name', header: '이름', width: 100, render: (r) => r.student.name },
  { key: 'category', header: '카테고리', width: 140, render: (r) => <Badge tone="teal">{r.category}</Badge> },
  { key: 'item', header: '세부 항목', width: 160, render: (r) => r.item },
  { key: 'title', header: '제목', render: (r) => r.title },
  { key: 'created_at', header: '신청일', width: 110, render: (r) => r.created_at.slice(0, 10) },
  {
    key: 'status',
    header: '상태',
    width: 80,
    align: 'center',
    render: (r) => <Badge tone={statusTone[r.status]}>{r.status}</Badge>,
  },
]

export function MeisterReviewPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>('대기')
  const [page, setPage] = useState(1)

  const summary = useQuery({ queryKey: ['meister-summary'], queryFn: meisterApi.summary })
  const filter = { status: status === '전체' ? undefined : (status as SubmissionStatus), page, size: PAGE_SIZE }
  const list = useQuery({
    queryKey: ['meister-submissions', filter],
    queryFn: () => meisterApi.list(filter),
    placeholderData: keepPreviousData,
  })

  const pending = summary.data?.pending_by_grade ?? {}
  const totalPages = Math.max(1, Math.ceil((list.data?.total ?? 0) / PAGE_SIZE))

  return (
    <>
      <PageHeader title="역량 인증 심사" />
      <div className={styles.summary}>
        <SummaryCard
          title="승인 대기"
          value={Object.values(pending).reduce((a, b) => a + b, 0)}
          accent="amber"
          actions={[[1, 2, 3].map((g) => `${g}학년 ${pending[g] ?? 0}`).join(' · ')]}
        />
        <SummaryCard
          title="이번 달 처리"
          value={(summary.data?.approved_this_month ?? 0) + (summary.data?.rejected_this_month ?? 0)}
          accent="blue"
          actions={[`승인 ${summary.data?.approved_this_month ?? 0} · 반려 ${summary.data?.rejected_this_month ?? 0}`]}
        />
        <Card accent="teal" className={styles.categories}>
          <span className="text-h3">카테고리별 대기</span>
          <div className={styles.categoryList}>
            {MEISTER_CATEGORIES.map((c) => (
              <span key={c}>
                {c} <b>{summary.data?.pending_by_category[c] ?? 0}</b>
              </span>
            ))}
          </div>
        </Card>
      </div>

      <FilterPills
        options={STATUS_FILTERS}
        value={status}
        onChange={(s) => {
          setStatus(s)
          setPage(1)
        }}
      />

      <Card variant="table">
        {list.isLoading ? (
          <Loading />
        ) : list.error ? (
          <ErrorState error={list.error} />
        ) : (
          <>
            <Table
              columns={columns}
              rows={list.data?.items ?? []}
              rowKey={(r) => r.id}
              onRowClick={(r) => navigate(`/teacher/meister/review/${r.id}`)}
              empty="신청이 없습니다"
            />
            {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}
          </>
        )}
      </Card>
    </>
  )
}
