import { useEffect, useState } from 'react'
import { createCoupon, createBulkCoupons, getCoupons } from '../api/endpoints'
import ItemBuilder from '../components/ItemBuilder'
import { newRow, buildSendMailListFormat, type ItemRow } from '../data/gameData'
import type { CouponResponse } from '../types'

interface ResultState { type: 'success' | 'error'; message: string }
type TabType = 'single' | 'bulk' | 'list'

export default function CouponPage() {
  const [activeTab, setActiveTab] = useState<TabType>('single')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ResultState | null>(null)

  // 단건 생성
  const [name, setName] = useState('')
  const [itemRows, setItemRows] = useState<ItemRow[]>([newRow()])
  const [rawInput, setRawInput] = useState('')
  const [code, setCode] = useState('')
  const [keyword, setKeyword] = useState(false)
  const [accountCoupon, setAccountCoupon] = useState(false)
  const [beginDate, setBeginDate] = useState('')
  const [expireDate, setExpireDate] = useState('')
  const [mailTemplateIndex, setMailTemplateIndex] = useState('')

  // 일괄 발급
  const [bulkName, setBulkName] = useState('')
  const [bulkItemRows, setBulkItemRows] = useState<ItemRow[]>([newRow()])
  const [bulkRawInput, setBulkRawInput] = useState('')
  const [quantity, setQuantity] = useState(10)
  const [bulkBeginDate, setBulkBeginDate] = useState('')
  const [bulkExpireDate, setBulkExpireDate] = useState('')
  const [bulkMailTemplateIndex, setBulkMailTemplateIndex] = useState('')

  // 목록
  const [coupons, setCoupons] = useState<CouponResponse[] | null>(null)
  const [listLoading, setListLoading] = useState(false)

  function showResult(type: 'success' | 'error', message: string) {
    setResult({ type, message })
    setTimeout(() => setResult(null), 5000)
  }

  async function loadCoupons() {
    setListLoading(true)
    try {
      setCoupons(await getCoupons())
    } catch (err: unknown) {
      const e = err as { message?: string }
      showResult('error', e.message || '쿠폰 목록 조회 실패')
    } finally {
      setListLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'list' && coupons === null) loadCoupons()
  }, [activeTab]) // eslint-disable-line react-hooks/exhaustive-deps

  function toIso(dt: string) {
    return dt ? new Date(dt).toISOString().replace('Z', '') : undefined
  }

  async function handleCreateSingle(e: React.FormEvent) {
    e.preventDefault()
    const gettingItem = rawInput.trim() || buildSendMailListFormat(itemRows)
    if (!name.trim() || !gettingItem) { showResult('error', '쿠폰 이름과 지급 아이템을 입력하세요'); return }
    setLoading(true)
    try {
      const created = await createCoupon({
        name: name.trim(),
        gettingItem,
        code: code.trim() || undefined,
        keyword,
        accountCoupon,
        beginDate: toIso(beginDate),
        expireDate: toIso(expireDate),
        mailTemplateIndex: mailTemplateIndex === '' ? undefined : Number(mailTemplateIndex),
      })
      showResult('success', `쿠폰 생성 완료 (코드: ${created.code})`)
      setName(''); setItemRows([newRow()]); setRawInput(''); setCode('')
      setKeyword(false); setAccountCoupon(false); setBeginDate(''); setExpireDate(''); setMailTemplateIndex('')
      setCoupons(null)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string }
      showResult('error', e.response?.data?.message || e.message || '쿠폰 생성 실패')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateBulk(e: React.FormEvent) {
    e.preventDefault()
    const gettingItem = bulkRawInput.trim() || buildSendMailListFormat(bulkItemRows)
    if (!bulkName.trim() || !gettingItem) { showResult('error', '쿠폰 이름과 지급 아이템을 입력하세요'); return }
    if (!quantity || quantity < 1 || quantity > 1000) { showResult('error', '발급 수량은 1~1000 사이여야 합니다'); return }
    if (!window.confirm(`"${bulkName}" 쿠폰을 ${quantity}장 발급하시겠습니까?`)) return
    setLoading(true)
    try {
      const created = await createBulkCoupons({
        name: bulkName.trim(),
        gettingItem,
        quantity,
        beginDate: toIso(bulkBeginDate),
        expireDate: toIso(bulkExpireDate),
        mailTemplateIndex: bulkMailTemplateIndex === '' ? undefined : Number(bulkMailTemplateIndex),
      })
      showResult('success', `쿠폰 ${created.length}장 발급 완료`)
      setBulkName(''); setBulkItemRows([newRow()]); setBulkRawInput(''); setQuantity(10)
      setBulkBeginDate(''); setBulkExpireDate(''); setBulkMailTemplateIndex('')
      setCoupons(null)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string }
      showResult('error', e.response?.data?.message || e.message || '쿠폰 일괄 발급 실패')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <h1>쿠폰 관리</h1>
        <p>쿠폰 생성, 일괄 발급 및 목록 조회</p>
      </div>
      <div className="page-body">
        {result && (
          <div className={`alert alert-${result.type === 'success' ? 'success' : 'error'}`}>
            {result.message}
          </div>
        )}

        <div className="tabs">
          <button className={`tab-btn ${activeTab === 'single' ? 'active' : ''}`} onClick={() => setActiveTab('single')}>단건 생성</button>
          <button className={`tab-btn ${activeTab === 'bulk' ? 'active' : ''}`} onClick={() => setActiveTab('bulk')}>일괄 발급</button>
          <button className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>쿠폰 목록</button>
        </div>

        {activeTab === 'single' && (
          <form onSubmit={handleCreateSingle}>
            <div className="card">
              <div className="card-title">쿠폰 정보</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">쿠폰 이름</label>
                  <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="예: 출시 기념 쿠폰" required />
                </div>
                <div className="form-group">
                  <label className="form-label">쿠폰 코드 <span className="text-muted" style={{ textTransform: 'none', fontSize: 11 }}>(비워두면 자동 생성)</span></label>
                  <input className="form-input font-mono" value={code} onChange={e => setCode(e.target.value)} placeholder="자동 생성" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">사용 시작일시</label>
                  <input className="form-input" type="datetime-local" value={beginDate} onChange={e => setBeginDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">만료일시</label>
                  <input className="form-input" type="datetime-local" value={expireDate} onChange={e => setExpireDate(e.target.value)} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">메일 템플릿 인덱스 <span className="text-muted" style={{ textTransform: 'none', fontSize: 11 }}>(비워두면 -1)</span></label>
                  <input className="form-input" type="number" value={mailTemplateIndex} onChange={e => setMailTemplateIndex(e.target.value)} min={0} style={{ maxWidth: 160 }} />
                </div>
              </div>

              <div className="flex gap-2" style={{ alignItems: 'center' }}>
                <label className="flex items-center" style={{ gap: 6, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={keyword} onChange={e => setKeyword(e.target.checked)} />
                  다회용(키워드) 쿠폰
                </label>
                <label className="flex items-center" style={{ gap: 6, fontSize: 13, cursor: 'pointer', marginLeft: 16 }}>
                  <input type="checkbox" checked={accountCoupon} onChange={e => setAccountCoupon(e.target.checked)} />
                  계정당 1회 제한
                </label>
              </div>

              <div className="alert alert-info" style={{ marginTop: 12, fontSize: 12 }}>
                <strong>다회용(keyword)</strong>: 체크 해제 시 코드는 <strong>전역 1회성</strong>입니다 — 서버 전체에서 누군가 한 번 사용하면 즉시 소진되어 다른 유저는 쓸 수 없습니다(유저별 1회가 아님). 체크하면 코드가 소진되지 않고 여러 유저가 각자 1번씩 사용할 수 있습니다(동일 유저의 재사용은 차단).<br />
                <strong>계정당 1회 제한(accountCoupon)</strong>: 같은 쿠폰 <strong>이름</strong>으로 발급된 다른 코드를 이미 사용한 계정은 추가 사용이 차단됩니다(코드가 달라도 적용). 두 항목은 서로 독립적으로 조합 가능합니다.
              </div>
            </div>

            <div className="card">
              <div className="card-title">지급 아이템 설정</div>
              <ItemBuilder rows={itemRows} onChange={setItemRows} rawInput={rawInput} onRawChange={setRawInput} />
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? <><span className="spinner" /> 생성 중...</> : '쿠폰 생성'}
            </button>
          </form>
        )}

        {activeTab === 'bulk' && (
          <form onSubmit={handleCreateBulk}>
            <div className="alert alert-info">
              일괄 발급된 쿠폰은 항상 <code style={{ fontSize: 12 }}>keyword=false</code>, <code style={{ fontSize: 12 }}>accountCoupon=false</code>이며, 각 쿠폰은 서로 다른 난수 코드를 가집니다.
            </div>
            <div className="card">
              <div className="card-title">쿠폰 정보</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">쿠폰 이름</label>
                  <input className="form-input" value={bulkName} onChange={e => setBulkName(e.target.value)} placeholder="예: 출시 기념 쿠폰" required />
                </div>
                <div className="form-group">
                  <label className="form-label">발급 수량 (1~1000)</label>
                  <input className="form-input" type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} min={1} max={1000} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">사용 시작일시</label>
                  <input className="form-input" type="datetime-local" value={bulkBeginDate} onChange={e => setBulkBeginDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">만료일시</label>
                  <input className="form-input" type="datetime-local" value={bulkExpireDate} onChange={e => setBulkExpireDate(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">메일 템플릿 인덱스 <span className="text-muted" style={{ textTransform: 'none', fontSize: 11 }}>(비워두면 -1)</span></label>
                <input className="form-input" type="number" value={bulkMailTemplateIndex} onChange={e => setBulkMailTemplateIndex(e.target.value)} min={0} style={{ maxWidth: 160 }} />
              </div>
            </div>

            <div className="card">
              <div className="card-title">지급 아이템 설정</div>
              <ItemBuilder rows={bulkItemRows} onChange={setBulkItemRows} rawInput={bulkRawInput} onRawChange={setBulkRawInput} />
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? <><span className="spinner" /> 발급 중...</> : '쿠폰 일괄 발급'}
            </button>
          </form>
        )}

        {activeTab === 'list' && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <div className="card-title" style={{ marginBottom: 0 }}>쿠폰 목록</div>
              <button className="btn btn-ghost btn-sm" onClick={loadCoupons} disabled={listLoading}>새로고침</button>
            </div>
            {listLoading ? (
              <p className="text-muted">로딩 중...</p>
            ) : !coupons || coupons.length === 0 ? (
              <p className="text-muted">등록된 쿠폰이 없습니다.</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>이름</th>
                      <th>코드</th>
                      <th>지급 아이템</th>
                      <th>사용</th>
                      <th>키워드</th>
                      <th>계정 제한</th>
                      <th>시작일</th>
                      <th>만료일</th>
                      <th>생성일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map(c => (
                      <tr key={c.id}>
                        <td><code style={{ fontSize: 11 }}>{c.id}</code></td>
                        <td>{c.name}</td>
                        <td><code style={{ fontSize: 12 }}>{c.code}</code></td>
                        <td style={{ fontSize: 12, fontFamily: 'monospace' }}>{c.gettingItem}</td>
                        <td><span className={`badge ${c.used ? 'badge-green' : 'badge-blue'}`}>{c.used ? '사용됨' : '미사용'}</span></td>
                        <td>{c.keyword ? <span className="badge badge-yellow">다회용</span> : <span className="text-muted">-</span>}</td>
                        <td>{c.accountCoupon ? <span className="badge badge-red">제한</span> : <span className="text-muted">-</span>}</td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.beginDate?.replace('T', ' ').slice(0, 16) ?? '-'}</td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.expireDate?.replace('T', ' ').slice(0, 16) ?? '-'}</td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.createdDate?.replace('T', ' ').slice(0, 16)}</td>
                      </tr>
                    ))}
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
