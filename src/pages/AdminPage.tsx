import { useState, useEffect } from 'react'
import { getAdminAccounts, createAdminAccount, deleteAdminAccount } from '../api/endpoints'
import type { AdminAccount } from '../types'

interface ResultState { type: 'success' | 'error'; message: string }

export default function AdminPage() {
  const [accounts, setAccounts] = useState<AdminAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ResultState | null>(null)

  const [socialId, setSocialId] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('ROLE_PM')
  const [creating, setCreating] = useState(false)

  function showResult(type: 'success' | 'error', message: string) {
    setResult({ type, message })
    setTimeout(() => setResult(null), 4000)
  }

  async function loadAccounts() {
    setLoading(true)
    try {
      setAccounts(await getAdminAccounts())
    } catch (err: unknown) {
      const e = err as { response?: { status?: number }; message?: string }
      if (e.response?.status === 403) showResult('error', '권한이 없습니다 (ROLE_ADMIN 전용)')
      else showResult('error', e.message || '계정 목록 조회 실패')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAccounts() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      const created = await createAdminAccount({ socialId, password, role })
      setAccounts(prev => [...prev, created])
      setSocialId('')
      setPassword('')
      setRole('ROLE_PM')
      showResult('success', `계정 "${created.socialId}" 생성 완료`)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string }; status?: number }; message?: string }
      if (e.response?.status === 403) showResult('error', '권한이 없습니다 (ROLE_ADMIN 전용)')
      else showResult('error', e.response?.data?.message || e.message || '생성 실패')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(account: AdminAccount) {
    if (!window.confirm(`"${account.socialId}" 계정을 삭제하시겠습니까?`)) return
    try {
      await deleteAdminAccount(account.id)
      setAccounts(prev => prev.filter(a => a.id !== account.id))
      showResult('success', `"${account.socialId}" 계정 삭제 완료`)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string }; status?: number }; message?: string }
      if (e.response?.status === 403) showResult('error', '권한이 없습니다 (ROLE_ADMIN 전용)')
      else showResult('error', e.response?.data?.message || e.message || '삭제 실패')
    }
  }

  const ROLE_LABEL: Record<string, { label: string; cls: string }> = {
    ROLE_ADMIN: { label: 'ADMIN', cls: 'badge-red'  },
    ROLE_PM:    { label: 'PM',    cls: 'badge-blue' },
  }

  return (
    <>
      <div className="page-header">
        <h1>관리자 계정 관리</h1>
        <p>운영툴 접근 계정 생성 및 삭제 (ROLE_ADMIN 전용)</p>
      </div>
      <div className="page-body">
        {result && (
          <div className={`alert alert-${result.type === 'success' ? 'success' : 'error'}`}>
            {result.message}
          </div>
        )}

        {/* 계정 목록 */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <div className="card-title" style={{ marginBottom: 0 }}>계정 목록</div>
            <button className="btn btn-ghost btn-sm" onClick={loadAccounts} disabled={loading}>새로고침</button>
          </div>
          {loading ? (
            <p className="text-muted">로딩 중...</p>
          ) : accounts.length === 0 ? (
            <p className="text-muted">등록된 계정이 없습니다.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>ID</th><th>소셜 ID</th><th>권한</th><th>생성일</th><th></th></tr>
                </thead>
                <tbody>
                  {accounts.map(acc => {
                    const roleKey = acc.roles[0] ?? ''
                    const roleMeta = ROLE_LABEL[roleKey]
                    return (
                      <tr key={acc.id}>
                        <td><code>{acc.id}</code></td>
                        <td>{acc.socialId}</td>
                        <td>
                          <span className={`badge ${roleMeta?.cls ?? 'badge-blue'}`}>
                            {roleMeta?.label ?? roleKey}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {acc.createdDate?.replace('T', ' ').slice(0, 19)}
                        </td>
                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(acc)}
                            style={{ padding: '3px 10px' }}
                          >삭제</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 계정 생성 */}
        <div className="card">
          <div className="card-title">새 계정 생성</div>
          <form onSubmit={handleCreate}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">소셜 ID</label>
                <input
                  className="form-input"
                  value={socialId}
                  onChange={e => setSocialId(e.target.value)}
                  placeholder="로그인 ID"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">비밀번호</label>
                <input
                  className="form-input"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="비밀번호"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">권한</label>
                <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="ROLE_PM">ROLE_PM — 유저 조회/관리</option>
                  <option value="ROLE_ADMIN">ROLE_ADMIN — 전체 권한</option>
                </select>
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={creating}>
              {creating ? <><span className="spinner" /> 생성 중...</> : '계정 생성'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
