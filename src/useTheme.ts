import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'ec-cart-theme'
const VALID_THEMES: readonly Theme[] = ['light', 'dark', 'system']

function loadTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved !== null && (VALID_THEMES as readonly string[]).includes(saved)) {
      return saved as Theme
    }
  } catch {
    // localStorage が使用できない環境ではシステム追従にフォールバック
  }
  return 'system'
}

export function useTheme(): [Theme, (theme: Theme) => void] {
  const [theme, setThemeState] = useState<Theme>(loadTheme)

  const setTheme = (newTheme: Theme): void => {
    setThemeState(newTheme)
    try {
      localStorage.setItem(STORAGE_KEY, newTheme)
    } catch {
      // localStorage が使用できない環境では保存をスキップ
    }
  }

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'light' || theme === 'dark') {
      root.dataset.theme = theme
    } else {
      delete root.dataset.theme
    }
  }, [theme])

  return [theme, setTheme]
}
