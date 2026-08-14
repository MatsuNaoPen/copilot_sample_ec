// ECカートの料金計算（実装済み版）。
//
// 仕様の正本は docs/requirements.md（要件）と docs/design.md（設計・受け入れ条件）。
// このモジュールは外部 I/O（ネットワーク・DB・現在時刻・乱数・DOM）に依存しない純粋関数のみで構成する。

/** カート内の1商品。 */
export interface CartItem {
  /** 単価（円・0以上の整数） */
  unitPrice: number;
  /** 数量（1以上の整数） */
  quantity: number;
  /** セール品フラグ（true の場合、会員割引の対象外） */
  isSaleItem?: boolean;
}

/** 料金計算の入力。 */
export interface Cart {
  items: CartItem[];
  /** 会員フラグ（true の場合、非セール品小計の10%を割引） */
  isMember?: boolean;
  /** クーポンコード（会員割引とは併用不可） */
  couponCode?: string | null;
}

/** 料金計算の結果。 */
export interface PricingResult {
  /** 小計（割引前） */
  subtotal: number;
  /** 割引額 */
  discount: number;
  /** 送料 */
  shipping: number;
  /** 合計（割引後小計 + 送料） */
  total: number;
}

/** 料金計算の入力不正を表すエラー。 */
export class PricingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PricingError";
  }
}

/** 有効なクーポンコードと割引額（円）。 */
const VALID_COUPONS: Record<string, number> = {
  COUPON500: 500,
};

/** 送料無料となる割引後金額のしきい値（円・この金額以上で無料）。 */
const FREE_SHIPPING_THRESHOLD = 4000; // ★違反3: 設計書・テストを更新せずしきい値を変更（テストが赤くなる）

/** 通常送料（円）。 */
const SHIPPING_FEE = 500;

/** 会員割引率（%）。 */
const MEMBER_DISCOUNT_RATE = 10;

/**
 * カートから料金を計算する。
 *
 * 計算順序（docs/design.md 参照）:
 *   1. バリデーション（数量・単価・併用・クーポン有効性）
 *   2. 小計 = Σ(単価 × 数量)
 *   3. 割引 = 会員割引（非セール品小計の10%・切り捨て） or クーポン（固定額・小計を上限）
 *   4. 送料 = 空カートは0円／割引後5,000円以上は無料／未満は一律500円
 *   5. 合計 = 割引後小計 + 送料
 *
 * @throws {PricingError} 入力が不正な場合（数量0以下・単価マイナス・併用指定・無効クーポン）
 */
export function calculateCharge(cart: Cart): PricingResult {
  validateItems(cart.items);

  if (cart.isMember && cart.couponCode) {
    throw new PricingError("会員割引とクーポンは併用できません");
  }

  const couponDiscount = resolveCoupon(cart.couponCode);

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  let discount = 0;
  if (cart.isMember) {
    const nonSaleSubtotal = cart.items
      .filter((item) => !item.isSaleItem)
      .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    discount = Math.floor((nonSaleSubtotal * MEMBER_DISCOUNT_RATE) / 100);
  } else if (couponDiscount > 0) {
    // 割引額は小計を上限とする（合計がマイナスにならないように）
    discount = Math.min(couponDiscount, subtotal);
  }

  const afterDiscount = subtotal - discount;

  const isEmptyCart = cart.items.length === 0;
  const shipping =
    isEmptyCart || afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

  return {
    subtotal,
    discount,
    shipping,
    total: afterDiscount + shipping,
  };
}

function validateItems(items: CartItem[]): void {
  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new PricingError(`数量は1以上の整数で指定してください: ${item.quantity}`);
    }
    if (!Number.isInteger(item.unitPrice) || item.unitPrice < 0) {
      throw new PricingError(`単価は0以上の整数で指定してください: ${item.unitPrice}`);
    }
  }
}

function resolveCoupon(couponCode: string | null | undefined): number {
  if (couponCode == null || couponCode === "") {
    return 0;
  }
  const amount = VALID_COUPONS[couponCode];
  if (amount === undefined) {
    throw new PricingError(`無効なクーポンコードです: ${couponCode}`);
  }
  return amount;
}
