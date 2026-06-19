import { useEffect, useState } from 'react'
import { getUserById, changeUserType, changeUserLevel } from '../api/endpoints'
import { useApp } from '../contexts/AppContext'
import type { UserResponse, UserTypeValue } from '../types'

const USER_TYPE_LABEL: Record<number, { label: string; cls: string }> = {
  1: { label: '일반',         cls: 'badge-green'  },
  2: { label: '화이트/개발자', cls: 'badge-blue'   },
  3: { label: '블랙',         cls: 'badge-red'    },
  4: { label: '정지',         cls: 'badge-yellow' },
}

interface Props {
  userId: number
  onClose: () => void
  onResult: (type: 'success' | 'error', msg: string) => void
}

export default function UserActionModal({ userId, onClose, onResult }: Props) {
  const { userInfo } = useApp()
  const isAdmin = userInfo?.roles.includes('ROLE_ADMIN') ?? false

  const [user, setUser] = useState<UserResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [levelInput, setLevelInput] = useState('')
  const [levelLoading, setLevelLoading] = useState(false)

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  async function load() {
    setLoading(true)
    try {
      setUser(await getUserById(userId))
    } catch (err: unknown) {
      const e = err as { message?: string }
      onResult('error', e.message || '유저 조회 실패')
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(type: UserTypeValue) {
    setActionLoading(true)
    try {
      await changeUserType(userId, type)
      onResult('success', `유저 ${userId} → ${type} 처리 완료`)
      const typeNum = { normal: 1, white: 2, black: 3, stop: 4 }[type]
      setUser(prev => prev ? { ...prev, userType: typeNum } : prev)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string }; status?: number }; message?: string }
      if (e.response?.status === 403) onResult('error', '권한이 없습니다 (ROLE_ADMIN 필요)')
      else onResult('error', e.response?.data?.message || e.message || '오류 발생')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleLevelChange(e: React.FormEvent) {
    e.preventDefault()
    const lv = Number(levelInput)
    if (!lv || lv < 1 || lv > 100) { onResult('error', '레벨은 1~100 사이여야 합니다'); return }
    if (!window.confirm(`유저 ${userId}의 레벨을 ${lv}로 변경하시겠습니까?`)) return
    setLevelLoading(true)
    try {
      await changeUserLevel(userId, lv)
      onResult('success', `유저 ${userId} 레벨 → ${lv} 변경 완료`)
      setLevelInput('')
      setUser(prev => prev ? { ...prev, level: lv } : prev)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string }; status?: number }; message?: string }
      if (e.response?.status === 403) onResult('error', '권한이 없습니다 (ROLE_ADMIN 필요)')
      else onResult('error', e.response?.data?.message || e.message || '레벨 변경 실패')
    } finally {
      setLevelLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <div className="card-title" style={{ marginBottom: 0 }}>유저 정보 — {userId}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>닫기</button>
        </div>

        {loading ? (
          <p className="text-muted">로딩 중...</p>
        ) : !user ? (
          <p className="text-muted">유저 정보를 불러올 수 없습니다.</p>
        ) : (
          <>
            <div style={{ padding: '12px 14px', background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px 20px', fontSize: 13 }}>
                <div><div className="form-label">유저 ID</div><code style={{ fontSize: 14, color: 'var(--primary)' }}>{user.id}</code></div>
                <div><div className="form-label">닉네임</div><span>{user.userGameName}</span></div>
                <div>
                  <div className="form-label">상태</div>
                  <span className={`badge ${USER_TYPE_LABEL[user.userType]?.cls ?? 'badge-blue'}`}>
                    {USER_TYPE_LABEL[user.userType]?.label ?? `타입 ${user.userType}`}
                  </span>
                </div>
                <div><div className="form-label">레벨</div><span>Lv.{user.level} ({user.exp} exp)</span></div>
                <div><div className="form-label">서버</div><span>{user.serverNum}</span></div>
                <div><div className="form-label">마일리지</div><span>{user.mileage.toLocaleString()}</span></div>
                <div><div className="form-label">총 구매액</div><span>{user.totalPurchase.toLocaleString()}</span></div>
                <div><div className="form-label">출석 횟수</div><span>{user.attendanceCount}</span></div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div className="form-label">마지막 로그인</div>
                  <span className="text-muted">{user.lastloginDate?.replace('T', ' ').slice(0, 19) ?? '-'}</span>
                </div>
              </div>
            </div>

            <div className="card-title" style={{ fontSize: 13, marginBottom: 8 }}>제재 / 해제</div>
            <div className="btn-group" style={{ marginBottom: 16 }}>
              <button className="btn btn-danger btn-sm"  onClick={() => handleAction('black')}  disabled={actionLoading}>블랙 처리</button>
              <button className="btn btn-warning btn-sm" onClick={() => handleAction('stop')}   disabled={actionLoading}>계정 정지</button>
              <button className="btn btn-success btn-sm" onClick={() => handleAction('white')}  disabled={actionLoading}>화이트리스트</button>
              <button className="btn btn-ghost btn-sm"   onClick={() => handleAction('normal')} disabled={actionLoading}>정상화</button>
            </div>

            {isAdmin && (
              <>
                <div className="card-title" style={{ fontSize: 13, marginBottom: 8 }}>
                  레벨 변경 <span className="badge badge-red" style={{ fontSize: 11, verticalAlign: 'middle' }}>ADMIN</span>
                </div>
                <form onSubmit={handleLevelChange}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                    <input
                      className="form-input"
                      type="number"
                      min={1}
                      max={100}
                      value={levelInput}
                      onChange={e => setLevelInput(e.target.value)}
                      placeholder="1~100"
                      style={{ maxWidth: 100 }}
                    />
                    <button className="btn btn-primary btn-sm" type="submit" disabled={levelLoading}>
                      {levelLoading ? <><span className="spinner" /> 변경 중...</> : '레벨 변경'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
