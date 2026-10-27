// MeisterTrack_Back 응답 타입. 백엔드 스키마가 바뀌면 같이 맞춘다.

export type Role = 'student' | 'teacher'

export interface User {
  id: number
  email: string
  name: string
  role: Role
  grade: number | null
  class_no: number | null
  number: number | null
  student_id: string | null
  position: string | null
  phone: string | null
}

export interface TokenResponse {
  access_token: string
  token_type: 'bearer'
  user: User
}

export const MEISTER_CATEGORIES = ['직업기초능력', '전문기술역량', '인성·직업의식', '인문학적 소양', '외국어능력'] as const
export type MeisterCategory = (typeof MEISTER_CATEGORIES)[number]
export type SubmissionStatus = '대기' | '승인' | '반려'

export interface Submission {
  id: number
  student_id: number
  category: MeisterCategory
  item: string
  title: string
  content: string
  attachment_url: string | null
  acquired_at: string | null
  status: SubmissionStatus
  score: number | null
  review_memo: string | null
  reviewed_at: string | null
  created_at: string
}

export interface SubmissionWithStudent extends Submission {
  student: User
}

export interface Page<T> {
  items: T[]
  total: number
  page: number
  size: number
}

export interface ReviewSummary {
  pending_by_grade: Record<string, number>
  approved_this_month: number
  rejected_this_month: number
  pending_by_category: Record<MeisterCategory, number>
}

export interface StudentScore {
  student: User
  total: number
  categories: { category: MeisterCategory; score: number; grade: string | null; items: Submission[] }[]
}

export type AttendanceStatus = '출석' | '지각' | '조퇴' | '결석'
export const ATTENDANCE_STATUSES: AttendanceStatus[] = ['출석', '지각', '조퇴', '결석']

export interface AttendanceRecord {
  id: number
  student_id: number
  date: string
  status: AttendanceStatus
  reason: string | null
}

export interface MonthlyAttendance {
  month: string
  counts: Record<AttendanceStatus, number>
  records: AttendanceRecord[]
}

export interface TimetableSlot {
  weekday: number
  period: number
  subject: string
  teacher_name: string | null
  room: string | null
}

export interface Timetable {
  grade: number
  class_no: number
  slots: TimetableSlot[]
}

export interface Meal {
  date: string
  type: '조식' | '중식' | '석식'
  dishes: { name: string; allergies: number[] }[]
  calories: string | null
}

export interface MileageSummary {
  merit: number
  demerit: number
  total: number
}

export interface MileageRecord {
  id: number
  student_id: number
  type: '상점' | '벌점'
  points: number
  reason: string
  date: string
  teacher_name: string
}

export interface ClubDetail {
  id: number
  name: string
  type: '창체' | '자율'
  description: string
  room: string | null
  advisor_name: string | null
  member_count: number
  members: { student: User; role: '부장' | '부원' }[]
}

export interface SchoolEvent {
  id: number | null
  title: string
  start_date: string
  end_date: string
  grade: number | null
  memo: string | null
  source: 'neis' | 'school'
}
