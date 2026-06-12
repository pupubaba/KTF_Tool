import { useEffect, useMemo, useState } from 'react'
import { getUserCurrency } from '../../api/endpoints'
import type { CurrencyItem } from '../../types'

type SortKey = keyof CurrencyItem

interface Props {
  userId: string
  data: CurrencyItem[] | null
  setData: React.Dispatch<React.SetStateAction<CurrencyItem[] | null>>
  onResult: (type: 'success' | 'error', msg: string) => void
}

export default function CurrencyTab({ userId, data, setData, onResult }: Props) {
  const [sort, setSort] = useState<{ key: SortKey; asc: boolean }>({ key: 'currencyName', asc: true })

  useEffect(() => {
    if (!userId || data !== null) return
    load()
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function load() {
    try {
      const res = await getUserCurrency(Number(userId))
      setData(res.currency)
    } catch (err: unknown) {
      const e = err as { message?: string }
      onResult('error', e.message || '재화 조회 실패')
    }
  }

  async function handleRefresh() {
    setData(null)
    await load()
  }

  const sorted = useMemo(() => {
    if (!data) return []
    return [...data].sort((a, b) => {
      const av = a[sort.key], bv = b[sort.key]
      const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number)
      return sort.asc ? cmp : -cmp
    })
  }, [data, sort])

  function toggleSort(key: SortKey) {
    setSort(prev => prev.key === key ? { key, asc: !prev.asc } : { key, asc: true })
  }
  function sortIcon(active: boolean, asc: boolean) { return active ? (asc ? ' ▲' : ' ▼') : ' ·' }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <div className="card-title" style={{ marginBottom: 0 }}>재화 정보 {userId ? `— 유저 ${userId}` : ''}</div>
        {userId && <button className="btn btn-ghost btn-sm" onClick={handleRefresh}>새로고침</button>}
      </div>
      {!userId ? (
        <p className="text-muted">유저 제재 탭에서 유저를 검색하면 재화 정보을(를) 조회합니다.</p>
      ) : data === null ? (
        <p className="text-muted">로딩 중...</p>
      ) : data.length === 0 ? (
        <p className="text-muted">재화 데이터가 없습니다.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {([['currencyName','재화명'],['currentCount','보유량'],['dayLimit','일일 한도']] as [SortKey, string][]).map(([key, label]) => (
                  <th key={key} onClick={() => toggleSort(key)} style={{ cursor: 'pointer', userSelect: 'none' }}>
                    {label}{sortIcon(sort.key === key, sort.asc)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((c, i) => (
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
  )
}
