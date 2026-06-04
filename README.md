# ECカート料金計算デモ — Copilot TDD サンプル（React + TypeScript）

GitHub Copilot 活用研修のライブデモ用サンプルリポジトリです。
**「議事録 → 要件定義書 → 設計書 → テストコード → 実装」** の一気通貫を、
受講者の前でクリーンな状態から実演するための土台になっています。

題材は **ECカートの料金計算ロジック**。`npm run dev` で**起動できる UI 付きの Web サービス**として動き、
入力（カート）に対する合計金額をブラウザ上で確認できます。

## 技術スタック

- **フロントエンド**: React 18 + TypeScript
- **ビルド/開発サーバー**: Vite
- **テスト**: Vitest
- **構成**: バックエンド無しの単一サービス。料金計算は `src/pricing.ts` の**純粋関数**で、
  外部 I/O（ネットワーク・DB・現在時刻・乱数）に依存しない。
  → テストが決定的になり、ライブデモが安定する。

## 起動方法

```bash
npm install
npm run dev      # http://localhost:5173 が開く
npm test         # Vitest で料金計算ロジックのテストを実行
npm run build    # 型チェック + 本番ビルド
```

## 料金仕様（全成果物の正本）

入力はカート（商品リスト ＋ 会員フラグ ＋ クーポン指定）。商品は `単価(円, 整数)` `数量(整数)` `セール品フラグ` を持つ。

1. **小計** = Σ(単価 × 数量)
2. **会員割引**: 会員なら「セール品を除いた小計」に 10% 引き。1円未満は切り捨て（`Math.floor`）。
3. **クーポン**: 固定額（500円）引き。**会員割引とクーポンは併用不可**（両方指定はエラー）。
4. **送料**: 割引後合計が **5,000円以上で無料**、未満は一律 500円。
5. **合計** = 割引後小計 ＋ 送料
6. **空カート**（商品0件）: 合計0円・送料0円。

### バリデーション（異常系）

- 数量 ≤ 0 はエラー
- 単価 < 0 はエラー
- 存在しないクーポンコードはエラー
- 会員割引とクーポンの併用指定はエラー

## リポジトリ構成

```
sample_repository/
├── README.md                              … このファイル
├── .github/copilot-instructions.md        … プロジェクト全体の常設ルール（言語/規約/テスト方針）
├── docs/
│   ├── minutes/kickoff_meeting.md         … デモの出発点となる議事録（会話形式で料金ルールを含む）
│   └── templates/
│       ├── requirements_template.md       … 要件定義書テンプレート（空欄）
│       └── design_template.md             … 設計書テンプレート（空欄）
├── index.html                             … Vite のエントリ HTML
├── package.json / tsconfig.json / vite.config.ts
└── src/
    ├── main.tsx                           … React マウント（雛形）
    ├── index.css                          … スタイル（雛形）
    ├── App.tsx                            … カート UI（demo-start は空のプレースホルダー）
    ├── pricing.ts                         … 料金計算ロジック（demo-solution のみ）
    └── pricing.test.ts                    … Vitest テスト（demo-solution のみ）
```

## 2つのブランチ（重要）

ライブデモは**クリーンな状態から**実演し、当日トラブル時の保険として**完成版**も用意しています。

| ブランチ | 役割 | 中身 |
|----------|------|------|
| **`demo-start`**（デフォルト） | デモの開始点 | 議事録・テンプレート・copilot-instructions・**起動はできるが料金計算は未実装**の UI 雛形（プレースホルダーの `App.tsx`）。`pricing.ts`・`pricing.test.ts` は無い。 |
| **`demo-solution`** | フォールバック兼アンサーキー | 受け入れ条件を満たす `src/pricing.ts`・全テスト `src/pricing.test.ts`・完成版カート UI（`App.tsx`）入り。 |

> 2ブランチの**差分がそのままデモの成果物**（ロジック＋テスト＋UI）になります。

## デモ当日の進め方（demo-start から）

```bash
git switch demo-start
npm install
npm run dev        # まだ料金計算は無い。プレースホルダー画面が出る
```

1. **議事録を読ませる** — `docs/minutes/kickoff_meeting.md` を Copilot に渡し、
   `docs/templates/requirements_template.md` を埋めて **要件定義書 `docs/requirements.md`** を生成。
   議事録には**端数処理（10%割引で1円未満が出たときの扱い）が明記されていません**。
   ここで「不明点」として AI に気づかせ／質問させると、レビュー工程が活きます（→ 教育ポイント）。
2. **設計書を書かせる** — 要件定義書と `design_template.md` から **設計書 `docs/design.md`** を生成。
   関数シグネチャ（`calculateCharge`）・型（`Cart` / `PricingResult`）・端数処理（`Math.floor`）をここで確定。
3. **テストを先に書かせる** — 設計の受け入れ条件から `src/pricing.test.ts` を生成（実装はまだ）。
   この時点で `npm test` は **失敗（赤）** する。
4. **実装させる** — Agent モードでテストを満たす `src/pricing.ts` を生成し、`npm test` が **全部グリーン**に。
5. **UI に繋ぐ** — `src/App.tsx` のプレースホルダーを、`calculateCharge` を呼ぶカート UI に置き換え、
   `npm run dev` でブラウザ上の動作を見せる。

## フォールバックの使い方（デモが詰まったとき）

ライブで AI の出力が安定しない・時間が押した、等のときは完成版に切り替えます。

```bash
git switch demo-solution
npm install
npm test           # 全テストがパスすることを見せる
npm run dev        # 完成版カート UI を見せる
```

- `demo-solution` の `src/pricing.ts` と `src/pricing.test.ts` が**アンサーキー**です。
- 差分を見せたい場合: `git diff demo-start demo-solution`

## 開始状態へのリセット（デモ後・やり直し用）

デモで生成したファイル（`docs/requirements.md` / `docs/design.md` / `src/pricing.ts` / `src/pricing.test.ts` 等）や
`App.tsx` への変更を破棄し、**`demo-start` のクリーンな状態**に戻します。
`node_modules` などは保持されるので `npm install` のやり直しは不要です。

```bash
npm run reset        # 確認プロンプトあり
npm run reset:yes    # 確認なしで即リセット（本番デモ向け）
# 直接実行: bash scripts/reset-demo.sh [-y]
```

> 内部的には `git switch --discard-changes demo-start && git clean -fd` を実行しています。
> **コミットしていない変更は失われます**。残したい場合は事前に別ブランチへ退避してください。
