import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toYmd } from '../../api/dates'
import { calendarApi } from '../../api/endpoints'
import type { EventInput, SchoolEvent } from '../../api/types'
import { Button, ErrorState, Input, Modal, Select, TextArea } from '../../components'
import { PageHeader } from '../../layouts/PageHeader'
import { SchoolCalendar } from '../shared/SchoolCalendar'
import styles from './Manage.module.css'

const GRADE_OPTIONS = [
  { value: 0, label: '전체' },
  { value: 1, label: '1학년' },
  { value: 2, label: '2학년' },
  { value: 3, label: '3학년' },
]

type Editing = { event?: SchoolEvent; date: string }

/** 학사일정 관리: 날짜를 누르면 추가, 학교 일정을 누르면 수정·삭제. NEIS 일정은 읽기 전용 */
export function CalendarManagePage() {
  const [editing, setEditing] = useState<Editing | null>(null)
  return (
    <>
      <PageHeader title="학사일정 관리" actions={<Button onClick={() => setEditing({ date: toYmd(new Date()) })}>일정 추가</Button>} />
      <p className={styles.muted} style={{ margin: 0 }}>
        날짜를 누르면 일정을 추가하고, 목록에서 학교 일정을 누르면 수정할 수 있어요. NEIS 일정은 수정할 수 없습니다.
      </p>
      <SchoolCalendar
        onDayClick={(date) => setEditing({ date })}
        onEventClick={(event) => setEditing({ event, date: event.start_date })}
      />
      {editing && <EventModal {...editing} onClose={() => setEditing(null)} />}
    </>
  )
}

function EventModal({ event, date, onClose }: Editing & { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<EventInput>({
    title: event?.title ?? '',
    start_date: event?.start_date ?? date,
    end_date: event?.end_date ?? date,
    grade: event?.grade ?? null,
    memo: event?.memo ?? null,
  })
  const done = () => {
    queryClient.invalidateQueries({ queryKey: ['calendar'] })
    onClose()
  }
  const save = useMutation({
    mutationFn: () => (event?.id ? calendarApi.update(event.id, form) : calendarApi.create(form)),
    onSuccess: done,
  })
  const remove = useMutation({ mutationFn: () => calendarApi.remove(event!.id!), onSuccess: done })
  const valid = form.title.trim() && form.start_date && form.start_date <= form.end_date

  return (
    <Modal
      open
      title={event ? '일정 수정' : '일정 추가'}
      onClose={onClose}
      actions={
        <>
          {event ? (
            <Button variant="danger" disabled={remove.isPending} onClick={() => remove.mutate()}>
              삭제
            </Button>
          ) : (
            <Button variant="secondary" onClick={onClose}>
              취소
            </Button>
          )}
          <Button disabled={!valid || save.isPending} onClick={() => save.mutate()}>
            저장
          </Button>
        </>
      }
    >
      <div className={styles.form}>
        <Input label="일정" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <div className={styles.row}>
          <Input label="시작일" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          <Input label="종료일" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
        </div>
        <Select label="대상" value={form.grade ?? 0} options={GRADE_OPTIONS} onChange={(g) => setForm({ ...form, grade: g || null })} />
        <TextArea label="메모" value={form.memo ?? ''} onChange={(e) => setForm({ ...form, memo: e.target.value || null })} />
        {(save.error || remove.error) && <ErrorState error={save.error ?? remove.error} />}
      </div>
    </Modal>
  )
}
