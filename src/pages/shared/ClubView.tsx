import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { clubApi } from '../../api/endpoints'
import type { ClubActivity, ClubDetail, User } from '../../api/types'
import { Badge, Card, Loading, Table, type Column } from '../../components'
import styles from './ClubView.module.css'

const memberColumns: Column<{ student: User; role: string }>[] = [
  { key: 'student_id', header: '학번', width: 80, render: (m) => m.student.student_id },
  { key: 'name', header: '이름', render: (m) => m.student.name },
  {
    key: 'role',
    header: '역할',
    width: 80,
    align: 'center',
    render: (m) => <Badge tone={m.role === '부장' ? 'blue' : 'gray'}>{m.role}</Badge>,
  },
]

const activityColumns: Column<ClubActivity>[] = [
  { key: 'date', header: '날짜', width: 120, render: (a) => a.date },
  { key: 'title', header: '활동', width: 240, render: (a) => a.title },
  { key: 'content', header: '내용', render: (a) => a.content || '-' },
]

/** 동아리 정보 + 부원 명단 + 활동 기록 (학생 창체/자율, 교사 동아리 관리 공용) */
export function ClubView({ club, activityAction }: { club: ClubDetail; activityAction?: ReactNode }) {
  const activities = useQuery({ queryKey: ['club-activities', club.id], queryFn: () => clubApi.activities(club.id) })

  return (
    <>
      <Card accent={club.type === '창체' ? 'blue' : 'teal'}>
        <div className={styles.head}>
          <span className="text-h2">{club.name}</span>
          <Badge tone={club.type === '창체' ? 'blue' : 'teal'}>{club.type}</Badge>
        </div>
        <dl className={styles.info}>
          <dt>지도교사</dt>
          <dd>{club.advisor_name ?? '-'}</dd>
          <dt>활동 장소</dt>
          <dd>{club.room ?? '-'}</dd>
          <dt>부원 수</dt>
          <dd>{club.member_count}명</dd>
        </dl>
        {club.description && <p className={styles.description}>{club.description}</p>}
      </Card>
      <div className={styles.grid}>
        <Card variant="table">
          <h2 className="text-h2" style={{ margin: '0 0 16px' }}>
            부원 명단
          </h2>
          <Table columns={memberColumns} rows={club.members} rowKey={(m) => m.student.id} empty="부원이 없습니다" />
        </Card>
        <Card variant="table">
          <div className={styles.head}>
            <h2 className="text-h2" style={{ margin: 0 }}>
              활동 기록
            </h2>
            {activityAction}
          </div>
          {activities.isLoading ? (
            <Loading />
          ) : (
            <Table columns={activityColumns} rows={activities.data ?? []} rowKey={(a) => a.id} empty="활동 기록이 없습니다" />
          )}
        </Card>
      </div>
    </>
  )
}
