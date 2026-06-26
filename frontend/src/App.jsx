import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Spin } from 'antd'
import { useAuth } from './context/AuthContext'
import MainLayout from './components/Layout/MainLayout'
import ErrorBoundary from './components/ErrorBoundary'
import { setNotificacionHandler } from './services/api'
import notify from './utils/notify'

const Login         = lazy(() => import('./pages/Login'))
const Dashboard     = lazy(() => import('./pages/Dashboard'))
const Categorias    = lazy(() => import('./pages/Categorias'))
const Productos     = lazy(() => import('./pages/Productos'))
const Movimientos   = lazy(() => import('./pages/Movimientos'))
const Historial     = lazy(() => import('./pages/Historial'))
const Reportes      = lazy(() => import('./pages/Reportes'))
const Usuarios      = lazy(() => import('./pages/Usuarios'))
const Auditoria     = lazy(() => import('./pages/Auditoria'))
const Ubicaciones   = lazy(() => import('./pages/Ubicaciones'))
const ImportarDatos = lazy(() => import('./pages/ImportarDatos'))
const GestionPermisos = lazy(() => import('./pages/GestionPermisos'))
const Notificaciones = lazy(() => import('./pages/Notificaciones'))

function FullPageSpinner({ text = 'Cargando...' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', gap: 16,
    }}>
      <Spin size="large" />
      <span style={{ color: '#888', fontSize: 14 }}>{text}</span>
    </div>
  )
}

function PrivateRoute({ children }) {
  const { usuario, cargando } = useAuth()
  if (cargando) return <FullPageSpinner text="Verificando sesión..." />
  return usuario ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { usuario, cargando } = useAuth()
  if (cargando) return <FullPageSpinner text="Verificando sesión..." />
  if (!usuario) return <Navigate to="/login" replace />
  return usuario.rol === 'admin' ? children : <Navigate to="/dashboard" replace />
}

function LoginRoute() {
  const { usuario, cargando } = useAuth()
  if (cargando) return <FullPageSpinner text="Verificando sesión..." />
  return usuario ? <Navigate to="/dashboard" replace /> : <Login />
}

setNotificacionHandler((tipo, titulo, descripcion) => {
  notify[tipo]?.(titulo, descripcion)
})

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={
          <Suspense fallback={<FullPageSpinner />}><LoginRoute /></Suspense>
        } />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Suspense fallback={<FullPageSpinner />}><Dashboard /></Suspense>} />
          <Route path="categorias" element={<Suspense fallback={<FullPageSpinner />}><Categorias /></Suspense>} />
          <Route path="productos" element={<Suspense fallback={<FullPageSpinner />}><Productos /></Suspense>} />
          <Route path="movimientos" element={<Suspense fallback={<FullPageSpinner />}><Movimientos /></Suspense>} />
          <Route path="historial" element={<Suspense fallback={<FullPageSpinner />}><Historial /></Suspense>} />
          <Route path="reportes" element={<Suspense fallback={<FullPageSpinner />}><Reportes /></Suspense>} />
          <Route path="ubicaciones" element={<Suspense fallback={<FullPageSpinner />}><Ubicaciones /></Suspense>} />
          <Route path="importar" element={<Suspense fallback={<FullPageSpinner />}><ImportarDatos /></Suspense>} />
          <Route path="notificaciones" element={<Suspense fallback={<FullPageSpinner />}><Notificaciones /></Suspense>} />
          <Route path="usuarios" element={
            <AdminRoute><Suspense fallback={<FullPageSpinner />}><Usuarios /></Suspense></AdminRoute>
          } />
          <Route path="auditoria" element={
            <AdminRoute><Suspense fallback={<FullPageSpinner />}><Auditoria /></Suspense></AdminRoute>
          } />
          <Route path="permisos" element={
            <AdminRoute><Suspense fallback={<FullPageSpinner />}><GestionPermisos /></Suspense></AdminRoute>
          } />
        </Route>
        <Route path="*" element={
          <PrivateRoute><Navigate to="/dashboard" replace /></PrivateRoute>
        } />
      </Routes>
    </ErrorBoundary>
  )
}
