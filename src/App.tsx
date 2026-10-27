import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { studentMenu, teacherMenu } from './layouts/menus'
import { ComponentsPage } from './pages/dev/ComponentsPage'
import { LoginPage } from './pages/Login/LoginPage'
import { StudentDashboardPage } from './pages/student/StudentDashboardPage'

// Tauri는 파일 기반으로 서빙되므로 HashRouter 사용
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dev/components" element={<ComponentsPage />} />
        <Route path="/student" element={<AppLayout menu={studentMenu} user={{ name: '김부마', subtitle: '2학년 1반' }} />}>
          <Route index element={<StudentDashboardPage />} />
        </Route>
        <Route path="/teacher" element={<AppLayout menu={teacherMenu} user={{ name: '이선생', subtitle: '담임교사' }} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </HashRouter>
  )
}
