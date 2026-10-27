import { api, apiBlob } from './client'
import type {
  AfterSchoolCourse,
  AttendanceRecord,
  AttendanceStatus,
  Club,
  ClubActivity,
  ClubDetail,
  ClubRole,
  ClubType,
  CourseInput,
  EventInput,
  Meal,
  MeisterCategory,
  MileageRecord,
  MileageSummary,
  MonthlyAttendance,
  Page,
  ReviewSummary,
  SchoolEvent,
  StudentMileage,
  StudentScore,
  StudentScoreRow,
  Submission,
  SubmissionInput,
  SubmissionStatus,
  SubmissionWithStudent,
  Timetable,
  TimetableSlot,
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

const send = (method: string, body?: unknown) => ({
  method,
  body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body),
})
const post = (body?: unknown) => send('POST', body)
const put = (body: unknown) => send('PUT', body)
const del = () => send('DELETE')

export interface ClassFilter {
  grade?: number
  class_no?: number
}

export const authApi = {
  google: (idToken: string) => api<TokenResponse>('/auth/google', post({ id_token: idToken })),
  devLogin: (email: string) => api<TokenResponse>('/auth/dev-login', post({ email })),
  me: () => api<User>('/auth/me'),
}

export const userApi = {
  updateMe: (phone: string | null) => api<User>('/users/me', send('PATCH', { phone })),
  students: (filter: ClassFilter) => api<User[]>(`/users/students${query({ ...filter })}`),
  teachers: () => api<User[]>('/users/teachers'),
  importTemplate: () => apiBlob('/users/import/template'),
  importExcel: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api<{ created: number; updated: number }>('/users/import', post(form))
  },
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
  create: (body: SubmissionInput) => api<Submission>('/meister/submissions', post(body)),
  mine: () => api<Submission[]>('/meister/submissions/me'),
  cancel: (id: number) => api<void>(`/meister/submissions/${id}`, del()),
  list: (filter: SubmissionFilter) => api<Page<SubmissionWithStudent>>(`/meister/submissions${query({ ...filter })}`),
  summary: () => api<ReviewSummary>('/meister/submissions/summary'),
  get: (id: number) => api<SubmissionWithStudent>(`/meister/submissions/${id}`),
  approve: (id: number, score: number, memo?: string) =>
    api<SubmissionWithStudent>(`/meister/submissions/${id}/approve`, post({ score, memo })),
  reject: (id: number, memo: string) => api<SubmissionWithStudent>(`/meister/submissions/${id}/reject`, post({ memo })),
  scores: (filter: ClassFilter) => api<StudentScoreRow[]>(`/meister/scores${query({ ...filter })}`),
  score: (studentId: number) => api<StudentScore>(`/meister/scores/${studentId}`),
}

export interface AttendanceInput {
  student_id: number
  date: string
  status: AttendanceStatus
  reason?: string | null
}

export const attendanceApi = {
  monthly: (studentId: number, month: string) =>
    api<MonthlyAttendance>(`/attendance/students/${studentId}${query({ month })}`),
  daily: (date: string, filter: ClassFilter) => api<AttendanceRecord[]>(`/attendance${query({ date, ...filter })}`),
  save: (entries: AttendanceInput[]) => api<AttendanceRecord[]>('/attendance', put(entries)),
}

export type SlotInput = Omit<TimetableSlot, 'teacher_name' | 'room'> & Partial<Pick<TimetableSlot, 'teacher_name' | 'room'>>

export const timetableApi = {
  mine: () => api<Timetable>('/timetable/me'),
  get: (grade: number, classNo: number) => api<Timetable>(`/timetable${query({ grade, class_no: classNo })}`),
  save: (grade: number, classNo: number, slots: SlotInput[]) =>
    api<Timetable>(`/timetable${query({ grade, class_no: classNo })}`, put(slots)),
}

export const mealApi = {
  list: (start: string, end: string) => api<Meal[]>(`/meals${query({ start, end })}`),
}

export interface MileageInput {
  student_ids: number[]
  type: '상점' | '벌점'
  points: number
  reason: string
  date: string
}

export const mileageApi = {
  student: (studentId: number) =>
    api<{ summary: MileageSummary; records: MileageRecord[] }>(`/mileage/students/${studentId}`),
  byClass: (grade: number, classNo?: number) =>
    api<StudentMileage[]>(`/mileage/students${query({ grade, class_no: classNo })}`),
  give: (body: MileageInput) => api<MileageRecord[]>('/mileage', post(body)),
  cancel: (id: number) => api<void>(`/mileage/${id}`, del()),
}

export interface ClubInput {
  name: string
  type: ClubType
  description: string
  room: string | null
  advisor_id: number | null
}

export const clubApi = {
  list: (type?: ClubType) => api<Club[]>(`/clubs${query({ type })}`),
  mine: () => api<ClubDetail[]>('/clubs/me'),
  get: (id: number) => api<ClubDetail>(`/clubs/${id}`),
  create: (body: ClubInput) => api<Club>('/clubs', post(body)),
  update: (id: number, body: ClubInput) => api<Club>(`/clubs/${id}`, put(body)),
  setMembers: (id: number, members: { student_id: number; role: ClubRole }[]) =>
    api<ClubDetail>(`/clubs/${id}/members`, put(members)),
  activities: (id: number) => api<ClubActivity[]>(`/clubs/${id}/activities`),
  addActivity: (id: number, body: Omit<ClubActivity, 'id'>) =>
    api<ClubActivity>(`/clubs/${id}/activities`, post(body)),
}

export const afterSchoolApi = {
  courses: (semester: string) => api<AfterSchoolCourse[]>(`/after-school/courses${query({ semester })}`),
  mine: () => api<AfterSchoolCourse[]>('/after-school/me'),
  create: (body: CourseInput) => api<AfterSchoolCourse>('/after-school/courses', post(body)),
  update: (id: number, body: CourseInput) => api<AfterSchoolCourse>(`/after-school/courses/${id}`, put(body)),
  enroll: (id: number) => api<AfterSchoolCourse>(`/after-school/courses/${id}/enroll`, post()),
  cancel: (id: number) => api<AfterSchoolCourse>(`/after-school/courses/${id}/enroll`, del()),
  students: (id: number) => api<User[]>(`/after-school/courses/${id}/students`),
}

export const calendarApi = {
  list: (start: string, end: string) => api<SchoolEvent[]>(`/calendar${query({ start, end })}`),
  create: (body: EventInput) => api<SchoolEvent>('/calendar', post(body)),
  update: (id: number, body: EventInput) => api<SchoolEvent>(`/calendar/${id}`, put(body)),
  remove: (id: number) => api<void>(`/calendar/${id}`, del()),
}
