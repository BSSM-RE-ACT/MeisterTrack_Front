import { SummaryCard } from '../../components'
import styles from './StudentDashboardPage.module.css'

export function StudentDashboardPage() {
  const today = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'full' }).format(new Date())
  return (
    <>
      <section className={styles.banner}>
        <p className={styles.date}>{today}</p>
        <h1 className={styles.greeting}>안녕하세요, 학생님!</h1>
        <p className={styles.bannerSub}>오늘도 좋은 하루 보내세요.</p>
      </section>
      {/* TODO: FastAPI 응답으로 교체 */}
      <div className={styles.grid}>
        <SummaryCard title="출결" value="출석" accent="blue" actions={['이번 달 지각 0회', '출결 기록 보기']} />
        <SummaryCard title="시간표" value="7교시" accent="navy" actions={['다음 수업: 프로그래밍', '주간 시간표 보기']} />
        <SummaryCard title="급식" value="중식" accent="amber" actions={['오늘의 메뉴', '주간 급식 보기']} />
        <SummaryCard title="상벌점" value="+12" accent="teal" actions={['상점 15 / 벌점 3', '내역 보기']} />
        <SummaryCard title="동아리" value="2" accent="red" actions={['창체 · 자율', '활동 기록 보기']} />
        <SummaryCard title="마이스터역량" value="320" accent="gray" actions={['종합 점수', '상세 보기']} />
      </div>
    </>
  )
}
