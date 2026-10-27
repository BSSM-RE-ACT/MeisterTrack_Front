import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ApiError } from './api/client'
import { AuthProvider } from './auth/AuthContext'
import { RequireRole } from './auth/RequireRole'
import { AppLayout } from './layouts/AppLayout'
import { studentMenu, teacherMenu } from './layouts/menus'
import { ComingSoonPage } from './pages/ComingSoonPage'
import { ComponentsPage } from './pages/dev/ComponentsPage'
import { LoginPage } from './pages/Login/LoginPage'
import { AttendancePage } from './pages/student/AttendancePage'
import { MealPage } from './pages/student/MealPage'
import { StudentDashboardPage } from './pages/student/StudentDashboardPage'
import { TimetablePage } from './pages/student/TimetablePage'
import { MeisterReviewDetailPage } from './pages/teacher/MeisterReviewDetailPage'
import { MeisterReviewPage } from './pages/teacher/MeisterReviewPage'

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
              <Route path="*" element={<ComingSoonPage />} />
            </Route>
            <Route
              path="/teacher"
              element={
                <RequireRole role="teacher">
                  <AppLayout menu={teacherMenu} />
                </RequireRole>
              }
            >
              <Route index element={<Navigate to="meister/review" replace />} />
              <Route path="meister/review" element={<MeisterReviewPage />} />
              <Route path="meister/review/:id" element={<MeisterReviewDetailPage />} />
              <Route path="*" element={<ComingSoonPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
