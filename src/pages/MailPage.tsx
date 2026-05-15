import { useState } from 'react'
import { sendMail, sendMailList } from '../api/endpoints'
import ItemBuilder from '../components/ItemBuilder'
import { newRow, buildSendMailListFormat, type ItemRow } from '../data/gameData'

interface ResultState {
  type: 'success' | 'error'
  message: string
}

function getTodayStr() {
  return new Date().toISOString().slice(0, 16)
}

function getExpireStr() {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().slice(0, 16)
}

export default function MailPage() {
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ResultState | null>(null)

  // 단건 발송
  const [toId, setToId] = useState('')
  const [title, setTitle] = useState('')
  const [gettingItem, setGettingItem] = useState('')
  const [gettingItemCount, setGettingItemCount] = useState('')
  const [mailType, setMailType] = useState(0)
  const [sendDate, setSendDate] = useState(getTodayStr())
  const [expireDate, setExpireDate] = useState(getExpireStr())
  const [mailTemplateIndex, setMailTemplateIndex] = useState(0)

  // 일괄 발송
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

    const listFormat = rawInput.trim() || buildSendMailListFormat(itemRows)
    setLoading(true)
    try {
      const res = await sendMailList({
        userId: uid,
        plusDay: batchPlusDay,
        title: batchTitle,
        gettingItem: listFormat,
        mailTemplateIndex: batchTemplateIndex,
      })
      if (res.check) showResult('success', '우편 일괄 발송이 완료되었습니다')
      else showResult('error', res.message || '발송 실패')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string }
      showResult('error', e.response?.data?.message || e.message || '오류 발생')
    } finally {
      setLoading(false)
    }
  }

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
                  <input className="form-input" type="number" value={toId} onChange={e => setToId(e.target.value)} placeholder="예: 1001" required />
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
                <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="우편 제목 입력" required />
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
                  <input className="form-input font-mono" value={gettingItem} onChange={e => setGettingItem(e.target.value)} placeholder="Character_1,Currency_1" />
                </div>
                <div className="form-group">
                  <label className="form-label">gettingItemCount <span className="text-muted" style={{ textTransform: 'none', fontSize: 11 }}>(예: 1,100)</span></label>
                  <input className="form-input font-mono" value={gettingItemCount} onChange={e => setGettingItemCount(e.target.value)} placeholder="1,100" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">메일 템플릿 인덱스</label>
                <input className="form-input" type="number" value={mailTemplateIndex} onChange={e => setMailTemplateIndex(Number(e.target.value))} min={0} style={{ maxWidth: 160 }} />
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
              SendMailList: 아이템 하나당 우편 1개가 생성됩니다. gettingItem 형식: <code style={{ fontSize: 12 }}>Type_Id:Count,...</code>
            </div>
            <div className="card">
              <div className="card-title">발송 정보</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">유저 ID</label>
                  <input className="form-input" type="number" value={batchUserId} onChange={e => setBatchUserId(e.target.value)} placeholder="예: 1001" required />
                </div>
                <div className="form-group">
                  <label className="form-label">만료일 (+일수)</label>
                  <input className="form-input" type="number" value={batchPlusDay} onChange={e => setBatchPlusDay(Number(e.target.value))} min={1} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">우편 제목</label>
                <input className="form-input" value={batchTitle} onChange={e => setBatchTitle(e.target.value)} placeholder="우편 제목 입력" required />
              </div>

              <div className="form-group">
                <label className="form-label">메일 템플릿 인덱스</label>
                <input className="form-input" type="number" value={batchTemplateIndex} onChange={e => setBatchTemplateIndex(Number(e.target.value))} min={0} style={{ maxWidth: 160 }} />
              </div>
            </div>

            <div className="card">
              <div className="card-title">지급 아이템 설정</div>
              <ItemBuilder rows={itemRows} onChange={setItemRows} rawInput={rawInput} onRawChange={setRawInput} />
              <div className="alert alert-info" style={{ marginTop: 12, fontSize: 12 }}>
                <strong>지원 타입:</strong> Currency_N · Character_N · Equipment_N · EquipmentBox_N · ItemBox_N · Emblem_N · Emblem (랜덤)
              </div>
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? <><span className="spinner" /> 발송 중...</> : '일괄 발송'}
            </button>
          </form>
        )}
      </div>
    </>
  )
}
