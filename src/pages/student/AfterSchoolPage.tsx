import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { currentSemester } from '../../api/dates'
import { courseTime } from '../../api/format'
import { afterSchoolApi } from '../../api/endpoints'
import type { AfterSchoolCourse } from '../../api/types'
import { Badge, Button, Card, ErrorState, FilterPills, Loading, Table, type Column } from '../../components'
import { PageHeader } from '../../layouts/PageHeader'

const TABS = ['전체 강좌', '내 강좌'] as const

export function AfterSchoolPage() {
  const queryClient = useQueryClient()
  const semester = currentSemester()
  const [tab, setTab] = useState<(typeof TABS)[number]>('전체 강좌')
  const all = useQuery({ queryKey: ['after-school', semester], queryFn: () => afterSchoolApi.courses(semester) })
  const mine = useQuery({ queryKey: ['after-school', 'me'], queryFn: afterSchoolApi.mine })

  const toggle = useMutation({
    mutationFn: (c: AfterSchoolCourse) => (c.enrolled_by_me ? afterSchoolApi.cancel(c.id) : afterSchoolApi.enroll(c.id)),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['after-school'] }),
  })

  const columns: Column<AfterSchoolCourse>[] = [
    { key: 'name', header: '강좌', width: 200, render: (c) => c.name },
    { key: 'teacher', header: '강사', width: 100, render: (c) => c.teacher_name },
    { key: 'time', header: '시간', width: 150, render: courseTime },
    { key: 'room', header: '장소', render: (c) => c.room ?? '-' },
    {
      key: 'enrolled',
      header: '신청',
      width: 90,
      align: 'center',
      render: (c) => (
        <Badge tone={c.enrolled >= c.capacity ? 'red' : 'gray'}>
          {c.enrolled}/{c.capacity}
        </Badge>
      ),
    },
    {
      key: 'action',
      header: '',
      width: 130,
      align: 'center',
      render: (c) =>
        c.enrolled_by_me ? (
          <Button variant="secondary" disabled={toggle.isPending} onClick={() => toggle.mutate(c)}>
            신청 취소
          </Button>
        ) : (
          <Button
            disabled={toggle.isPending || !c.is_open || c.enrolled >= c.capacity}
            onClick={() => toggle.mutate(c)}
          >
            {c.is_open ? '신청' : '마감'}
          </Button>
        ),
    },
  ]

  const query = tab === '전체 강좌' ? all : mine
  return (
    <>
      <PageHeader title={`방과후 · ${semester.replace('-', '년 ')}학기`} />
      <FilterPills options={TABS} value={tab} onChange={setTab} />
      {toggle.error && <ErrorState error={toggle.error} />}
      <Card variant="table">
        {query.isLoading ? (
          <Loading />
        ) : query.error ? (
          <ErrorState error={query.error} />
        ) : (
          <Table
            columns={columns}
            rows={query.data ?? []}
            rowKey={(c) => c.id}
            empty={tab === '내 강좌' ? '신청한 강좌가 없습니다' : '이번 학기 강좌가 없습니다'}
          />
        )}
      </Card>
    </>
  )
}
