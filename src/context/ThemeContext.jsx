import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('nestly-theme') || 'system'
  })

  const setTheme = (newTheme) => {
    setThemeState(newTheme)
    localStorage.setItem('nestly-theme', newTheme)
  }

  useEffect(() => {
    const root = document.documentElement
    
    const applySystemTheme = () => {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      if (mediaQuery.matches) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }

    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      // theme === 'system'
      applySystemTheme()
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const listener = (e) => {
        if (e.matches) {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }
      }
      
      mediaQuery.addEventListener('change', listener)
      return () => {
        mediaQuery.removeEventListener('change', listener)
      }
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
