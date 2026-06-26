import * as XLSX from 'xlsx'

export function exportarExcel(nombreArchivo, filas, columnas) {
  if (!filas?.length) return false

  const data = filas.map((fila) => {
    const obj = {}
    columnas.forEach((col) => {
      obj[col.title] = col.get ? col.get(fila) : fila[col.key]
    })
    return obj
  })

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Datos')

  const nombre = nombreArchivo.endsWith('.xlsx') ? nombreArchivo : `${nombreArchivo}.xlsx`
  XLSX.writeFile(wb, nombre)
  return true
}
