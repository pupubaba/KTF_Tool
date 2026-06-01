export interface ServerConfig {
  name: string
  url: string
}

export interface AppState {
  server: ServerConfig
  jwt: string | null
  userInfo: UserInfo | null
}

export interface UserInfo {
  socialId: string
  roles: string[]
}

// ── Auth ──────────────────────────────────────────────────
export interface LoginRequest {
  socialId: string
  password: string
}

export interface LoginResponse {
  token: string
}

// ── User ──────────────────────────────────────────────────
export interface UserResponse {
  id: number
  socialId: string
  userGameName: string
  level: number
  exp: number
  serverNum: number
  userType: number
  mileage: number
  attendanceCount: number
  totalPurchase: number
  createdDate: string
  lastloginDate: string | null
  previousLoginDate: string | null
}

export type UserTypeValue = 'normal' | 'white' | 'black' | 'stop'

// ── Admin Accounts ────────────────────────────────────────
export interface AdminAccount {
  id: number
  socialId: string
  roles: string[]
  createdDate: string
}

export interface CreateAdminRequest {
  socialId: string
  password: string
  role: string
}

// ── User Detail ───────────────────────────────────────────
export interface CurrencyItem {
  currencyName: string
  currentCount: number
  dayLimit: number
}

export interface HeroItem {
  heroName: string
  currentCount: number
  awakenStep: string
  level: number
  activeSkillLevel: number
}

export interface GuideInfo {
  currentQuestId: number
  isClearable: boolean
  allClear: boolean
}

export interface PurchaseItem {
  productId: string
  platform: string
  date: string
}

// ── Mail (old endpoints — kept as-is) ────────────────────
export interface ApiResponse<T = unknown> {
  status: number
  errorCode: number
  message: string
  check: boolean
  response: T
}

export interface MailSendRequest {
  title: string
  toId: number
  gettingItem: string
  gettingItemCount: string
  mailType: number
  sendDate: string
  expireDate: string
  mailTemplateIndex: number
}

export interface MailListSendRequest {
  userId: number
  plusDay: number
  title: string
  gettingItem: string
  mailTemplateIndex: number
}

export interface MailItem {
  mailId: number
  title: string
  gettingItem: string
  gettingItemCount: string
  expireDate: string
  mailType: number
  received: boolean
}
