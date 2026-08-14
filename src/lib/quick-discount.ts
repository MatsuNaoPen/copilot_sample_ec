// ★研修用のわざと規約違反なコード（ハーネス検証ワークショップの題材）。
// このブランチを push すると、整備した CI（typecheck / lint / test）が
// どこで弾いてくれるかを確認できる。

// 違反1: any の使用（instructions とESLintルールに違反）
export function quickDiscount(cart: any): number {
  // 違反2: 端数を切り捨てず浮動小数のまま返す（「金額は整数」規約に違反）
  return cart.subtotal * 0.1;
}
