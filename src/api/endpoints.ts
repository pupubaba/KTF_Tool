import { publicClient, authClient } from './client'
import type {
  ApiResponse,
  LoginRequest,
  MailSendRequest,
  MailListSendRequest,
  UserActionRequest,
} from '../types'

export async function login(data: LoginRequest) {
  const res = await publicClient.post<ApiResponse>('/auth/Login', data)
  return res.data
}

export async function getServerStatus() {
  const res = await authClient.get<{ response: Record<string, unknown> }>('/api/Test/status')
  return res.data
}

export async function getUserMailBox(userId: number) {
  const res = await authClient.post<ApiResponse>('/api/Test/Mail/GetMyMailBox', { userId })
  return res.data
}

export async function sendMail(data: MailSendRequest) {
  const res = await authClient.post<ApiResponse>('/api/Test/Mail/SendMail', data)
  return res.data
}

export async function sendMailList(data: MailListSendRequest) {
  const res = await authClient.post<ApiResponse>('/api/Test/Mail/SendMailList', data)
  return res.data
}

export async function blackUser(data: UserActionRequest) {
  const res = await authClient.post<ApiResponse>('/api/Test/User/BlackUser', data)
  return res.data
}

export async function stopUser(data: UserActionRequest) {
  const res = await authClient.post<ApiResponse>('/api/Test/User/StopUser', data)
  return res.data
}

export async function whiteUser(data: UserActionRequest) {
  const res = await authClient.post<ApiResponse>('/api/Test/User/WhiteUser', data)
  return res.data
}

export async function normalUser(data: UserActionRequest) {
  const res = await authClient.post<ApiResponse>('/api/Test/User/NormalUser', data)
  return res.data
}

export async function getBlackList() {
  const res = await authClient.get<ApiResponse>('/api/Test/User/BlackList')
  return res.data
}

export async function findUserByGameName(userGameName: string) {
  const res = await authClient.get<ApiResponse>(`/api/Test/Tool/FindByUserGameName/${encodeURIComponent(userGameName)}`)
  return res.data
}
