// ECカートの料金計算（ベースライン版）。
//
// ★現状は「小計（単価 × 数量の合計）」だけを計算する素朴な実装です。
//   会員割引・クーポン・送料・バリデーションには未対応です。
//   → 議事録 docs/minutes/kickoff_meeting.md から要件を定義し、
//     このロジックを改善していくのがデモのゴールです。

/** カート内の1商品。 */
export interface CartItem {
  /** 単価（円） */
  unitPrice: number
  /** 数量 */
  quantity: number
  /** セール品フラグ（※現状は未使用。会員割引の対象外判定でいずれ使う） */
  isSaleItem?: boolean
}

/** 料金計算の入力。 */
export interface Cart {
  items: CartItem[]
  /** 会員フラグ（※現状は未使用） */
  isMember?: boolean
  /** クーポンコード（※現状は未使用） */
  couponCode?: string | null
}

/** 料金計算の結果。 */
export interface PricingResult {
  /** 小計（割引前） */
  subtotal: number
  /** 割引額（※現状は常に0） */
  discount: number
  /** 送料（※現状は常に0） */
  shipping: number
  /** 合計 */
  total: number
}

/**
 * カートから料金を計算する（ベースライン）。
 *
 * 現状は小計のみ。要件定義のあと、以下を順に実装して改善する想定:
 *   - 会員割引（セール品を除いた小計に10%・端数切り捨て）
 *   - クーポン（固定額引き・会員割引とは併用不可）
 *   - 送料（割引後5,000円以上で無料・未満は一律500円）
 *   - バリデーション（数量0以下・単価マイナス・無効クーポン・併用指定）
 */
export function calculateCharge(cart: Cart): PricingResult {
  // TODO(要件定義後に改善): 会員割引・クーポン・送料・バリデーションは未実装。
  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  )

  return { subtotal, discount: 0, shipping: 0, total: subtotal }
}
