/** Exporta un array de objetos a CSV y descarga el archivo */
export function exportarCsv(nombreArchivo, filas, columnas) {
  if (!filas?.length) return false

  const esc = (v) => {
    let s = v == null ? '' : String(v)
    // Prevenir CSV injection: si el valor empieza con =, +, -, @, anteponer \t
    if (/^[=+\-@]/.test(s)) {
      s = "'" + s
    }
    return `"${s.replace(/"/g, '""')}"`
  }

  const header = columnas.map((c) => esc(c.title)).join(',')
  const body = filas.map((fila) =>
    columnas.map((c) => esc(c.get ? c.get(fila) : fila[c.key])).join(',')
  ).join('\n')

  const blob = new Blob(['\uFEFF' + header + '\n' + body], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = nombreArchivo.endsWith('.csv') ? nombreArchivo : `${nombreArchivo}.csv`
  a.click()
  URL.revokeObjectURL(url)
  return true
}
