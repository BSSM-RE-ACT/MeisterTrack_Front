import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { clubApi, userApi, type ClubInput } from '../../api/endpoints'
import type { Club, ClubType } from '../../api/types'
import { Button, ErrorState, FilterPills, Input, Modal, Select, TextArea } from '../../components'
import styles from './Manage.module.css'

const TYPES = ['창체', '자율'] as const

/** 동아리 만들기 / 정보 수정 */
export function ClubFormModal({ club, onClose, onSaved }: { club?: Club; onClose: () => void; onSaved?: (club: Club) => void }) {
  const queryClient = useQueryClient()
  const teachers = useQuery({ queryKey: ['teachers'], queryFn: userApi.teachers })
  const [form, setForm] = useState<ClubInput>({
    name: club?.name ?? '',
    type: club?.type ?? '창체',
    description: club?.description ?? '',
    room: club?.room ?? null,
    advisor_id: club?.advisor_id ?? null,
  })
  const save = useMutation({
    mutationFn: () => (club ? clubApi.update(club.id, form) : clubApi.create(form)),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] })
      queryClient.invalidateQueries({ queryKey: ['club', saved.id] })
      onSaved?.(saved)
      onClose()
    },
  })

  const advisorOptions = [
    { value: 0, label: club ? '지정 안 함' : '나 (기본)' },
    ...(teachers.data ?? []).map((t) => ({ value: t.id, label: t.name })),
  ]

  return (
    <Modal
      open
      title={club ? '동아리 정보 수정' : '동아리 만들기'}
      onClose={onClose}
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button disabled={!form.name.trim() || save.isPending} onClick={() => save.mutate()}>
            저장
          </Button>
        </>
      }
    >
      <div className={styles.form}>
        <FilterPills options={TYPES} value={form.type} onChange={(type: ClubType) => setForm({ ...form, type })} />
        <Input label="동아리 이름" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <div className={styles.row}>
          <Input label="활동 장소" value={form.room ?? ''} onChange={(e) => setForm({ ...form, room: e.target.value || null })} />
          <Select
            label="지도교사"
            value={form.advisor_id ?? 0}
            options={advisorOptions}
            onChange={(id) => setForm({ ...form, advisor_id: id || null })}
          />
        </div>
        <TextArea label="소개" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        {save.error && <ErrorState error={save.error} />}
      </div>
    </Modal>
  )
}
