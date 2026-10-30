import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { aiApi, meisterApi } from '../../api/endpoints'
import type { SubmissionWithStudent } from '../../api/types'
import {
  Badge,
  Button,
  Card,
  ErrorState,
  Input,
  Loading,
  Modal,
  statusTone,
  Table,
  TextArea,
  type Column,
} from '../../components'
import styles from './MeisterReviewDetailPage.module.css'

const historyColumns: Column<SubmissionWithStudent>[] = [
  { key: 'category', header: '카테고리', width: 130, render: (r) => r.category },
  { key: 'title', header: '제목', render: (r) => <Link to={`/teacher/meister/review/${r.id}`}>{r.title}</Link> },
  { key: 'score', header: '점수', width: 70, align: 'center', render: (r) => r.score ?? '-' },
  {
    key: 'status',
    header: '상태',
    width: 80,
    align: 'center',
    render: (r) => <Badge tone={statusTone[r.status]}>{r.status}</Badge>,
  },
]

export function MeisterReviewDetailPage() {
  const id = Number(useParams().id)
  const queryClient = useQueryClient()
  const [modal, setModal] = useState<'approve' | 'reject' | null>(null)
  const [score, setScore] = useState('')
  const [memo, setMemo] = useState('')

  const submission = useQuery({ queryKey: ['meister-submission', id], queryFn: () => meisterApi.get(id) })
  const studentId = submission.data?.student_id
  const history = useQuery({
    queryKey: ['meister-submissions', { student_id: studentId }],
    queryFn: () => meisterApi.list({ student_id: studentId, size: 50 }),
    enabled: studentId !== undefined,
  })

  // 버튼을 눌렀을 때만 호출한다 (Claude API 비용)
  const assist = useQuery({
    queryKey: ['ai-review', id],
    queryFn: () => aiApi.review(id),
    enabled: false,
    retry: false,
    staleTime: Infinity,
  })

  const review = useMutation({
    mutationFn: () => (modal === 'approve' ? meisterApi.approve(id, Number(score), memo || undefined) : meisterApi.reject(id, memo)),
    onSuccess: () => {
      setModal(null)
      setScore('')
      setMemo('')
      queryClient.invalidateQueries({ queryKey: ['meister-submission', id] })
      queryClient.invalidateQueries({ queryKey: ['meister-submissions'] })
      queryClient.invalidateQueries({ queryKey: ['meister-summary'] })
    },
  })

  if (submission.isLoading) return <Loading />
  if (submission.error || !submission.data) return <ErrorState error={submission.error} />
  const s = submission.data
  const student = s.student
  const canSubmit = modal === 'approve' ? score !== '' && Number(score) >= 0 : memo.trim() !== ''

  return (
    <>
      <Link to="/teacher/meister/review" className={styles.back}>
        <ArrowLeft size={18} /> 목록으로
      </Link>

      <div className={styles.layout}>
        <div className={styles.side}>
          <Card>
            <div className={styles.profile}>
              <div className={styles.avatar}>{student.name.slice(0, 1)}</div>
              <div>
                <div className="text-h3">{student.name}</div>
                <div className={styles.muted}>
                  {student.grade}학년 {student.class_no}반 {student.number}번
                </div>
              </div>
            </div>
            <dl className={styles.info}>
              <dt>학번</dt>
              <dd>{student.student_id}</dd>
              <dt>이메일</dt>
              <dd>{student.email}</dd>
            </dl>
          </Card>
          {s.review_memo && (
            <Card>
              <div className="text-h3">처리 메모</div>
              <p className={styles.memo}>{s.review_memo}</p>
            </Card>
          )}
        </div>

        <div className={styles.main}>
          <Card>
            <div className={styles.titleRow}>
              <div>
                <div className={styles.muted}>
                  {s.category} · {s.item}
                </div>
                <h1 className="text-h1" style={{ margin: '4px 0 0' }}>
                  {s.title}
                </h1>
              </div>
              <Badge tone={statusTone[s.status]}>{s.status}</Badge>
            </div>
            <dl className={styles.info}>
              <dt>신청일</dt>
              <dd>{s.created_at.slice(0, 10)}</dd>
              {s.acquired_at && (
                <>
                  <dt>취득일</dt>
                  <dd>{s.acquired_at.slice(0, 10)}</dd>
                </>
              )}
              {s.score !== null && (
                <>
                  <dt>점수</dt>
                  <dd>{s.score}</dd>
                </>
              )}
            </dl>
            <p className={styles.content}>{s.content || '제출 내용이 없습니다.'}</p>
            {s.attachment_url && (
              <a href={s.attachment_url} target="_blank" rel="noreferrer" className={styles.attachment}>
                첨부파일 열기
              </a>
            )}
            {s.status === '대기' && (
              // 반려 → 승인(오른쪽 끝) 순서
              <div className={styles.actions}>
                <Button variant="danger" size="lg" onClick={() => setModal('reject')}>
                  반려
                </Button>
                <Button size="lg" onClick={() => setModal('approve')}>
                  승인
                </Button>
              </div>
            )}
          </Card>

          {s.status === '대기' && (
            <Card>
              <div className={styles.aiHeader}>
                <div className="text-h2">AI 심사 보조</div>
                <Button variant="secondary" className={styles.aiButton} disabled={assist.isFetching} onClick={() => assist.refetch()}>
                  <Sparkles size={16} /> {assist.isFetching ? '분석 중…' : assist.data ? '다시 분석' : '분석하기'}
                </Button>
              </div>
              {assist.error && <ErrorState error={assist.error} />}
              {assist.data ? (
                <div className={styles.ai}>
                  <p className={styles.aiSummary}>{assist.data.summary}</p>
                  {assist.data.checks.length > 0 && (
                    <ul className={styles.aiChecks}>
                      {assist.data.checks.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  )}
                  <div className={styles.aiScore}>
                    <div>
                      <div className={styles.muted}>제안 점수</div>
                      <div className="text-h2">{assist.data.suggested_score}점</div>
                    </div>
                    <div className={styles.aiReason}>
                      {assist.data.score_reason}
                      {assist.data.score_min !== null && (
                        <div className={styles.muted}>
                          비슷한 승인 {assist.data.similar.length}건 · {assist.data.score_min}~{assist.data.score_max}점 (평균{' '}
                          {assist.data.score_avg}점)
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => {
                        setScore(String(assist.data?.suggested_score ?? ''))
                        setModal('approve')
                      }}
                    >
                      이 점수로 승인
                    </Button>
                  </div>
                  {assist.data.similar.length > 0 && (
                    <div>
                      <div className={styles.muted}>비슷한 승인 사례</div>
                      <ul className={styles.aiSimilar}>
                        {assist.data.similar.map((c) => (
                          <li key={c.id}>
                            <Link to={`/teacher/meister/review/${c.id}`}>{c.title}</Link>
                            <span>
                              {c.item} · {c.score}점
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className={styles.aiNote}>AI 제안은 참고용이에요. 증빙을 직접 확인하고 판단해 주세요.</div>
                </div>
              ) : (
                !assist.error && <p className={styles.muted}>증빙 요약, 확인할 점, 비슷한 승인 사례와 점수 범위를 보여 드려요.</p>
              )}
            </Card>
          )}

          <Card variant="table">
            <div className="text-h2" style={{ marginBottom: 16 }}>
              다른 제출 이력
            </div>
            <Table
              columns={historyColumns}
              rows={history.data?.items.filter((h) => h.id !== id) ?? []}
              rowKey={(r) => r.id}
              empty="다른 제출 이력이 없습니다"
            />
          </Card>
        </div>
      </div>

      <Modal
        open={modal !== null}
        title={modal === 'approve' ? '신청을 승인할까요?' : '신청을 반려할까요?'}
        onClose={() => setModal(null)}
        actions={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>
              취소
            </Button>
            <Button
              variant={modal === 'reject' ? 'danger' : 'primary'}
              disabled={!canSubmit || review.isPending}
              onClick={() => review.mutate()}
            >
              {modal === 'approve' ? '승인' : '반려'}
            </Button>
          </>
        }
      >
        <div className={styles.modalBody}>
          {modal === 'approve' ? (
            <>
              <Input
                label="점수"
                type="number"
                min={0}
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="등급은 자동 계산됩니다"
              />
              <TextArea label="메모 (선택)" value={memo} onChange={(e) => setMemo(e.target.value)} />
            </>
          ) : (
            <TextArea label="반려 사유" value={memo} onChange={(e) => setMemo(e.target.value)} />
          )}
          {review.error && <ErrorState error={review.error} />}
        </div>
      </Modal>
    </>
  )
}
