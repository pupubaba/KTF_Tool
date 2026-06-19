import { useEffect } from 'react'
import { getGatchaLogs } from '../../api/endpoints'
import type { GatchaLog } from '../../types'

interface Props {
  userId: string
  data: GatchaLog[] | null
  setData: React.Dispatch<React.SetStateAction<GatchaLog[] | null>>
  onResult: (type: 'success' | 'error', msg: string) => void
}

export default function GatchaTab({ userId, data, setData, onResult }: Props) {
  useEffect(() => {
    if (!userId || data !== null) return
    load()
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function load() {
    try {
      setData(await getGatchaLogs(Number(userId)))
    } catch (err: unknown) {
      const e = err as { message?: string }
      onResult('error', e.message || '가챠 로그 조회 실패')
    }
  }

  async function handleRefresh() {
    setData(null)
    await load()
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <div className="card-title" style={{ marginBottom: 0 }}>가챠 로그 {userId ? `— 유저 ${userId}` : ''}</div>
        {userId && <button className="btn btn-ghost btn-sm" onClick={handleRefresh}>새로고침</button>}
      </div>
      {!userId ? (
        <p className="text-muted">유저 제재 탭에서 유저를 검색하면 가챠 로그를 조회합니다.</p>
      ) : data === null ? (
        <p className="text-muted">로딩 중...</p>
      ) : data.length === 0 ? (
        <p className="text-muted">가챠 내역이 없습니다.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>로그 ID</th>
                <th>가챠 타입</th>
                <th style={{ width: 60 }}>광고</th>
                <th style={{ width: 60, textAlign: 'right' }}>순번</th>
                <th style={{ width: 80 }}>보상 타입</th>
                <th style={{ width: 80 }}>테이블 ID</th>
                <th style={{ width: 70, textAlign: 'right' }}>수량</th>
                <th>소환 일시</th>
              </tr>
            </thead>
            <tbody>
              {data.map(log => (
                <tr key={log.id}>
                  <td><code style={{ fontSize: 11 }}>{log.id}</code></td>
                  <td><span className="badge badge-blue">{log.gachaType}</span></td>
                  <td>{log.isAD ? <span className="badge badge-yellow">광고</span> : <span className="text-muted">-</span>}</td>
                  <td style={{ textAlign: 'right' }}>{log.pullIndex}</td>
                  <td>{log.rewardType}</td>
                  <td>{log.tableId}</td>
                  <td style={{ textAlign: 'right' }}>{log.count}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{log.createddate?.replace('T', ' ').slice(0, 19)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
