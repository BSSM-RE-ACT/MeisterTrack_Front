import { useState } from 'react'
import { Badge, Button, Card, FilterPills, Modal, Pagination, statusTone, Table, type Column } from '../../components'

interface Row {
  id: number
  name: string
  category: string
  status: keyof typeof statusTone
}

const rows: Row[] = [
  { id: 1, name: '김부마', category: '전문기술역량', status: '대기' },
  { id: 2, name: '이소마', category: '외국어능력', status: '승인' },
  { id: 3, name: '박마고', category: '인성·직업의식', status: '반려' },
]

const columns: Column<Row>[] = [
  { key: 'name', header: '이름', width: 160, render: (r) => r.name },
  { key: 'category', header: '카테고리', render: (r) => <Badge tone="teal">{r.category}</Badge> },
  { key: 'status', header: '상태', width: 120, align: 'center', render: (r) => <Badge tone={statusTone[r.status]}>{r.status}</Badge> },
]

const filters = ['전체', '대기', '승인', '반려'] as const

// 공통 컴포넌트 확인용 페이지 (/dev/components)
export function ComponentsPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>('전체')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24, maxWidth: 1200 }}>
      <Card>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button>메인</Button>
          <Button variant="secondary">보조</Button>
          <Button variant="danger">반려</Button>
          <Button size="lg" onClick={() => setOpen(true)}>모달 열기</Button>
        </div>
      </Card>
      <FilterPills options={filters} value={filter} onChange={setFilter} />
      <Card variant="table">
        <Table columns={columns} rows={rows} rowKey={(r) => r.id} />
        <Pagination page={page} totalPages={5} onChange={setPage} />
      </Card>
      <Modal
        open={open}
        title="신청을 승인할까요?"
        onClose={() => setOpen(false)}
        actions={
          <>
            <Button variant="danger" onClick={() => setOpen(false)}>반려</Button>
            <Button onClick={() => setOpen(false)}>승인</Button>
          </>
        }
      >
        점수를 입력하면 등급은 자동 계산됩니다.
      </Modal>
    </div>
  )
}
