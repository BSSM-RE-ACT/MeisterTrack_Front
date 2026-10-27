import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '../../api/client'
import { userApi } from '../../api/endpoints'
import type { User } from '../../api/types'
import { Button, Card, ClassPicker, ErrorState, Loading, Table, type Column } from '../../components'
import { PageHeader } from '../../layouts/PageHeader'
import styles from './Manage.module.css'

const columns: Column<User>[] = [
  { key: 'student_id', header: '학번', width: 80, render: (u) => u.student_id },
  { key: 'name', header: '이름', width: 100, render: (u) => u.name },
  { key: 'email', header: '이메일', render: (u) => u.email },
  { key: 'phone', header: '연락처', width: 140, render: (u) => u.phone ?? '-' },
]

/** 계정 일괄 등록: 엑셀 양식 내려받기 → 채워서 업로드. 오류가 하나라도 있으면 아무것도 저장되지 않는다 */
export function UserImportPage() {
  const queryClient = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [grade, setGrade] = useState(2)
  const [classNo, setClassNo] = useState(1)

  const students = useQuery({
    queryKey: ['students', grade, classNo],
    queryFn: () => userApi.students({ grade, class_no: classNo }),
  })
  const template = useMutation({
    mutationFn: userApi.importTemplate,
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'bssm_user_import_template.xlsx'
      // 문서에 붙여야 download 이름이 적용되고, 바로 revoke하면 다운로드가 끊긴다
      document.body.append(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    },
  })
  const upload = useMutation({
    mutationFn: (f: File) => userApi.importExcel(f),
    onSuccess: () => {
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })

  // 422면 행별 오류가 줄바꿈으로 이어져 온다
  const rowErrors =
    upload.error instanceof ApiError && upload.error.status === 422 ? upload.error.message.split('\n').filter(Boolean) : null

  return (
    <>
      <PageHeader title="계정 등록" />
      <Card className={styles.form}>
        <div className={styles.toolbar}>
          <div>
            <span className="text-h3">엑셀 일괄 등록</span>
            <p className={styles.muted} style={{ margin: '4px 0 0' }}>
              양식에 이메일·이름·구분(학생/교사)과 학년·반·번호를 채워 올려 주세요. 이미 있는 이메일은 정보가 갱신됩니다.
            </p>
          </div>
          <Button variant="secondary" disabled={template.isPending} onClick={() => template.mutate()}>
            양식 내려받기
          </Button>
        </div>
        <div className={styles.toolbar} style={{ justifyContent: 'flex-start' }}>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx"
            hidden
            aria-label="엑셀 파일"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null)
              upload.reset()
            }}
          />
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            파일 선택
          </Button>
          <span className={styles.muted}>{file?.name ?? '선택한 파일 없음'}</span>
          <Button disabled={!file || upload.isPending} onClick={() => file && upload.mutate(file)}>
            {upload.isPending ? '등록 중…' : '업로드'}
          </Button>
        </div>
        {template.error && <ErrorState error={template.error} />}
        {upload.data && (
          <p style={{ margin: 0, color: 'var(--teal-600)' }}>
            등록 완료: 새 계정 {upload.data.created}명, 갱신 {upload.data.updated}명
          </p>
        )}
        {rowErrors ? (
          <div>
            <p style={{ margin: '0 0 8px', color: 'var(--red-500)' }}>
              오류 {rowErrors.length}건이 있어 아무것도 저장하지 않았습니다. 고친 뒤 다시 올려 주세요.
            </p>
            <ul className={styles.errors}>
              {rowErrors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        ) : (
          upload.error && <ErrorState error={upload.error} />
        )}
      </Card>

      <Card variant="table">
        <div className={styles.toolbar} style={{ marginBottom: 16 }}>
          <h2 className="text-h2" style={{ margin: 0 }}>
            등록된 학생
          </h2>
          <ClassPicker
            grade={grade}
            classNo={classNo}
            onChange={(g, c) => {
              setGrade(g)
              setClassNo(c)
            }}
          />
        </div>
        {students.isLoading ? (
          <Loading />
        ) : students.error ? (
          <ErrorState error={students.error} />
        ) : (
          <Table columns={columns} rows={students.data ?? []} rowKey={(u) => u.id} empty="이 반에 등록된 학생이 없습니다" />
        )}
      </Card>
    </>
  )
}
