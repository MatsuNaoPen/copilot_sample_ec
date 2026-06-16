---
name: tdd-demo
description: ECカート料金計算のTDDデモを「議事録→要件定義→設計→テスト(レッド)→実装(グリーン)→UI反映」の順で進行・再開する。requirements.md / design.md / pricing.test.ts の生成や、テストファーストでの pricing.ts の改善・UIへの反映を行うときに使う。
allowed-tools: shell
---

# TDD デモ進行 skill

GitHub Copilot 研修用 EC カート料金計算デモを、ドキュメント駆動の TDD パイプラインとして
**順番に・整合を取りながら**進行（または途中から再開）するための手順書。

各ステージの「やること」の正本は `.github/prompts/*.prompt.md` にある。本 skill はそれらを束ね、
順序・テストファースト・不明点の扱いを守らせるオーケストレーションを担う。

## ゴール
`src/pricing.ts` を「小計だけ」のベースラインから、要件どおり（会員割引・クーポン・送料・
バリデーション）に育て、テストをグリーンにし、UI（`src/App.tsx`）に反映するまで。

## パイプライン（この順序は厳守）

| # | ステージ | 入力 | 出力 | 対応 prompt |
|---|----------|------|------|-------------|
| 1 | 要件定義 | `docs/minutes/kickoff_meeting.md` + `docs/templates/requirements_template.md` | `docs/requirements.md` | `requirements-from-minutes.prompt.md` |
| 2 | 設計 | `docs/requirements.md` + `docs/templates/design_template.md` | `docs/design.md` | `design-from-requirements.prompt.md` |
| 3 | テスト(レッド) | `docs/design.md` + `docs/requirements.md` | `src/pricing.test.ts` | `tests-from-design.prompt.md` |
| 4 | 実装(グリーン) | `src/pricing.test.ts` + `docs/design.md` | `src/pricing.ts`（改善） | （prompt なし・下記手順） |
| 5 | UI 反映 | 改善後の `pricing.ts` | `src/App.tsx`（割引/送料/エラー表示） | （prompt なし・下記手順） |

## 開始時にやること（再開対応）
1. 各成果物の有無を確認し、**まだ無い最初のステージから**始める:
   - `docs/requirements.md` が無ければステージ1から
   - あればステージ2、`docs/design.md` があればステージ3 …という具合に未完了の先頭を特定する。
2. ユーザーが特定ステージだけを指定した場合（例「設計だけ」）は、その前段の成果物が揃っているか確認してから実行する。揃っていなければ不足を伝える。
3. 1ステージ完了ごとに**何を作ったか・次は何かを1〜2行で報告**し、勝手に全ステージを突き進まない。

## 全ステージ共通のルール
- 対応する prompt ファイルがあるステージは、その prompt の指示（入力・守ること・注意）に**従う**。本 skill と矛盾したら prompt を優先。
- プロジェクト規約 `.github/copilot-instructions.md` と `.github/instructions/*.instructions.md` を必ず守る
  （純粋関数・型必須/`any`禁止・金額は整数で端数 `Math.floor` 切り捨て・例外を握り潰さない 等）。
- **議事録/上流に明記がない点を勝手に確定しない**。要件定義では「不明点・確認事項」節に、設計では「要確認」として推奨案つきで残す（特に端数処理＝切り上げ/切り捨て/四捨五入）。
- 前段に「不明点」が残ったまま後段を確定させない。下流で確定が必要になったら、その判断をユーザーに確認する。

## ステージ別の要点

### ステージ1: 要件定義
- `requirements-from-minutes.prompt.md` に従い、議事録から料金ルール（小計／会員割引10%／セール品は対象外／クーポン500円／会員割引とクーポンは併用不可／送料は割引後5,000円以上で無料・未満500円／空カートは0円）を順序立てて記述。
- 異常系（数量0以下・単価マイナス・無効クーポン・併用指定）をバリデーション節に、受け入れ条件を正常系/境界値/異常系で網羅。端数処理は不明点として挙げる。

### ステージ2: 設計
- `design-from-requirements.prompt.md` に従い、`pricing.ts` の純粋関数設計・`Cart`/`CartItem`/`PricingResult`/`PricingError`・処理フロー（バリデーション→小計→割引→送料→合計）・テスト観点を埋める。
- 境界値「5,000円ちょうど＝無料」「4,999円＝送料500円」「会員割引の端数切り捨て」をテスト観点に必ず含める。

### ステージ3: テスト（レッド）
- `tests-from-design.prompt.md` に従い、**`src/pricing.ts` は触らず**に `src/pricing.test.ts` を仕様どおりの期待値で書く。
- `describe`/`it` で正常系・境界値・異常系を整理。異常系は `expect(() => calculateCharge(cart)).toThrow(PricingError)`。期待値は数値リテラル＋計算過程コメント。
- 完了後 `npm test` を実行し、**素朴な実装のまま失敗（レッド）すること**を確認・報告する。これがテストファーストの出発点。

### ステージ4: 実装（グリーン）※対応 prompt なし
- ステージ3のテストとステージ2の設計を満たすよう `src/pricing.ts` を改善する。**テストの期待値を実装に合わせて書き換えない**（仕様＝テストが正）。
- 追加する要素: `PricingError` クラス、バリデーション（数量0以下・単価マイナス・無効クーポン・会員割引×クーポン併用）、会員割引（セール品を除いた小計に10%・`Math.floor` 切り捨て）、クーポン（固定額引き・会員割引と併用不可）、送料（割引後5,000円以上無料/未満500円）、空カートは0円。
- 副作用・外部 I/O を持ち込まない。`catch {}` で握り潰さない。
- `npm test` を実行し**全テストがグリーン**になるまで直す。グリーンを確認して報告する。

### ステージ5: UI 反映 ※対応 prompt なし
- `src/App.tsx` は計算ロジックを再実装せず、改善後の `calculateCharge` を呼ぶだけにする（`.github/instructions/react-tsx.instructions.md` 準拠）。
- 割引額・送料・合計を表示に追加し、`PricingError` を `try/catch` で捕捉して画面にメッセージ表示する（握り潰さない）。
- `npm run dev` で起動確認できる状態にする（任意）。

## 完了の定義
- `docs/requirements.md` / `docs/design.md` / `src/pricing.test.ts` が揃い、`src/pricing.ts` が要件を満たし、`npm test` がグリーン。UI に割引/送料/エラーが反映されている。
- 各ドキュメント間（議事録→要件→設計→テスト→実装→UI）で仕様に齟齬がない。
