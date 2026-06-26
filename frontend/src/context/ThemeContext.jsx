import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { ConfigProvider, theme, App as AntApp } from 'antd'
import esES from 'antd/locale/es_ES'

// ── Valores por defecto ───────────────────────────────────────────────────────
const DEFAULTS = {
  isDark:           false,
  colorPrimary:     '#1890ff',
  siderColor:       '#001529',       // color de fondo del sidebar
  borderRadius:     8,               // radio de bordes en px
  fontSize:         14,              // tamaño de fuente base
  compactMode:      false,           // layout compacto
  loginBg:          'gradient',      // 'gradient' | 'solid' | 'image'
  loginBgColor:     '#001529',       // color sólido del login
  loginBgImage:     '',              // URL de imagen de fondo del login
  logoUrl:          '',              // URL de logo personalizado (vacío = logo por defecto)
  siderWidth:       220,             // ancho del sidebar
  animaciones:      true,            // transiciones y animaciones
}

const STORAGE_KEY = 'sisge_apariencia'

const ThemeContext = createContext(null)

// ── Helpers ───────────────────────────────────────────────────────────────────
const cargarGuardado = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS }
  } catch {
    return { ...DEFAULTS }
  }
}

const guardar = (config) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

// Genera el gradiente del login según la configuración
export const loginBgStyle = (config) => {
  if (config.loginBg === 'image' && config.loginBgImage) {
    return {
      backgroundImage: `url(${config.loginBgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }
  if (config.loginBg === 'solid') {
    return { background: config.loginBgColor }
  }
  // gradient (default) - usa la imagen de fondo del CSS
  // Retornamos un objeto vacío para que el CSS de index.css tome control
  return {}
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function ThemeProvider({ children }) {
  const [config, setConfig] = useState(cargarGuardado)
  const [pulse,  setPulse]  = useState(false)

  // Sincronizar data-theme y CSS vars al cambiar config
  useEffect(() => {
    const mode = config.isDark ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', mode)
    document.documentElement.style.setProperty('--sisge-primary',      config.colorPrimary)
    document.documentElement.style.setProperty('--sisge-sider-bg',     config.siderColor)
    document.documentElement.style.setProperty('--sisge-border-radius',`${config.borderRadius}px`)
    document.documentElement.style.setProperty('--sisge-font-size',    `${config.fontSize}px`)
    document.documentElement.style.setProperty(
      '--sisge-login-gradient',
      loginBgStyle(config).background || ''
    )
    guardar(config)
  }, [config])

  const actualizar = useCallback((cambios) => {
    setConfig((prev) => ({ ...prev, ...cambios }))
  }, [])

  const toggleTheme = useCallback(() => {
    setPulse(true)
    setTimeout(() => setPulse(false), 450)
    setConfig((prev) => ({ ...prev, isDark: !prev.isDark }))
  }, [])

  const resetear = useCallback(() => {
    setConfig({ ...DEFAULTS })
  }, [])

  // ── Tokens de Ant Design derivados de la config ───────────────────────────
  const antTheme = {
    algorithm: config.isDark
      ? (config.compactMode
          ? [theme.darkAlgorithm, theme.compactAlgorithm]
          : theme.darkAlgorithm)
      : (config.compactMode
          ? [theme.defaultAlgorithm, theme.compactAlgorithm]
          : theme.defaultAlgorithm),
    token: {
      colorPrimary:    config.colorPrimary,
      borderRadius:    config.borderRadius,
      fontSize:        config.fontSize,
      colorBgContainer: config.isDark ? '#141414' : '#ffffff',
      colorBgLayout:    config.isDark ? '#0a0a0a' : '#f0f2f5',
      motionDurationMid: config.animaciones ? '0.2s' : '0s',
      motionDurationSlow: config.animaciones ? '0.3s' : '0s',
    },
    components: {
      Layout: {
        headerBg: config.isDark ? '#141414' : '#ffffff',
        bodyBg:   config.isDark ? '#0a0a0a' : '#f0f2f5',
        siderBg:  config.siderColor,
      },
      Menu: {
        darkItemBg:         config.siderColor,
        darkSubMenuItemBg:  config.siderColor,
        darkItemSelectedBg: config.colorPrimary,
      },
    },
  }

  return (
    <ThemeContext.Provider value={{
      config, actualizar, toggleTheme, resetear, pulse,
      // Atajos de compatibilidad con código existente
      isDark: config.isDark,
    }}>
      <ConfigProvider locale={esES} theme={antTheme}>
        <AntApp>{children}</AntApp>
      </ConfigProvider>
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme debe usarse dentro de ThemeProvider')
  return ctx
}
