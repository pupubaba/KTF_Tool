import { NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { setBaseURL } from '../api/client'

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

  function handleServerChange(name: string) {
    const found = servers.find(s => s.name === name)
    if (found) {
      setServer(found)
      setBaseURL(found.url)
    }
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
        </nav>

        <div className="sidebar-footer">
          <div className="server-badge">
            서버: <strong>{server.name}</strong>
          </div>
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
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
              {userInfo.userGameName ?? userInfo.socialId}
              <span style={{ marginLeft: 6, color: 'var(--text-muted)' }}>#{userInfo.id}</span>
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
