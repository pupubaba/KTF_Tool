import { useEffect } from 'react'
import { getShopPurchaseLogs } from '../../api/endpoints'
import type { ShopPurchaseLog } from '../../types'

interface Props {
  userId: string
  data: ShopPurchaseLog[] | null
  setData: React.Dispatch<React.SetStateAction<ShopPurchaseLog[] | null>>
  onResult: (type: 'success' | 'error', msg: string) => void
}

export default function ShopTab({ userId, data, setData, onResult }: Props) {
  useEffect(() => {
    if (!userId || data !== null) return
    load()
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function load() {
    try {
      setData(await getShopPurchaseLogs(Number(userId)))
    } catch (err: unknown) {
      const e = err as { message?: string }
      onResult('error', e.message || '인게임 상점 로그 조회 실패')
    }
  }

  async function handleRefresh() {
    setData(null)
    await load()
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <div className="card-title" style={{ marginBottom: 0 }}>인게임 상점 구매 로그 {userId ? `— 유저 ${userId}` : ''}</div>
        {userId && <button className="btn btn-ghost btn-sm" onClick={handleRefresh}>새로고침</button>}
      </div>
      {!userId ? (
        <p className="text-muted">유저 제재 탭에서 유저를 검색하면 상점 구매 로그를 조회합니다.</p>
      ) : data === null ? (
        <p className="text-muted">로딩 중...</p>
      ) : data.length === 0 ? (
        <p className="text-muted">상점 구매 내역이 없습니다.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>로그 ID</th>
                <th>상점 타입</th>
                <th style={{ width: 80 }}>상품 ID</th>
                <th style={{ width: 70, textAlign: 'right' }}>수량</th>
                <th style={{ width: 100, textAlign: 'right' }}>지출</th>
                <th style={{ width: 80 }}>재화 ID</th>
                <th>구매 일시</th>
              </tr>
            </thead>
            <tbody>
              {data.map(log => (
                <tr key={log.id}>
                  <td><code style={{ fontSize: 11 }}>{log.id}</code></td>
                  <td><span className="badge badge-blue">{log.shopType}</span></td>
                  <td>{log.goodsId}</td>
                  <td style={{ textAlign: 'right' }}>{log.count}</td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{log.spendAmount.toLocaleString()}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{log.currencyId}</td>
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
