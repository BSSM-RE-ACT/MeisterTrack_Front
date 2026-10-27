import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toYmd } from '../../api/dates'
import { mileageApi } from '../../api/endpoints'
import { signed } from '../../api/format'
import type { MileageRecord, StudentMileage } from '../../api/types'
import {
  Badge,
  Button,
  Card,
  ClassPicker,
  ErrorState,
  FilterPills,
  Input,
  Loading,
  Modal,
  Table,
  type Column,
} from '../../components'
import { PageHeader } from '../../layouts/PageHeader'
import styles from './MileageManagePage.module.css'

const TYPES = ['상점', '벌점'] as const

/** 상벌점 관리: 반 학생 합계표 + 체크한 학생에게 일괄 부여 + 학생별 내역 */
export function MileageManagePage() {
  const queryClient = useQueryClient()
  const [grade, setGrade] = useState(2)
  const [classNo, setClassNo] = useState(1)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [form, setForm] = useState({ type: '상점' as (typeof TYPES)[number], points: '1', reason: '', date: toYmd(new Date()) })
  const [detail, setDetail] = useState<StudentMileage | null>(null)

  const rows = useQuery({ queryKey: ['mileage-class', grade, classNo], queryFn: () => mileageApi.byClass(grade, classNo) })
  const give = useMutation({
    mutationFn: () =>
      mileageApi.give({ student_ids: [...selected], type: form.type, points: Number(form.points), reason: form.reason, date: form.date }),
    onSuccess: () => {
      setSelected(new Set())
      setForm({ ...form, reason: '' })
      queryClient.invalidateQueries({ queryKey: ['mileage-class'] })
      queryClient.invalidateQueries({ queryKey: ['mileage'] })
    },
  })

  const all = rows.data ?? []
  const allChecked = all.length > 0 && all.every((r) => selected.has(r.student.id))
  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const columns: Column<StudentMileage>[] = [
    {
      key: 'check',
      header: '',
      width: 48,
      align: 'center',
      render: (r) => (
        <input
          type="checkbox"
          checked={selected.has(r.student.id)}
          onClick={(e) => e.stopPropagation()}
          onChange={() => toggle(r.student.id)}
          aria-label={`${r.student.name} 선택`}
        />
      ),
    },
    { key: 'student_id', header: '학번', width: 80, render: (r) => r.student.student_id },
    { key: 'name', header: '이름', render: (r) => r.student.name },
    { key: 'merit', header: '상점', width: 80, align: 'center', render: (r) => r.summary.merit },
    { key: 'demerit', header: '벌점', width: 80, align: 'center', render: (r) => r.summary.demerit },
    {
      key: 'total',
      header: '합계',
      width: 80,
      align: 'center',
      render: (r) => <Badge tone={r.summary.total < 0 ? 'red' : 'teal'}>{signed(r.summary.total)}</Badge>,
    },
  ]

  const points = Number(form.points)
  const canGive = selected.size > 0 && form.reason.trim() && points >= 1 && points <= 100

  return (
    <>
      <PageHeader
        title="상벌점 관리"
        actions={
          <ClassPicker
            grade={grade}
            classNo={classNo}
            onChange={(g, c) => {
              setGrade(g)
              setClassNo(c)
              setSelected(new Set())
            }}
          />
        }
      />
      <div className={styles.layout}>
        <Card variant="table">
          <div className={styles.tableHead}>
            <label className={styles.checkAll}>
              <input
                type="checkbox"
                checked={allChecked}
                onChange={() => setSelected(allChecked ? new Set() : new Set(all.map((r) => r.student.id)))}
              />
              전체 선택
            </label>
            <span className={styles.muted}>행을 누르면 내역을 볼 수 있어요</span>
          </div>
          {rows.isLoading ? (
            <Loading />
          ) : rows.error ? (
            <ErrorState error={rows.error} />
          ) : (
            <Table columns={columns} rows={all} rowKey={(r) => r.student.id} onRowClick={setDetail} empty="이 반에 등록된 학생이 없습니다" />
          )}
        </Card>

        <Card className={styles.form}>
          <span className="text-h3">상벌점 부여</span>
          <FilterPills options={TYPES} value={form.type} onChange={(type) => setForm({ ...form, type })} />
          <Input label="점수 (1~100)" type="number" min={1} max={100} value={form.points} onChange={(e) => setForm({ ...form, points: e.target.value })} />
          <Input label="사유" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          <Input label="날짜" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          {give.error && <ErrorState error={give.error} />}
          <Button size="lg" disabled={!canGive || give.isPending} onClick={() => give.mutate()}>
            {selected.size}명에게 {form.type} 부여
          </Button>
        </Card>
      </div>

      {detail && <MileageDetailModal row={detail} onClose={() => setDetail(null)} />}
    </>
  )
}

function MileageDetailModal({ row, onClose }: { row: StudentMileage; onClose: () => void }) {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['mileage', row.student.id], queryFn: () => mileageApi.student(row.student.id) })
  const cancel = useMutation({
    mutationFn: mileageApi.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mileage', row.student.id] })
      queryClient.invalidateQueries({ queryKey: ['mileage-class'] })
    },
  })

  const columns: Column<MileageRecord>[] = [
    { key: 'date', header: '날짜', width: 100, render: (r) => r.date.slice(5) },
    { key: 'points', header: '점수', width: 60, render: (r) => (r.type === '상점' ? `+${r.points}` : `-${r.points}`) },
    { key: 'reason', header: '사유', render: (r) => r.reason },
    {
      key: 'cancel',
      header: '',
      width: 60,
      render: (r) => (
        <button className={styles.cancel} disabled={cancel.isPending} onClick={() => cancel.mutate(r.id)}>
          취소
        </button>
      ),
    },
  ]

  return (
    <Modal open title={`${row.student.name} 상벌점 내역`} onClose={onClose} actions={<Button onClick={onClose}>닫기</Button>}>
      {isLoading ? <Loading /> : <Table columns={columns} rows={data?.records ?? []} rowKey={(r) => r.id} empty="내역이 없습니다" />}
    </Modal>
  )
}
