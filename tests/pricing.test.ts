import { describe, expect, it } from "vitest";
import { calculateCharge, PricingError, type Cart } from "@/lib/pricing";

const item = (unitPrice: number, quantity: number, isSaleItem = false) => ({
  unitPrice,
  quantity,
  isSaleItem,
});

describe("calculateCharge: 正常系", () => {
  it("小計のみ（会員でもクーポンでもない）: 送料500円が加算される", () => {
    const cart: Cart = { items: [item(1000, 2)] };
    expect(calculateCharge(cart)).toEqual({
      subtotal: 2000,
      discount: 0,
      shipping: 500,
      total: 2500,
    });
  });

  it("空カートは全て0円（送料も取らない）", () => {
    const cart: Cart = { items: [] };
    expect(calculateCharge(cart)).toEqual({
      subtotal: 0,
      discount: 0,
      shipping: 0,
      total: 0,
    });
  });

  it("会員割引: 非セール品小計の10%を割引する", () => {
    const cart: Cart = { items: [item(3000, 1)], isMember: true };
    expect(calculateCharge(cart)).toEqual({
      subtotal: 3000,
      discount: 300,
      shipping: 500,
      total: 3200,
    });
  });

  it("会員割引: セール品は割引対象外（非セール品にのみ10%）", () => {
    const cart: Cart = {
      items: [item(3000, 1), item(2000, 1, true)],
      isMember: true,
    };
    // 非セール品3000の10% = 300。セール品2000は対象外
    expect(calculateCharge(cart)).toEqual({
      subtotal: 5000,
      discount: 300,
      shipping: 500,
      total: 5200,
    });
  });

  it("会員割引: 端数は切り捨てる", () => {
    const cart: Cart = { items: [item(999, 1)], isMember: true };
    // 999 * 10% = 99.9 → 99
    const result = calculateCharge(cart);
    expect(result.discount).toBe(99);
  });

  it("クーポン COUPON500: 固定500円引き", () => {
    const cart: Cart = { items: [item(2000, 1)], couponCode: "COUPON500" };
    expect(calculateCharge(cart)).toEqual({
      subtotal: 2000,
      discount: 500,
      shipping: 500,
      total: 2000,
    });
  });

  it("クーポン: 割引額は小計を上限とする（合計がマイナスにならない）", () => {
    const cart: Cart = { items: [item(300, 1)], couponCode: "COUPON500" };
    const result = calculateCharge(cart);
    expect(result.discount).toBe(300);
    expect(result.total).toBe(500); // 割引後0円 < 5000 → 送料500のみ
  });
});

describe("calculateCharge: 送料の境界値", () => {
  it("割引後ちょうど5,000円は送料無料", () => {
    const cart: Cart = { items: [item(5000, 1)] };
    expect(calculateCharge(cart).shipping).toBe(0);
  });

  it("割引後4,999円は送料500円", () => {
    const cart: Cart = { items: [item(4999, 1)] };
    expect(calculateCharge(cart).shipping).toBe(500);
  });

  it("割引によって5,000円を下回ると送料が発生する", () => {
    // 小計5300 - 会員割引530 = 4770 < 5000 → 送料500
    const cart: Cart = { items: [item(5300, 1)], isMember: true };
    const result = calculateCharge(cart);
    expect(result.discount).toBe(530);
    expect(result.shipping).toBe(500);
    expect(result.total).toBe(5270);
  });
});

describe("calculateCharge: 異常系", () => {
  it("数量0はエラー", () => {
    const cart: Cart = { items: [item(1000, 0)] };
    expect(() => calculateCharge(cart)).toThrow(PricingError);
  });

  it("数量マイナスはエラー", () => {
    const cart: Cart = { items: [item(1000, -1)] };
    expect(() => calculateCharge(cart)).toThrow(PricingError);
  });

  it("単価マイナスはエラー", () => {
    const cart: Cart = { items: [item(-100, 1)] };
    expect(() => calculateCharge(cart)).toThrow(PricingError);
  });

  it("無効なクーポンコードはエラー", () => {
    const cart: Cart = { items: [item(1000, 1)], couponCode: "INVALID" };
    expect(() => calculateCharge(cart)).toThrow(PricingError);
  });

  it("会員割引とクーポンの併用はエラー", () => {
    const cart: Cart = {
      items: [item(1000, 1)],
      isMember: true,
      couponCode: "COUPON500",
    };
    expect(() => calculateCharge(cart)).toThrow(PricingError);
  });
});
