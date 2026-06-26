import { useState, useEffect, useCallback } from 'react'
import {
  Card, Table, Button, Space, Tag, Typography, Tabs, Select, DatePicker,
  Empty, Spin, Tooltip, message,
} from 'antd'
import {
  CheckOutlined, ReloadOutlined, FilterOutlined,
  InfoCircleOutlined, WarningOutlined, CloseCircleOutlined, CheckCircleOutlined,
} from '@ant-design/icons'
import api from '../services/api'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/es'
import { useNavigate } from 'react-router-dom'

dayjs.extend(relativeTime)
dayjs.locale('es')

const { Title, Text } = Typography
const { RangePicker } = DatePicker

// ── Iconos y colores por tipo ────────────────────────────────────────────────
const TIPO_CONFIG = {
  INFO: {
    icon:  <InfoCircleOutlined />,
    color: 'blue',
    label: 'Información',
  },
  ADVERTENCIA: {
    icon:  <WarningOutlined />,
    color: 'orange',
    label: 'Advertencia',
  },
  ERROR: {
    icon:  <CloseCircleOutlined />,
    color: 'red',
    label: 'Error',
  },
  EXITO: {
    icon:  <CheckCircleOutlined />,
    color: 'green',
    label: 'Éxito',
  },
  STOCK_BAJO: {
    icon:  <WarningOutlined />,
    color: 'orange',
    label: 'Stock Bajo',
  },
  STOCK_RECUPERADO: {
    icon:  <CheckCircleOutlined />,
    color: 'green',
    label: 'Stock Recuperado',
  },
  DEVOLUCION_VENCIDA: {
    icon:  <CloseCircleOutlined />,
    color: 'red',
    label: 'Devolución Vencida',
  },
  DEVOLUCION_PROXIMA: {
    icon:  <InfoCircleOutlined />,
    color: 'orange',
    label: 'Devolución Próxima',
  },
  MATERIAL_EXTRAVIADO: {
    icon:  <CloseCircleOutlined />,
    color: 'volcano',
    label: 'Material Extraviado',
  },
}

export default function Notificaciones() {
  const [loading, setLoading] = useState(false)
  const [notificaciones, setNotificaciones] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 })
  const [tabActivo, setTabActivo] = useState('todas')
  const [filtroTipo, setFiltroTipo] = useState(null)
  const [filtroFecha, setFiltroFecha] = useState(null)
  const [noLeidas, setNoLeidas] = useState(0)
  const navigate = useNavigate()

  // ── Fetch notificaciones ─────────────────────────────────────────────────
  const fetchNotificaciones = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = {
        page,
        limit: pagination.pageSize,
      }

      // Filtro por tipo
      if (filtroTipo) {
        params.tipo = filtroTipo
      }

      // Filtro por fecha (si se implementa en el backend)
      if (filtroFecha && filtroFecha.length === 2) {
        params.fecha_desde = filtroFecha[0].format('YYYY-MM-DD')
        params.fecha_hasta = filtroFecha[1].format('YYYY-MM-DD')
      }

      const response = await api.get('/notificaciones', { params })
      const data = response.data || response

      setNotificaciones(data.data || [])
      setPagination((prev) => ({
        ...prev,
        current: data.page || page,
        total: data.total || 0,
      }))
    } catch (error) {
      message.error('Error al cargar notificaciones')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [pagination.pageSize, filtroTipo, filtroFecha])

  // ── Fetch contador no leídas ────────────────────────────────────────────
  const fetchNoLeidas = useCallback(async () => {
    try {
      const response = await api.get('/notificaciones/no-leidas')
      const data = response.data || response
      setNoLeidas(data.total || 0)
    } catch (error) {
      console.error('Error al obtener contador:', error)
    }
  }, [])

  // ── Cargar datos al montar y al cambiar filtros ─────────────────────────
  useEffect(() => {
    fetchNotificaciones(1)
    fetchNoLeidas()
  }, [filtroTipo, filtroFecha])

  // ── Marcar como leída ────────────────────────────────────────────────────
  const marcarLeida = async (id) => {
    try {
      await api.patch(`/notificaciones/${id}`)
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      )
      setNoLeidas((prev) => Math.max(0, prev - 1))
      message.success('Notificación marcada como leída')
    } catch (error) {
      message.error('Error al marcar como leída')
      console.error(error)
    }
  }

  // ── Marcar todas como leídas ────────────────────────────────────────────
  const marcarTodasLeidas = async () => {
    try {
      await api.patch('/notificaciones')
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })))
      setNoLeidas(0)
      message.success('Todas las notificaciones marcadas como leídas')
    } catch (error) {
      message.error('Error al marcar todas como leídas')
      console.error(error)
    }
  }

  // ── Click en notificación ────────────────────────────────────────────────
  const handleClick = async (record) => {
    // Marcar como leída si no lo está
    if (!record.leida) {
      await marcarLeida(record.id)
    }

    // Navegar a la URL si existe
    if (record.url) {
      navigate(record.url)
    }
  }

  // ── Filtrar por tab (todas / no leídas) ─────────────────────────────────
  const notificacionesFiltradas =
    tabActivo === 'no-leidas'
      ? notificaciones.filter((n) => !n.leida)
      : notificaciones

  // ── Columnas de la tabla ────────────────────────────────────────────────
  const columns = [
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      width: 180,
      render: (tipo) => {
        const config = TIPO_CONFIG[tipo] || TIPO_CONFIG.INFO
        return (
          <Tag icon={config.icon} color={config.color}>
            {config.label}
          </Tag>
        )
      },
    },
    {
      title: 'Notificación',
      key: 'contenido',
      render: (_, record) => (
        <div>
          <Text
            strong
            style={{
              fontSize: 14,
              fontWeight: record.leida ? 'normal' : 'bold',
              cursor: record.url ? 'pointer' : 'default',
            }}
          >
            {record.titulo}
          </Text>
          {record.mensaje && (
            <div style={{ marginTop: 4 }}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {record.mensaje}
              </Text>
            </div>
          )}
          <div style={{ marginTop: 6 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {dayjs(record.created_at).format('DD/MM/YYYY HH:mm')} •{' '}
              {dayjs(record.created_at).fromNow()}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'leida',
      key: 'leida',
      width: 100,
      align: 'center',
      render: (leida) =>
        leida ? (
          <Tag color="default">Leída</Tag>
        ) : (
          <Tag color="blue">No leída</Tag>
        ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Space>
          {!record.leida && (
            <Tooltip title="Marcar como leída">
              <Button
                type="text"
                size="small"
                icon={<CheckOutlined />}
                onClick={(e) => {
                  e.stopPropagation()
                  marcarLeida(record.id)
                }}
              />
            </Tooltip>
          )}
          {record.url && (
            <Tooltip title="Ver detalles">
              <Button
                type="link"
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  handleClick(record)
                }}
              >
                Ver
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ]

  // ── Opciones del filtro de tipo ─────────────────────────────────────────
  const tiposDisponibles = Object.keys(TIPO_CONFIG).map((key) => ({
    value: key,
    label: TIPO_CONFIG[key].label,
  }))

  return (
    <Card
      title={
        <Space>
          <Title level={4} style={{ margin: 0 }}>
            Notificaciones
          </Title>
          {noLeidas > 0 && (
            <Tag color="blue">{noLeidas} no leída{noLeidas !== 1 ? 's' : ''}</Tag>
          )}
        </Space>
      }
      extra={
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchNotificaciones(pagination.current)}
            loading={loading}
          >
            Actualizar
          </Button>
          {noLeidas > 0 && (
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={marcarTodasLeidas}
            >
              Marcar todas como leídas
            </Button>
          )}
        </Space>
      }
    >
      {/* ── Tabs: Todas / No leídas ───────────────────────────────────────── */}
      <Tabs
        activeKey={tabActivo}
        onChange={setTabActivo}
        items={[
          {
            key: 'todas',
            label: `Todas (${notificaciones.length})`,
          },
          {
            key: 'no-leidas',
            label: `No leídas (${noLeidas})`,
          },
        ]}
      />

      {/* ── Filtros ────────────────────────────────────────────────────────── */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Text type="secondary">
          <FilterOutlined /> Filtros:
        </Text>
        <Select
          placeholder="Tipo de notificación"
          style={{ width: 200 }}
          allowClear
          value={filtroTipo}
          onChange={setFiltroTipo}
          options={tiposDisponibles}
        />
        <RangePicker
          placeholder={['Fecha desde', 'Fecha hasta']}
          format="DD/MM/YYYY"
          value={filtroFecha}
          onChange={setFiltroFecha}
        />
      </Space>

      {/* ── Tabla de notificaciones ─────────────────────────────────────────── */}
      <Table
        columns={columns}
        dataSource={notificacionesFiltradas}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} notificación${total !== 1 ? 'es' : ''}`,
        }}
        onChange={(pag) => {
          setPagination(pag)
          fetchNotificaciones(pag.current)
        }}
        onRow={(record) => ({
          onClick: () => handleClick(record),
          style: {
            cursor: record.url ? 'pointer' : 'default',
            background: record.leida ? 'transparent' : '#e6f7ff',
          },
        })}
        locale={{
          emptyText: (
            <Empty
              description={
                tabActivo === 'no-leidas'
                  ? 'No tienes notificaciones sin leer'
                  : 'No hay notificaciones'
              }
            />
          ),
        }}
      />
    </Card>
  )
}
