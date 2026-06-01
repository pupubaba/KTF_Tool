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
  MailItem,
  MailSendRequest,
  MailListSendRequest,
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

export async function getUserPurchase(userId: number) {
  // form-urlencoded 바인딩 (@RequestBody 없음)
  const form = new URLSearchParams({ userId: String(userId) })
  const res = await authClient.post<{ purchase: PurchaseItem[] }>('/api/shop/purchaseLog', form)
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
