import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { setBaseURL } from '../api/client'
import { getServerStatus, changeServerStatus } from '../api/endpoints'

interface NavItemProps {
  to: string
  label: string
  icon: string
}

function NavItem({ to, label, icon }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </NavLink>
  )
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { server, servers, setServer, userInfo, logout } = useApp()
  const navigate = useNavigate()
  const isAdmin = userInfo?.roles.includes('ROLE_ADMIN') ?? false

  const [serverStatus, setServerStatus] = useState<string | null>(null)
  const [statusLoading, setStatusLoading] = useState(false)

  useEffect(() => {
    getServerStatus()
      .then(res => setServerStatus(res.serverStatus))
      .catch(() => {})
  }, [server])

  async function handleToggleStatus() {
    const next = serverStatus === '점검' ? 'normal' : 'check'
    const nextLabel = next === 'check' ? '점검' : '정상'
    if (!window.confirm(`서버 상태를 [${nextLabel}]으로 변경하시겠습니까?`)) return
    setStatusLoading(true)
    try {
      await changeServerStatus(next)
      const res = await getServerStatus()
      setServerStatus(res.serverStatus)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string }
      alert(e.response?.data?.message || e.message || '서버 상태 변경 실패')
    } finally {
      setStatusLoading(false)
    }
  }

  function handleServerChange(name: string) {
    const found = servers.find(s => s.name === name)
    if (!found || found.name === server.name) return
    setServer(found)
    setBaseURL(found.url)
    logout()
    navigate('/login')
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          KTF 운영툴
          <span>Game Admin Dashboard</span>
        </div>

        <nav className="sidebar-nav">
          <NavItem to="/users" label="유저 관리" icon="👤" />
          <NavItem to="/mail" label="우편 발송" icon="✉️" />
          <NavItem to="/ranking" label="실시간 랭킹" icon="🏆" />
          {userInfo?.roles.includes('ROLE_ADMIN') && (
            <NavItem to="/metrics" label="게임 지표" icon="📊" />
          )}
          {userInfo?.roles.includes('ROLE_ADMIN') && (
            <NavItem to="/admin" label="관리자 계정" icon="🔑" />
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="server-badge">
            서버: <strong>{server.name}</strong>
          </div>

          {serverStatus && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className={`badge ${serverStatus === '점검' ? 'badge-yellow' : 'badge-green'}`} style={{ fontSize: 11 }}>
                서버 상태: {serverStatus}
              </span>
              {isAdmin && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={handleToggleStatus}
                  disabled={statusLoading}
                  style={{ fontSize: 11, padding: '2px 8px' }}
                >
                  {statusLoading ? '변경 중...' : (serverStatus === '점검' ? '정상으로 전환' : '점검으로 전환')}
                </button>
              )}
            </div>
          )}

          <select
            className="form-select"
            value={server.name}
            onChange={e => handleServerChange(e.target.value)}
            style={{ marginBottom: 8 }}
          >
            {servers.map(s => (
              <option key={s.name} value={s.name}>{s.name} — {s.url}</option>
            ))}
          </select>

          {userInfo && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                {userInfo.socialId}
              </div>
              {userInfo.roles.map(role => {
                const isAdmin = role === 'ROLE_ADMIN'
                return (
                  <span
                    key={role}
                    className={`badge ${isAdmin ? 'badge-red' : 'badge-blue'}`}
                    style={{ fontSize: 10 }}
                  >
                    {isAdmin ? 'ADMIN' : 'PM'}
                  </span>
                )
              })}
            </div>
          )}

          <button className="btn btn-ghost btn-sm w-full" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
