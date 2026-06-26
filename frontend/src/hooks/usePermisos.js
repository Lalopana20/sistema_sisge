import { useAuth } from '../context/AuthContext'

/**
 * Hook centralizado para verificar permisos en el frontend.
 *
 * Los permisos vienen del AuthContext, que los carga desde /auth/me o /auth/login.
 * Cada permiso tiene:
 *   - ver / crear / editar / eliminar: boolean
 *   - fuente: 'rol' | 'usuario'  (indica si es del rol base o un override individual)
 */
export function usePermisos() {
  const { usuario, permisos, tienePermiso, puedeVerModulo } = useAuth()

  const esAdmin      = usuario?.rol === 'admin'
  const esSupervisor = usuario?.rol === 'supervisor'
  const esOperario   = usuario?.rol === 'operario'

  // Helpers de acciones
  const puedeVer      = (modulo) => tienePermiso(modulo, 'ver')
  const puedeCrear    = (modulo) => tienePermiso(modulo, 'crear')
  const puedeEditar   = (modulo) => tienePermiso(modulo, 'editar')
  const puedeEliminar = (modulo) => tienePermiso(modulo, 'eliminar')

  /**
   * Indica si el permiso de un módulo viene de un override individual
   * (no del rol base). Útil para mostrar indicadores visuales.
   */
  const esPermisoPersonalizado = (modulo) => {
    return permisos[modulo]?.fuente === 'usuario'
  }

  /**
   * Devuelve el objeto de permisos completo de un módulo:
   * { ver, crear, editar, eliminar, fuente }
   */
  const permisosDeModulo = (modulo) => {
    if (!usuario) return { ver: false, crear: false, editar: false, eliminar: false, fuente: null }
    if (esAdmin)  return { ver: true,  crear: true,  editar: true,  eliminar: true,  fuente: 'admin' }
    return permisos[modulo] || { ver: false, crear: false, editar: false, eliminar: false, fuente: null }
  }

  return {
    usuario,
    permisos,
    esAdmin,
    esSupervisor,
    esOperario,
    tienePermiso,
    puedeVerModulo,
    puedeVer,
    puedeCrear,
    puedeEditar,
    puedeEliminar,
    esPermisoPersonalizado,
    permisosDeModulo,
  }
}
