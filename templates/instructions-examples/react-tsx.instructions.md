---
applyTo: "**/*.tsx"
---

# React / TSX 向け指示（GitHub Copilot 向け）

`.tsx` ファイル（React コンポーネント）に対する指示です。
リポジトリ全体の規約は `.github/copilot-instructions.md` を優先し、本ファイルは UI 層に固有のルールを補足します。

## 役割分担（最重要）
- `.tsx` は **表示と入力ハンドリングのみ** を担当する。料金・割引・送料などの計算ロジックは絶対に書かない。
- 計算は必ず `src/pricing.ts` の純粋関数（`calculateCharge` など）を **呼び出すだけ** にする。
  ロジックをコンポーネント内に再実装しない（テストの決定性とデモの安定性を壊さない）。
- コンポーネントから渡す入力は `Cart` / `CartItem`、受け取る結果は `PricingResult` の型で扱う。

## コンポーネントの書き方
- **関数コンポーネント + Hooks** で書く。クラスコンポーネントは使わない。
- 画面のルートコンポーネントは `export default function ComponentName()` の形にする（`src/main.tsx` から `App` を default import している）。
- 状態管理は React 標準の `useState` で十分。外部の状態管理ライブラリは導入しない。
- 計算結果のように入力から導出される値は `useMemo` で算出し、依存配列（`[rows, isMember, ...]`）を正しく指定する。
- 状態更新は**イミュータブル**に行う。`setRows((prev) => prev.map(...))` のように更新関数を使い、既存配列・オブジェクトを直接 mutate しない。

## 型
- `any` を使わない。props・state・ローカルの行データ（例: `ItemRow`）には明示的に型を付ける。
- `pricing.ts` の型は **type-only import** で取り込む: `import { calculateCharge, type Cart, type PricingResult } from './pricing'`。
- イベントハンドラの引数は推論に任せてよいが、戻り値や公開関数の型は曖昧にしない。

## 入力フォームの扱い
- `<input>` の値は **文字列のまま state に保持** し、計算に渡す直前で `Number(...)` 変換する（このプロジェクトの既定パターン）。
- 数値入力は `type="number"`、真偽値は `type="checkbox"`（`e.target.checked`）、テキストは `e.target.value` で受ける。
- バリデーション結果やエラーメッセージは **画面に表示** する。`calculateCharge` が `PricingError` を throw しうる場合は `try/catch` で捕捉し、メッセージを描画する。`catch {}` で握りつぶさない。

## アクセシビリティ・表示
- フォーム部品は `<label>` で囲むか、対応する `label`/`aria-label` を付ける（例: 操作列の `<th aria-label="操作" />`）。
- スタイルは `src/index.css` の `className`（`container` / `secondary` / `link` / `result` など）を使う。インラインスタイルは最小限にとどめる。
- ユーザー向けの表示文字列は **日本語** で書く。金額は `toLocaleString('ja-JP')` を使った既存ヘルパ（`yen()`）に倣ってフォーマットする。

## やらないこと
- `.tsx` 内で `fetch`・`localStorage`・`Date`・`Math.random` などの外部 I/O や非決定的な処理を計算ロジックに混ぜない。
- リストの `key` には可能なら安定した識別子を使う（暫定で index を使う場合も、計算ロジックを index に依存させない）。
