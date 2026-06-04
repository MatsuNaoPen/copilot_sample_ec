// ECカートの料金計算ロジック（純粋関数）。
// 外部 I/O（ネットワーク・DB・現在時刻・乱数・DOM）に依存しない。
// 入力（Cart）だけで結果（PricingResult）が決まるため、テストは決定的になる。
// 金額はすべて整数（円）で扱い、割引の端数は Math.floor で切り捨てる。

// --- 定数（料金仕様の正本） -------------------------------------------------
/** 会員割引率（%）。整数演算で `* 10 / 100` = 1割引・端数切り捨て。 */
export const MEMBER_DISCOUNT_PERCENT = 10
/** この金額（円）「以上」で送料無料。 */
export const FREE_SHIPPING_THRESHOLD = 5000
/** 送料無料に満たない場合の一律送料（円）。 */
export const SHIPPING_FEE = 500

/** 有効なクーポンコードと割引額（円）。存在しないコードはエラー。 */
export const COUPONS: Record<string, number> = {
  SAVE500: 500,
}

/** カートの入力が料金計算のルールに反する場合に throw する例外。 */
export class PricingError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PricingError'
  }
}

/** カート内の1商品。 */
export interface CartItem {
  /** 単価（円） */
  unitPrice: number
  /** 数量 */
  quantity: number
  /** セール品フラグ（true なら会員割引の対象外） */
  isSaleItem?: boolean
}

/** 料金計算の入力。 */
export interface Cart {
  items: CartItem[]
  /** 会員フラグ */
  isMember?: boolean
  /** クーポンコード（未指定なら null / 空文字） */
  couponCode?: string | null
}

/** 料金計算の結果。 */
export interface PricingResult {
  /** 小計（割引前） */
  subtotal: number
  /** 適用された割引額（会員割引 or クーポン） */
  discount: number
  /** 送料 */
  shipping: number
  /** 合計（割引後小計 + 送料） */
  total: number
}

/**
 * カートから料金を計算して返す。
 *
 * 計算順:
 *   1. 小計 = Σ(単価 × 数量)
 *   2. 会員割引: 会員なら「セール品を除いた小計」に 10% 引き（1円未満切り捨て）
 *   3. クーポン: 固定額引き（会員割引とは併用不可）
 *   4. 送料: 割引後合計が 5,000円以上で無料、未満は一律 500円
 *   5. 合計 = 割引後小計 + 送料
 * 空カートは合計0円・送料0円。
 *
 * @throws {PricingError} 数量0以下 / 単価マイナス / 無効クーポン / 会員割引×クーポン併用
 */
export function calculateCharge(cart: Cart): PricingResult {
  validate(cart)

  // 空カートは送料も発生させず 0 を返す。
  if (cart.items.length === 0) {
    return { subtotal: 0, discount: 0, shipping: 0, total: 0 }
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  )
  const discount = calculateDiscount(cart)

  // 割引額が小計を上回っても割引後をマイナスにしない。
  const discountedSubtotal = Math.max(0, subtotal - discount)
  const appliedDiscount = subtotal - discountedSubtotal

  const shipping =
    discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const total = discountedSubtotal + shipping

  return { subtotal, discount: appliedDiscount, shipping, total }
}

/** 入力バリデーション。問題があれば PricingError を throw する。 */
function validate(cart: Cart): void {
  const hasCoupon = cart.couponCode != null && cart.couponCode !== ''

  // 会員割引とクーポンは併用不可。
  if (cart.isMember && hasCoupon) {
    throw new PricingError('会員割引とクーポンは併用できません。')
  }

  // 存在しないクーポンコードは受け付けない。
  if (hasCoupon && !(cart.couponCode! in COUPONS)) {
    throw new PricingError(`無効なクーポンコードです: ${cart.couponCode}`)
  }

  for (const item of cart.items) {
    if (item.quantity <= 0) {
      throw new PricingError(`数量は1以上である必要があります: ${item.quantity}`)
    }
    if (item.unitPrice < 0) {
      throw new PricingError(`単価は0以上である必要があります: ${item.unitPrice}`)
    }
  }
}

/** 会員割引またはクーポンによる割引額（円）を返す。併用は validate で排除済み。 */
function calculateDiscount(cart: Cart): number {
  if (cart.isMember) {
    // セール品を除いた小計にのみ 10% を適用し、1円未満は切り捨てる（整数演算）。
    const nonSaleSubtotal = cart.items
      .filter((item) => !item.isSaleItem)
      .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
    return Math.floor((nonSaleSubtotal * MEMBER_DISCOUNT_PERCENT) / 100)
  }

  if (cart.couponCode != null && cart.couponCode !== '') {
    return COUPONS[cart.couponCode]
  }

  return 0
}
