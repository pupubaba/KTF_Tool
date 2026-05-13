import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { ServerConfig, UserInfo } from '../types'

const SERVERS: ServerConfig[] = [
  { name: '로컬', url: 'http://localhost:8080' },
  { name: '운영', url: 'http://localhost:8080' },
]

interface AppContextType {
  server: ServerConfig
  servers: ServerConfig[]
  jwt: string | null
  userInfo: UserInfo | null
  setServer: (server: ServerConfig) => void
  setAuth: (jwt: string, userInfo: UserInfo) => void
  logout: () => void
  updateServerUrl: (index: number, url: string) => void
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [servers, setServers] = useState<ServerConfig[]>(SERVERS)
  const [serverIndex, setServerIndex] = useState(0)
  const [jwt, setJwt] = useState<string | null>(
    () => sessionStorage.getItem('ktf_jwt')
  )
  const [userInfo, setUserInfo] = useState<UserInfo | null>(() => {
    const stored = sessionStorage.getItem('ktf_user')
    return stored ? JSON.parse(stored) : null
  })

  const setServer = useCallback((server: ServerConfig) => {
    const idx = servers.findIndex(s => s.url === server.url && s.name === server.name)
    if (idx >= 0) setServerIndex(idx)
  }, [servers])

  const setAuth = useCallback((token: string, info: UserInfo) => {
    setJwt(token)
    setUserInfo(info)
    sessionStorage.setItem('ktf_jwt', token)
    sessionStorage.setItem('ktf_user', JSON.stringify(info))
  }, [])

  const logout = useCallback(() => {
    setJwt(null)
    setUserInfo(null)
    sessionStorage.removeItem('ktf_jwt')
    sessionStorage.removeItem('ktf_user')
  }, [])

  const updateServerUrl = useCallback((index: number, url: string) => {
    setServers(prev => prev.map((s, i) => i === index ? { ...s, url } : s))
  }, [])

  return (
    <AppContext.Provider value={{
      server: servers[serverIndex],
      servers,
      jwt,
      userInfo,
      setServer,
      setAuth,
      logout,
      updateServerUrl,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
