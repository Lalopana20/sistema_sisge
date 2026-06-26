import { Alert, Button } from 'antd'
import { ReloadOutlined, DisconnectOutlined } from '@ant-design/icons'
import { useBackendHealth } from '../hooks/useBackendHealth'

export default function BackendStatusBanner() {
  const { ok, cargando, reintentar } = useBackendHealth()

  if (cargando || ok) return null

  return (
    <Alert
      type="error"
      showIcon
      icon={<DisconnectOutlined />}
      style={{ marginBottom: 16, borderRadius: 8 }}
      message="Servidor desconectado"
      description="No hay conexión con la API (puerto 3000). Inicia el backend con: cd backend && npm run dev"
      action={
        <Button size="small" icon={<ReloadOutlined />} onClick={reintentar}>
          Reintentar
        </Button>
      }
    />
  )
}
