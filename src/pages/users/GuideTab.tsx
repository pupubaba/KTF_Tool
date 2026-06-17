import { useEffect, useState } from 'react'
import { getUserGuide, setGuideClearable, setGuideQuest } from '../../api/endpoints'
import { useApp } from '../../contexts/AppContext'
import type { GuideInfo } from '../../types'

interface Props {
  userId: string
  data: GuideInfo | null
  setData: React.Dispatch<React.SetStateAction<GuideInfo | null>>
  onResult: (type: 'success' | 'error', msg: string) => void
}

export default function GuideTab({ userId, data, setData, onResult }: Props) {
  const { userInfo } = useApp()
  const isAdmin = userInfo?.roles.includes('ROLE_ADMIN') ?? false
  const [clearableLoading, setClearableLoading] = useState(false)
  const [questInput, setQuestInput]             = useState('')
  const [questLoading, setQuestLoading]         = useState(false)

  useEffect(() => {
    if (!userId || data !== null) return
    load()
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function load() {
    try {
      const res = await getUserGuide(Number(userId))
      setData(res.guideInfo)
    } catch (err: unknown) {
      const e = err as { message?: string }
      onResult('error', e.message || '가이드 조회 실패')
    }
  }

  async function handleRefresh() {
    setData(null)
    await load()
  }

  async function handleSetClearable() {
    if (!window.confirm(`유저 ${userId}의 가이드 퀘스트를 클리어 가능 상태로 변경하시겠습니까?`)) return
    setClearableLoading(true)
    try {
      await setGuideClearable(Number(userId))
      onResult('success', '클리어 가능 상태로 변경했습니다.')
      setData(null)
      await load()
    } catch (err: unknown) {
      const e = err as { response?: { status?: number }; message?: string }
      if (e.response?.status === 400) onResult('error', '해당 유저의 가이드 정보가 없습니다.')
      else onResult('error', e.message || '상태 변경 실패')
    } finally {
      setClearableLoading(false)
    }
  }

  async function handleSetQuest(e: React.FormEvent) {
    e.preventDefault()
    const qid = Number(questInput)
    if (!qid || qid < 3001 || qid > 3069) { onResult('error', '퀘스트 ID는 3001~3069 사이여야 합니다'); return }
    if (!window.confirm(`유저 ${userId}의 가이드 퀘스트를 ${qid}로 이동하시겠습니까?\nallClear와 clearable이 false로 초기화됩니다.`)) return
    setQuestLoading(true)
    try {
      await setGuideQuest(Number(userId), qid)
      onResult('success', `가이드 퀘스트를 ${qid}로 이동했습니다.`)
      setQuestInput('')
      setData(null)
      await load()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string }; status?: number }; message?: string }
      if (e.response?.status === 400) onResult('error', e.response.data?.message || '유효하지 않은 퀘스트 ID 또는 유저 정보 없음')
      else onResult('error', e.message || '퀘스트 이동 실패')
    } finally {
      setQuestLoading(false)
    }
  }

  const card = (label: string, content: React.ReactNode) => (
    <div style={{ padding: '16px 20px', background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', textAlign: 'center' }}>
      <div className="form-label">{label}</div>
      {content}
    </div>
  )

  return (
    <>
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <div className="card-title" style={{ marginBottom: 0 }}>가이드 진행 {userId ? `— 유저 ${userId}` : ''}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {isAdmin && userId && data && !data.allClear && (
              <button className="btn btn-primary btn-sm" onClick={handleSetClearable} disabled={clearableLoading}>
                {clearableLoading ? <><span className="spinner" /> 처리 중...</> : '클리어 가능 설정'}
              </button>
            )}
            {userId && <button className="btn btn-ghost btn-sm" onClick={handleRefresh}>새로고침</button>}
          </div>
        </div>
        {!userId ? (
          <p className="text-muted">유저 제재 탭에서 유저를 검색하면 가이드 정보을(를) 조회합니다.</p>
        ) : data === null ? (
          <p className="text-muted">로딩 중...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {card('현재 퀘스트 ID',
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)' }}>{data.currentQuestId}</div>
            )}
            {card('클리어 가능',
              <span className={`badge ${data.clearable ? 'badge-green' : 'badge-yellow'}`} style={{ fontSize: 14 }}>
                {data.clearable ? '가능' : '불가'}
              </span>
            )}
            {card('전체 클리어',
              <span className={`badge ${data.allClear ? 'badge-green' : 'badge-blue'}`} style={{ fontSize: 14 }}>
                {data.allClear ? '완료' : '진행 중'}
              </span>
            )}
          </div>
        )}
      </div>

      {isAdmin && userId && (
        <div className="card">
          <div className="card-title">퀘스트 강제 이동 <span className="badge badge-red" style={{ fontSize: 11, verticalAlign: 'middle' }}>ADMIN</span></div>
          <form onSubmit={handleSetQuest}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">퀘스트 ID (3001~3069)</label>
                <input
                  className="form-input"
                  type="number"
                  min={3001}
                  max={3069}
                  value={questInput}
                  onChange={e => setQuestInput(e.target.value)}
                  placeholder="예: 3015"
                  style={{ maxWidth: 140 }}
                />
              </div>
              <button className="btn btn-primary" type="submit" disabled={questLoading}>
                {questLoading ? <><span className="spinner" /> 이동 중...</> : '퀘스트 이동'}
              </button>
            </div>
            <p className="text-muted mt-4" style={{ fontSize: 12 }}>
              실행 시 allClear와 clearable이 false로 초기화됩니다.
            </p>
          </form>
        </div>
      )}
    </>
  )
}
