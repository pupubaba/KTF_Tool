import { useEffect } from 'react'
import { getUserMailBox } from '../../api/endpoints'
import type { MailItem } from '../../types'

interface ParsedItem { key: string; count: string }

function parseMailItems(gettingItem: string, gettingItemCount: string): ParsedItem[] {
  if (!gettingItem) return []
  const keys = gettingItem.split(',')
  const counts = gettingItemCount ? gettingItemCount.split(',') : []
  return keys.map((k, i) => ({ key: k.trim(), count: counts[i]?.trim() ?? '1' }))
}

function itemLabel(key: string): string {
  if (key.startsWith('Currency_'))     return `재화 #${key.replace('Currency_', '')}`
  if (key.startsWith('Character_'))    return `영웅 #${key.replace('Character_', '')}`
  if (key.startsWith('Equipment_'))    return `장비 #${key.replace('Equipment_', '')}`
  if (key.startsWith('EquipmentBox_')) return `장비상자 #${key.replace('EquipmentBox_', '')}`
  if (key.startsWith('ItemBox_'))      return `아이템상자 #${key.replace('ItemBox_', '')}`
  if (key === 'Emblem')                return '문장(랜덤)'
  if (key.startsWith('Emblem_'))       return `문장 등급${key.replace('Emblem_', '')}`
  return key
}

function itemBadgeClass(key: string): string {
  if (key.startsWith('Currency_'))                                     return 'badge-yellow'
  if (key.startsWith('Character_'))                                    return 'badge-blue'
  if (key.startsWith('Equipment_') || key.startsWith('EquipmentBox_')) return 'badge-green'
  if (key.startsWith('ItemBox_'))                                      return 'badge-blue'
  if (key.includes('Emblem'))                                          return 'badge-red'
  return 'badge-blue'
}

interface Props {
  userId: string
  data: MailItem[] | null
  setData: React.Dispatch<React.SetStateAction<MailItem[] | null>>
  onResult: (type: 'success' | 'error', msg: string) => void
}

export default function MailboxTab({ userId, data, setData, onResult }: Props) {
  useEffect(() => {
    if (!userId || data !== null) return
    load()
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function load() {
    try {
      const res = await getUserMailBox(Number(userId))
      setData(res.myMailBoxResponseDtoList ?? [])
    } catch (err: unknown) {
      const e = err as { message?: string }
      onResult('error', e.message || '우편함 조회 실패')
    }
  }

  async function handleRefresh() {
    setData(null)
    await load()
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <div className="card-title" style={{ marginBottom: 0 }}>{userId ? `유저 ${userId}의 우편함` : '우편함'}</div>
        {userId && <button className="btn btn-ghost btn-sm" onClick={handleRefresh}>새로고침</button>}
      </div>
      {!userId ? (
        <p className="text-muted">유저 제재 탭에서 유저를 검색하면 우편함을 조회합니다.</p>
      ) : data === null ? (
        <p className="text-muted">로딩 중...</p>
      ) : data.length === 0 ? (
        <p className="text-muted">우편함이 비어있습니다.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Mail ID</th><th>제목</th><th>수령</th><th>만료일</th><th>포함 아이템</th></tr></thead>
            <tbody>
              {data.map(mail => {
                const items = parseMailItems(mail.gettingItem, mail.gettingItemCount)
                return (
                  <tr key={mail.mailId}>
                    <td><code>{mail.mailId}</code></td>
                    <td>{mail.title}</td>
                    <td>
                      <span className={`badge ${mail.received ? 'badge-green' : 'badge-yellow'}`}>
                        {mail.received ? '수령완료' : '미수령'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{mail.expireDate?.split('T')[0]}</td>
                    <td>
                      {items.length === 0 ? (
                        <span className="text-muted" style={{ fontSize: 12 }}>없음</span>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {items.map((item, i) => (
                            <span key={i} className={`badge ${itemBadgeClass(item.key)}`} title={`${item.key}:${item.count}`}>
                              {itemLabel(item.key)} × {item.count}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
