import { useState, useMemo } from 'react'
import {
  searchUser, changeUserType, getUserMailBox,
  getUserCurrency, getUserHeroes, getUserGuide, getUserPurchase,
} from '../api/endpoints'
import type {
  UserResponse, UserTypeValue, MailItem,
  CurrencyItem, HeroItem, GuideInfo, PurchaseItem,
} from '../types'

const USER_TYPE_LABEL: Record<number, { label: string; cls: string }> = {
  1: { label: '일반',         cls: 'badge-green'  },
  2: { label: '화이트/개발자', cls: 'badge-blue'   },
  3: { label: '블랙',         cls: 'badge-red'    },
  4: { label: '정지',         cls: 'badge-yellow' },
}

type SearchType = 'gameName' | 'socialId'
type TabType = 'action' | 'currency' | 'hero' | 'guide' | 'purchase' | 'mailbox'

interface ParsedItem { key: string; count: string }

function parseMailItems(gettingItem: string, gettingItemCount: string): ParsedItem[] {
  if (!gettingItem) return []
  const keys = gettingItem.split(',')
  const counts = gettingItemCount ? gettingItemCount.split(',') : []
  return keys.map((k, i) => ({ key: k.trim(), count: counts[i]?.trim() ?? '1' }))
}

function itemLabel(key: string): string {
  if (key.startsWith('Currency_'))     return `재화 #${key.replace('Currency_', '')}`
  if (key.startsWith('Character_'))    return `영웅 #${key.replace('Character_', '')}`
  if (key.startsWith('Equipment_'))    return `장비 #${key.replace('Equipment_', '')}`
  if (key.startsWith('EquipmentBox_')) return `장비상자 #${key.replace('EquipmentBox_', '')}`
  if (key.startsWith('ItemBox_'))      return `아이템상자 #${key.replace('ItemBox_', '')}`
  if (key === 'Emblem')                return '문장(랜덤)'
  if (key.startsWith('Emblem_'))       return `문장 등급${key.replace('Emblem_', '')}`
  return key
}

function itemBadgeClass(key: string): string {
  if (key.startsWith('Currency_'))                                     return 'badge-yellow'
  if (key.startsWith('Character_'))                                    return 'badge-blue'
  if (key.startsWith('Equipment_') || key.startsWith('EquipmentBox_')) return 'badge-green'
  if (key.startsWith('ItemBox_'))                                      return 'badge-blue'
  if (key.includes('Emblem'))                                          return 'badge-red'
  return 'badge-blue'
}

interface ResultState { type: 'success' | 'error'; message: string }

export default function UsersPage() {
  const [userId, setUserId]   = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState<ResultState | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('action')

  // 검색
  const [searchType, setSearchType]   = useState<SearchType>('gameName')
  const [searchQuery, setSearchQuery] = useState('')
  const [foundUser, setFoundUser]     = useState<UserResponse | null | 'not_found'>('not_found')
  const [searching, setSearching]     = useState(false)

  // 상세 데이터
  const [currencies, setCurrencies] = useState<CurrencyItem[] | null>(null)
  const [heroes, setHeroes]         = useState<HeroItem[] | null>(null)
  const [guide, setGuide]           = useState<GuideInfo | null>(null)
  const [purchases, setPurchases]   = useState<PurchaseItem[] | null>(null)
  const [mailBox, setMailBox]       = useState<MailItem[] | null>(null)

  // 정렬
  type CurrencyKey = keyof CurrencyItem
  type HeroKey = keyof HeroItem
  const [currSort, setCurrSort] = useState<{ key: CurrencyKey; asc: boolean }>({ key: 'currencyName', asc: true })
  const [heroSort, setHeroSort] = useState<{ key: HeroKey; asc: boolean }>({ key: 'heroName', asc: true })

  const sortedCurrencies = useMemo(() => {
    if (!currencies) return []
    return [...currencies].sort((a, b) => {
      const av = a[currSort.key], bv = b[currSort.key]
      const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number)
      return currSort.asc ? cmp : -cmp
    })
  }, [currencies, currSort])

  const sortedHeroes = useMemo(() => {
    if (!heroes) return []
    return [...heroes].sort((a, b) => {
      const av = a[heroSort.key], bv = b[heroSort.key]
      const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number)
      return heroSort.asc ? cmp : -cmp
    })
  }, [heroes, heroSort])

  function toggleCurrSort(key: CurrencyKey) {
    setCurrSort(prev => prev.key === key ? { key, asc: !prev.asc } : { key, asc: true })
  }
  function toggleHeroSort(key: HeroKey) {
    setHeroSort(prev => prev.key === key ? { key, asc: !prev.asc } : { key, asc: true })
  }
  function sortIcon(active: boolean, asc: boolean) {
    return active ? (asc ? ' ▲' : ' ▼') : ' ·'
  }

  function showResult(type: 'success' | 'error', message: string) {
    setResult({ type, message })
    setTimeout(() => setResult(null), 4000)
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setSearching(true)
    setFoundUser('not_found')
    setCurrencies(null); setHeroes(null); setGuide(null); setPurchases(null); setMailBox(null)
    try {
      const params = searchType === 'gameName'
        ? { gameName: searchQuery.trim() }
        : { socialId: searchQuery.trim() }
      const user = await searchUser(params)
      setFoundUser(user)
      setUserId(String(user.id))
    } catch (err: unknown) {
      const e = err as { response?: { status?: number }; message?: string }
      if (e.response?.status === 404) setFoundUser(null)
      else showResult('error', e.message || '검색 오류')
    } finally {
      setSearching(false)
    }
  }

  async function handleAction(type: UserTypeValue) {
    const uid = Number(userId)
    if (!uid) { showResult('error', '유저 ID를 입력하세요'); return }
    setLoading(true)
    try {
      await changeUserType(uid, type)
      showResult('success', `유저 ${uid} → ${type} 처리 완료`)
      if (foundUser && foundUser !== 'not_found') {
        const typeNum = { normal: 1, white: 2, black: 3, stop: 4 }[type]
        setFoundUser({ ...foundUser, userType: typeNum })
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string }; status?: number }; message?: string }
      if (e.response?.status === 403) showResult('error', '권한이 없습니다 (ROLE_ADMIN 필요)')
      else showResult('error', e.response?.data?.message || e.message || '오류 발생')
    } finally {
      setLoading(false)
    }
  }

  async function switchTab(tab: TabType) {
    setActiveTab(tab)
    const uid = Number(userId)
    if (!uid) return
    try {
      if (tab === 'currency' && currencies === null) {
        const res = await getUserCurrency(uid)
        setCurrencies(res.currency)
      } else if (tab === 'hero' && heroes === null) {
        const res = await getUserHeroes(uid)
        setHeroes(res.heroes)
      } else if (tab === 'guide' && guide === null) {
        const res = await getUserGuide(uid)
        setGuide(res.guideInfo)
      } else if (tab === 'purchase' && purchases === null) {
        const res = await getUserPurchase(uid)
        setPurchases(res.purchase)
      } else if (tab === 'mailbox' && mailBox === null) {
        const res = await getUserMailBox(uid)
        setMailBox(res.myMailBoxResponseDtoList ?? [])
      }
    } catch (err: unknown) {
      const e = err as { message?: string }
      showResult('error', e.message || '데이터 조회 실패')
    }
  }

  const noUserMsg = (label: string) => (
    <p className="text-muted">유저 제재 탭에서 유저를 검색하면 {label}을(를) 조회합니다.</p>
  )

  return (
    <>
      <div className="page-header">
        <h1>유저 관리</h1>
        <p>유저 조회, 제재 및 상세 정보</p>
      </div>
      <div className="page-body">
        {result && (
          <div className={`alert alert-${result.type === 'success' ? 'success' : 'error'}`}>
            {result.message}
          </div>
        )}

        <div className="tabs">
          {([
            ['action',   '유저 제재'],
            ['currency', '재화'],
            ['hero',     '영웅'],
            ['guide',    '가이드'],
            ['purchase', '구매 내역'],
            ['mailbox',  '우편함'],
          ] as [TabType, string][]).map(([key, label]) => (
            <button
              key={key}
              className={`tab-btn ${activeTab === key ? 'active' : ''}`}
              onClick={() => switchTab(key)}
            >{label}</button>
          ))}
        </div>

        {/* ── 유저 제재 ── */}
        {activeTab === 'action' && (
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
                  </select>
                  <input
                    className="form-input"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={searchType === 'gameName' ? '게임 닉네임 입력' : '소셜 ID 입력'}
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
              <div className="card-title">유저 ID</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">유저 ID</label>
                  <input className="form-input" type="number" value={userId} onChange={e => setUserId(e.target.value)} placeholder="예: 1001" />
                </div>
                <div className="form-group">
                  <label className="form-label">우편함 조회</label>
                  <button className="btn btn-ghost w-full" onClick={() => switchTab('mailbox')} disabled={loading}>우편함 보기</button>
                </div>
              </div>
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
          </>
        )}

        {/* ── 재화 ── */}
        {activeTab === 'currency' && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <div className="card-title" style={{ marginBottom: 0 }}>재화 정보 {userId ? `— 유저 ${userId}` : ''}</div>
              {userId && <button className="btn btn-ghost btn-sm" onClick={async () => { setCurrencies(null); const res = await getUserCurrency(Number(userId)); setCurrencies(res.currency) }}>새로고침</button>}
            </div>
            {!userId ? noUserMsg('재화 정보') : currencies === null ? (
              <p className="text-muted">로딩 중...</p>
            ) : currencies.length === 0 ? (
              <p className="text-muted">재화 데이터가 없습니다.</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      {([['currencyName','재화명'],['currentCount','보유량'],['dayLimit','일일 한도']] as [CurrencyKey, string][]).map(([key, label]) => (
                        <th key={key} onClick={() => toggleCurrSort(key)} style={{ cursor: 'pointer', userSelect: 'none' }}>
                          {label}{sortIcon(currSort.key === key, currSort.asc)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCurrencies.map((c, i) => (
                      <tr key={i}>
                        <td>{c.currencyName}</td>
                        <td><strong>{c.currentCount.toLocaleString()}</strong></td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{c.dayLimit > 0 ? c.dayLimit.toLocaleString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── 영웅 ── */}
        {activeTab === 'hero' && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <div className="card-title" style={{ marginBottom: 0 }}>영웅 정보 {userId ? `— 유저 ${userId}` : ''}</div>
              {userId && <button className="btn btn-ghost btn-sm" onClick={async () => { setHeroes(null); const res = await getUserHeroes(Number(userId)); setHeroes(res.heroes) }}>새로고침</button>}
            </div>
            {!userId ? noUserMsg('영웅 정보') : heroes === null ? (
              <p className="text-muted">로딩 중...</p>
            ) : heroes.length === 0 ? (
              <p className="text-muted">보유 영웅이 없습니다.</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      {([['heroName','영웅명'],['level','레벨'],['awakenStep','각성'],['currentCount','보유 수'],['activeSkillLevel','스킬 레벨']] as [HeroKey, string][]).map(([key, label]) => (
                        <th key={key} onClick={() => toggleHeroSort(key)} style={{ cursor: 'pointer', userSelect: 'none' }}>
                          {label}{sortIcon(heroSort.key === key, heroSort.asc)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedHeroes.map((h, i) => (
                      <tr key={i}>
                        <td><strong>{h.heroName}</strong></td>
                        <td>Lv.{h.level}</td>
                        <td><span className="badge badge-blue">{h.awakenStep}</span></td>
                        <td>{h.currentCount}</td>
                        <td>{h.activeSkillLevel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── 가이드 ── */}
        {activeTab === 'guide' && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <div className="card-title" style={{ marginBottom: 0 }}>가이드 진행 {userId ? `— 유저 ${userId}` : ''}</div>
              {userId && <button className="btn btn-ghost btn-sm" onClick={async () => { setGuide(null); const res = await getUserGuide(Number(userId)); setGuide(res.guideInfo) }}>새로고침</button>}
            </div>
            {!userId ? noUserMsg('가이드 정보') : guide === null ? (
              <p className="text-muted">로딩 중...</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <div style={{ padding: '16px 20px', background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div className="form-label">현재 퀘스트 ID</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)' }}>{guide.currentQuestId}</div>
                </div>
                <div style={{ padding: '16px 20px', background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div className="form-label">클리어 가능</div>
                  <span className={`badge ${guide.isClearable ? 'badge-green' : 'badge-yellow'}`} style={{ fontSize: 14 }}>
                    {guide.isClearable ? '가능' : '불가'}
                  </span>
                </div>
                <div style={{ padding: '16px 20px', background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div className="form-label">전체 클리어</div>
                  <span className={`badge ${guide.allClear ? 'badge-green' : 'badge-blue'}`} style={{ fontSize: 14 }}>
                    {guide.allClear ? '완료' : '진행 중'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── 구매 내역 ── */}
        {activeTab === 'purchase' && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <div className="card-title" style={{ marginBottom: 0 }}>구매 내역 {userId ? `— 유저 ${userId}` : ''}</div>
              {userId && <button className="btn btn-ghost btn-sm" onClick={async () => { setPurchases(null); const res = await getUserPurchase(Number(userId)); setPurchases(res.purchase) }}>새로고침</button>}
            </div>
            {!userId ? noUserMsg('구매 내역') : purchases === null ? (
              <p className="text-muted">로딩 중...</p>
            ) : purchases.length === 0 ? (
              <p className="text-muted">구매 내역이 없습니다.</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>상품 ID</th><th>플랫폼</th><th>구매일시</th></tr></thead>
                  <tbody>
                    {purchases.map((p, i) => (
                      <tr key={i}>
                        <td><code style={{ fontSize: 12 }}>{p.productId}</code></td>
                        <td>
                          <span className={`badge ${p.platform === 'Apple' ? 'badge-blue' : p.platform === 'Google' ? 'badge-green' : 'badge-yellow'}`}>
                            {p.platform}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {p.date?.replace('T', ' ').slice(0, 19)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── 우편함 ── */}
        {activeTab === 'mailbox' && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <div className="card-title" style={{ marginBottom: 0 }}>{userId ? `유저 ${userId}의 우편함` : '우편함'}</div>
              {userId && <button className="btn btn-ghost btn-sm" onClick={() => switchTab('mailbox')} disabled={loading}>새로고침</button>}
            </div>
            {!userId ? noUserMsg('우편함') : mailBox === null ? (
              <p className="text-muted">로딩 중...</p>
            ) : mailBox.length === 0 ? (
              <p className="text-muted">우편함이 비어있습니다.</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Mail ID</th><th>제목</th><th>수령</th><th>만료일</th><th>포함 아이템</th></tr></thead>
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
                          <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{mail.expireDate?.split('T')[0]}</td>
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
