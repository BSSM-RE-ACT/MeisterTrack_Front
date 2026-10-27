import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { meisterApi } from '../../api/endpoints'
import { MEISTER_CATEGORIES, type StudentScoreRow } from '../../api/types'
import { Badge, Card, ClassPicker, ErrorState, Loading, Table, type Column } from '../../components'
import { PageHeader } from '../../layouts/PageHeader'

const columns: Column<StudentScoreRow>[] = [
  { key: 'student_id', header: '학번', width: 80, render: (r) => r.student.student_id },
  { key: 'name', header: '이름', width: 100, render: (r) => r.student.name },
  ...MEISTER_CATEGORIES.map(
    (c): Column<StudentScoreRow> => ({ key: c, header: c, align: 'center', render: (r) => r.scores[c] ?? 0 }),
  ),
  { key: 'total', header: '종합', width: 80, align: 'center', render: (r) => <Badge tone="teal">{r.total}</Badge> },
  {
    key: 'pending',
    header: '심사 대기',
    width: 90,
    align: 'center',
    render: (r) => (r.pending ? <Badge tone="amber">{r.pending}건</Badge> : '-'),
  },
]

/** 학생 점수 조회: 반 단위 마역량 점수표. 행을 누르면 상세 */
export function StudentScoresPage() {
  const navigate = useNavigate()
  const [grade, setGrade] = useState(2)
  const [classNo, setClassNo] = useState(1)
  const { data, isLoading, error } = useQuery({
    queryKey: ['meister-scores', grade, classNo],
    queryFn: () => meisterApi.scores({ grade, class_no: classNo }),
  })

  return (
    <>
      <PageHeader
        title="학생 점수 조회"
        actions={
          <ClassPicker
            grade={grade}
            classNo={classNo}
            onChange={(g, c) => {
              setGrade(g)
              setClassNo(c)
            }}
          />
        }
      />
      <Card variant="table">
        {isLoading ? (
          <Loading />
        ) : error ? (
          <ErrorState error={error} />
        ) : (
          <Table
            columns={columns}
            rows={data ?? []}
            rowKey={(r) => r.student.id}
            onRowClick={(r) => navigate(`/teacher/meister/scores/${r.student.id}`)}
            empty="이 반에 등록된 학생이 없습니다"
          />
        )}
      </Card>
    </>
  )
}
