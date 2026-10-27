import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { clubApi, userApi } from '../../api/endpoints'
import type { ClubDetail, ClubRole, User } from '../../api/types'
import { Button, ClassPicker, ErrorState, Loading, Modal, Select } from '../../components'
import { PageHeader } from '../../layouts/PageHeader'
import { ClubView } from '../shared/ClubView'
import { AddActivityButton } from '../student/MyClubPage'
import { ClubFormModal } from './ClubFormModal'
import styles from './Manage.module.css'

/** 동아리 상세 관리: 정보 수정, 부원 편성, 활동 기록 */
export function ClubManageDetailPage() {
  const clubId = Number(useParams().id)
  const [editing, setEditing] = useState(false)
  const [membersOpen, setMembersOpen] = useState(false)
  const { data: club, isLoading, error } = useQuery({ queryKey: ['club', clubId], queryFn: () => clubApi.get(clubId) })

  return (
    <>
      <Link to="/teacher/clubs" className={styles.back}>
        <ChevronLeft size={16} /> 동아리 관리
      </Link>
      {isLoading ? (
        <Loading />
      ) : error ? (
        <ErrorState error={error} />
      ) : club ? (
        <>
          <PageHeader
            title={club.name}
            actions={
              <div className={styles.actions}>
                <Button variant="secondary" onClick={() => setEditing(true)}>
                  정보 수정
                </Button>
                <Button variant="secondary" onClick={() => setMembersOpen(true)}>
                  부원 관리
                </Button>
              </div>
            }
          />
          <ClubView club={club} activityAction={<AddActivityButton club={club} />} />
          {editing && <ClubFormModal club={club} onClose={() => setEditing(false)} />}
          {membersOpen && <MembersModal club={club} onClose={() => setMembersOpen(false)} />}
        </>
      ) : null}
    </>
  )
}

const ROLES = [
  { value: '부원' as ClubRole, label: '부원' },
  { value: '부장' as ClubRole, label: '부장' },
]

/** 부원 편성: 반별 학생을 체크해 추가하고 역할을 고른다. 저장하면 명단을 통째로 바꾼다 */
function MembersModal({ club, onClose }: { club: ClubDetail; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [grade, setGrade] = useState(club.members[0]?.student.grade ?? 1)
  const [classNo, setClassNo] = useState(club.members[0]?.student.class_no ?? 1)
  const [members, setMembers] = useState(() => new Map(club.members.map((m) => [m.student.id, m])))
  const students = useQuery({
    queryKey: ['students', grade, classNo],
    queryFn: () => userApi.students({ grade, class_no: classNo }),
  })
  const save = useMutation({
    mutationFn: () => clubApi.setMembers(club.id, [...members.values()].map((m) => ({ student_id: m.student.id, role: m.role }))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['club', club.id] })
      queryClient.invalidateQueries({ queryKey: ['clubs'] })
      onClose()
    },
  })

  const update = (fn: (next: Map<number, { student: User; role: ClubRole }>) => void) =>
    setMembers((prev) => {
      const next = new Map(prev)
      fn(next)
      return next
    })
  const toggle = (s: User) =>
    update((next) => {
      if (next.has(s.id)) next.delete(s.id)
      else next.set(s.id, { student: s, role: '부원' })
    })

  return (
    <Modal
      open
      title="부원 관리"
      width={640}
      onClose={onClose}
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button disabled={save.isPending} onClick={() => save.mutate()}>
            {members.size}명 저장
          </Button>
        </>
      }
    >
      <div className={styles.form}>
        <div className={styles.toolbar}>
          <span className="text-h3">학생 추가</span>
          <ClassPicker
            grade={grade}
            classNo={classNo}
            onChange={(g, c) => {
              setGrade(g)
              setClassNo(c)
            }}
          />
        </div>
        {students.isLoading ? (
          <Loading />
        ) : (
          <div className={styles.checkGrid}>
            {(students.data ?? []).map((s) => (
              <label key={s.id} className={styles.check}>
                <input type="checkbox" checked={members.has(s.id)} onChange={() => toggle(s)} />
                {s.student_id} {s.name}
              </label>
            ))}
            {students.data?.length === 0 && <span className={styles.muted}>이 반에 학생이 없습니다</span>}
          </div>
        )}
        <span className="text-h3">현재 명단</span>
        {members.size === 0 ? (
          <span className={styles.muted}>부원이 없습니다</span>
        ) : (
          <ul className={styles.memberList}>
            {[...members.values()].map((m) => (
              <li key={m.student.id}>
                <span>
                  {m.student.student_id} {m.student.name}
                </span>
                <div>
                  <Select
                    value={m.role}
                    options={ROLES}
                    aria-label={`${m.student.name} 역할`}
                    onChange={(role) => update((next) => next.set(m.student.id, { ...m, role }))}
                  />
                </div>
                <button className={`${styles.link} ${styles.danger}`} onClick={() => toggle(m.student)}>
                  빼기
                </button>
              </li>
            ))}
          </ul>
        )}
        {save.error && <ErrorState error={save.error} />}
      </div>
    </Modal>
  )
}
