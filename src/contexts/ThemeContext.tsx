/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'
export type FontScale = 'normal' | 'large' | 'extra-large'

interface ThemeContextType {
    theme: ThemeMode
    resolved: 'light' | 'dark'
    setTheme: (theme: ThemeMode) => void
    fontScale: FontScale
    setFontScale: (scale: FontScale) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_KEY = 'ro-naturalis-theme'
const FONT_KEY = 'ro-naturalis-font-scale'

const fontScaleMap: Record<FontScale, string> = {
    'normal': '100%',
    'large': '112%',
    'extra-large': '125%',
}

function getSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getStoredTheme(): ThemeMode {
    try {
        const stored = localStorage.getItem(THEME_KEY)
        if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
    } catch { /* SSR or privacy mode */ }
    return 'system'
}

function getStoredFontScale(): FontScale {
    try {
        const stored = localStorage.getItem(FONT_KEY)
        if (stored === 'normal' || stored === 'large' || stored === 'extra-large') return stored
    } catch { /* privacy mode */ }
    return 'normal'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<ThemeMode>(getStoredTheme)
    const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(getSystemTheme)
    const [fontScale, setFontScaleState] = useState<FontScale>(getStoredFontScale)

    const resolved = theme === 'system' ? systemTheme : theme

    // Listen for system theme changes
    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)')
        const handler = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? 'dark' : 'light')
        mq.addEventListener('change', handler)
        return () => mq.removeEventListener('change', handler)
    }, [])

    // Apply theme class to document
    useEffect(() => {
        const root = document.documentElement
        if (resolved === 'dark') {
            root.classList.add('dark')
        } else {
            root.classList.remove('dark')
        }
    }, [resolved])

    // Apply font scale
    useEffect(() => {
        document.documentElement.style.fontSize = fontScaleMap[fontScale]
    }, [fontScale])

    function setTheme(newTheme: ThemeMode) {
        setThemeState(newTheme)
        try { localStorage.setItem(THEME_KEY, newTheme) } catch { /* */ }
    }

    function setFontScale(scale: FontScale) {
        setFontScaleState(scale)
        try { localStorage.setItem(FONT_KEY, scale) } catch { /* */ }
    }

    return (
        <ThemeContext.Provider value={{ theme, resolved, setTheme, fontScale, setFontScale }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (!context) throw new Error('useTheme deve ser usado dentro de um ThemeProvider')
    return context
}
