import { publicClient, authClient } from './client'
import type {
  LoginRequest,
  LoginResponse,
  UserResponse,
  UserTypeValue,
  AdminAccount,
  CreateAdminRequest,
  CurrencyItem,
  HeroItem,
  GuideInfo,
  PurchaseItem,
  ShopPurchaseLog,
  MailItem,
  MailSendRequest,
  MailListSendRequest,
  ChannelInfo,
  DamageDungeonRankItem,
  GuildRankItem,
  GuildInfo,
  GuildBossRankItem,
  DailyMetrics,
} from '../types'

// ── Auth ──────────────────────────────────────────────────
export async function login(data: LoginRequest) {
  const res = await publicClient.post<LoginResponse>('/api/auth/login', data)
  return res.data
}

// ── User ──────────────────────────────────────────────────
export async function searchUser(params: { gameName?: string; socialId?: string; id?: number }) {
  const res = await authClient.get<UserResponse>('/api/users', { params })
  return res.data
}

export async function getUserById(id: number) {
  const res = await authClient.get<UserResponse>(`/api/users/${id}`)
  return res.data
}

export async function changeUserType(id: number, type: UserTypeValue) {
  const res = await authClient.post<{ message: string }>(`/api/users/${id}/type`, { type })
  return res.data
}

export async function changeUserLevel(id: number, level: number) {
  const res = await authClient.post<{ message: string }>(`/api/users/${id}/level`, { level })
  return res.data
}

// ── Admin Accounts ────────────────────────────────────────
export async function getAdminAccounts() {
  const res = await authClient.get<AdminAccount[]>('/api/admin/accounts')
  return res.data
}

export async function createAdminAccount(data: CreateAdminRequest) {
  const res = await authClient.post<AdminAccount>('/api/admin/accounts', data)
  return res.data
}

export async function deleteAdminAccount(id: number) {
  await authClient.delete(`/api/admin/accounts/${id}`)
}

// ── User Detail ───────────────────────────────────────────
export async function getUserCurrency(userId: number) {
  const res = await authClient.post<{ currency: CurrencyItem[] }>('/api/currency/myCurrency', { userId })
  return res.data
}

export async function getUserHeroes(userId: number) {
  // form-urlencoded 바인딩 (@RequestBody 없음)
  const form = new URLSearchParams({ userId: String(userId) })
  const res = await authClient.post<{ heroes: HeroItem[] }>('/api/hero/myHero', form)
  return res.data
}

export async function getUserGuide(userId: number) {
  const res = await authClient.post<{ guideInfo: GuideInfo }>('/api/Guide/myGuideInfo', { userId })
  return res.data
}

export async function setGuideClearable(userId: number) {
  await authClient.post('/api/Guide/setClearable', { userId })
}

export async function getUserPurchase(userId: number) {
  // form-urlencoded 바인딩 (@RequestBody 없음)
  const form = new URLSearchParams({ userId: String(userId) })
  const res = await authClient.post<{ purchase: PurchaseItem[] }>('/api/shop/purchaseLog', form)
  return res.data
}

export async function getShopPurchaseLogs(userId: number) {
  const res = await authClient.get<ShopPurchaseLog[]>(`/api/shop/purchase-logs/${userId}`)
  return res.data
}

// ── Mail ──────────────────────────────────────────────────
export async function getUserMailBox(userId: number) {
  const res = await authClient.post<{ myMailBoxResponseDtoList: MailItem[] }>('/api/mail/getMailBox', { userId })
  return res.data
}

export async function sendMail(data: MailSendRequest) {
  const res = await authClient.post<{ mail: Record<string, unknown> }>('/api/mail/send', data)
  return res.data
}

export async function sendMailList(data: MailListSendRequest) {
  const res = await authClient.post<{ mail: Record<string, unknown> }>('/api/mail/send-list', data)
  return res.data
}

// ── Ranking ───────────────────────────────────────────────
export async function getRankingChannels() {
  const res = await authClient.get<ChannelInfo[]>('/api/ranking/channels')
  return res.data
}

export async function getDamageDungeonRanking(channel: number) {
  const res = await authClient.get<DamageDungeonRankItem[]>('/api/ranking/damage-dungeon', { params: { channel } })
  return res.data
}

export async function getGuildRanking(channel: number) {
  const res = await authClient.get<GuildRankItem[]>('/api/ranking/guild', { params: { channel } })
  return res.data
}

export async function getGuildBossGuilds(channel: number) {
  const res = await authClient.get<GuildInfo[]>('/api/ranking/guild-boss/guilds', { params: { channel } })
  return res.data
}

export async function getGuildBossRanking(guildId: number) {
  const res = await authClient.get<GuildBossRankItem[]>('/api/ranking/guild-boss', { params: { guildId } })
  return res.data
}

// ── Metrics ───────────────────────────────────────────────
export async function getDailyMetrics(from: string, to: string) {
  const res = await authClient.get<DailyMetrics[]>('/api/metrics/daily', { params: { from, to } })
  return res.data
}
