import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './contexts/AppContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import UsersPage from './pages/UsersPage'
import MailPage from './pages/MailPage'
import { setBaseURL } from './api/client'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { jwt, server } = useApp()
  if (!jwt) return <Navigate to="/login" replace />
  setBaseURL(server.url)
  return <Layout>{children}</Layout>
}

function AppRoutes() {
  const { jwt } = useApp()

  return (
    <Routes>
      <Route path="/login" element={jwt ? <Navigate to="/users" replace /> : <LoginPage />} />
      <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
      <Route path="/mail" element={<ProtectedRoute><MailPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to={jwt ? '/users' : '/login'} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  )
}
