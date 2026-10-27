import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { WEEKDAYS } from '../../api/dates'
import { timetableApi } from '../../api/endpoints'
import { Button, Card, ClassPicker, ErrorState, Loading } from '../../components'
import { PageHeader } from '../../layouts/PageHeader'
import grid from '../student/TimetablePage.module.css'
import styles from './TimetableManagePage.module.css'

const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8]
type Cell = { subject: string; teacher_name: string }
const key = (w: number, p: number) => `${w}-${p}`

/** NEIS 스타일 편집 그리드: 칸을 바로 고치고 저장하면 반 시간표 전체를 바꾼다 */
export function TimetableManagePage() {
  const queryClient = useQueryClient()
  const [grade, setGrade] = useState(2)
  const [classNo, setClassNo] = useState(1)
  const [cells, setCells] = useState<Record<string, Cell>>({})
  const [dirty, setDirty] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['timetable', grade, classNo],
    queryFn: () => timetableApi.get(grade, classNo),
  })

  useEffect(() => {
    if (!data) return
    setCells(
      Object.fromEntries(
        data.slots.map((s) => [key(s.weekday, s.period), { subject: s.subject, teacher_name: s.teacher_name ?? '' }]),
      ),
    )
    setDirty(false)
  }, [data])

  const save = useMutation({
    mutationFn: () =>
      timetableApi.save(
        grade,
        classNo,
        Object.entries(cells)
          .filter(([, c]) => c.subject.trim())
          .map(([k, c]) => {
            const [weekday, period] = k.split('-').map(Number)
            return { weekday, period, subject: c.subject.trim(), teacher_name: c.teacher_name.trim() || null }
          }),
      ),
    onSuccess: () => {
      setDirty(false)
      queryClient.invalidateQueries({ queryKey: ['timetable'] })
    },
  })

  const edit = (k: string, patch: Partial<Cell>) => {
    setCells((prev) => ({ ...prev, [k]: { ...(prev[k] ?? { subject: '', teacher_name: '' }), ...patch } }))
    setDirty(true)
  }

  return (
    <>
      <PageHeader
        title="시간표 관리"
        actions={
          <div className={styles.controls}>
            <ClassPicker
              grade={grade}
              classNo={classNo}
              onChange={(g, c) => {
                if (dirty && !window.confirm('저장하지 않은 변경 사항이 사라집니다. 이동할까요?')) return
                setGrade(g)
                setClassNo(c)
              }}
            />
            <Button disabled={!dirty || save.isPending} onClick={() => save.mutate()}>
              {dirty ? '저장' : '저장됨'}
            </Button>
          </div>
        }
      />
      {save.error && <ErrorState error={save.error} />}
      <Card variant="table">
        {isLoading ? (
          <Loading />
        ) : error ? (
          <ErrorState error={error} />
        ) : (
          <div className={grid.grid}>
            <div className={grid.head} />
            {WEEKDAYS.map((d) => (
              <div key={d} className={grid.head}>
                {d}
              </div>
            ))}
            {PERIODS.map((p) => (
              <Row key={p} period={p} cells={cells} edit={edit} />
            ))}
          </div>
        )}
      </Card>
    </>
  )
}

function Row({
  period,
  cells,
  edit,
}: {
  period: number
  cells: Record<string, Cell>
  edit: (k: string, patch: Partial<Cell>) => void
}) {
  return (
    <>
      <div className={grid.period}>{period}교시</div>
      {WEEKDAYS.map((_, w) => {
        const k = key(w, period)
        return (
          <div key={k} className={styles.cell}>
            <input
              className={styles.subject}
              placeholder="과목"
              value={cells[k]?.subject ?? ''}
              onChange={(e) => edit(k, { subject: e.target.value })}
              aria-label={`${WEEKDAYS[w]} ${period}교시 과목`}
            />
            <input
              className={styles.teacher}
              placeholder="교사"
              value={cells[k]?.teacher_name ?? ''}
              onChange={(e) => edit(k, { teacher_name: e.target.value })}
              aria-label={`${WEEKDAYS[w]} ${period}교시 교사`}
            />
          </div>
        )
      })}
    </>
  )
}
