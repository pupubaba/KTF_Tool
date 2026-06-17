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
  clearable: boolean
  allClear: boolean
}

export interface PurchaseItem {
  productId: string
  platform: string
  date: string
}

export interface ShopPurchaseLog {
  id: number
  useridUser: number
  shopType: string
  goodsId: number
  count: number
  currencyId: number
  spendAmount: number
  createddate: string
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

// ── Ranking ───────────────────────────────────────────────
export interface ChannelInfo {
  channelId: number
  channelName: string
  currentNum: number
  maxNum: number
}

export interface DamageDungeonRankItem {
  ranking: number
  userId: number
  userGameName: string
  level: number
  point: number
  thumbnail: number
}

export interface GuildRankItem {
  ranking: number
  guildId: number
  guildName: string
  leaderName: string
  level: number
  joinNum: number
  point: number
  guildColor: number
  guildPattern: number
}

export interface GuildInfo {
  guildId: number
  guildName: string
  level: number
  joinNum: number
}

export interface GuildBossRankItem {
  ranking: number
  userId: number
  userGameName: string
  level: number
  point: number
  thumbnail: number
}

// ── Dungeon ───────────────────────────────────────────────
export interface DungeonInfo {
  allDungeonStage: number
  celestialDungeonStage: number
  humanDungeonStage: number
  guardianDungeonStage: number
  crusherDungeonStage: number
  equipmentDungeonStage: number
  goldDungeonStage: number
  damageDungeonStage: number
  constellationDungeonStage: number
  damageDungeonStep: number
}

// ── Server Status ─────────────────────────────────────────
export interface ServerStatusResponse {
  serverStatus: string
}

export type ServerStatusValue = 'normal' | 'check'

// ── Metrics ───────────────────────────────────────────────
export interface DailyMetrics {
  date: string
  dau: number
  mau: number
  newUserCount: number
  totalRevenue: number
  purchaseCount: number
  payingUserCount: number
  arpu: number
  arppu: number
}

export interface DailyRetentionMetrics {
  cohortDate: string
  cohortSize: number
  d1Count: number;  d1Rate: number
  d3Count: number;  d3Rate: number
  d5Count: number;  d5Rate: number
  d7Count: number;  d7Rate: number
  d14Count: number; d14Rate: number
  d21Count: number; d21Rate: number
  d30Count: number; d30Rate: number
}
