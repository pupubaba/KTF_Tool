import { useState } from 'react'
import { blackUser, stopUser, whiteUser, normalUser, getBlackList, getUserMailBox, findUserByGameName } from '../api/endpoints'
import type { MailItem } from '../types'

interface FoundUser {
  id: number
  userGameName: string
  userType: number
  level: number
  serverNum: number
  lastloginDate: string | null
  createdDate: string | null
  socialProvider: string
}

const USER_TYPE_LABEL: Record<number, { label: string; cls: string }> = {
  1: { label: '일반',          cls: 'badge-green'  },
  2: { label: '화이트/개발자',  cls: 'badge-blue'   },
  3: { label: '블랙',          cls: 'badge-red'    },
  4: { label: '정지',          cls: 'badge-yellow' },
}

type ActionType = 'black' | 'stop' | 'white' | 'normal'

interface ParsedItem { key: string; count: string }

function parseMailItems(gettingItem: string, gettingItemCount: string): ParsedItem[] {
  if (!gettingItem) return []
  const keys = gettingItem.split(',')
  const counts = gettingItemCount ? gettingItemCount.split(',') : []
  return keys.map((k, i) => ({ key: k.trim(), count: counts[i]?.trim() ?? '1' }))
}

function itemLabel(key: string): string {
  if (key.startsWith('Currency_'))    return `재화 #${key.replace('Currency_', '')}`
  if (key.startsWith('Character_'))   return `영웅 #${key.replace('Character_', '')}`
  if (key.startsWith('Equipment_'))   return `장비 #${key.replace('Equipment_', '')}`
  if (key.startsWith('EquipmentBox_')) return `장비상자 #${key.replace('EquipmentBox_', '')}`
  if (key.startsWith('ItemBox_'))     return `아이템상자 #${key.replace('ItemBox_', '')}`
  if (key === 'Emblem')               return '문장(랜덤)'
  if (key.startsWith('Emblem_'))      return `문장 등급${key.replace('Emblem_', '')}`
  return key
}

function itemBadgeClass(key: string): string {
  if (key.startsWith('Currency_'))                               return 'badge-yellow'
  if (key.startsWith('Character_'))                              return 'badge-blue'
  if (key.startsWith('Equipment_') || key.startsWith('EquipmentBox_')) return 'badge-green'
  if (key.startsWith('ItemBox_'))                                return 'badge-blue'
  if (key.includes('Emblem'))                                    return 'badge-red'
  return 'badge-blue'
}

interface ResultState { type: 'success' | 'error'; message: string }

export default function UsersPage() {
  const [userId, setUserId]     = useState('')
  const [blackType, setBlackType] = useState(0)
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState<ResultState | null>(null)
  const [blackList, setBlackList] = useState<unknown[] | null>(null)
  const [mailBox, setMailBox]   = useState<MailItem[] | null>(null)
  const [activeTab, setActiveTab] = useState<'action' | 'blacklist' | 'mailbox'>('action')

  const [gameName, setGameName]     = useState('')
  const [foundUser, setFoundUser]   = useState<FoundUser | null | 'not_found'>('not_found')
  const [searching, setSearching]   = useState(false)

  function showResult(type: 'success' | 'error', message: string) {
    setResult({ type, message })
    setTimeout(() => setResult(null), 4000)
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!gameName.trim()) return
    setSearching(true)
    setFoundUser('not_found')
    try {
      const res = await findUserByGameName(gameName.trim())
      const user = (res.response as Record<string, unknown>).user as FoundUser | null
      setFoundUser(user ?? null)
      if (user) setUserId(String(user.id))
    } catch (err: unknown) {
      const e = err as { message?: string }
      showResult('error', e.message || '검색 오류')
    } finally {
      setSearching(false)
    }
  }

  async function handleAction(action: ActionType) {
    const uid = Number(userId)
    if (!uid) { showResult('error', '유저 ID를 입력하세요'); return }
    setLoading(true)
    try {
      let res
      if (action === 'black')       res = await blackUser({ userId: uid, type: blackType })
      else if (action === 'stop')   res = await stopUser({ userId: uid })
      else if (action === 'white')  res = await whiteUser({ userId: uid })
      else                          res = await normalUser({ userId: uid })

      if (res.check) showResult('success', `성공: 유저 ${uid}에 대한 작업이 완료되었습니다`)
      else showResult('error', res.message || '처리 실패')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string }
      showResult('error', e.response?.data?.message || e.message || '오류 발생')
    } finally {
      setLoading(false)
    }
  }

  async function handleGetBlackList() {
    setLoading(true)
    try {
      const res = await getBlackList()
      const response = res.response as Record<string, unknown>
      setBlackList((response.blackUserList ?? response.blackList ?? []) as unknown[])
    } catch (err: unknown) {
      const e = err as { message?: string }
      showResult('error', e.message || '블랙리스트 조회 실패')
    } finally {
      setLoading(false)
    }
  }

  async function handleGetMailBox() {
    const uid = Number(userId)
    if (!uid) { showResult('error', '유저 ID를 입력하세요'); return }
    setLoading(true)
    try {
      const res = await getUserMailBox(uid)
      const response = res.response as Record<string, unknown>
      setMailBox((response.myMailBoxResponseDtoList ?? []) as MailItem[])
      setActiveTab('mailbox')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showResult('error', e.message || '우편함 조회 실패')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <h1>유저 관리</h1>
        <p>유저 제재, 해제 및 우편함 조회</p>
      </div>
      <div className="page-body">
        {result && (
          <div className={`alert alert-${result.type === 'success' ? 'success' : 'error'}`}>
            {result.message}
          </div>
        )}

        <div className="tabs">
          <button className={`tab-btn ${activeTab === 'action' ? 'active' : ''}`} onClick={() => setActiveTab('action')}>유저 제재</button>
          <button className={`tab-btn ${activeTab === 'blacklist' ? 'active' : ''}`} onClick={() => { setActiveTab('blacklist'); handleGetBlackList() }}>블랙리스트</button>
          <button className={`tab-btn ${activeTab === 'mailbox' ? 'active' : ''}`} onClick={() => setActiveTab('mailbox')}>우편함 조회</button>
        </div>

        {/* ── 유저 제재 탭 ── */}
        {activeTab === 'action' && (
          <>
            {/* 닉네임 검색 */}
            <div className="card">
              <div className="card-title">닉네임으로 유저 검색</div>
              <form onSubmit={handleSearch}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    className="form-input"
                    value={gameName}
                    onChange={e => setGameName(e.target.value)}
                    placeholder="게임 닉네임 입력"
                  />
                  <button className="btn btn-primary" type="submit" disabled={searching} style={{ whiteSpace: 'nowrap' }}>
                    {searching ? <><span className="spinner" /> 검색 중</> : '검색'}
                  </button>
                </div>
              </form>

              {foundUser !== 'not_found' && foundUser !== null && (
                <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px 20px', fontSize: 13 }}>
                    <div>
                      <div className="form-label">유저 ID</div>
                      <code style={{ fontSize: 14, color: 'var(--primary)' }}>{foundUser.id}</code>
                    </div>
                    <div>
                      <div className="form-label">닉네임</div>
                      <span>{foundUser.userGameName}</span>
                    </div>
                    <div>
                      <div className="form-label">상태</div>
                      <span className={`badge ${USER_TYPE_LABEL[foundUser.userType]?.cls ?? 'badge-blue'}`}>
                        {USER_TYPE_LABEL[foundUser.userType]?.label ?? `타입 ${foundUser.userType}`}
                      </span>
                    </div>
                    <div>
                      <div className="form-label">레벨</div>
                      <span>Lv.{foundUser.level}</span>
                    </div>
                    <div>
                      <div className="form-label">서버</div>
                      <span>{foundUser.serverNum}</span>
                    </div>
                    <div>
                      <div className="form-label">플랫폼</div>
                      <span>{foundUser.socialProvider}</span>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div className="form-label">마지막 로그인</div>
                      <span className="text-muted">{foundUser.lastloginDate?.replace('T', ' ').slice(0, 19) ?? '-'}</span>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div className="form-label">가입일</div>
                      <span className="text-muted">{foundUser.createdDate?.replace('T', ' ').slice(0, 19) ?? '-'}</span>
                    </div>
                  </div>
                  <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                    ↓ 아래 유저 ID에 자동 입력되었습니다
                  </div>
                </div>
              )}

              {foundUser === null && (
                <div className="alert alert-error" style={{ marginTop: 10 }}>
                  닉네임 <strong>{gameName}</strong>에 해당하는 유저를 찾을 수 없습니다.
                </div>
              )}
            </div>

            {/* 유저 ID 입력 */}
            <div className="card">
              <div className="card-title">유저 ID</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">유저 ID</label>
                  <input
                    className="form-input"
                    type="number"
                    value={userId}
                    onChange={e => setUserId(e.target.value)}
                    placeholder="예: 1001"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">우편함 조회</label>
                  <button className="btn btn-ghost w-full" onClick={handleGetMailBox} disabled={loading}>
                    우편함 보기
                  </button>
                </div>
              </div>
            </div>

            {/* 제재 / 해제 */}
            <div className="card">
              <div className="card-title">제재 / 해제</div>
              <div className="form-group">
                <label className="form-label">블랙 타입 (BlackUser 전용)</label>
                <select className="form-select" value={blackType} onChange={e => setBlackType(Number(e.target.value))}>
                  <option value={0}>0 - 일반 블랙</option>
                  <option value={1}>1 - 영구 블랙</option>
                  <option value={2}>2 - 임시 블랙</option>
                </select>
              </div>
              <div className="btn-group mt-4">
                <button className="btn btn-danger"  onClick={() => handleAction('black')}  disabled={loading}>블랙 처리</button>
                <button className="btn btn-warning" onClick={() => handleAction('stop')}   disabled={loading}>계정 정지</button>
                <button className="btn btn-success" onClick={() => handleAction('white')}  disabled={loading}>화이트리스트</button>
                <button className="btn btn-ghost"   onClick={() => handleAction('normal')} disabled={loading}>정상화</button>
              </div>
              <p className="text-muted mt-4" style={{ fontSize: '12px' }}>
                블랙 처리: 영구 제재 | 계정 정지: 임시 정지 | 화이트리스트: 특수 권한 부여 | 정상화: 모든 제재 해제
              </p>
            </div>
          </>
        )}

        {/* ── 블랙리스트 탭 ── */}
        {activeTab === 'blacklist' && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <div className="card-title" style={{ marginBottom: 0 }}>블랙리스트</div>
              <button className="btn btn-ghost btn-sm" onClick={handleGetBlackList} disabled={loading}>새로고침</button>
            </div>
            {blackList === null ? (
              <p className="text-muted">로딩 중...</p>
            ) : blackList.length === 0 ? (
              <p className="text-muted">블랙리스트가 비어있습니다.</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>#</th><th>데이터</th></tr>
                  </thead>
                  <tbody>
                    {blackList.map((item, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td><code style={{ fontSize: '12px' }}>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</code></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── 우편함 탭 ── */}
        {activeTab === 'mailbox' && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <div className="card-title" style={{ marginBottom: 0 }}>
                {userId ? `유저 ${userId}의 우편함` : '우편함'}
              </div>
              {userId && (
                <button className="btn btn-ghost btn-sm" onClick={handleGetMailBox} disabled={loading}>새로고침</button>
              )}
            </div>
            {mailBox === null ? (
              <p className="text-muted">유저 제재 탭에서 유저 ID 입력 후 "우편함 보기"를 클릭하세요.</p>
            ) : mailBox.length === 0 ? (
              <p className="text-muted">우편함이 비어있습니다.</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Mail ID</th>
                      <th>제목</th>
                      <th>수령</th>
                      <th>만료일</th>
                      <th>포함 아이템</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mailBox.map(mail => {
                      const items = parseMailItems(mail.gettingItem, mail.gettingItemCount)
                      return (
                        <tr key={mail.mailId}>
                          <td><code>{mail.mailId}</code></td>
                          <td>{mail.title}</td>
                          <td>
                            <span className={`badge ${mail.received ? 'badge-green' : 'badge-yellow'}`}>
                              {mail.received ? '수령완료' : '미수령'}
                            </span>
                          </td>
                          <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {mail.expireDate?.split('T')[0]}
                          </td>
                          <td>
                            {items.length === 0 ? (
                              <span className="text-muted" style={{ fontSize: 12 }}>없음</span>
                            ) : (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                {items.map((item, i) => (
                                  <span key={i} className={`badge ${itemBadgeClass(item.key)}`} title={`${item.key}:${item.count}`}>
                                    {itemLabel(item.key)} × {item.count}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
