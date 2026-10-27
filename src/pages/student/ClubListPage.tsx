import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { clubApi } from '../../api/endpoints'
import type { Club } from '../../api/types'
import { useUser } from '../../auth/useAuth'
import { Badge, Card, ErrorState, FilterPills, Loading, Table, type Column } from '../../components'
import { PageHeader } from '../../layouts/PageHeader'

const FILTERS = ['전체', '창체', '자율'] as const

const columns: Column<Club>[] = [
  { key: 'name', header: '동아리', width: 200, render: (c) => c.name },
  {
    key: 'type',
    header: '구분',
    width: 80,
    align: 'center',
    render: (c) => <Badge tone={c.type === '창체' ? 'blue' : 'teal'}>{c.type}</Badge>,
  },
  { key: 'description', header: '소개', render: (c) => c.description || '-' },
  { key: 'advisor', header: '지도교사', width: 120, render: (c) => c.advisor_name ?? '-' },
  { key: 'room', header: '장소', width: 140, render: (c) => c.room ?? '-' },
  { key: 'members', header: '부원', width: 70, align: 'center', render: (c) => `${c.member_count}명` },
]

/** 전체 동아리 목록. 교사는 행을 누르면 관리 화면으로 간다 */
export function ClubListPage() {
  const user = useUser()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('전체')
  const { data, isLoading, error } = useQuery({
    queryKey: ['clubs', filter],
    queryFn: () => clubApi.list(filter === '전체' ? undefined : filter),
  })

  return (
    <>
      <PageHeader title="동아리 목록" />
      <FilterPills options={FILTERS} value={filter} onChange={setFilter} />
      <Card variant="table">
        {isLoading ? (
          <Loading />
        ) : error ? (
          <ErrorState error={error} />
        ) : (
          <Table
            columns={columns}
            rows={data ?? []}
            rowKey={(c) => c.id}
            onRowClick={user.role === 'teacher' ? (c) => navigate(`/teacher/clubs/${c.id}`) : undefined}
            empty="동아리가 없습니다"
          />
        )}
      </Card>
    </>
  )
}
