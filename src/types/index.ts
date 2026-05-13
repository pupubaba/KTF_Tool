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
  id: number
  socialId: string
  userGameName?: string
  serverNum: number
}

export interface ApiResponse<T = unknown> {
  status: number
  errorCode: number
  message: string
  check: boolean
  response: T
}

export interface LoginRequest {
  socialId: string
  password: string
  socialProvider: string
  version: string
  serverNum: number
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

export interface UserActionRequest {
  userId: number
  type?: number
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
