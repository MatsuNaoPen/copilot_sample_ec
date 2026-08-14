// カートの保存（localStorage）。ブラウザ専用のため "use client" コンポーネントからのみ使う。
// 料金計算そのものは src/lib/pricing.ts の純粋関数に任せ、ここでは保存と復元だけを行う。

export interface StoredCartLine {
  productId: string;
  quantity: number;
}

const STORAGE_KEY = "copilot-training-cart";

export function loadCart(): StoredCartLine[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (line): line is StoredCartLine =>
        typeof line === "object" &&
        line !== null &&
        typeof (line as StoredCartLine).productId === "string" &&
        typeof (line as StoredCartLine).quantity === "number",
    );
  } catch {
    // 壊れた保存データは空カートとして扱う（ユーザー操作で回復できるため握り潰しではなく既定値への復帰）
    return [];
  }
}

export function saveCart(lines: StoredCartLine[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
}

export function clearCart(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
