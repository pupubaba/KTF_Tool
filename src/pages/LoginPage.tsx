import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { setBaseURL } from '../api/client'
import { login } from '../api/endpoints'
import { decodeJwtPayload } from '../utils/jwt'

export default function LoginPage() {
  const { server, servers, setServer, setAuth, updateServerUrl } = useApp()
  const navigate = useNavigate()

  const [socialId, setSocialId] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [customUrls, setCustomUrls] = useState(servers.map(s => s.url))

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    setBaseURL(server.url)

    try {
      const res = await login({ socialId, password })
      const payload = decodeJwtPayload(res.token)
      const roles = String(payload.roles ?? '').split(',').filter(Boolean)
      setAuth(res.token, { socialId, roles })
      navigate('/users')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string }; status?: number }; message?: string }
      if (e.response?.status === 401) setError('아이디 또는 비밀번호가 올바르지 않습니다')
      else setError(e.response?.data?.message || e.message || '서버 연결 오류')
    } finally {
      setLoading(false)
    }
  }

  function handleServerChange(name: string) {
    const found = servers.find(s => s.name === name)
    if (found) {
      setServer(found)
      setBaseURL(found.url)
    }
  }

  function handleUrlChange(i: number, val: string) {
    const next = [...customUrls]
    next[i] = val
    setCustomUrls(next)
    updateServerUrl(i, val)
    if (servers[i].name === server.name) setBaseURL(val)
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-title">
          <h1>KTF 운영툴</h1>
          <p>게임 서버 관리 도구</p>
        </div>

        <div className="form-group">
          <label className="form-label">서버 선택</label>
          <select className="form-select" value={server.name} onChange={e => handleServerChange(e.target.value)}>
            {servers.map(s => (
              <option key={s.name} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>

        {servers.map((s, i) => (
          s.name === server.name && (
            <div key={s.name} className="form-group">
              <label className="form-label">서버 URL</label>
              <input
                className="form-input font-mono"
                value={customUrls[i]}
                onChange={e => handleUrlChange(i, e.target.value)}
                placeholder="http://host:port"
              />
            </div>
          )
        ))}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Social ID</label>
            <input
              className="form-input"
              value={socialId}
              onChange={e => setSocialId(e.target.value)}
              placeholder="socialId 입력"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              required
            />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <button className="btn btn-primary w-full" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" /> 로그인 중...</> : '로그인'}
          </button>
        </form>
      </div>
    </div>
  )
}
