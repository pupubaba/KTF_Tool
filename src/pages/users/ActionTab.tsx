import { useState } from 'react'
import { searchUser, changeUserType, changeUserLevel } from '../../api/endpoints'
import { useApp } from '../../contexts/AppContext'
import type { UserResponse, UserTypeValue } from '../../types'

const USER_TYPE_LABEL: Record<number, { label: string; cls: string }> = {
  1: { label: '일반',         cls: 'badge-green'  },
  2: { label: '화이트/개발자', cls: 'badge-blue'   },
  3: { label: '블랙',         cls: 'badge-red'    },
  4: { label: '정지',         cls: 'badge-yellow' },
}

type SearchType = 'gameName' | 'socialId' | 'id'

interface Props {
  userId: string
  foundUser: UserResponse | null | 'not_found'
  setFoundUser: React.Dispatch<React.SetStateAction<UserResponse | null | 'not_found'>>
  onUserFound: (id: string) => void
  onResult: (type: 'success' | 'error', msg: string) => void
}

export default function ActionTab({ userId, foundUser, setFoundUser, onUserFound, onResult }: Props) {
  const { userInfo } = useApp()
  const isAdmin = userInfo?.roles.includes('ROLE_ADMIN') ?? false

  const [searchType, setSearchType]   = useState<SearchType>('gameName')
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching]     = useState(false)
  const [loading, setLoading]         = useState(false)
  const [levelInput, setLevelInput]   = useState('')
  const [levelLoading, setLevelLoading] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setSearching(true)
    setFoundUser('not_found')
    try {
      const params = searchType === 'gameName'
        ? { gameName: searchQuery.trim() }
        : searchType === 'socialId'
        ? { socialId: searchQuery.trim() }
        : { id: Number(searchQuery.trim()) }
      const user = await searchUser(params)
      setFoundUser(user)
      onUserFound(String(user.id))
    } catch (err: unknown) {
      const e = err as { response?: { status?: number }; message?: string }
      if (e.response?.status === 404) setFoundUser(null)
      else onResult('error', e.message || '검색 오류')
    } finally {
      setSearching(false)
    }
  }

  async function handleAction(type: UserTypeValue) {
    const uid = Number(userId)
    if (!uid) { onResult('error', '유저 ID를 입력하세요'); return }
    setLoading(true)
    try {
      await changeUserType(uid, type)
      onResult('success', `유저 ${uid} → ${type} 처리 완료`)
      if (foundUser && foundUser !== 'not_found') {
        const typeNum = { normal: 1, white: 2, black: 3, stop: 4 }[type]
        setFoundUser({ ...foundUser, userType: typeNum })
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string }; status?: number }; message?: string }
      if (e.response?.status === 403) onResult('error', '권한이 없습니다 (ROLE_ADMIN 필요)')
      else onResult('error', e.response?.data?.message || e.message || '오류 발생')
    } finally {
      setLoading(false)
    }
  }

  async function handleLevelChange(e: React.FormEvent) {
    e.preventDefault()
    const uid = Number(userId)
    const lv  = Number(levelInput)
    if (!uid) { onResult('error', '유저 ID를 입력하세요'); return }
    if (!lv || lv < 1 || lv > 100) { onResult('error', '레벨은 1~100 사이여야 합니다'); return }
    setLevelLoading(true)
    try {
      await changeUserLevel(uid, lv)
      onResult('success', `유저 ${uid} 레벨 → ${lv} 변경 완료`)
      setLevelInput('')
      setFoundUser(prev => prev && prev !== 'not_found' ? { ...prev, level: lv } : prev)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string }; status?: number }; message?: string }
      if (e.response?.status === 403) onResult('error', '권한이 없습니다 (ROLE_ADMIN 필요)')
      else onResult('error', e.response?.data?.message || e.message || '레벨 변경 실패')
    } finally {
      setLevelLoading(false)
    }
  }

  return (
    <>
      <div className="card">
        <div className="card-title">유저 검색</div>
        <form onSubmit={handleSearch}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <select
              className="form-select"
              value={searchType}
              onChange={e => setSearchType(e.target.value as SearchType)}
              style={{ width: 130, flexShrink: 0 }}
            >
              <option value="gameName">닉네임</option>
              <option value="socialId">소셜 ID</option>
              <option value="id">유저 ID</option>
            </select>
            <input
              className="form-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={searchType === 'gameName' ? '게임 닉네임 입력' : searchType === 'socialId' ? '소셜 ID 입력' : '유저 ID 입력 (숫자)'}
            />
            <button className="btn btn-primary" type="submit" disabled={searching} style={{ whiteSpace: 'nowrap' }}>
              {searching ? <><span className="spinner" /> 검색 중</> : '검색'}
            </button>
          </div>
        </form>

        {foundUser !== 'not_found' && foundUser !== null && (
          <div style={{ marginTop: 12, padding: '12px 14px', background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px 20px', fontSize: 13 }}>
              <div><div className="form-label">유저 ID</div><code style={{ fontSize: 14, color: 'var(--primary)' }}>{foundUser.id}</code></div>
              <div><div className="form-label">닉네임</div><span>{foundUser.userGameName}</span></div>
              <div>
                <div className="form-label">상태</div>
                <span className={`badge ${USER_TYPE_LABEL[foundUser.userType]?.cls ?? 'badge-blue'}`}>
                  {USER_TYPE_LABEL[foundUser.userType]?.label ?? `타입 ${foundUser.userType}`}
                </span>
              </div>
              <div><div className="form-label">레벨</div><span>Lv.{foundUser.level} ({foundUser.exp} exp)</span></div>
              <div><div className="form-label">서버</div><span>{foundUser.serverNum}</span></div>
              <div><div className="form-label">마일리지</div><span>{foundUser.mileage.toLocaleString()}</span></div>
              <div><div className="form-label">총 구매액</div><span>{foundUser.totalPurchase.toLocaleString()}</span></div>
              <div><div className="form-label">출석 횟수</div><span>{foundUser.attendanceCount}</span></div>
              <div><div className="form-label">소셜 ID</div><span className="text-muted" style={{ fontSize: 12 }}>{foundUser.socialId}</span></div>
              <div style={{ gridColumn: '1 / -1' }}><div className="form-label">마지막 로그인</div><span className="text-muted">{foundUser.lastloginDate?.replace('T', ' ').slice(0, 19) ?? '-'}</span></div>
              <div style={{ gridColumn: '1 / -1' }}><div className="form-label">가입일</div><span className="text-muted">{foundUser.createdDate?.replace('T', ' ').slice(0, 19) ?? '-'}</span></div>
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>↓ 유저 ID가 자동 입력되었습니다. 다른 탭에서 상세 정보를 확인하세요.</div>
          </div>
        )}

        {foundUser === null && (
          <div className="alert alert-error" style={{ marginTop: 10 }}>
            <strong>{searchQuery}</strong>에 해당하는 유저를 찾을 수 없습니다.
          </div>
        )}
      </div>

<div className="card">
        <div className="card-title">제재 / 해제</div>
        <div className="btn-group mt-4">
          <button className="btn btn-danger"  onClick={() => handleAction('black')}  disabled={loading}>블랙 처리</button>
          <button className="btn btn-warning" onClick={() => handleAction('stop')}   disabled={loading}>계정 정지</button>
          <button className="btn btn-success" onClick={() => handleAction('white')}  disabled={loading}>화이트리스트</button>
          <button className="btn btn-ghost"   onClick={() => handleAction('normal')} disabled={loading}>정상화</button>
        </div>
        <p className="text-muted mt-4" style={{ fontSize: 12 }}>
          블랙: userType 3 | 정지: userType 4 | 화이트: userType 2 | 정상화: userType 1
        </p>
      </div>

      {isAdmin && (
        <div className="card">
          <div className="card-title">레벨 변경 <span className="badge badge-red" style={{ fontSize: 11, verticalAlign: 'middle' }}>ADMIN</span></div>
          <form onSubmit={handleLevelChange}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">변경할 레벨 (1~100)</label>
                <input
                  className="form-input"
                  type="number"
                  min={1}
                  max={100}
                  value={levelInput}
                  onChange={e => setLevelInput(e.target.value)}
                  placeholder="예: 50"
                  style={{ maxWidth: 120 }}
                />
              </div>
              <button className="btn btn-primary" type="submit" disabled={levelLoading}>
                {levelLoading ? <><span className="spinner" /> 변경 중...</> : '레벨 변경'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
