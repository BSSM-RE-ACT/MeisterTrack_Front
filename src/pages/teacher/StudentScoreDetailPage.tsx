import { useQuery } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { meisterApi } from '../../api/endpoints'
import { Card, ErrorState, Loading } from '../../components'
import { MeisterScoreView } from '../shared/MeisterScoreView'
import styles from './Manage.module.css'

/** 학생 점수 상세: 학생 정보 + 마역량 정보 카드 */
export function StudentScoreDetailPage() {
  const studentId = Number(useParams().id)
  const { data, isLoading, error } = useQuery({
    queryKey: ['meister-score', studentId],
    queryFn: () => meisterApi.score(studentId),
  })

  return (
    <>
      <Link to="/teacher/meister/scores" className={styles.back}>
        <ChevronLeft size={16} /> 학생 점수 조회
      </Link>
      {isLoading ? (
        <Loading />
      ) : error ? (
        <ErrorState error={error} />
      ) : data ? (
        <div className={styles.split}>
          <Card>
            <span className="text-h2">{data.student.name}</span>
            <dl className={styles.info}>
              <dt>학번</dt>
              <dd>{data.student.student_id}</dd>
              <dt>이메일</dt>
              <dd>{data.student.email}</dd>
              <dt>연락처</dt>
              <dd>{data.student.phone ?? '-'}</dd>
            </dl>
          </Card>
          <MeisterScoreView score={data} />
        </div>
      ) : null}
    </>
  )
}
