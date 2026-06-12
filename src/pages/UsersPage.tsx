import { useState } from 'react'
import ActionTab   from './users/ActionTab'
import CurrencyTab from './users/CurrencyTab'
import HeroTab     from './users/HeroTab'
import GuideTab    from './users/GuideTab'
import PurchaseTab from './users/PurchaseTab'
import ShopTab     from './users/ShopTab'
import MailboxTab  from './users/MailboxTab'
import type { CurrencyItem, HeroItem, GuideInfo, PurchaseItem, ShopPurchaseLog, MailItem, UserResponse } from '../types'

type TabType = 'action' | 'currency' | 'hero' | 'guide' | 'purchase' | 'shop' | 'mailbox'
interface ResultState { type: 'success' | 'error'; message: string }

const TABS: [TabType, string][] = [
  ['action',   '유저 제재'],
  ['currency', '재화'],
  ['hero',     '영웅'],
  ['guide',    '가이드'],
  ['purchase', 'IAP 결제'],
  ['shop',     '인게임 상점'],
  ['mailbox',  '우편함'],
]

export default function UsersPage() {
  const [userId, setUserId]   = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('action')
  const [result, setResult]   = useState<ResultState | null>(null)

  const [foundUser, setFoundUser] = useState<UserResponse | null | 'not_found'>('not_found')

  // 탭간 캐시 (null = 미로드, [] = 로드 완료)
  const [currencies, setCurrencies] = useState<CurrencyItem[] | null>(null)
  const [heroes, setHeroes]         = useState<HeroItem[] | null>(null)
  const [guide, setGuide]           = useState<GuideInfo | null>(null)
  const [purchases, setPurchases]   = useState<PurchaseItem[] | null>(null)
  const [shopLogs, setShopLogs]     = useState<ShopPurchaseLog[] | null>(null)
  const [mailBox, setMailBox]       = useState<MailItem[] | null>(null)

  function showResult(type: 'success' | 'error', message: string) {
    setResult({ type, message })
    setTimeout(() => setResult(null), 4000)
  }

  function handleUserFound(id: string) {
    setUserId(id)
    // 유저가 바뀌면 캐시 초기화
    setCurrencies(null); setHeroes(null); setGuide(null)
    setPurchases(null);  setShopLogs(null); setMailBox(null)
  }

  return (
    <>
      <div className="page-header">
        <h1>유저 관리</h1>
        <p>유저 조회, 제재 및 상세 정보</p>
      </div>
      <div className="page-body">
        {result && (
          <div className={`alert alert-${result.type === 'success' ? 'success' : 'error'}`}>
            {result.message}
          </div>
        )}

        <div className="tabs">
          {TABS.map(([key, label]) => (
            <button
              key={key}
              className={`tab-btn ${activeTab === key ? 'active' : ''}`}
              onClick={() => setActiveTab(key)}
            >{label}</button>
          ))}
        </div>

        {activeTab === 'action'   && <ActionTab   userId={userId} foundUser={foundUser} setFoundUser={setFoundUser} onUserFound={handleUserFound} onResult={showResult} />}
        {activeTab === 'currency' && <CurrencyTab userId={userId} data={currencies} setData={setCurrencies} onResult={showResult} />}
        {activeTab === 'hero'     && <HeroTab     userId={userId} data={heroes}     setData={setHeroes}     onResult={showResult} />}
        {activeTab === 'guide'    && <GuideTab    userId={userId} data={guide}      setData={setGuide}      onResult={showResult} />}
        {activeTab === 'purchase' && <PurchaseTab userId={userId} data={purchases}  setData={setPurchases}  onResult={showResult} />}
        {activeTab === 'shop'     && <ShopTab     userId={userId} data={shopLogs}   setData={setShopLogs}   onResult={showResult} />}
        {activeTab === 'mailbox'  && <MailboxTab  userId={userId} data={mailBox}    setData={setMailBox}    onResult={showResult} />}
      </div>
    </>
  )
}
