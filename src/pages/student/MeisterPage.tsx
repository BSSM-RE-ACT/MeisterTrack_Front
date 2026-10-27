import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { meisterApi } from '../../api/endpoints'
import { MEISTER_CATEGORIES, type Submission, type SubmissionInput } from '../../api/types'
import { useUser } from '../../auth/useAuth'
import {
  Badge,
  Button,
  Card,
  ErrorState,
  Input,
  Loading,
  Modal,
  Select,
  statusTone,
  Table,
  TextArea,
  type Column,
} from '../../components'
import { PageHeader } from '../../layouts/PageHeader'
import { MeisterScoreView } from '../shared/MeisterScoreView'
import styles from './MeisterPage.module.css'

const EMPTY: SubmissionInput = { category: '전문기술역량', item: '', title: '', content: '', attachment_url: '', acquired_at: '' }

export function MeisterPage() {
  const user = useUser()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<SubmissionInput>(EMPTY)

  const score = useQuery({ queryKey: ['meister-score', user.id], queryFn: () => meisterApi.score(user.id) })
  const mine = useQuery({ queryKey: ['meister-mine'], queryFn: meisterApi.mine })
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['meister-mine'] })
    queryClient.invalidateQueries({ queryKey: ['meister-score', user.id] })
  }

  const create = useMutation({
    mutationFn: () =>
      meisterApi.create({
        ...form,
        attachment_url: form.attachment_url || null,
        acquired_at: form.acquired_at ? `${form.acquired_at}T00:00:00` : null,
      }),
    onSuccess: () => {
      setOpen(false)
      setForm(EMPTY)
      refresh()
    },
  })
  const cancel = useMutation({ mutationFn: meisterApi.cancel, onSuccess: refresh })

  const columns: Column<Submission>[] = [
    { key: 'created_at', header: '신청일', width: 110, render: (s) => s.created_at.slice(0, 10) },
    { key: 'category', header: '카테고리', width: 130, render: (s) => <Badge tone="teal">{s.category}</Badge> },
    { key: 'item', header: '세부 항목', width: 150, render: (s) => s.item },
    { key: 'title', header: '제목', render: (s) => s.title },
    { key: 'score', header: '점수', width: 70, align: 'center', render: (s) => s.score ?? '-' },
    { key: 'memo', header: '처리 메모', width: 180, render: (s) => s.review_memo ?? '-' },
    {
      key: 'status',
      header: '상태',
      width: 80,
      align: 'center',
      render: (s) => <Badge tone={statusTone[s.status]}>{s.status}</Badge>,
    },
    {
      key: 'action',
      header: '',
      width: 90,
      align: 'center',
      render: (s) =>
        s.status === '대기' && (
          <Button variant="secondary" disabled={cancel.isPending} onClick={() => cancel.mutate(s.id)}>
            취소
          </Button>
        ),
    },
  ]

  const valid = form.item.trim() && form.title.trim()

  return (
    <>
      <PageHeader title="마이스터역량인증제" actions={<Button onClick={() => setOpen(true)}>인증 신청</Button>} />
      {score.isLoading ? <Loading /> : score.error ? <ErrorState error={score.error} /> : score.data && <MeisterScoreView score={score.data} />}

      <Card variant="table">
        <h2 className="text-h2" style={{ margin: '0 0 16px' }}>
          내 신청 내역
        </h2>
        {cancel.error && <ErrorState error={cancel.error} />}
        <Table columns={columns} rows={mine.data ?? []} rowKey={(s) => s.id} empty="신청 내역이 없습니다" />
      </Card>

      <Modal
        open={open}
        title="역량 인증 신청"
        onClose={() => setOpen(false)}
        actions={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button disabled={!valid || create.isPending} onClick={() => create.mutate()}>
              신청
            </Button>
          </>
        }
      >
        <div className={styles.form}>
          <Select
            label="카테고리"
            value={form.category}
            options={MEISTER_CATEGORIES.map((c) => ({ value: c, label: c }))}
            onChange={(category) => setForm({ ...form, category })}
          />
          <Input
            label="세부 항목"
            placeholder="예: 전공관련 자격증"
            value={form.item}
            onChange={(e) => setForm({ ...form, item: e.target.value })}
          />
          <Input
            label="제목"
            placeholder="예: 정보처리기능사"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Input
            label="취득일 (선택)"
            type="date"
            value={form.acquired_at ?? ''}
            onChange={(e) => setForm({ ...form, acquired_at: e.target.value })}
          />
          <TextArea label="내용" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          <Input
            label="첨부 링크 (선택)"
            placeholder="https://"
            value={form.attachment_url ?? ''}
            onChange={(e) => setForm({ ...form, attachment_url: e.target.value })}
          />
          {create.error && <ErrorState error={create.error} />}
        </div>
      </Modal>
    </>
  )
}
