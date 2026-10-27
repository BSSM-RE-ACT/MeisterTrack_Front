import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { userApi } from '../api/endpoints'
import type { User } from '../api/types'
import { subtitleOf } from '../auth/useAuth'
import { Button, ErrorState, Input, Modal } from '../components'

/** 내 정보: 이름·학년반은 학교 등록 정보라 읽기 전용, 연락처만 수정 */
export function ProfileModal({ user, onClose, onSaved }: { user: User; onClose: () => void; onSaved: (u: User) => void }) {
  const [phone, setPhone] = useState(user.phone ?? '')
  const save = useMutation({
    mutationFn: () => userApi.updateMe(phone.trim() || null),
    onSuccess: (u) => {
      onSaved(u)
      onClose()
    },
  })

  return (
    <Modal
      open
      title="내 정보"
      onClose={onClose}
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            닫기
          </Button>
          <Button disabled={save.isPending} onClick={() => save.mutate()}>
            저장
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Input label="이름" value={user.name} disabled />
        <Input label={user.role === 'teacher' ? '직위' : '학년·반'} value={subtitleOf(user)} disabled />
        {user.student_id && <Input label="학번" value={user.student_id} disabled />}
        <Input label="이메일" value={user.email} disabled />
        <Input label="연락처" value={phone} placeholder="010-0000-0000" onChange={(e) => setPhone(e.target.value)} />
        {save.error && <ErrorState error={save.error} />}
      </div>
    </Modal>
  )
}
