import { useEffect } from 'react'
import { getUserPurchase } from '../../api/endpoints'
import type { PurchaseItem } from '../../types'

interface Props {
  userId: string
  data: PurchaseItem[] | null
  setData: React.Dispatch<React.SetStateAction<PurchaseItem[] | null>>
  onResult: (type: 'success' | 'error', msg: string) => void
}

export default function PurchaseTab({ userId, data, setData, onResult }: Props) {
  useEffect(() => {
    if (!userId || data !== null) return
    load()
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function load() {
    try {
      const res = await getUserPurchase(Number(userId))
      setData(res.purchase)
    } catch (err: unknown) {
      const e = err as { message?: string }
      onResult('error', e.message || 'IAP 구매 내역 조회 실패')
    }
  }

  async function handleRefresh() {
    setData(null)
    await load()
  }

  const platformBadge = (platform: string) =>
    platform === 'Apple' ? 'badge-blue' : platform === 'Google' ? 'badge-green' : 'badge-yellow'

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <div className="card-title" style={{ marginBottom: 0 }}>IAP 결제 내역 {userId ? `— 유저 ${userId}` : ''}</div>
        {userId && <button className="btn btn-ghost btn-sm" onClick={handleRefresh}>새로고침</button>}
      </div>
      {!userId ? (
        <p className="text-muted">유저 제재 탭에서 유저를 검색하면 구매 내역을 조회합니다.</p>
      ) : data === null ? (
        <p className="text-muted">로딩 중...</p>
      ) : data.length === 0 ? (
        <p className="text-muted">구매 내역이 없습니다.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead><tr><th>상품 ID</th><th>플랫폼</th><th>구매일시</th></tr></thead>
            <tbody>
              {data.map((p, i) => (
                <tr key={i}>
                  <td><code style={{ fontSize: 12 }}>{p.productId}</code></td>
                  <td><span className={`badge ${platformBadge(p.platform)}`}>{p.platform}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.date?.replace('T', ' ').slice(0, 19)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
