import { useState } from 'react'
import { getDailyMetrics, getRetentionMetrics } from '../api/endpoints'
import PayingUsersModal from '../components/PayingUsersModal'
import UserActionModal from '../components/UserActionModal'
import type { DailyMetrics, DailyRetentionMetrics } from '../types'

interface ResultState { type: 'success' | 'error'; message: string }

type TabType = 'daily' | 'retention'

function today() {
  return new Date().toISOString().slice(0, 10)
}

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

const RETENTION_DAYS = [1, 3, 5, 7, 14, 21, 30] as const

export default function MetricsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('daily')
  const [payingUsersDate, setPayingUsersDate] = useState<string | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [result, setResult] = useState<ResultState | null>(null)

  const [from, setFrom] = useState(daysAgo(6))
  const [to, setTo] = useState(today())
  const [rows, setRows] = useState<DailyMetrics[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const [retentionRows, setRetentionRows] = useState<DailyRetentionMetrics[]>([])
  const [retentionLoading, setRetentionLoading] = useState(false)
  const [retentionError, setRetentionError] = useState<string | null>(null)
  const [retentionSearched, setRetentionSearched] = useState(false)

  function showResult(type: 'success' | 'error', message: string) {
    setResult({ type, message })
    setTimeout(() => setResult(null), 4000)
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await getDailyMetrics(from, to)
      setRows(data)
      setSearched(true)
    } catch (err: unknown) {
      const e = err as { response?: { status?: number }; message?: string }
      if (e.response?.status === 403) setError('권한이 없습니다 (ROLE_ADMIN 전용)')
      else setError(e.message || '지표 조회 실패')
    } finally {
      setLoading(false)
    }
  }

  async function handleRetentionSearch(e: React.FormEvent) {
    e.preventDefault()
    setRetentionLoading(true)
    setRetentionError(null)
    try {
      const data = await getRetentionMetrics(from, to)
      setRetentionRows(data)
      setRetentionSearched(true)
    } catch (err: unknown) {
      const e = err as { response?: { status?: number }; message?: string }
      if (e.response?.status === 403) setRetentionError('권한이 없습니다 (ROLE_ADMIN 전용)')
      else setRetentionError(e.message || '리텐션 지표 조회 실패')
    } finally {
      setRetentionLoading(false)
    }
  }

  const totalRevenue = rows.reduce((s, r) => s + r.totalRevenue, 0)
  const avgDau = rows.length > 0 ? Math.round(rows.reduce((s, r) => s + r.dau, 0) / rows.length) : 0
  const totalNew = rows.reduce((s, r) => s + r.newUserCount, 0)

  const currentError = activeTab === 'daily' ? error : retentionError
  const currentLoading = activeTab === 'daily' ? loading : retentionLoading

  return (
    <>
      <div className="page-header">
        <h1>일별 게임 지표</h1>
        <p>DAU · MAU · 신규 · 매출 · 리텐션 집계 (ROLE_ADMIN 전용)</p>
      </div>
      <div className="page-body">
        {currentError && <div className="alert alert-error">{currentError}</div>}
        {result && (
          <div className={`alert alert-${result.type === 'success' ? 'success' : 'error'}`}>
            {result.message}
          </div>
        )}

        <div className="tabs">
          <button className={`tab-btn ${activeTab === 'daily' ? 'active' : ''}`} onClick={() => setActiveTab('daily')}>일별 지표</button>
          <button className={`tab-btn ${activeTab === 'retention' ? 'active' : ''}`} onClick={() => setActiveTab('retention')}>리텐션</button>
        </div>

        {/* 기간 선택 */}
        <div className="card" style={{ marginBottom: 16 }}>
          <form onSubmit={activeTab === 'daily' ? handleSearch : handleRetentionSearch}>
            <div className="flex items-center" style={{ gap: 12, flexWrap: 'wrap' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ marginBottom: 4 }}>{activeTab === 'daily' ? '시작일' : '시작 가입일'}</label>
                <input
                  className="form-input"
                  type="date"
                  value={from}
                  onChange={e => setFrom(e.target.value)}
                  max={to}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ marginBottom: 4 }}>{activeTab === 'daily' ? '종료일' : '종료 가입일'}</label>
                <input
                  className="form-input"
                  type="date"
                  value={to}
                  onChange={e => setTo(e.target.value)}
                  min={from}
                  max={today()}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', paddingTop: 20 }}>
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => { setFrom(daysAgo(6)); setTo(today()) }}>
                  최근 7일
                </button>
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => { setFrom(daysAgo(29)); setTo(today()) }}>
                  최근 30일
                </button>
                <button className="btn btn-primary" type="submit" disabled={currentLoading}>
                  {currentLoading ? <><span className="spinner" /> 조회 중...</> : '조회'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {activeTab === 'daily' ? (
          <>
            {/* 요약 카드 */}
            {searched && rows.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
                <SummaryCard label="기간 총 매출" value={`₩${totalRevenue.toLocaleString()}`} color="var(--accent)" />
                <SummaryCard label="평균 DAU" value={avgDau.toLocaleString()} color="var(--primary)" />
                <SummaryCard label="기간 신규 유저" value={totalNew.toLocaleString()} color="#22c55e" />
                <SummaryCard label="조회 기간" value={`${rows.length}일`} color="var(--text-muted)" />
              </div>
            )}

            {/* 테이블 */}
            {searched && (
              <div className="card">
                {rows.length === 0 ? (
                  <p className="text-muted">해당 기간에 데이터가 없습니다.</p>
                ) : (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>날짜</th>
                          <th style={{ textAlign: 'right' }}>DAU</th>
                          <th style={{ textAlign: 'right' }}>MAU</th>
                          <th style={{ textAlign: 'right' }}>신규</th>
                          <th style={{ textAlign: 'right' }}>총 매출</th>
                          <th style={{ textAlign: 'right' }}>결제 건수</th>
                          <th style={{ textAlign: 'right' }}>결제 유저</th>
                          <th style={{ textAlign: 'right' }}>ARPU</th>
                          <th style={{ textAlign: 'right' }}>ARPPU</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map(r => (
                          <tr key={r.date}>
                            <td style={{ fontWeight: 600 }}>{r.date}</td>
                            <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.dau.toLocaleString()}</td>
                            <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.mau.toLocaleString()}</td>
                            <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.newUserCount.toLocaleString()}</td>
                            <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>₩{r.totalRevenue.toLocaleString()}</td>
                            <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.purchaseCount.toLocaleString()}</td>
                            <td
                              style={{
                                textAlign: 'right',
                                fontVariantNumeric: 'tabular-nums',
                                cursor: r.payingUserCount > 0 ? 'pointer' : 'default',
                                textDecoration: r.payingUserCount > 0 ? 'underline' : 'none',
                                color: r.payingUserCount > 0 ? 'var(--primary)' : undefined,
                              }}
                              onClick={() => r.payingUserCount > 0 && setPayingUsersDate(r.date)}
                            >
                              {r.payingUserCount.toLocaleString()}
                            </td>
                            <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.arpu.toFixed(0)}</td>
                            <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.arppu.toFixed(0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            {/* 리텐션 테이블 */}
            {retentionSearched && (
              <div className="card">
                <p className="text-muted" style={{ fontSize: 12, marginBottom: 12 }}>
                  가입일(코호트) 기준 N일차 잔존율. 오늘 도달한 윈도우는 Redis 실시간 집계, 그 외는 전날 배치 반영 값입니다.
                </p>
                {retentionRows.length === 0 ? (
                  <p className="text-muted">해당 기간에 데이터가 없습니다.</p>
                ) : (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>가입일</th>
                          <th style={{ textAlign: 'right' }}>가입자 수</th>
                          {RETENTION_DAYS.map(d => (
                            <th key={d} style={{ textAlign: 'right' }}>D{d}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {retentionRows.map(r => (
                          <tr key={r.cohortDate}>
                            <td style={{ fontWeight: 600 }}>{r.cohortDate}</td>
                            <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.cohortSize.toLocaleString()}</td>
                            {RETENTION_DAYS.map(d => {
                              const count = r[`d${d}Count` as keyof DailyRetentionMetrics] as number
                              const rate = r[`d${d}Rate` as keyof DailyRetentionMetrics] as number
                              return (
                                <td key={d} style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                                  {(rate * 100).toFixed(1)}%
                                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{count.toLocaleString()}명</div>
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {payingUsersDate && (
        <PayingUsersModal
          date={payingUsersDate}
          onClose={() => setPayingUsersDate(null)}
          onUserClick={setSelectedUserId}
        />
      )}

      {selectedUserId != null && (
        <UserActionModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onResult={showResult}
        />
      )}
    </>
  )
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="card" style={{ padding: '16px 20px' }}>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
    </div>
  )
}
