import { useState } from 'react'
import {
  ITEM_CATEGORIES,
  CURRENCIES,
  CHARACTERS,
  buildSendMailListFormat,
  newRow,
  type ItemRow,
  type ItemCategory,
} from '../data/gameData'

interface Props {
  rows: ItemRow[]
  onChange: (rows: ItemRow[]) => void
  rawInput: string
  onRawChange: (v: string) => void
}

export default function ItemBuilder({ rows, onChange, rawInput, onRawChange }: Props) {
  const [mode, setMode] = useState<'builder' | 'raw'>('builder')

  function updateRow(id: string, patch: Partial<ItemRow>) {
    onChange(rows.map(r => r.id === id ? { ...r, ...patch } : r))
  }

  function removeRow(id: string) {
    onChange(rows.filter(r => r.id !== id))
  }

  const preview = buildSendMailListFormat(rows)

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
              const isCurrency = row.itemType === 'Currency_'
              const isCharacter = row.itemType === 'Character_'
              return (
                <div
                  key={row.id}
                  style={{ display: 'grid', gridTemplateColumns: '160px 1fr 80px 36px', gap: 6, marginBottom: 6, alignItems: 'center' }}
                >
                  <select
                    className="form-select"
                    value={row.itemType}
                    onChange={e => updateRow(row.id, { itemType: e.target.value as ItemCategory, itemId: '' })}
                  >
                    {ITEM_CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>

                  {isCurrency ? (
                    <select
                      className="form-select"
                      value={row.itemId}
                      onChange={e => updateRow(row.id, { itemId: e.target.value })}
                    >
                      <option value="">-- 재화 선택 --</option>
                      {CURRENCIES.map(c => (
                        <option key={c.id} value={String(c.id)}>
                          {c.id} · {c.desc} ({c.name})
                        </option>
                      ))}
                    </select>
                  ) : isCharacter ? (
                    <select
                      className="form-select"
                      value={row.itemId}
                      onChange={e => updateRow(row.id, { itemId: e.target.value })}
                    >
                      <option value="">-- 캐릭터 선택 --</option>
                      {CHARACTERS.map(c => (
                        <option key={c.id} value={String(c.id)}>
                          {c.id} · {c.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="form-input"
                      type="number"
                      placeholder={cat?.needId ? 'ID' : '-'}
                      disabled={!cat?.needId}
                      value={row.itemId}
                      onChange={e => updateRow(row.id, { itemId: e.target.value })}
                      style={{ opacity: cat?.needId ? 1 : 0.4 }}
                    />
                  )}

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
              <div className="code-block">{preview || '-'}</div>
            </div>
          )}
        </>
      ) : (
        <div>
          <div className="form-label">
            gettingItem 직접 입력{' '}
            <span className="text-muted">(Type_Id:Count 콤마 구분, 예: Character_1:1,Currency_1:100)</span>
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
