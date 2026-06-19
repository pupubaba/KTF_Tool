import { useEffect, useState } from 'react'
import { getPayingUsers } from '../api/endpoints'
import type { PayingUserResponse } from '../types'

interface Props {
  date: string
  onClose: () => void
  onUserClick: (userId: number) => void
}

export default function PayingUsersModal({ date, onClose, onUserClick }: Props) {
  const [users, setUsers] = useState<PayingUserResponse[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getPayingUsers(date)
      .then(setUsers)
      .catch((err: unknown) => {
        const e = err as { message?: string }
        setError(e.message || '결제 유저 조회 실패')
      })
  }, [date])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <div className="card-title" style={{ marginBottom: 0 }}>결제 유저 — {date}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>닫기</button>
        </div>

        {error ? (
          <div className="alert alert-error">{error}</div>
        ) : users === null ? (
          <p className="text-muted">로딩 중...</p>
        ) : users.length === 0 ? (
          <p className="text-muted">해당 날짜에 결제한 유저가 없습니다.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 80 }}>유저 ID</th>
                  <th>닉네임</th>
                  <th style={{ width: 100, textAlign: 'right' }}>결제액</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} onClick={() => onUserClick(u.id)} style={{ cursor: 'pointer' }}>
                    <td><code style={{ fontSize: 11 }}>{u.id}</code></td>
                    <td>{u.userGameName}</td>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>₩{u.totalAmount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
