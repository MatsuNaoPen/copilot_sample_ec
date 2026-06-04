#!/usr/bin/env bash
# デモを「開始状態」（demo-start ブランチのクリーンな状態）に戻す。
#
# - デモ中に生成したファイル（docs/requirements.md, docs/design.md,
#   src/pricing.ts, src/pricing.test.ts など）を削除する。
# - App.tsx などトラッキング済みファイルへの変更を破棄する。
# - node_modules / dist など .gitignore 対象は削除しない（npm install のやり直し不要）。
#
# 使い方:
#   bash scripts/reset-demo.sh        # 確認プロンプトあり
#   bash scripts/reset-demo.sh -y     # 確認なしで即リセット（デモ向け）
set -euo pipefail

# スクリプトの場所に関係なくリポジトリルートで実行する。
cd "$(dirname "$0")/.."

if [[ "${1:-}" != "-y" ]]; then
  echo "⚠️  demo-start のクリーンな状態に戻します。"
  echo "    デモ中に生成・変更したファイルは破棄されます（node_modules は保持）。"
  read -r -p "続行しますか? [y/N] " ans
  if [[ "$ans" != "y" && "$ans" != "Y" ]]; then
    echo "中止しました。"
    exit 0
  fi
fi

# 変更を破棄して demo-start へ切り替え、追跡外の生成物を掃除する。
git switch --discard-changes demo-start
git clean -fd

echo "✅ demo-start のクリーンな状態にリセットしました。"
echo "   起動: npm run dev"
