import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ApiError } from './api/client'
import { AuthProvider } from './auth/AuthContext'
import { RequireRole } from './auth/RequireRole'
import { AppLayout } from './layouts/AppLayout'
import { studentMenu, teacherMenu } from './layouts/menus'
import { ComponentsPage } from './pages/dev/ComponentsPage'
import { LoginPage } from './pages/Login/LoginPage'
import { AfterSchoolPage } from './pages/student/AfterSchoolPage'
import { AttendancePage } from './pages/student/AttendancePage'
import { CalendarPage } from './pages/student/CalendarPage'
import { ClubListPage } from './pages/student/ClubListPage'
import { MealPage } from './pages/student/MealPage'
import { MeisterPage } from './pages/student/MeisterPage'
import { MileagePage } from './pages/student/MileagePage'
import { MyClubPage } from './pages/student/MyClubPage'
import { StudentDashboardPage } from './pages/student/StudentDashboardPage'
import { TimetablePage } from './pages/student/TimetablePage'
import { AfterSchoolManagePage } from './pages/teacher/AfterSchoolManagePage'
import { AttendanceManagePage } from './pages/teacher/AttendanceManagePage'
import { CalendarManagePage } from './pages/teacher/CalendarManagePage'
import { ClubManageDetailPage } from './pages/teacher/ClubManageDetailPage'
import { ClubManagePage } from './pages/teacher/ClubManagePage'
import { MeisterReviewDetailPage } from './pages/teacher/MeisterReviewDetailPage'
import { MeisterReviewPage } from './pages/teacher/MeisterReviewPage'
import { MileageManagePage } from './pages/teacher/MileageManagePage'
import { StudentScoreDetailPage } from './pages/teacher/StudentScoreDetailPage'
import { StudentScoresPage } from './pages/teacher/StudentScoresPage'
import { TeacherDashboardPage } from './pages/teacher/TeacherDashboardPage'
import { TimetableManagePage } from './pages/teacher/TimetableManagePage'
import { UserImportPage } from './pages/teacher/UserImportPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // 4xx는 다시 시도해도 같은 결과라 재시도하지 않는다
      retry: (count, error) => !(error instanceof ApiError && error.status < 500) && count < 1,
    },
  },
})

// Tauri는 파일 기반으로 서빙되므로 HashRouter 사용
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dev/components" element={<ComponentsPage />} />
            <Route
              path="/student"
              element={
                <RequireRole role="student">
                  <AppLayout menu={studentMenu} />
                </RequireRole>
              }
            >
              <Route index element={<StudentDashboardPage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="timetable" element={<TimetablePage />} />
              <Route path="meal" element={<MealPage />} />
              <Route path="mileage" element={<MileagePage />} />
              <Route path="club/creative" element={<MyClubPage key="창체" type="창체" />} />
              <Route path="club/self" element={<MyClubPage key="자율" type="자율" />} />
              <Route path="club/list" element={<ClubListPage />} />
              <Route path="after-school" element={<AfterSchoolPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="meister" element={<MeisterPage />} />
              <Route path="*" element={<Navigate to="/student" replace />} />
            </Route>
            <Route
              path="/teacher"
              element={
                <RequireRole role="teacher">
                  <AppLayout menu={teacherMenu} />
                </RequireRole>
              }
            >
              <Route index element={<TeacherDashboardPage />} />
              <Route path="attendance" element={<AttendanceManagePage />} />
              <Route path="timetable" element={<TimetableManagePage />} />
              <Route path="meal" element={<MealPage />} />
              <Route path="mileage" element={<MileageManagePage />} />
              <Route path="meister/review" element={<MeisterReviewPage />} />
              <Route path="meister/review/:id" element={<MeisterReviewDetailPage />} />
              <Route path="meister/scores" element={<StudentScoresPage />} />
              <Route path="meister/scores/:id" element={<StudentScoreDetailPage />} />
              <Route path="clubs" element={<ClubManagePage />} />
              <Route path="clubs/:id" element={<ClubManageDetailPage />} />
              <Route path="after-school" element={<AfterSchoolManagePage />} />
              <Route path="calendar" element={<CalendarManagePage />} />
              <Route path="users" element={<UserImportPage />} />
              <Route path="*" element={<Navigate to="/teacher" replace />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
