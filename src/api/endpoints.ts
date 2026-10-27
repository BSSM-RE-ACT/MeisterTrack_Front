import { api } from './client'
import type {
  ClubDetail,
  Meal,
  MeisterCategory,
  MileageRecord,
  MileageSummary,
  MonthlyAttendance,
  Page,
  ReviewSummary,
  SchoolEvent,
  StudentScore,
  SubmissionStatus,
  SubmissionWithStudent,
  Timetable,
  TokenResponse,
  User,
} from './types'

function query(params: Record<string, string | number | undefined | null>) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value))
  }
  const text = search.toString()
  return text ? `?${text}` : ''
}

const post = (body: unknown) => ({ method: 'POST', body: JSON.stringify(body) })

export const authApi = {
  google: (idToken: string) => api<TokenResponse>('/auth/google', post({ id_token: idToken })),
  devLogin: (email: string) => api<TokenResponse>('/auth/dev-login', post({ email })),
  me: () => api<User>('/auth/me'),
}

export interface SubmissionFilter {
  status?: SubmissionStatus
  category?: MeisterCategory
  grade?: number
  student_id?: number
  page?: number
  size?: number
}

export const meisterApi = {
  list: (filter: SubmissionFilter) => api<Page<SubmissionWithStudent>>(`/meister/submissions${query({ ...filter })}`),
  summary: () => api<ReviewSummary>('/meister/submissions/summary'),
  get: (id: number) => api<SubmissionWithStudent>(`/meister/submissions/${id}`),
  approve: (id: number, score: number, memo?: string) =>
    api<SubmissionWithStudent>(`/meister/submissions/${id}/approve`, post({ score, memo })),
  reject: (id: number, memo: string) => api<SubmissionWithStudent>(`/meister/submissions/${id}/reject`, post({ memo })),
  score: (studentId: number) => api<StudentScore>(`/meister/scores/${studentId}`),
}

export const attendanceApi = {
  monthly: (studentId: number, month: string) =>
    api<MonthlyAttendance>(`/attendance/students/${studentId}${query({ month })}`),
}

export const timetableApi = {
  mine: () => api<Timetable>('/timetable/me'),
}

export const mealApi = {
  list: (start: string, end: string) => api<Meal[]>(`/meals${query({ start, end })}`),
}

export const mileageApi = {
  student: (studentId: number) =>
    api<{ summary: MileageSummary; records: MileageRecord[] }>(`/mileage/students/${studentId}`),
}

export const clubApi = {
  mine: () => api<ClubDetail[]>('/clubs/me'),
}

export const calendarApi = {
  list: (start: string, end: string) => api<SchoolEvent[]>(`/calendar${query({ start, end })}`),
}
