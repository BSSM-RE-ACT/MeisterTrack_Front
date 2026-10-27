import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { toYmd } from '../../api/dates'
import { afterSchoolApi, calendarApi, clubApi, meisterApi } from '../../api/endpoints'
import { useUser } from '../../auth/useAuth'
import { SummaryCard } from '../../components'
import styles from '../student/StudentDashboardPage.module.css'

export function TeacherDashboardPage() {
  const user = useUser()
  const now = new Date()
  const today = toYmd(now)
  const weekLater = toYmd(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7))

  const summary = useQuery({ queryKey: ['meister-summary'], queryFn: meisterApi.summary })
  const events = useQuery({ queryKey: ['calendar', today, weekLater], queryFn: () => calendarApi.list(today, weekLater) })
  const clubs = useQuery({ queryKey: ['clubs', 'me'], queryFn: clubApi.mine })
  const courses = useQuery({ queryKey: ['after-school', 'me'], queryFn: afterSchoolApi.mine })

  const pending = Object.values(summary.data?.pending_by_grade ?? {}).reduce((a, b) => a + b, 0)
  const nextEvent = events.data?.[0]

  return (
    <>
      <section className={styles.banner}>
        <p className={styles.date}>{new Intl.DateTimeFormat('ko-KR', { dateStyle: 'full' }).format(now)}</p>
        <h1 className={styles.greeting}>안녕하세요, {user.name} 선생님!</h1>
        <p className={styles.bannerSub}>오늘 처리할 일을 확인하세요.</p>
      </section>
      <div className={styles.grid}>
        <SummaryCard
          title="역량 인증 대기"
          value={summary.data ? pending : '-'}
          accent="amber"
          actions={[
            `이번 달 승인 ${summary.data?.approved_this_month ?? 0} · 반려 ${summary.data?.rejected_this_month ?? 0}`,
            <Link to="/teacher/meister/review">심사하러 가기</Link>,
          ]}
        />
        <SummaryCard
          title="출결"
          value="입력"
          accent="blue"
          actions={['오늘 반 출결을 입력하세요', <Link to="/teacher/attendance">출결 관리</Link>]}
        />
        <SummaryCard
          title="다가오는 일정"
          value={events.data?.length ?? '-'}
          accent="teal"
          actions={[
            nextEvent ? `${nextEvent.start_date.slice(5)} ${nextEvent.title}` : '7일 안에 일정 없음',
            <Link to="/teacher/calendar">학사일정 관리</Link>,
          ]}
        />
        <SummaryCard
          title="지도 동아리"
          value={clubs.data?.length ?? '-'}
          accent="red"
          actions={[
            clubs.data?.length ? clubs.data.map((c) => c.name).join(' · ') : '지도하는 동아리 없음',
            <Link to="/teacher/clubs">동아리 관리</Link>,
          ]}
        />
        <SummaryCard
          title="방과후 강좌"
          value={courses.data?.length ?? '-'}
          accent="navy"
          actions={[
            courses.data?.length ? courses.data.map((c) => `${c.name} ${c.enrolled}/${c.capacity}`).join(' · ') : '담당 강좌 없음',
            <Link to="/teacher/after-school">방과후 관리</Link>,
          ]}
        />
        <SummaryCard
          title="상벌점"
          value="부여"
          accent="gray"
          actions={['학생에게 상벌점을 부여하세요', <Link to="/teacher/mileage">상벌점 관리</Link>]}
        />
      </div>
    </>
  )
}
