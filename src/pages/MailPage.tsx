import { useState } from 'react'
import { sendMail, sendMailList } from '../api/endpoints'

interface ResultState {
  type: 'success' | 'error'
  message: string
}

interface ItemRow {
  id: string
  itemType: string
  itemId: string
  count: string
}

type ItemCategory = 'Currency_' | 'Character_' | 'Equipment_' | 'EquipmentBox_' | 'ItemBox_' | 'Emblem' | 'Emblem_'

const ITEM_CATEGORIES: { value: ItemCategory; label: string; needId: boolean }[] = [
  { value: 'Currency_',     label: '재화 (Currency_N)',        needId: true },
  { value: 'Character_',    label: '영웅/캐릭터 (Character_N)', needId: true },
  { value: 'Equipment_',    label: '장비 (Equipment_N)',        needId: true },
  { value: 'EquipmentBox_', label: '장비 상자 (EquipmentBox_N)',needId: true },
  { value: 'ItemBox_',      label: '아이템 상자 (ItemBox_N)',   needId: true },
  { value: 'Emblem_',       label: '문장 등급 지정 (Emblem_N)',  needId: true },
  { value: 'Emblem',        label: '문장 랜덤',                 needId: false },
]

function makeKey(row: ItemRow): string {
  const cat = ITEM_CATEGORIES.find(c => c.value === row.itemType)
  if (!cat) return ''
  if (!cat.needId) return 'Emblem'
  return `${row.itemType}${row.itemId}`
}

function buildSendMailListFormat(rows: ItemRow[]) {
  return rows
    .map(r => `${makeKey(r)}:${r.count || '1'}`)
    .filter(s => !s.startsWith(':'))
    .join(',')
}

function newRow(): ItemRow {
  return { id: crypto.randomUUID(), itemType: 'Currency_', itemId: '', count: '1' }
}

function getTodayStr() {
  return new Date().toISOString().slice(0, 16)
}

function getExpireStr() {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().slice(0, 16)
}

interface ItemBuilderProps {
  rows: ItemRow[]
  onChange: (rows: ItemRow[]) => void
  rawInput: string
  onRawChange: (v: string) => void
}

function ItemBuilder({ rows, onChange, rawInput, onRawChange }: ItemBuilderProps) {
  const [mode, setMode] = useState<'builder' | 'raw'>('builder')

  function updateRow(id: string, patch: Partial<ItemRow>) {
    onChange(rows.map(r => r.id === id ? { ...r, ...patch } : r))
  }

  function removeRow(id: string) {
    onChange(rows.filter(r => r.id !== id))
  }

  const previewList = buildSendMailListFormat(rows)

  return (
    <div>
      <div className="flex gap-2 mb-3" style={{ alignItems: 'center' }}>
        <span className="form-label" style={{ marginBottom: 0 }}>아이템 입력 방식</span>
        <button
          type="button"
          className={`btn btn-sm ${mode === 'builder' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setMode('builder')}
        >빌더</button>
        <button
          type="button"
          className={`btn btn-sm ${mode === 'raw' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setMode('raw')}
        >직접 입력</button>
      </div>

      {mode === 'builder' ? (
        <>
          <div style={{ marginBottom: 8 }}>
            {rows.map((row) => {
              const cat = ITEM_CATEGORIES.find(c => c.value === row.itemType)
              return (
                <div key={row.id} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 80px 36px', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                  <select
                    className="form-select"
                    value={row.itemType}
                    onChange={e => updateRow(row.id, { itemType: e.target.value as ItemCategory, itemId: '' })}
                  >
                    {ITEM_CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>

                  <input
                    className="form-input"
                    type="number"
                    placeholder={cat?.needId ? 'ID' : '-'}
                    disabled={!cat?.needId}
                    value={row.itemId}
                    onChange={e => updateRow(row.id, { itemId: e.target.value })}
                    style={{ opacity: cat?.needId ? 1 : 0.4 }}
                  />

                  <input
                    className="form-input"
                    type="number"
                    placeholder="수량"
                    min={1}
                    value={row.count}
                    onChange={e => updateRow(row.id, { count: e.target.value })}
                  />

                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => removeRow(row.id)}
                    style={{ padding: '5px 8px' }}
                  >✕</button>
                </div>
              )
            })}
          </div>

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onChange([...rows, newRow()])}
          >+ 아이템 추가</button>

          {rows.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div className="form-label">미리보기 (gettingItem)</div>
              <div className="code-block">
                {previewList || '-'}
              </div>
            </div>
          )}
        </>
      ) : (
        <div>
          <div className="form-label">
            gettingItem 직접 입력 <span className="text-muted">(Type_Id:Count 콤마 구분, 예: Character_1:1,Currency_1:100)</span>
          </div>
          <textarea
            className="form-textarea"
            value={rawInput}
            onChange={e => onRawChange(e.target.value)}
            placeholder="Character_1:1,Currency_1:100,Equipment_112:1"
            style={{ minHeight: 80, fontFamily: 'monospace', fontSize: 12 }}
          />
          <div className="code-block" style={{ marginTop: 6 }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>입력값: </span>
            {rawInput || '-'}
          </div>
        </div>
      )}
    </div>
  )
}

export default function MailPage() {
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ResultState | null>(null)

  // 단건 발송 state
  const [toId, setToId] = useState('')
  const [title, setTitle] = useState('')
  const [gettingItem, setGettingItem] = useState('')
  const [gettingItemCount, setGettingItemCount] = useState('')
  const [mailType, setMailType] = useState(0)
  const [sendDate, setSendDate] = useState(getTodayStr())
  const [expireDate, setExpireDate] = useState(getExpireStr())
  const [mailTemplateIndex, setMailTemplateIndex] = useState(0)

  // 일괄 발송 state (아이템 빌더)
  const [itemRows, setItemRows] = useState<ItemRow[]>([newRow()])
  const [rawInput, setRawInput] = useState('')
  const [batchUserId, setBatchUserId] = useState('')
  const [batchPlusDay, setBatchPlusDay] = useState(30)
  const [batchTitle, setBatchTitle] = useState('')
  const [batchTemplateIndex, setBatchTemplateIndex] = useState(0)

  function showResult(type: 'success' | 'error', message: string) {
    setResult({ type, message })
    setTimeout(() => setResult(null), 5000)
  }

  function getBatchListFormat() {
    if (rawInput.trim()) return rawInput.trim()
    return buildSendMailListFormat(itemRows)
  }

  async function handleSingleSend(e: React.FormEvent) {
    e.preventDefault()
    const uid = Number(toId)
    if (!uid) { showResult('error', '유저 ID를 입력하세요'); return }

    setLoading(true)
    try {
      const res = await sendMail({
        title,
        toId: uid,
        gettingItem,
        gettingItemCount,
        mailType,
        sendDate: new Date(sendDate).toISOString().replace('Z', ''),
        expireDate: new Date(expireDate).toISOString().replace('Z', ''),
        mailTemplateIndex,
      })

      if (res.check) showResult('success', `유저 ${uid}에게 우편이 발송되었습니다`)
      else showResult('error', res.message || '발송 실패')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string }
      showResult('error', e.response?.data?.message || e.message || '오류 발생')
    } finally {
      setLoading(false)
    }
  }

  async function handleBatchSend(e: React.FormEvent) {
    e.preventDefault()
    const uid = Number(batchUserId)
    if (!uid) { showResult('error', '유저 ID를 입력하세요'); return }

    const listFormat = getBatchListFormat()
    setLoading(true)
    try {
      const res = await sendMailList({
        userId: uid,
        plusDay: batchPlusDay,
        title: batchTitle,
        gettingItem: listFormat,
        mailTemplateIndex: batchTemplateIndex,
      })

      if (res.check) showResult('success', `우편 일괄 발송이 완료되었습니다`)
      else showResult('error', res.message || '발송 실패')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string }
      showResult('error', e.response?.data?.message || e.message || '오류 발생')
    } finally {
      setLoading(false)
    }
  }

  const itemBuilder = (
    <div className="card">
      <div className="card-title">지급 아이템 설정</div>
      <ItemBuilder
        rows={itemRows}
        onChange={setItemRows}
        rawInput={rawInput}
        onRawChange={setRawInput}
      />
      <div className="alert alert-info" style={{ marginTop: 12, fontSize: 12 }}>
        <strong>지원 타입:</strong> Currency_N · Character_N · Equipment_N · EquipmentBox_N · ItemBox_N · Emblem_N · Emblem (랜덤)
      </div>
    </div>
  )

  return (
    <>
      <div className="page-header">
        <h1>우편 발송</h1>
        <p>유저에게 아이템/재화를 우편으로 지급</p>
      </div>
      <div className="page-body">
        {result && (
          <div className={`alert alert-${result.type === 'success' ? 'success' : 'error'}`}>
            {result.message}
          </div>
        )}

        <div className="tabs">
          <button className={`tab-btn ${activeTab === 'single' ? 'active' : ''}`} onClick={() => setActiveTab('single')}>단건 발송</button>
          <button className={`tab-btn ${activeTab === 'batch' ? 'active' : ''}`} onClick={() => setActiveTab('batch')}>일괄 발송</button>
        </div>

        {activeTab === 'single' && (
          <form onSubmit={handleSingleSend}>
            <div className="card">
              <div className="card-title">발송 정보</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">수신 유저 ID</label>
                  <input
                    className="form-input"
                    type="number"
                    value={toId}
                    onChange={e => setToId(e.target.value)}
                    placeholder="예: 1001"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">메일 타입</label>
                  <select className="form-select" value={mailType} onChange={e => setMailType(Number(e.target.value))}>
                    <option value={0}>0 - 일반</option>
                    <option value={1}>1 - 시스템</option>
                    <option value={2}>2 - 이벤트</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">우편 제목</label>
                <input
                  className="form-input"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="우편 제목 입력"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">발송 시각</label>
                  <input className="form-input" type="datetime-local" value={sendDate} onChange={e => setSendDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">만료 시각</label>
                  <input className="form-input" type="datetime-local" value={expireDate} onChange={e => setExpireDate(e.target.value)} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">gettingItem <span className="text-muted" style={{ textTransform: 'none', fontSize: 11 }}>(예: Character_1,Currency_1)</span></label>
                  <input
                    className="form-input font-mono"
                    value={gettingItem}
                    onChange={e => setGettingItem(e.target.value)}
                    placeholder="Character_1,Currency_1"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">gettingItemCount <span className="text-muted" style={{ textTransform: 'none', fontSize: 11 }}>(예: 1,100)</span></label>
                  <input
                    className="form-input font-mono"
                    value={gettingItemCount}
                    onChange={e => setGettingItemCount(e.target.value)}
                    placeholder="1,100"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">메일 템플릿 인덱스</label>
                <input
                  className="form-input"
                  type="number"
                  value={mailTemplateIndex}
                  onChange={e => setMailTemplateIndex(Number(e.target.value))}
                  min={0}
                  style={{ maxWidth: 160 }}
                />
              </div>
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? <><span className="spinner" /> 발송 중...</> : '우편 발송'}
            </button>
          </form>
        )}

        {activeTab === 'batch' && (
          <form onSubmit={handleBatchSend}>
            <div className="alert alert-info">
              SendMailList: 아이템 하나당 우편 1개가 생성됩니다. gettingItem 형식: <code style={{ fontSize: 12 }}>Type_Id:Count,Type_Id:Count,...</code>
            </div>
            <div className="card">
              <div className="card-title">발송 정보</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">유저 ID</label>
                  <input
                    className="form-input"
                    type="number"
                    value={batchUserId}
                    onChange={e => setBatchUserId(e.target.value)}
                    placeholder="예: 1001"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">만료일 (+일수)</label>
                  <input
                    className="form-input"
                    type="number"
                    value={batchPlusDay}
                    onChange={e => setBatchPlusDay(Number(e.target.value))}
                    min={1}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">우편 제목</label>
                <input
                  className="form-input"
                  value={batchTitle}
                  onChange={e => setBatchTitle(e.target.value)}
                  placeholder="우편 제목 입력"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">메일 템플릿 인덱스</label>
                <input
                  className="form-input"
                  type="number"
                  value={batchTemplateIndex}
                  onChange={e => setBatchTemplateIndex(Number(e.target.value))}
                  min={0}
                  style={{ maxWidth: 160 }}
                />
              </div>
            </div>

            {itemBuilder}

            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? <><span className="spinner" /> 발송 중...</> : '일괄 발송'}
            </button>
          </form>
        )}
      </div>
    </>
  )
}
