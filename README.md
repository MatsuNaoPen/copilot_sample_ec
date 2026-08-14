# Copilot Training Shop（Next.js 研修用デモリポジトリ）

GitHub Copilot 研修（エージェント駆動開発・skill 作成・ハーネス整備）の演習用ミニECサイトです。
「カートの料金計算」を題材に、Issue 起票 → Coding Agent への委譲 → PR レビュー → CI 通過までを体験します。

## セットアップ

```bash
npm ci
npm run dev   # http://localhost:3000
```

## コマンド

| コマンド | 内容 |
|----------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run test` | テスト実行（Vitest） |
| `npm run typecheck` | 型チェック（tsc --noEmit） |
| `npm run lint` | Lint（ESLint） |
| `npm run build` | 本番ビルド |

## 構成

```
app/                 # 画面（商品一覧 / カート / 注文完了）。計算ロジックは持たない
src/lib/pricing.ts   # 料金計算の純粋関数（このリポジトリの主戦場）
src/lib/products.ts  # 商品カタログ（静的データ）
tests/               # Vitest テスト（受け入れ条件に対応）
docs/
  requirements.md    # 要件定義書（仕様の正本）
  design.md          # 設計書（受け入れ条件・定数表）
  adr/               # 設計判断の記録
  minutes/           # 議事録（デモ・prompt file 演習の入力）
  issues/            # 演習用お題 Issue の下書き（小: 送料ルール変更 / 大: 割合クーポン追加）
.github/
  ISSUE_TEMPLATE/    # 受け入れ条件付きの作業 Issue テンプレート
  prompts/           # prompt file（議事録→要件→設計→テストの変換）
templates/           # ★ワークショップで「適用する側」の材料（最初は未適用）
  copilot-instructions.example.md   # ハーネスWS: .github/copilot-instructions.md として配置
  ci.yml                            # ハーネスWS: .github/workflows/ci.yml として配置
  skill-template/SKILL.md           # skill作成WS: .github/skills/<name>/SKILL.md の雛形
  skills-examples/                  # skill の完成例（要件レビュー・受入テスト生成・TDD・xlsx変換）
  instructions-examples/            # パス別 instructions の完成例
  copilot-instructions.vite-example.md  # 旧Vite版 instructions（参考）
scripts/             # docs の md ⇄ xlsx 変換スクリプト（docs-xlsx skill が使用）
```

## 研修での使い方（受講者向け）

1. **Issue 起票**: `docs/issues/` のお題を Issue テンプレート（task）に転記し、受け入れ条件を確認
2. **ハーネス整備**: `templates/` の instructions と CI を `.github/` に配置し、違反 push が弾かれることを確認
3. **skill 作成**: `templates/skill-template/` を雛形に、定型作業を skill 化
4. **委譲**: Issue を Copilot（Coding Agent）にアサインし、生成された PR を受け入れ条件と突き合わせてレビュー

> このリポジトリは意図的に `copilot-instructions.md` と CI が**未設置**の状態で始まります。
> 「エージェントが安全に走れる環境」を自分の手で整備するところまでが演習です。

## 仕様の正本

- 要件: [docs/requirements.md](docs/requirements.md)
- 設計・受け入れ条件: [docs/design.md](docs/design.md)

仕様を変更する PR では、design.md の該当箇所を同じ PR で更新してください。
