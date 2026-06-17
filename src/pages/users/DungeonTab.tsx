import { useEffect, useState } from 'react'
import { getDungeonInfo, patchDungeonInfo } from '../../api/endpoints'
import { useApp } from '../../contexts/AppContext'
import type { DungeonInfo } from '../../types'

const DUNGEON_TYPES = [
  { value: 'all',           label: '전체 던전' },
  { value: 'celestial',     label: '천상 던전' },
  { value: 'human',         label: '인간 던전' },
  { value: 'guardian',      label: '수호 던전' },
  { value: 'crusher',       label: '분쇄 던전' },
  { value: 'equipment',     label: '장비 던전' },
  { value: 'gold',          label: '골드 던전' },
  { value: 'damage',        label: '데미지 던전 (데미지)' },
  { value: 'constellation', label: '별자리 던전' },
  { value: 'damageStep',    label: '데미지 던전 (스탭)' },
]

const DUNGEON_ROWS: { key: keyof DungeonInfo; label: string }[] = [
  { key: 'allDungeonStage',           label: '전체 던전' },
  { key: 'celestialDungeonStage',     label: '천상 던전' },
  { key: 'humanDungeonStage',         label: '인간 던전' },
  { key: 'guardianDungeonStage',      label: '수호 던전' },
  { key: 'crusherDungeonStage',       label: '분쇄 던전' },
  { key: 'equipmentDungeonStage',     label: '장비 던전' },
  { key: 'goldDungeonStage',          label: '골드 던전' },
  { key: 'damageDungeonStage',        label: '데미지 던전 (데미지)' },
  { key: 'constellationDungeonStage', label: '별자리 던전' },
  { key: 'damageDungeonStep',         label: '데미지 던전 (스탭)' },
]

interface Props {
  userId: string
  data: DungeonInfo | null
  setData: React.Dispatch<React.SetStateAction<DungeonInfo | null>>
  onResult: (type: 'success' | 'error', msg: string) => void
}

export default function DungeonTab({ userId, data, setData, onResult }: Props) {
  const { userInfo } = useApp()
  const isAdmin = userInfo?.roles.includes('ROLE_ADMIN') ?? false

  const [dungeonType, setDungeonType] = useState('all')
  const [valueInput, setValueInput]   = useState('')
  const [patchLoading, setPatchLoading] = useState(false)

  useEffect(() => {
    if (!userId || data !== null) return
    load()
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function load() {
    try {
      const res = await getDungeonInfo(Number(userId))
      setData(res)
    } catch (err: unknown) {
      const e = err as { response?: { status?: number }; message?: string }
      if (e.response?.status === 404) setData({} as DungeonInfo)
      else onResult('error', e.message || '던전 기록 조회 실패')
    }
  }

  async function handleRefresh() {
    setData(null)
    await load()
  }

  async function handlePatch(e: React.FormEvent) {
    e.preventDefault()
    const val = Number(valueInput)
    if (valueInput === '' || isNaN(val)) { onResult('error', '값을 입력하세요'); return }
    const label = DUNGEON_TYPES.find(t => t.value === dungeonType)?.label ?? dungeonType
    if (!window.confirm(`유저 ${userId}의 [${label}] 값을 ${val}로 수정하시겠습니까?`)) return
    setPatchLoading(true)
    try {
      await patchDungeonInfo(Number(userId), dungeonType, val)
      onResult('success', `[${label}] → ${val} 수정 완료`)
      setValueInput('')
      setData(null)
      await load()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string }; status?: number }; message?: string }
      if (e.response?.status === 400) onResult('error', e.response.data?.message || '유효하지 않은 요청')
      else onResult('error', e.message || '던전 기록 수정 실패')
    } finally {
      setPatchLoading(false)
    }
  }

  return (
    <>
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <div className="card-title" style={{ marginBottom: 0 }}>던전 기록 {userId ? `— 유저 ${userId}` : ''}</div>
          {userId && <button className="btn btn-ghost btn-sm" onClick={handleRefresh}>새로고침</button>}
        </div>
        {!userId ? (
          <p className="text-muted">유저 제재 탭에서 유저를 검색하면 던전 기록을 조회합니다.</p>
        ) : data === null ? (
          <p className="text-muted">로딩 중...</p>
        ) : !data.allDungeonStage && data.allDungeonStage !== 0 ? (
          <p className="text-muted">던전 기록이 없습니다.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '6px 10px', color: 'var(--text-muted)', fontWeight: 500 }}>던전</th>
                <th style={{ textAlign: 'right', padding: '6px 10px', color: 'var(--text-muted)', fontWeight: 500 }}>기록</th>
              </tr>
            </thead>
            <tbody>
              {DUNGEON_ROWS.map(({ key, label }) => (
                <tr key={key} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 10px' }}>{label}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>{(data[key] ?? 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isAdmin && userId && (
        <div className="card">
          <div className="card-title">던전 기록 수정 <span className="badge badge-red" style={{ fontSize: 11, verticalAlign: 'middle' }}>ADMIN</span></div>
          <form onSubmit={handlePatch}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">던전 타입</label>
                <select
                  className="form-select"
                  value={dungeonType}
                  onChange={e => setDungeonType(e.target.value)}
                  style={{ width: 200 }}
                >
                  {DUNGEON_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">설정할 값</label>
                <input
                  className="form-input"
                  type="number"
                  value={valueInput}
                  onChange={e => setValueInput(e.target.value)}
                  placeholder="예: 30"
                  style={{ maxWidth: 120 }}
                />
              </div>
              <button className="btn btn-primary" type="submit" disabled={patchLoading}>
                {patchLoading ? <><span className="spinner" /> 수정 중...</> : '기록 수정'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
