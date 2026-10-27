import {
  Award,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  Clock,
  LayoutDashboard,
  Star,
  Users,
  Utensils,
} from 'lucide-react'
import type { SidebarItem } from '../components'

const icon = { size: 20 }

export const studentMenu: SidebarItem[] = [
  { label: '대시보드', icon: <LayoutDashboard {...icon} />, to: '/student' },
  { label: '출결', icon: <CalendarCheck {...icon} />, to: '/student/attendance' },
  { label: '시간표', icon: <Clock {...icon} />, to: '/student/timetable' },
  { label: '급식', icon: <Utensils {...icon} />, to: '/student/meal' },
  { label: '상벌점', icon: <Star {...icon} />, to: '/student/mileage' },
  {
    label: '동아리',
    icon: <Users {...icon} />,
    children: [
      { label: '창체 동아리', to: '/student/club/creative' },
      { label: '자율 동아리', to: '/student/club/self' },
      { label: '동아리 목록', to: '/student/club/list' },
    ],
  },
  { label: '방과후', icon: <BookOpen {...icon} />, to: '/student/after-school' },
  { label: '학사일정', icon: <CalendarDays {...icon} />, to: '/student/calendar' },
  { label: '마이스터역량인증제', icon: <Award {...icon} />, to: '/student/meister' },
]

export const teacherMenu: SidebarItem[] = [
  { label: '대시보드', icon: <LayoutDashboard {...icon} />, to: '/teacher' },
  { label: '출결 관리', icon: <CalendarCheck {...icon} />, to: '/teacher/attendance' },
  { label: '시간표 관리', icon: <Clock {...icon} />, to: '/teacher/timetable' },
  { label: '상벌점 부여', icon: <Star {...icon} />, to: '/teacher/mileage' },
  {
    label: '마이스터역량',
    icon: <Award {...icon} />,
    children: [
      { label: '인증 심사', to: '/teacher/meister/review' },
      { label: '학생 점수 조회', to: '/teacher/meister/scores' },
    ],
  },
]
