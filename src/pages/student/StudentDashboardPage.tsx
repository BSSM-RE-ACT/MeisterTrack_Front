import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { toYm, toYmd, weekdayIndex } from '../../api/dates'
import { attendanceApi, clubApi, mealApi, meisterApi, mileageApi, timetableApi } from '../../api/endpoints'
import { useUser } from '../../auth/useAuth'
import { SummaryCard } from '../../components'
import styles from './StudentDashboardPage.module.css'

export function StudentDashboardPage() {
  const user = useUser()
  const now = new Date()
  const today = toYmd(now)
  const weekday = weekdayIndex(now)

  const attendance = useQuery({
    queryKey: ['attendance', user.id, toYm(now)],
    queryFn: () => attendanceApi.monthly(user.id, toYm(now)),
  })
  const timetable = useQuery({ queryKey: ['timetable', 'me'], queryFn: timetableApi.mine })
  const meals = useQuery({ queryKey: ['meals', today, today], queryFn: () => mealApi.list(today, today) })
  const mileage = useQuery({ queryKey: ['mileage', user.id], queryFn: () => mileageApi.student(user.id) })
  const clubs = useQuery({ queryKey: ['clubs', 'me'], queryFn: clubApi.mine })
  const score = useQuery({ queryKey: ['meister-score', user.id], queryFn: () => meisterApi.score(user.id) })

  const todayRecord = attendance.data?.records.find((r) => r.date === today)
  const todaySlots = timetable.data?.slots.filter((s) => s.weekday === weekday) ?? []
  const lunch = meals.data?.find((m) => m.type === '중식') ?? meals.data?.[0]
  const counts = attendance.data?.counts

  return (
    <>
      <section className={styles.banner}>
        <p className={styles.date}>{new Intl.DateTimeFormat('ko-KR', { dateStyle: 'full' }).format(now)}</p>
        <h1 className={styles.greeting}>안녕하세요, {user.name}님!</h1>
        <p className={styles.bannerSub}>오늘도 좋은 하루 보내세요.</p>
      </section>
      <div className={styles.grid}>
        <SummaryCard
          title="출결"
          value={todayRecord?.status ?? '-'}
          accent="blue"
          actions={[
            counts ? `이번 달 지각 ${counts['지각']} · 조퇴 ${counts['조퇴']} · 결석 ${counts['결석']}` : '불러오는 중',
            <Link to="/student/attendance">출결 기록 보기</Link>,
          ]}
        />
        <SummaryCard
          title="시간표"
          value={weekday === null ? '휴일' : `${todaySlots.length}교시`}
          accent="navy"
          actions={[
            todaySlots.length ? todaySlots.map((s) => s.subject).slice(0, 3).join(' · ') + ' …' : '오늘 수업 없음',
            <Link to="/student/timetable">주간 시간표 보기</Link>,
          ]}
        />
        <SummaryCard
          title="급식"
          value={lunch?.type ?? '-'}
          accent="amber"
          actions={[
            lunch ? lunch.dishes.slice(0, 3).map((d) => d.name).join(', ') : meals.isError ? '급식 정보를 못 불러왔어요' : '급식 없음',
            <Link to="/student/meal">주간 급식 보기</Link>,
          ]}
        />
        <SummaryCard
          title="상벌점"
          value={mileage.data ? formatSigned(mileage.data.summary.total) : '-'}
          accent="teal"
          actions={[
            mileage.data ? `상점 ${mileage.data.summary.merit} / 벌점 ${mileage.data.summary.demerit}` : '불러오는 중',
            <Link to="/student/mileage">내역 보기</Link>,
          ]}
        />
        <SummaryCard
          title="동아리"
          value={clubs.data?.length ?? '-'}
          accent="red"
          actions={[
            clubs.data?.length ? clubs.data.map((c) => c.name).join(' · ') : '가입한 동아리 없음',
            <Link to="/student/club/creative">활동 기록 보기</Link>,
          ]}
        />
        <SummaryCard
          title="마이스터역량"
          value={score.data?.total ?? '-'}
          accent="gray"
          actions={['종합 점수', <Link to="/student/meister">상세 보기</Link>]}
        />
      </div>
    </>
  )
}

function formatSigned(n: number) {
  return n > 0 ? `+${n}` : String(n)
}
