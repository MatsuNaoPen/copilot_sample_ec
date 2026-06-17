import { describe, expect, it } from 'vitest'
import { calculateCharge } from './pricing'

describe('calculateCharge - 会員割引', () => {
  it('非会員の場合は割引なし', () => {
    const result = calculateCharge({
      items: [{ unitPrice: 1000, quantity: 2 }],
      isMember: false,
    })
    expect(result.discount).toBe(0)
    expect(result.total).toBe(2000)
  })

  it('会員かつ非セール品のみ → 小計の10%が割引される', () => {
    const result = calculateCharge({
      items: [{ unitPrice: 1000, quantity: 2 }],
      isMember: true,
    })
    expect(result.subtotal).toBe(2000)
    expect(result.discount).toBe(200)
    expect(result.total).toBe(1800)
  })

  it('セール品が混在 → セール品は割引対象から除外', () => {
    const result = calculateCharge({
      items: [
        { unitPrice: 1000, quantity: 2, isSaleItem: false },
        { unitPrice: 2000, quantity: 1, isSaleItem: true },
      ],
      isMember: true,
    })
    // 小計: 1000*2 + 2000*1 = 4000
    // 割引対象: 1000*2 = 2000 → 10% = 200
    expect(result.subtotal).toBe(4000)
    expect(result.discount).toBe(200)
    expect(result.total).toBe(3800)
  })

  it('セール品のみ → 割引額は0', () => {
    const result = calculateCharge({
      items: [{ unitPrice: 1000, quantity: 1, isSaleItem: true }],
      isMember: true,
    })
    expect(result.discount).toBe(0)
    expect(result.total).toBe(1000)
  })

  it('端数が出るケース（2999円）→ 299円引き（切り捨て）', () => {
    const result = calculateCharge({
      items: [{ unitPrice: 2999, quantity: 1 }],
      isMember: true,
    })
    // 2999 * 10 / 100 = 299.9 → Math.floor = 299
    expect(result.discount).toBe(299)
    expect(result.total).toBe(2700)
  })

  it('空カートの場合は合計0円', () => {
    const result = calculateCharge({ items: [], isMember: true })
    expect(result.subtotal).toBe(0)
    expect(result.discount).toBe(0)
    expect(result.total).toBe(0)
  })
})
