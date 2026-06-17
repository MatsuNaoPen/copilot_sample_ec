import { useEffect, useState } from 'react'

/** テーマモード: ライト固定 / ダーク固定 / OS追従 */
export type ThemeMode = 'light' | 'dark' | 'system'

/**
 * テーマモードを管理するカスタムフック。
 *
 * - 初期値は 'system'（OS の prefers-color-scheme に追従）
 * - 'light' / 'dark' を選択すると <html> に `data-theme` 属性を付与して固定
 * - 'system' を選択すると `data-theme` 属性を除去し、CSS メディアクエリに委譲
 */
export function useTheme(): [ThemeMode, (mode: ThemeMode) => void] {
  const [mode, setMode] = useState<ThemeMode>('system')

  useEffect(() => {
    const root = document.documentElement
    if (mode === 'system') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', mode)
    }
  }, [mode])

  return [mode, setMode]
}
