import { useState, useEffect, useCallback } from 'react'
import { Badge, Drawer, Button, Empty, Typography, Spin } from 'antd'
import {
  BellOutlined, CheckOutlined,
  InfoCircleOutlined, WarningOutlined, CloseCircleOutlined, CheckCircleOutlined,
} from '@ant-design/icons'
import api from '../services/api'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/es'
import { useNavigate } from 'react-router-dom'

dayjs.extend(relativeTime)
dayjs.locale('es')

const { Text } = Typography

// ── Iconos y colores por tipo de notificación (Fase 3) ──────────────────────
const TIPO_ICON = {
  // Tipos originales
  INFO:        <InfoCircleOutlined style={{ color: '#1890ff' }} />,
  ADVERTENCIA: <WarningOutlined style={{ color: '#faad14' }} />,
  ERROR:       <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
  EXITO:       <CheckCircleOutlined style={{ color: '#52c41a' }} />,
  
  // Tipos Fase 3: Sistema de notificaciones automáticas
  STOCK_BAJO:           <WarningOutlined style={{ color: '#fa8c16' }} />,
  STOCK_RECUPERADO:     <CheckCircleOutlined style={{ color: '#52c41a' }} />,
  DEVOLUCION_VENCIDA:   <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
  DEVOLUCION_PROXIMA:   <InfoCircleOutlined style={{ color: '#faad14' }} />,
  MATERIAL_EXTRAVIADO:  <CloseCircleOutlined style={{ color: '#cf1322' }} />,
}

export default function NotificacionesBandeja({ colorTextSecondary, bgTextHover }) {
  const [open, setOpen] = useState(false)
  const [list, setList] = useState([])
  const [noLeidas, setNoLeidas] = useState(0)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const fetchNoLeidas = useCallback(async () => {
    try {
      const r = await api.get('/notificaciones/no-leidas')
      setNoLeidas(r.data?.data?.total || 0)
    } catch { /* silent */ }
  }, [])

  const fetchLista = useCallback(async () => {
    setLoading(true)
    try {
      const r = await api.get('/notificaciones', { params: { limit: 30 } })
      setList(r.data?.data?.data || [])
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchNoLeidas()
    const iv = setInterval(fetchNoLeidas, 30000)
    return () => clearInterval(iv)
  }, [fetchNoLeidas])

  const abrir = () => { setOpen(true); fetchLista() }

  const marcarLeida = async (id) => {
    try {
      await api.patch(`/notificaciones/${id}`)
      setList(p => p.map(n => n.id === id ? { ...n, leida: true } : n))
      setNoLeidas(p => Math.max(0, p - 1))
    } catch { /* silent */ }
  }

  const marcarTodas = async () => {
    try {
      await api.patch('/notificaciones')
      setList(p => p.map(n => ({ ...n, leida: true })))
      setNoLeidas(0)
    } catch { /* silent */ }
  }

  const clickNotif = (n) => {
    if (!n.leida) marcarLeida(n.id)
    if (n.url) { setOpen(false); navigate(n.url) }
  }

  return (
    <>
      <Badge count={noLeidas} size="small" offset={[-2, 2]}>
        <div
          onClick={abrir}
          role="button"
          tabIndex={0}
          style={{
            cursor: 'pointer', padding: '6px 10px', borderRadius: 6,
            color: noLeidas ? '#faad14' : (colorTextSecondary || undefined),
            fontSize: 20, transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = bgTextHover || 'rgba(0,0,0,0.04)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          <BellOutlined />
        </div>
      </Badge>
      <Drawer
        title={`Notificaciones${noLeidas ? ` (${noLeidas} no leídas)` : ''}`}
        placement="right"
        width={400}
        open={open}
        onClose={() => setOpen(false)}
        extra={noLeidas > 0 ? (
          <Button size="small" icon={<CheckOutlined />} onClick={marcarTodas}>
            Todas leídas
          </Button>
        ) : null}
        footer={
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <Button
              type="link"
              onClick={() => {
                setOpen(false)
                navigate('/notificaciones')
              }}
            >
              Ver todas las notificaciones →
            </Button>
          </div>
        }
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
        ) : list.length === 0 ? (
          <Empty description="Sin notificaciones" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {list.map(n => (
              <div
                key={n.id}
                onClick={() => clickNotif(n)}
                role="button"
                tabIndex={0}
                style={{
                  cursor: n.url ? 'pointer' : 'default',
                  background: n.leida ? 'transparent' : '#e6f7ff',
                  padding: '12px 16px', borderRadius: 6,
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{ marginTop: 2, flexShrink: 0 }}>
                  {TIPO_ICON[n.tipo] || TIPO_ICON.INFO}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ fontSize: 13 }}>{n.titulo}</Text>
                    {!n.leida && (
                      <Button type="text" size="small" icon={<CheckOutlined />}
                        onClick={(e) => { e.stopPropagation(); marcarLeida(n.id) }}
                      />
                    )}
                  </div>
                  {n.mensaje && (
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 2 }}>
                      {n.mensaje}
                    </Text>
                  )}
                  <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
                    {dayjs(n.created_at).fromNow()}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        )}
      </Drawer>
    </>
  )
}
