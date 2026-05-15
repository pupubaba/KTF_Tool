export type ItemCategory =
  | 'Currency_'
  | 'Character_'
  | 'Equipment_'
  | 'EquipmentBox_'
  | 'ItemBox_'
  | 'Emblem'
  | 'Emblem_'

export interface ItemRow {
  id: string
  itemType: string
  itemId: string
  count: string
}

export const ITEM_CATEGORIES: { value: ItemCategory; label: string; needId: boolean }[] = [
  { value: 'Currency_',     label: '재화 (Currency_N)',         needId: true  },
  { value: 'Character_',    label: '영웅/캐릭터 (Character_N)', needId: true  },
  { value: 'Equipment_',    label: '장비 (Equipment_N)',         needId: true  },
  { value: 'EquipmentBox_', label: '장비 상자 (EquipmentBox_N)', needId: true  },
  { value: 'ItemBox_',      label: '아이템 상자 (ItemBox_N)',    needId: true  },
  { value: 'Emblem_',       label: '문장 등급 지정 (Emblem_N)',  needId: true  },
  { value: 'Emblem',        label: '문장 랜덤',                  needId: false },
]

export const CHARACTERS: { id: number; name: string }[] = [
  { id: 1,  name: '전우치' },
  { id: 2,  name: '해모수' },
  { id: 3,  name: '백화' },
  { id: 4,  name: '설화' },
  { id: 5,  name: '주아' },
  { id: 6,  name: '연이' },
  { id: 7,  name: '바리' },
  { id: 8,  name: '홍유아' },
  { id: 9,  name: '혜원' },
  { id: 10, name: '차차' },
  { id: 11, name: '적월' },
  { id: 12, name: '비연' },
  { id: 13, name: '소하' },
  { id: 14, name: '하설' },
  { id: 15, name: '태하' },
  { id: 16, name: '하연' },
  { id: 17, name: '단아' },
  { id: 18, name: '태랑' },
  { id: 19, name: '서율' },
  { id: 20, name: '하린' },
  { id: 21, name: '손서아' },
  { id: 22, name: '소향' },
  { id: 23, name: '라엘' },
  { id: 24, name: '연화' },
  { id: 25, name: '해령' },
  { id: 26, name: '현서' },
  { id: 27, name: '도하라' },
  { id: 28, name: '초령' },
  { id: 29, name: '유도연' },
  { id: 30, name: '소령' },
  { id: 31, name: '이설' },
  { id: 32, name: '연란' },
  { id: 33, name: '봉선' },
  { id: 34, name: '마현' },
  { id: 35, name: '태성' },
  { id: 36, name: '하얀' },
  { id: 37, name: '녹수' },
  { id: 38, name: '연희' },
  { id: 39, name: '현암' },
  { id: 40, name: '유연' },
]

export const CURRENCIES: { id: number; name: string; desc: string }[] = [
  { id: 1,   name: 'Gold',                                  desc: '골드' },
  { id: 2,   name: 'Wood',                                  desc: '나무' },
  { id: 3,   name: 'Ingot',                                 desc: '광석' },
  { id: 4,   name: 'Cash',                                  desc: '옥 (캐시)' },
  { id: 5,   name: 'Cash_Purchase',                         desc: '옥' },
  { id: 6,   name: 'MidCash',                               desc: '여우 구슬' },
  { id: 9,   name: 'Special_Ingot',                         desc: '특수 광석' },
  { id: 10,  name: 'Essence',                               desc: '장비 제단 강화 재료' },
  { id: 12,  name: 'AdmissionTicket_EquipmentDungeon',      desc: '장비 던전 입장권' },
  { id: 13,  name: 'AdmissionTicket_GoldDungeon',           desc: '골드 던전 입장권' },
  { id: 16,  name: 'Meat',                                  desc: '영혼석' },
  { id: 17,  name: 'GachaTicket_Normal',                    desc: '일반 가챠 뽑기권' },
  { id: 18,  name: 'GachaTicket_PickUp',                    desc: '픽업 가챠 뽑기권' },
  { id: 19,  name: 'GachaTicket_Celestial',                 desc: '신선 가챠 뽑기권' },
  { id: 20,  name: 'GachaSwapCurrency',                     desc: '가챠 치환 재화' },
  { id: 22,  name: 'GuildBossCoin',                         desc: '길드 보스 코인' },
  { id: 23,  name: 'AdmissionTicket_PVP',                   desc: 'PVP 입장권' },
  { id: 24,  name: 'StarPiece',                             desc: '별자리 운명점 재화' },
  { id: 25,  name: 'LimitBreakStone_1',                     desc: '영혼 조각 Lv1' },
  { id: 26,  name: 'LimitBreakStone_2',                     desc: '영혼 조각 Lv2' },
  { id: 27,  name: 'LimitBreakStone_3',                     desc: '영혼 조각 Lv3' },
  { id: 28,  name: 'EmblemFragment',                        desc: '엠블럼 조각' },
  { id: 29,  name: 'SlotOpenStone',                         desc: '공명 슬롯 확장 재화' },
  { id: 30,  name: 'HumanEssence',                          desc: '인간 제단 강화' },
  { id: 31,  name: 'CelestialEssence',                      desc: '천계 제단 강화' },
  { id: 32,  name: 'GuardianEssence',                       desc: '수인 제단 강화' },
  { id: 33,  name: 'CrusherEssence',                        desc: '요괴 제단 강화' },
  { id: 34,  name: 'BlueCrystal',                           desc: '신화 장비 업그레이드' },
  { id: 35,  name: 'IceSoulStone',                          desc: '얼어붙은 영혼석' },
  { id: 36,  name: 'FrostGlacial',                          desc: '빙하의 정수' },
  { id: 37,  name: 'FrostPiece',                            desc: '서리 조각' },
  { id: 106, name: 'Free_AdmissionTicket_EquipmentDungeon', desc: '무료 장비 던전 입장권' },
  { id: 107, name: 'Free_AdmissionTicket_GoldDungeon',      desc: '무료 골드 던전 입장권' },
  { id: 108, name: 'Free_AdmissionTicket_AwakeDungeon',     desc: '무료 별자리 던전 입장권' },
]

let _rowId = 0
export function newRow(): ItemRow {
  return { id: String(++_rowId), itemType: 'Currency_', itemId: '', count: '1' }
}

export function buildSendMailListFormat(rows: ItemRow[]): string {
  return rows
    .map(r => {
      const cat = ITEM_CATEGORIES.find(c => c.value === r.itemType)
      if (!cat) return ''
      const key = cat.needId ? `${r.itemType}${r.itemId}` : 'Emblem'
      return `${key}:${r.count || '1'}`
    })
    .filter(s => s && !s.startsWith(':'))
    .join(',')
}
