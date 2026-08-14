---
name: docs-xlsx
description: 要件定義書（docs/requirements.md）・設計書（docs/design.md）を xlsx に出力（export）し、xlsx 側の編集を取り込む（import）双方向変換を行う。Excel で共有・レビューしたいとき、Excel での修正を Markdown に戻したいとき、空テンプレートの xlsx を作りたいときに使う。
allowed-tools: shell
---

# ドキュメント xlsx 双方向変換 skill

要件定義書・設計書（Markdown）を **xlsx へエクスポート**し、Excel 側で編集した内容を
**Markdown に取り込む（インポート）** ための手順書。変換の実体は `scripts/docs_xlsx.py`
（Python + openpyxl）にあり、本 skill はセットアップ・実行・差分レビューを束ねる。

## 設計の前提（必ず理解してから操作する）

- **Markdown を正本（source of truth）とする。** git ではこちらを差分レビューする。
  xlsx はバイナリで差分が読めないため、あくまで共有・編集用のビューと位置づける。
- 変換は `md ⇄ ブロックモデル ⇄ xlsx` の 2 段。md と xlsx を直接変換しない。
- xlsx の **A 列（非表示）に各行の種別キー**が入っており、import はこのキー基準で復元する。
  → **Excel で行を増やすときは「既存行をコピーして貼り付け」**ること。非表示の A 列キーも
    複製され、import で正しく取り込める。素手で挿入した（キーの無い）行は段落として拾い、警告を出す。
- 往復対象はブロックモデルで表せる構造（見出し / 段落 / 箇条書き / 番号付き / チェックリスト /
  表 / コードブロック / 引用）のみ。**Excel 上で足した色・セル結合・別シート等は取り込まれない（ロッシー）。**

## セットアップ（初回のみ）

Python 3 と openpyxl が必要。未導入なら:

```sh
python3 -m pip install -r scripts/requirements.txt
```

## コマンド早見表

| やりたいこと | npm | 直接実行 | 入力 → 出力 |
|--------------|-----|----------|-------------|
| 文書を xlsx に出力 | `npm run docs:xlsx:export` | `python3 scripts/docs_xlsx.py export-docs` | `docs/{requirements,design}.md` → `.xlsx` |
| xlsx の編集を取り込む | `npm run docs:xlsx:import` | `python3 scripts/docs_xlsx.py import-docs` | `docs/{requirements,design}.xlsx` → `.md` |
| 空テンプレートを xlsx 化 | `npm run docs:xlsx:template` | `python3 scripts/docs_xlsx.py template` | `docs/templates/*_template.md` → `.xlsx` |
| 単一ファイルを変換 | — | `python3 scripts/docs_xlsx.py export <in.md> <out.xlsx>` / `import <in.xlsx> <out.md>` | 任意のパス |

> `export-docs` は `docs/requirements.md` / `docs/design.md` が無ければそのファイルをスキップする。
> まだ無い場合は先に `tdd-demo` skill（要件定義→設計）で生成しておく。

## 使い方の手順

### A. エクスポート（Markdown → xlsx）
1. セットアップ済みか確認（未なら上記 pip install）。
2. `npm run docs:xlsx:export` を実行。
3. 生成された `docs/requirements.xlsx` / `docs/design.xlsx` を報告する（存在した文書のみ出力される）。

### B. インポート（xlsx → Markdown、Excel の編集を反映）
1. ユーザーが Excel で編集した `docs/*.xlsx` がある前提。
2. `npm run docs:xlsx:import` を実行。
3. **必ず `git diff docs/*.md` を表示**し、取り込み結果をユーザーにレビューさせる
   （import は md を上書きするため）。`!` 付きの警告（キー無し行など）があれば併せて伝える。
4. 問題なければユーザーの指示でコミットする。

### C. 空テンプレートの xlsx 化
- `npm run docs:xlsx:template` で `docs/templates/*_template.xlsx` を生成。記入前の雛形が必要なときに使う。

## 守ること
- import は Markdown を上書きする破壊的操作。**実行後は必ず差分を提示**し、勝手にコミットしない。
- 「Markdown が正本」を崩さない。xlsx を直接ソースとして扱う運用を提案しない（既存 `tdd-demo` の md 駆動パイプラインと整合させる）。
- 変換ロジックを各所に再実装しない。変換は常に `scripts/docs_xlsx.py` を経由する。
- 出力の見た目を調整したいときは `scripts/docs_xlsx.py` のスタイル定義（`KEY_COL` 以降）を編集する。

## 完了の定義
- export: 対象 md に対応する xlsx が生成され、Excel で開いて崩れず読める。
- import: xlsx の編集が md に反映され、`git diff` でレビュー可能・警告が説明されている。
- 往復（export → 編集 → import）で、ブロックモデルで表せる内容が保持される。
