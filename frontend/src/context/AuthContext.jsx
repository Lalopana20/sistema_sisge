import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario,         setUsuario]         = useState(null)
  const [permisos,        setPermisos]        = useState({})
  const [modulosVisibles, setModulosVisibles] = useState([])
  // cargando = true mientras se verifica la sesión existente al montar
  const [cargando, setCargando] = useState(true)

  // ── Limpiar sesión local ────────────────────────────────────────────────
  const limpiarSesion = useCallback(() => {
    setUsuario(null)
    setPermisos({})
    setModulosVisibles([])
    api.clearToken()
    // Marcar logout explícito en sessionStorage para que al refrescar
    // no se restaure la sesión desde la cookie httpOnly si el servidor
    // no pudo invalidarla (ej: error de red durante el logout)
    sessionStorage.setItem('sisge_logout', '1')
  }, [])

  // ── Aplicar datos de sesión al estado ───────────────────────────────────
  const aplicarSesion = useCallback((data) => {
    // data puede venir de /auth/login o de /auth/me
    // /auth/login devuelve { token, usuario, permisos, modulos_visibles }
    // /auth/me    devuelve { usuario, permisos, modulos_visibles }  (ya normalizado por interceptor)
    const u  = data.usuario  || data
    const p  = data.permisos || {}
    const mv = data.modulos_visibles || []

    if (data.token) {
      api.setToken(data.token)
    }
    // Al aplicar sesión (login), limpiar la marca de logout explícito
    sessionStorage.removeItem('sisge_logout')
    setUsuario(u)
    setPermisos(p)
    setModulosVisibles(mv)
  }, [])

  // ── Verificar sesión existente al montar (cookie httpOnly) ──────────────
  useEffect(() => {
    // Si el usuario hizo logout explícito en esta pestaña/sesión del navegador,
    // no restaurar la sesión desde la cookie aunque siga siendo válida en el servidor.
    // Esto cubre el caso de logout con error de red donde la cookie no pudo borrarse.
    if (sessionStorage.getItem('sisge_logout') === '1') {
      setCargando(false)
      return
    }

    api.get('/auth/me')
      .then(({ data }) => {
        aplicarSesion(data)
      })
      .catch((err) => {
        const status = err.response?.status
        if (status === 401) {
          limpiarSesion()
        }
      })
      .finally(() => setCargando(false))
  }, [aplicarSesion, limpiarSesion])

  // ── Login ───────────────────────────────────────────────────────────────
  const login = useCallback(async (username, password) => {
    // El interceptor normaliza la respuesta: data = { token, usuario, permisos, modulos_visibles }
    const { data } = await api.post('/auth/login', { username, password })
    aplicarSesion(data)
    return data.usuario || data
  }, [aplicarSesion])

  // ── Logout ──────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    // Limpiar sesión local inmediatamente — no esperar al servidor.
    // Esto garantiza que el estado de React quede limpio aunque haya error de red.
    limpiarSesion()

    // Intentar invalidar el token en el servidor en segundo plano.
    // Si falla (error de red, servidor caído), la cookie httpOnly persiste en el
    // navegador pero el token en memoria ya fue borrado. Al refrescar, /auth/me
    // con la cookie aún válida restauraría la sesión — para evitarlo, el backend
    // invalida el token en BD en cuanto recibe la petición (cuando llegue).
    // En el peor caso (sin conexión), el token expira solo en 8h (JWT_EXPIRES_IN).
    try {
      await api.post('/auth/logout')
    } catch {
      // Silencioso — la sesión local ya fue limpiada arriba
    }
  }, [limpiarSesion])

  // ── Helpers de permisos ─────────────────────────────────────────────────
  const tienePermiso = useCallback((modulo, accion = 'ver') => {
    if (!usuario) return false
    if (usuario.rol === 'admin') return true
    return !!permisos[modulo]?.[accion]
  }, [usuario, permisos])

  const puedeVerModulo = useCallback((modulo) => {
    if (!usuario) return false
    if (usuario.rol === 'admin') return true
    return modulosVisibles.includes(modulo)
  }, [usuario, modulosVisibles])

  return (
    <AuthContext.Provider value={{
      usuario,
      permisos,
      modulosVisibles,
      cargando,
      login,
      logout,
      tienePermiso,
      puedeVerModulo,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
