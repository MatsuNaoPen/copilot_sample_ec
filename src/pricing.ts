/** カート内の1商品。 */
export interface CartItem {
  /** 単価（円） */
  unitPrice: number
  /** 数量 */
  quantity: number
  /** セール品フラグ（true の場合、会員割引の対象外） */
  isSaleItem?: boolean
}

/** 料金計算の入力。 */
export interface Cart {
  items: CartItem[]
  /** 会員フラグ（true の場合、セール品を除いた小計に10%割引を適用） */
  isMember?: boolean
  /** クーポンコード（※未実装） */
  couponCode?: string | null
}

/** 料金計算の結果。 */
export interface PricingResult {
  /** 小計（割引前） */
  subtotal: number
  /** 割引額 */
  discount: number
  /** 送料（※未実装、常に0） */
  shipping: number
  /** 合計 */
  total: number
}

/**
 * カートから料金を計算する。
 *
 * - 会員割引（セール品を除いた小計に10%・端数切り捨て）
 * - クーポン・送料・バリデーションは未実装。
 */
export function calculateCharge(cart: Cart): PricingResult {
  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  )

  let discount = 0
  if (cart.isMember) {
    const discountableSubtotal = cart.items
      .filter((item) => !item.isSaleItem)
      .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
    discount = Math.floor((discountableSubtotal * 10) / 100)
  }

  const total = subtotal - discount
  return { subtotal, discount, shipping: 0, total }
}
