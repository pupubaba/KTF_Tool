import { useState, useEffect } from 'react'
import {
  getRankingChannels,
  getDamageDungeonRanking,
  getGuildRanking,
  getGuildBossGuilds,
  getGuildBossRanking,
} from '../api/endpoints'
import UserActionModal from '../components/UserActionModal'
import type {
  ChannelInfo,
  DamageDungeonRankItem,
  GuildRankItem,
  GuildInfo,
  GuildBossRankItem,
} from '../types'

interface ResultState { type: 'success' | 'error'; message: string }

type RankTab = 'damage' | 'guild' | 'guild-boss'

const TAB_LABELS: { key: RankTab; label: string }[] = [
  { key: 'damage', label: '데미지 던전' },
  { key: 'guild', label: '길드' },
  { key: 'guild-boss', label: '길드 보스' },
]

export default function RankingPage() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [result, setResult] = useState<ResultState | null>(null)
  const [channels, setChannels] = useState<ChannelInfo[]>([])
  const [selectedChannel, setSelectedChannel] = useState<number | null>(null)
  const [tab, setTab] = useState<RankTab>('damage')

  const [guilds, setGuilds] = useState<GuildInfo[]>([])
  const [selectedGuild, setSelectedGuild] = useState<number | null>(null)

  const [damageRanking, setDamageRanking] = useState<DamageDungeonRankItem[]>([])
  const [guildRanking, setGuildRanking] = useState<GuildRankItem[]>([])
  const [guildBossRanking, setGuildBossRanking] = useState<GuildBossRankItem[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getRankingChannels()
      .then(data => {
        setChannels(data)
        if (data.length > 0) setSelectedChannel(data[0].channelId)
      })
      .catch(e => setError(e.message || '채널 목록 조회 실패'))
  }, [])

  useEffect(() => {
    if (selectedChannel == null) return
    if (tab === 'guild-boss') {
      loadGuildList(selectedChannel)
    } else {
      loadRanking(tab, selectedChannel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, selectedChannel])

  async function loadGuildList(channel: number) {
    setLoading(true)
    setError(null)
    setGuilds([])
    setSelectedGuild(null)
    setGuildBossRanking([])
    try {
      const data = await getGuildBossGuilds(channel)
      setGuilds(data)
      if (data.length > 0) {
        setSelectedGuild(data[0].guildId)
        await loadGuildBossRanking(data[0].guildId)
      }
    } catch (e: unknown) {
      const err = e as { message?: string }
      setError(err.message || '길드 목록 조회 실패')
    } finally {
      setLoading(false)
    }
  }

  async function loadGuildBossRanking(guildId: number) {
    setLoading(true)
    setError(null)
    try {
      setGuildBossRanking(await getGuildBossRanking(guildId))
    } catch (e: unknown) {
      const err = e as { message?: string }
      setError(err.message || '길드 보스 랭킹 조회 실패')
    } finally {
      setLoading(false)
    }
  }

  async function loadRanking(rankTab: RankTab, channel: number) {
    setLoading(true)
    setError(null)
    try {
      if (rankTab === 'damage') {
        setDamageRanking(await getDamageDungeonRanking(channel))
      } else if (rankTab === 'guild') {
        setGuildRanking(await getGuildRanking(channel))
      }
    } catch (e: unknown) {
      const err = e as { message?: string }
      setError(err.message || '랭킹 조회 실패')
    } finally {
      setLoading(false)
    }
  }

  function handleGuildSelect(guildId: number) {
    setSelectedGuild(guildId)
    loadGuildBossRanking(guildId)
  }

  function showResult(type: 'success' | 'error', message: string) {
    setResult({ type, message })
    setTimeout(() => setResult(null), 4000)
  }

  return (
    <>
      <div className="page-header">
        <h1>실시간 랭킹</h1>
        <p>채널별 데미지 던전 · 길드 · 길드 보스 상위 100위</p>
      </div>
      <div className="page-body">
        {error && <div className="alert alert-error">{error}</div>}
        {result && (
          <div className={`alert alert-${result.type === 'success' ? 'success' : 'error'}`}>
            {result.message}
          </div>
        )}

        {/* 채널 선택 */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="flex items-center" style={{ gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>채널 선택</span>
            {channels.length === 0 ? (
              <span className="text-muted" style={{ fontSize: 13 }}>로딩 중...</span>
            ) : (
              channels.map(ch => (
                <button
                  key={ch.channelId}
                  className={`btn btn-sm ${selectedChannel === ch.channelId ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setSelectedChannel(ch.channelId)}
                >
                  {ch.channelName}
                  <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.75 }}>
                    {ch.currentNum}/{ch.maxNum}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* 탭 */}
        <div className="tabs" style={{ marginBottom: 16 }}>
          {TAB_LABELS.map(t => (
            <button
              key={t.key}
              className={`tab-btn ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 길드 보스: 길드 선택 */}
        {tab === 'guild-boss' && guilds.length > 0 && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="flex items-center" style={{ gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>길드 선택</span>
              {guilds.map(g => (
                <button
                  key={g.guildId}
                  className={`btn btn-sm ${selectedGuild === g.guildId ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => handleGuildSelect(g.guildId)}
                >
                  {g.guildName}
                  <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.75 }}>Lv.{g.level} ({g.joinNum}명)</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 테이블 */}
        <div className="card">
          {loading ? (
            <p className="text-muted">로딩 중...</p>
          ) : (
            <>
              {tab === 'damage' && (
                <DamageDungeonTable rows={damageRanking} onUserClick={setSelectedUserId} />
              )}
              {tab === 'guild' && (
                <GuildTable rows={guildRanking} />
              )}
              {tab === 'guild-boss' && (
                <GuildBossTable rows={guildBossRanking} onUserClick={setSelectedUserId} />
              )}
            </>
          )}
        </div>
      </div>

      {selectedUserId != null && (
        <UserActionModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onResult={showResult}
        />
      )}
    </>
  )
}

function DamageDungeonTable({ rows, onUserClick }: { rows: DamageDungeonRankItem[]; onUserClick: (userId: number) => void }) {
  if (rows.length === 0) return <p className="text-muted">데이터가 없습니다.</p>
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th style={{ width: 60 }}>순위</th>
            <th>닉네임</th>
            <th style={{ width: 70 }}>레벨</th>
            <th style={{ width: 120, textAlign: 'right' }}>점수</th>
            <th style={{ width: 80 }}>유저 ID</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.userId} onClick={() => onUserClick(r.userId)} style={{ cursor: 'pointer' }}>
              <td><RankBadge rank={r.ranking} /></td>
              <td>{r.userGameName}</td>
              <td>{r.level}</td>
              <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                {r.point.toLocaleString()}
              </td>
              <td><code style={{ fontSize: 11 }}>{r.userId}</code></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function GuildTable({ rows }: { rows: GuildRankItem[] }) {
  if (rows.length === 0) return <p className="text-muted">데이터가 없습니다.</p>
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th style={{ width: 60 }}>순위</th>
            <th>길드명</th>
            <th>마스터</th>
            <th style={{ width: 70 }}>Lv</th>
            <th style={{ width: 70 }}>멤버</th>
            <th style={{ width: 120, textAlign: 'right' }}>점수</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.guildId}>
              <td><RankBadge rank={r.ranking} /></td>
              <td>{r.guildName}</td>
              <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{r.leaderName}</td>
              <td>{r.level}</td>
              <td>{r.joinNum}</td>
              <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                {r.point.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function GuildBossTable({ rows, onUserClick }: { rows: GuildBossRankItem[]; onUserClick: (userId: number) => void }) {
  if (rows.length === 0) return <p className="text-muted">길드를 선택하거나 데이터가 없습니다.</p>
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th style={{ width: 60 }}>순위</th>
            <th>닉네임</th>
            <th style={{ width: 70 }}>레벨</th>
            <th style={{ width: 140, textAlign: 'right' }}>누적 데미지</th>
            <th style={{ width: 80 }}>유저 ID</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.userId} onClick={() => onUserClick(r.userId)} style={{ cursor: 'pointer' }}>
              <td><RankBadge rank={r.ranking} /></td>
              <td>{r.userGameName}</td>
              <td>{r.level}</td>
              <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                {r.point.toLocaleString()}
              </td>
              <td><code style={{ fontSize: 11 }}>{r.userId}</code></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RankBadge({ rank }: { rank: number }) {
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null
  if (medal) return <span style={{ fontSize: 16 }}>{medal}</span>
  return <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{rank}</span>
}
