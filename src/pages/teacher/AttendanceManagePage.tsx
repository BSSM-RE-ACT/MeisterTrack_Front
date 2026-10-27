import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toYmd } from '../../api/dates'
import { attendanceApi, userApi } from '../../api/endpoints'
import { ATTENDANCE_STATUSES, type AttendanceStatus, type User } from '../../api/types'
import { attendanceTone, Button, Card, ClassPicker, ErrorState, Input, Loading, SummaryCard, Table, type Column } from '../../components'
import { PageHeader } from '../../layouts/PageHeader'
import styles from './AttendanceManagePage.module.css'

type Entry = { status: AttendanceStatus; reason: string }

/** 출결 입력: 날짜·반을 고르고 학생별 상태를 바꾼 뒤 한 번에 저장 */
export function AttendanceManagePage() {
  const queryClient = useQueryClient()
  const [date, setDate] = useState(toYmd(new Date()))
  const [grade, setGrade] = useState(2)
  const [classNo, setClassNo] = useState(1)
  const [entries, setEntries] = useState<Record<number, Entry>>({})
  const [saved, setSaved] = useState(false)

  const students = useQuery({
    queryKey: ['students', grade, classNo],
    queryFn: () => userApi.students({ grade, class_no: classNo }),
  })
  const records = useQuery({
    queryKey: ['attendance-daily', date, grade, classNo],
    queryFn: () => attendanceApi.daily(date, { grade, class_no: classNo }),
  })

  // 저장된 기록을 불러오고, 기록이 없는 학생은 출석으로 채운다
  useEffect(() => {
    if (!students.data || !records.data) return
    const byStudent = new Map(records.data.map((r) => [r.student_id, r]))
    setEntries(
      Object.fromEntries(
        students.data.map((s) => {
          const r = byStudent.get(s.id)
          return [s.id, { status: r?.status ?? '출석', reason: r?.reason ?? '' }]
        }),
      ),
    )
    setSaved(false)
  }, [students.data, records.data])

  const save = useMutation({
    mutationFn: () =>
      attendanceApi.save(
        Object.entries(entries).map(([id, e]) => ({
          student_id: Number(id),
          date,
          status: e.status,
          reason: e.reason.trim() || null,
        })),
      ),
    onSuccess: () => {
      setSaved(true)
      queryClient.invalidateQueries({ queryKey: ['attendance-daily', date, grade, classNo] })
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
    },
  })

  const update = (id: number, patch: Partial<Entry>) => {
    setEntries((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))
    setSaved(false)
  }

  const columns: Column<User>[] = [
    { key: 'number', header: '번호', width: 70, align: 'center', render: (s) => s.number },
    { key: 'name', header: '이름', width: 120, render: (s) => s.name },
    {
      key: 'status',
      header: '상태',
      width: 340,
      render: (s) => (
        <div className={styles.toggle}>
          {ATTENDANCE_STATUSES.map((status) => (
            <button
              key={status}
              className={entries[s.id]?.status === status ? styles[`on-${attendanceTone[status]}`] : undefined}
              onClick={() => update(s.id, { status })}
            >
              {status}
            </button>
          ))}
        </div>
      ),
    },
    {
      key: 'reason',
      header: '사유',
      render: (s) => (
        <input
          className={styles.reason}
          value={entries[s.id]?.reason ?? ''}
          placeholder={entries[s.id]?.status === '출석' ? '' : '사유 입력'}
          onChange={(e) => update(s.id, { reason: e.target.value })}
        />
      ),
    },
  ]

  const counts = Object.values(entries).reduce<Record<string, number>>((acc, e) => {
    acc[e.status] = (acc[e.status] ?? 0) + 1
    return acc
  }, {})

  return (
    <>
      <PageHeader
        title="출결 관리"
        actions={
          <div className={styles.controls}>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="날짜" />
            <ClassPicker
              grade={grade}
              classNo={classNo}
              onChange={(g, c) => {
                setGrade(g)
                setClassNo(c)
              }}
            />
            <Button disabled={save.isPending || !students.data?.length} onClick={() => save.mutate()}>
              {saved ? '저장됨' : '저장'}
            </Button>
          </div>
        }
      />
      <div className={styles.summary}>
        {ATTENDANCE_STATUSES.map((s) => (
          <SummaryCard key={s} title={s} value={counts[s] ?? 0} accent={attendanceTone[s]} />
        ))}
      </div>
      {save.error && <ErrorState error={save.error} />}
      <Card variant="table">
        {students.isLoading || records.isLoading ? (
          <Loading />
        ) : students.error ? (
          <ErrorState error={students.error} />
        ) : (
          <Table columns={columns} rows={students.data ?? []} rowKey={(s) => s.id} empty="이 반에 등록된 학생이 없습니다" />
        )}
      </Card>
    </>
  )
}
