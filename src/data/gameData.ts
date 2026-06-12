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
  { id: 1,   name: '골드 (캐릭터 관리 UI, 메인화면)',  desc: 'Gold'                                  },
  { id: 2,   name: '나무 (건설, 장비 강화 재료로 스왑)', desc: 'Wood'                                 },
  { id: 3,   name: '광석 (훈련소 기초 훈련)',           desc: 'Ingot'                                 },
  { id: 4,   name: '옥 (캐시)',                         desc: 'Cash'                                  },
  { id: 5,   name: '옥',                               desc: 'Cash_Purchase'                         },
  { id: 6,   name: '여우 구슬',                         desc: 'MidCash'                               },
  { id: 9,   name: '특수 광석 (강화 훈련)',              desc: 'Special_Ingot'                         },
  { id: 10,  name: '장비 제단 강화 재료',               desc: 'Essence'                               },
  { id: 12,  name: '장비 던전 입장권',                  desc: 'AdmissionTicket_EquipmentDungeon'      },
  { id: 13,  name: '골드 던전 입장권',                  desc: 'AdmissionTicket_GoldDungeon'           },
  { id: 14,  name: '봉인의 열쇠',                       desc: 'DungeonKey'                            },
  { id: 16,  name: '영혼석',                            desc: 'Meat'                                  },
  { id: 17,  name: '일반 가챠 뽑기권',                  desc: 'GachaTicket_Normal'                    },
  { id: 18,  name: '픽업 가챠 뽑기권',                  desc: 'GachaTicket_PickUp'                    },
  { id: 19,  name: '신선 가챠 뽑기권',                  desc: 'GachaTicket_Celestial'                 },
  { id: 20,  name: '가챠 치환 재화',                    desc: 'GachaSwapCurrency'                     },
  { id: 22,  name: '길드 보스 코인',                    desc: 'GuildBossCoin'                         },
  { id: 23,  name: 'PVP 입장권',                        desc: 'AdmissionTicket_PVP'                   },
  { id: 24,  name: '별자리 운명점 재화',                 desc: 'StarPiece'                             },
  { id: 25,  name: '영혼 조각 Lv1',                     desc: 'LimitBreakStone_1'                     },
  { id: 26,  name: '영혼 조각 Lv2',                     desc: 'LimitBreakStone_2'                     },
  { id: 27,  name: '영혼 조각 Lv3',                     desc: 'LimitBreakStone_3'                     },
  { id: 28,  name: '엠블럼 조각',                       desc: 'EmblemFragment'                        },
  { id: 29,  name: '공명 슬롯 확장 재화',               desc: 'SlotOpenStone'                         },
  { id: 30,  name: '인간 제단 강화',                    desc: 'HumanEssence'                          },
  { id: 31,  name: '천계 제단 강화',                    desc: 'CelestialEssence'                      },
  { id: 32,  name: '수인 제단 강화',                    desc: 'GuardianEssence'                       },
  { id: 33,  name: '요괴 제단 강화',                    desc: 'CrusherEssence'                        },
  { id: 34,  name: '신화등급 장비로 업그레이드',         desc: 'BlueCrystal'                           },
  { id: 35,  name: '얼어붙은 영혼석',                   desc: 'IceSoulStone'                          },
  { id: 36,  name: '빙하의 정수',                       desc: 'FrostGlacial'                          },
  { id: 37,  name: '서리 조각',                         desc: 'FrostPiece'                            },
  { id: 39,  name: '설산 열쇠',                         desc: 'FrostKey'                              },
  { id: 50,  name: '자귀',                              desc: 'BuildingUpgrade_1'                     },
  { id: 51,  name: '대들보',                            desc: 'BuildingUpgrade_2'                     },
  { id: 52,  name: '창호',                              desc: 'BuildingUpgrade_3'                     },
  { id: 53,  name: '기와',                              desc: 'BuildingUpgrade_4'                     },
  { id: 54,  name: '설계도',                            desc: 'BuildingUpgrade_5'                     },
  { id: 55,  name: '단청',                              desc: 'BuildingUpgrade_6'                     },
  { id: 106, name: '무료 장비 던전 입장권',              desc: 'Free_AdmissionTicket_EquipmentDungeon' },
  { id: 107, name: '무료 골드 던전 입장권',              desc: 'Free_AdmissionTicket_GoldDungeon'      },
  { id: 108, name: '무료 별자리 던전 입장권',            desc: 'Free_AdmissionTicket_AwakeDungeon'     },
]

let _rowId = 0
export function nextRowId(): string { return String(++_rowId) }
export function newRow(): ItemRow {
  return { id: nextRowId(), itemType: 'Currency_', itemId: '', count: '1' }
}

export function buildSendMailListFormat(rows: ItemRow[]): string {
  return rows
    .map(r => {
      const cat = ITEM_CATEGORIES.find(c => c.value === r.itemType)
      if (!cat) return ''
      if (cat.needId && !r.itemId) return ''
      const key = cat.needId ? `${r.itemType}${r.itemId}` : 'Emblem'
      return `${key}:${r.count || '1'}`
    })
    .filter(Boolean)
    .join(',')
}
