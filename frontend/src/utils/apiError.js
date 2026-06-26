function sanitizar(texto) {
  if (typeof texto !== 'string') return String(texto || '')
  return texto.replace(/<[^>]*>/g, '').slice(0, 500)
}

export function getApiError(err, fallback = 'Error en la operación') {
  const data = err?.response?.data
  if (data?.error) return sanitizar(data.error)
  if (data?.errores?.length) return sanitizar(data.errores.join(', '))
  if (err?.message === 'Network Error') {
    return 'No se pudo conectar al servidor. Verifica que el backend esté en ejecución (puerto 3000).'
  }
  return fallback
}
