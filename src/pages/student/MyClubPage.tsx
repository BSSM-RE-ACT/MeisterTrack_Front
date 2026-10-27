import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toYmd } from '../../api/dates'
import { clubApi } from '../../api/endpoints'
import type { ClubDetail, ClubType } from '../../api/types'
import { useUser } from '../../auth/useAuth'
import { Button, Card, Empty, ErrorState, Input, Loading, Modal, TextArea } from '../../components'
import { PageHeader } from '../../layouts/PageHeader'
import { ClubView } from '../shared/ClubView'

/** 창체 / 자율 동아리 (내가 속한 동아리) */
export function MyClubPage({ type }: { type: ClubType }) {
  const user = useUser()
  const { data, isLoading, error } = useQuery({ queryKey: ['clubs', 'me'], queryFn: clubApi.mine })
  const clubs = data?.filter((c) => c.type === type) ?? []

  return (
    <>
      <PageHeader title={`${type} 동아리`} />
      {isLoading ? (
        <Loading />
      ) : error ? (
        <ErrorState error={error} />
      ) : clubs.length === 0 ? (
        <Card>
          <Empty>{`가입한 ${type} 동아리가 없습니다`}</Empty>
        </Card>
      ) : (
        clubs.map((club) => {
          const isLeader = club.members.some((m) => m.student.id === user.id && m.role === '부장')
          return (
            <ClubView key={club.id} club={club} activityAction={isLeader && <AddActivityButton club={club} />} />
          )
        })
      )}
    </>
  )
}

/** 활동 기록 작성 (교사·부장) */
export function AddActivityButton({ club }: { club: ClubDetail }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ date: toYmd(new Date()), title: '', content: '' })
  const add = useMutation({
    mutationFn: () => clubApi.addActivity(club.id, form),
    onSuccess: () => {
      setOpen(false)
      setForm({ date: toYmd(new Date()), title: '', content: '' })
      queryClient.invalidateQueries({ queryKey: ['club-activities', club.id] })
    },
  })

  return (
    <>
      <Button size="md" onClick={() => setOpen(true)}>
        활동 기록 작성
      </Button>
      <Modal
        open={open}
        title="활동 기록 작성"
        onClose={() => setOpen(false)}
        actions={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button disabled={!form.title.trim() || add.isPending} onClick={() => add.mutate()}>
              저장
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="날짜" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Input label="활동" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <TextArea label="내용" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          {add.error && <ErrorState error={add.error} />}
        </div>
      </Modal>
    </>
  )
}
