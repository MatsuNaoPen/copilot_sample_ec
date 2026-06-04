---
description: '要件定義書 docs/requirements.md から設計書 docs/design.md を生成する'
agent: 'agent'
---

あなたはこのプロジェクトの設計担当です。
要件定義書 `docs/requirements.md` を入力に、設計書テンプレート `docs/templates/design_template.md`
の構成に沿って **設計書 `docs/design.md`** を新規作成してください。

## 入力
- 要件定義書: `docs/requirements.md`
- 設計書テンプレート: `docs/templates/design_template.md`（このセクション構成を踏襲する）
- プロジェクト規約: `.github/copilot-instructions.md`

## 設計方針（このプロジェクト固有）
- 料金計算ロジックは **`src/pricing.ts` の純粋関数**として設計する（UI から分離・外部 I/O 禁止）。
- 公開関数は `calculateCharge(cart: Cart): PricingResult` を基本とする。
- 型 `Cart` / `CartItem` / `PricingResult` と、入力不正時に throw する `PricingError` を定義する。
- 金額は整数（円）。端数は `Math.floor` で切り捨てる。
- UI（`src/App.tsx`）はこの純粋関数を呼ぶだけ、という責務分担を明記する。

## 必ず埋めるセクション
1. 概要（対応する要件へのリンク）
2. モジュール構成（`pricing.ts` と `App.tsx` の責務分担）
3. データ構造（`Cart` / `CartItem` / `PricingResult` の型定義）
4. 公開インターフェース（`calculateCharge` のシグネチャと throw する例外）
5. 処理フロー（バリデーション → 小計 → 割引 → 送料 → 合計 の順序）
6. 計算ルールの実装メモ（端数処理＝`Math.floor`、割引率/送料無料閾値/送料の定数、会員割引×クーポン併用不可の扱い）
7. エラー設計（どの条件で `PricingError` を throw するか）
8. テスト観点（正常系・境界値・異常系のリスト。境界値は「5,000円ちょうど＝無料」「4,999円＝送料500円」「会員割引の端数切り捨て」を必ず含める）

## 注意
- 要件定義書に「不明点」が残っている場合は勝手に確定させず、設計書の該当箇所に
  **「要確認」** として明示し、推奨案を併記する（特に端数処理）。
- 受け入れ条件は必ずテスト観点に落とし込む（後工程で `src/pricing.test.ts` の素になる）。
