// 料金計算ロジックの受け入れテスト（正常系・境界値・異常系）。
import { describe, it, expect } from 'vitest'
import { calculateCharge, PricingError, type Cart } from './pricing'

// --- 正常系 -----------------------------------------------------------------

describe('正常系', () => {
  it('会員割引が効く: 2,000円に10%引きで割引後1,800円、送料500円', () => {
    const cart: Cart = {
      items: [{ unitPrice: 1000, quantity: 2 }],
      isMember: true,
    }

    const result = calculateCharge(cart)

    expect(result.subtotal).toBe(2000)
    expect(result.discount).toBe(200)
    expect(result.shipping).toBe(500)
    expect(result.total).toBe(2300)
  })

  it('クーポンが効く: 3,000円から固定500円引き、割引後2,500円、送料500円', () => {
    const cart: Cart = {
      items: [{ unitPrice: 3000, quantity: 1 }],
      couponCode: 'SAVE500',
    }

    const result = calculateCharge(cart)

    expect(result.subtotal).toBe(3000)
    expect(result.discount).toBe(500)
    expect(result.total).toBe(3000) // 2500 + 送料500
  })

  it('セール品は会員割引の対象外: 非セール品2,000円分にのみ10%引き', () => {
    const cart: Cart = {
      items: [
        { unitPrice: 2000, quantity: 1 }, // 通常品
        { unitPrice: 2000, quantity: 1, isSaleItem: true }, // セール品
      ],
      isMember: true,
    }

    const result = calculateCharge(cart)

    expect(result.subtotal).toBe(4000)
    expect(result.discount).toBe(200) // 2000 の10%のみ（セール品は対象外）
    expect(result.total).toBe(4300) // 3800 + 送料500
  })

  it('割引後が閾値を超えると送料無料', () => {
    const cart: Cart = { items: [{ unitPrice: 3000, quantity: 2 }] }

    const result = calculateCharge(cart)

    expect(result.shipping).toBe(0)
    expect(result.total).toBe(6000)
  })

  it('割引後が閾値未満なら一律500円の送料', () => {
    const cart: Cart = { items: [{ unitPrice: 1000, quantity: 1 }] }

    const result = calculateCharge(cart)

    expect(result.shipping).toBe(500)
    expect(result.total).toBe(1500)
  })
})

// --- 境界値 -----------------------------------------------------------------

describe('境界値', () => {
  it('割引後ちょうど5,000円 → 送料無料', () => {
    const cart: Cart = { items: [{ unitPrice: 5000, quantity: 1 }] }

    const result = calculateCharge(cart)

    expect(result.shipping).toBe(0)
    expect(result.total).toBe(5000)
  })

  it('割引後4,999円 → 送料500円', () => {
    const cart: Cart = { items: [{ unitPrice: 4999, quantity: 1 }] }

    const result = calculateCharge(cart)

    expect(result.shipping).toBe(500)
    expect(result.total).toBe(5499)
  })

  it('会員割引で端数が出るケースは切り捨て: 2,999円の10%は299円', () => {
    const cart: Cart = {
      items: [{ unitPrice: 2999, quantity: 1 }],
      isMember: true,
    }

    const result = calculateCharge(cart)

    expect(result.discount).toBe(299) // 299.9 → 299（切り上げの300ではない）
    expect(result.total).toBe(3200) // 2700 + 送料500
  })
})

// --- 異常系 -----------------------------------------------------------------

describe('異常系', () => {
  it.each([0, -1])('数量が0以下（%i）はエラー', (quantity) => {
    const cart: Cart = { items: [{ unitPrice: 1000, quantity }] }

    expect(() => calculateCharge(cart)).toThrow(PricingError)
  })

  it('単価がマイナスはエラー', () => {
    const cart: Cart = { items: [{ unitPrice: -1, quantity: 1 }] }

    expect(() => calculateCharge(cart)).toThrow(PricingError)
  })

  it('存在しないクーポンコードはエラー', () => {
    const cart: Cart = {
      items: [{ unitPrice: 1000, quantity: 1 }],
      couponCode: 'NOPE',
    }

    expect(() => calculateCharge(cart)).toThrow(PricingError)
  })

  it('会員割引とクーポンの併用指定はエラー', () => {
    const cart: Cart = {
      items: [{ unitPrice: 1000, quantity: 1 }],
      isMember: true,
      couponCode: 'SAVE500',
    }

    expect(() => calculateCharge(cart)).toThrow(PricingError)
  })

  it('空カートは合計0円・送料0円', () => {
    const cart: Cart = { items: [] }

    const result = calculateCharge(cart)

    expect(result.subtotal).toBe(0)
    expect(result.discount).toBe(0)
    expect(result.shipping).toBe(0)
    expect(result.total).toBe(0)
  })
})
