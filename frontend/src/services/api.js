import axios from 'axios'

let authToken = null
const listeners = []

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,   // envía la cookie sisge_token en cada petición
})

// ── Gestión del token en memoria ─────────────────────────────────────────────
api.setToken = (token) => {
  authToken = token
  listeners.forEach(fn => fn(token))
}

api.clearToken = () => {
  authToken = null
  listeners.forEach(fn => fn(null))
}

api.onTokenChange = (fn) => {
  listeners.push(fn)
  return () => {
    const idx = listeners.indexOf(fn)
    if (idx >= 0) listeners.splice(idx, 1)
  }
}

// ── Interceptor de request: adjunta Bearer si hay token en memoria ────────────
api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`
  }
  // Si no hay token en memoria, la cookie httpOnly se envía automáticamente
  // gracias a withCredentials: true — el backend la acepta igual
  return config
})

// ── Handler de notificaciones globales ───────────────────────────────────────
let mostrarNotificacion = null
export function setNotificacionHandler(handler) {
  mostrarNotificacion = handler
}

// ── Interceptor de response ───────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    // Normalizar formato { success: true, data: ... } → devolver data directamente
    if (
      response.data &&
      typeof response.data === 'object' &&
      'success' in response.data &&
      'data' in response.data
    ) {
      response.data = response.data.data
    }
    return response
  },
  (error) => {
    const status  = error.response?.status
    const url     = error.config?.url || ''

    // Rutas que NO deben disparar el redirect de sesión expirada
    // /auth/me se llama al montar AuthContext — si falla es sesión inexistente, no expirada
    const esRutaSilenciosa = (
      url.includes('/auth/login') ||
      url.includes('/auth/me')    ||
      url.includes('/auth/logout') ||
      url.includes('/dashboard')
    )

    if (error.message === 'Network Error') {
      if (mostrarNotificacion) {
        mostrarNotificacion(
          'error',
          'Sin conexión al servidor',
          'Verifica que el backend esté en ejecución (puerto 3000).',
        )
      }
    } else if (error.code === 'ECONNABORTED') {
      if (mostrarNotificacion) {
        mostrarNotificacion(
          'warning',
          'Tiempo de espera agotado',
          'La operación tardó demasiado. Intenta de nuevo.',
        )
      }
    } else if (status === 403) {
      if (mostrarNotificacion) {
        mostrarNotificacion(
          'warning',
          'Permiso denegado',
          'No tienes permisos para realizar esta acción.',
        )
      }
    } else if (status === 401 && !esRutaSilenciosa) {
      // Solo mostrar "sesión expirada" en rutas protegidas, no en el arranque
      api.clearToken()
      if (mostrarNotificacion) {
        mostrarNotificacion(
          'warning',
          'Sesión expirada',
          'Tu sesión ha expirado. Serás redirigido al login.',
        )
      }
      setTimeout(() => { window.location.href = '/login' }, 1200)
    }

    return Promise.reject(error)
  },
)

export default api
