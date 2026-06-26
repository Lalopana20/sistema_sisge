import { useEffect, useState, useCallback } from 'react'
import api from '../services/api'

export function useBackendHealth(intervaloMs = 60000) {
  const [ok, setOk]             = useState(true)
  const [cargando, setCargando] = useState(true)

  const verificar = useCallback(async () => {
    try {
      await api.get('/health', { timeout: 5000 })
      setOk(true)
    } catch {
      setOk(false)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    verificar()
    const id = setInterval(verificar, intervaloMs)
    return () => clearInterval(id)
  }, [verificar, intervaloMs])

  return { ok, cargando, reintentar: verificar }
}
