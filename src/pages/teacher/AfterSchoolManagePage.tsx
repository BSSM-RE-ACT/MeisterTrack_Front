import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { currentSemester, WEEKDAYS } from '../../api/dates'
import { afterSchoolApi } from '../../api/endpoints'
import { courseTime } from '../../api/format'
import type { AfterSchoolCourse, CourseInput, User } from '../../api/types'
import {
  Badge,
  Button,
  Card,
  ErrorState,
  Input,
  Loading,
  Modal,
  Select,
  Table,
  TextArea,
  type Column,
} from '../../components'
import { PageHeader } from '../../layouts/PageHeader'
import styles from './Manage.module.css'

const WEEKDAY_OPTIONS = WEEKDAYS.map((label, value) => ({ value, label: `${label}요일` }))

/** 방과후 관리: 이번 학기 강좌 목록, 개설·수정, 신청 학생 명단 */
export function AfterSchoolManagePage() {
  const semester = currentSemester()
  const [editing, setEditing] = useState<AfterSchoolCourse | 'new' | null>(null)
  const [roster, setRoster] = useState<AfterSchoolCourse | null>(null)
  const { data, isLoading, error } = useQuery({
    queryKey: ['after-school', semester],
    queryFn: () => afterSchoolApi.courses(semester),
  })

  const columns: Column<AfterSchoolCourse>[] = [
    { key: 'name', header: '강좌', width: 180, render: (c) => c.name },
    { key: 'teacher', header: '강사', width: 90, render: (c) => c.teacher_name },
    { key: 'time', header: '시간', width: 140, render: courseTime },
    { key: 'room', header: '장소', render: (c) => c.room ?? '-' },
    {
      key: 'enrolled',
      header: '신청',
      width: 80,
      align: 'center',
      render: (c) => (
        <Badge tone={c.enrolled >= c.capacity ? 'red' : 'gray'}>
          {c.enrolled}/{c.capacity}
        </Badge>
      ),
    },
    {
      key: 'open',
      header: '상태',
      width: 100,
      align: 'center',
      render: (c) => <Badge tone={c.is_open ? 'teal' : 'gray'}>{c.is_open ? '모집 중' : '마감'}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      width: 110,
      align: 'center',
      render: (c) => (
        <div className={styles.actions}>
          <button className={styles.link} onClick={() => setRoster(c)}>
            명단
          </button>
          <button className={styles.link} onClick={() => setEditing(c)}>
            수정
          </button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title={`방과후 관리 · ${semester.replace('-', '년 ')}학기`}
        actions={<Button onClick={() => setEditing('new')}>강좌 개설</Button>}
      />
      <Card variant="table">
        {isLoading ? (
          <Loading />
        ) : error ? (
          <ErrorState error={error} />
        ) : (
          <Table columns={columns} rows={data ?? []} rowKey={(c) => c.id} empty="이번 학기 강좌가 없습니다" />
        )}
      </Card>
      {editing && (
        <CourseModal
          course={editing === 'new' ? undefined : editing}
          semester={semester}
          onClose={() => setEditing(null)}
        />
      )}
      {roster && <RosterModal course={roster} onClose={() => setRoster(null)} />}
    </>
  )
}

function CourseModal({ course, semester, onClose }: { course?: AfterSchoolCourse; semester: string; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<CourseInput>({
    name: course?.name ?? '',
    description: course?.description ?? '',
    weekday: course?.weekday ?? 0,
    start_time: course?.start_time ?? '16:40',
    end_time: course?.end_time ?? '18:20',
    room: course?.room ?? null,
    capacity: course?.capacity ?? 20,
    semester: course?.semester ?? semester,
    is_open: course?.is_open ?? true,
  })
  const save = useMutation({
    mutationFn: () => (course ? afterSchoolApi.update(course.id, form) : afterSchoolApi.create(form)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['after-school'] })
      onClose()
    },
  })
  const valid = form.name.trim() && form.start_time < form.end_time && form.capacity >= 1

  return (
    <Modal
      open
      title={course ? '강좌 수정' : '강좌 개설'}
      width={520}
      onClose={onClose}
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button disabled={!valid || save.isPending} onClick={() => save.mutate()}>
            저장
          </Button>
        </>
      }
    >
      <div className={styles.form}>
        <Input label="강좌 이름" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <div className={styles.row}>
          <Select label="요일" value={form.weekday} options={WEEKDAY_OPTIONS} onChange={(weekday) => setForm({ ...form, weekday })} />
          <Input label="장소" value={form.room ?? ''} onChange={(e) => setForm({ ...form, room: e.target.value || null })} />
        </div>
        <div className={styles.row}>
          <Input label="시작" type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
          <Input label="종료" type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
        </div>
        <div className={styles.row}>
          <Input
            label="정원"
            type="number"
            min={1}
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
          />
          <label className={styles.check} style={{ alignSelf: 'end', height: 40 }}>
            <input type="checkbox" checked={form.is_open} onChange={(e) => setForm({ ...form, is_open: e.target.checked })} />
            신청 받기
          </label>
        </div>
        <TextArea label="소개" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        {save.error && <ErrorState error={save.error} />}
      </div>
    </Modal>
  )
}

const rosterColumns: Column<User>[] = [
  { key: 'student_id', header: '학번', width: 80, render: (s) => s.student_id },
  { key: 'name', header: '이름', render: (s) => s.name },
  { key: 'phone', header: '연락처', width: 140, render: (s) => s.phone ?? '-' },
]

function RosterModal({ course, onClose }: { course: AfterSchoolCourse; onClose: () => void }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['after-school-students', course.id],
    queryFn: () => afterSchoolApi.students(course.id),
  })
  return (
    <Modal open title={`${course.name} 신청 학생`} width={520} onClose={onClose} actions={<Button onClick={onClose}>닫기</Button>}>
      {isLoading ? (
        <Loading />
      ) : error ? (
        <ErrorState error={error} />
      ) : (
        <Table columns={rosterColumns} rows={data ?? []} rowKey={(s) => s.id} empty="신청한 학생이 없습니다" />
      )}
    </Modal>
  )
}
