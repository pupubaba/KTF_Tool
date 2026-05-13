import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { setBaseURL } from '../api/client'
import { login } from '../api/endpoints'
import type { UserInfo } from '../types'

export default function LoginPage() {
  const { server, servers, setServer, setAuth, updateServerUrl } = useApp()
  const navigate = useNavigate()

  const [socialId, setSocialId] = useState('')
  const [password, setPassword] = useState('')
  const [serverNum, setServerNum] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [customUrls, setCustomUrls] = useState(servers.map(s => s.url))

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    setBaseURL(server.url)

    try {
      const res = await login({
        socialId,
        password,
        socialProvider: 'GOOGLE',
        version: '1.0.0',
        serverNum,
      })

      if (!res.check) {
        setError(res.message || '로그인 실패')
        return
      }

      const response = res.response as Record<string, unknown>
      const jwt = response.jwt as string
      const userInfoRaw = response.userInfo as Record<string, unknown>

      const userInfo: UserInfo = {
        id: userInfoRaw.id as number,
        socialId: userInfoRaw.socialId as string,
        userGameName: userInfoRaw.userGameName as string | undefined,
        serverNum,
      }

      setAuth(jwt, userInfo)
      navigate('/users')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string }
      setError(e.response?.data?.message || e.message || '서버 연결 오류')
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
          <select
            className="form-select"
            value={server.name}
            onChange={e => handleServerChange(e.target.value)}
          >
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

          <div className="form-group">
            <label className="form-label">서버 번호</label>
            <input
              className="form-input"
              type="number"
              value={serverNum}
              onChange={e => setServerNum(Number(e.target.value))}
              min={1}
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
