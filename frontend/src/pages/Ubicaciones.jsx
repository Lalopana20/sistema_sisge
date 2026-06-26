import { useEffect, useState, useCallback } from 'react'
import {
  Table, Tag, Button, Space, Select, Card, Typography,
  Modal, Form, Input, DatePicker, Tooltip, Alert,
  Descriptions, Divider,
} from 'antd'
import FormModal from '../components/FormModal'
import {
  EnvironmentOutlined, CheckCircleOutlined, EditOutlined,
  ExclamationCircleOutlined, ClockCircleOutlined, SearchOutlined,
  ClearOutlined, EyeOutlined, DownloadOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import api from '../services/api'
import { getApiError } from '../utils/apiError'
import { exportarExcel } from '../utils/exportExcel'
import notify from '../utils/notify'
import { useAuth } from '../context/AuthContext'
import BackendStatusBanner from '../components/BackendStatusBanner'

const { Title, Text } = Typography

const COLS_EXCEL_UBI = [
  { title: '#', key: 'id' },
  { title: 'Producto', key: 'producto' },
  { title: 'Categoría', key: 'categoria' },
  { title: 'Técnico', key: 'tecnico' },
  { title: 'Ubicación', key: 'ubicacion' },
  { title: 'Motivo', key: 'motivo' },
  { title: 'Estado', key: 'estado' },
  { title: 'Días fuera', key: 'dias_fuera', get: (r) => r.dias_fuera || 0 },
  { title: 'Dev. esperada', key: 'fecha_esperada_dev', get: (r) => r.fecha_esperada_dev || '' },
  { title: 'Salida', key: 'movimiento_fecha', get: (r) => r.movimiento_fecha || '' },
]

// ── Configuración de estados ──────────────────────────────────────────────────
const ESTADO_CONFIG = {
  EN_USO:        { color: 'blue',    label: 'En uso',           icon: <ClockCircleOutlined /> },
  EN_OBRA:       { color: 'cyan',    label: 'En obra',          icon: <EnvironmentOutlined /> },
  PENDIENTE_DEV: { color: 'orange',  label: 'Pendiente dev.',   icon: <ExclamationCircleOutlined /> },
  EXTRAVIADO:    { color: 'red',     label: 'Extraviado',       icon: <ExclamationCircleOutlined /> },
  DEVUELTO:      { color: 'green',   label: 'Devuelto',         icon: <CheckCircleOutlined /> },
}

const EstadoTag = ({ estado }) => {
  const cfg = ESTADO_CONFIG[estado] || { color: 'default', label: estado }
  return <Tag color={cfg.color} icon={cfg.icon}>{cfg.label}</Tag>
}

const PAGINACION = {
  pageSize: 15,
  showSizeChanger: true,
  showTotal: (t) => `${t} registros`,
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function Ubicaciones() {
  const { usuario, tienePermiso } = useAuth()
  const esAdmin     = ['admin', 'supervisor'].includes(usuario?.rol)

  const [data,      setData]      = useState([])
  const [tecnicos,  setTecnicos]  = useState([])
  const [loading,   setLoading]   = useState(false)
  const [filtros,   setFiltros]   = useState({})

  // Modales
  const [modalDetalle,  setModalDetalle]  = useState(false)
  const [modalEditar,   setModalEditar]   = useState(false)
  const [modalCerrar,   setModalCerrar]   = useState(false)
  const [seleccionado,  setSeleccionado]  = useState(null)

  const [formEditar] = Form.useForm()
  const [formCerrar] = Form.useForm()

  // ── Carga de datos ──────────────────────────────────────────────────────────
  const cargar = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const r = await api.get('/ubicaciones', { params })
      setData(r.data)
    } catch (err) {
      notify.msg.error(getApiError(err, 'Error al cargar ubicaciones'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargar()
    api.get('/usuarios/operarios')
      .then((r) => setTecnicos(r.data))
      .catch(() => {})
  }, [cargar, tienePermiso])

  // ── Acciones ────────────────────────────────────────────────────────────────
  const abrirDetalle = (registro) => {
    setSeleccionado(registro)
    setModalDetalle(true)
  }

  const abrirEditar = (registro) => {
    setSeleccionado(registro)
    formEditar.setFieldsValue({
      ubicacion:          registro.ubicacion,
      motivo:             registro.motivo,
      descripcion:        registro.descripcion,
      estado:             registro.estado,
      fecha_esperada_dev: registro.fecha_esperada_dev
        ? dayjs(registro.fecha_esperada_dev)
        : null,
    })
    setModalEditar(true)
  }

  const abrirCerrar = (registro) => {
    setSeleccionado(registro)
    formCerrar.resetFields()
    setModalCerrar(true)
  }

  const guardarEdicion = async (valores) => {
    const payload = {
      ...valores,
      fecha_esperada_dev: valores.fecha_esperada_dev
        ? valores.fecha_esperada_dev.format('YYYY-MM-DD')
        : null,
    }
    await api.put(`/ubicaciones/${seleccionado.id}`, payload)
    notify.success('Ubicación actualizada', 'Los datos fueron guardados correctamente')
    cargar(filtros)
  }

  const confirmarCierre = async (valores) => {
    await api.patch(`/ubicaciones/${seleccionado.id}/cerrar`, valores)
    notify.success('Material devuelto', `"${seleccionado.producto}" marcado como devuelto`)
    cargar(filtros)
  }

  const limpiar = () => {
    setFiltros({})
    cargar({})
  }

  // ── Columnas ────────────────────────────────────────────────────────────────
  const columnas = [
    {
      title: 'Producto', dataIndex: 'producto', key: 'producto',
      render: (v, r) => (
        <Space direction="vertical" size={0}>
          <Text strong>{v}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{r.categoria}</Text>
        </Space>
      ),
    },
    {
      title: 'Técnico', dataIndex: 'tecnico', key: 'tecnico',
      render: (v) => <Tag color="purple">{v}</Tag>,
    },
    {
      title: 'Ubicación', dataIndex: 'ubicacion', key: 'ubicacion',
      render: (v) => (
        <Space>
          <EnvironmentOutlined style={{ color: '#1890ff' }} />
          {v}
        </Space>
      ),
    },
    { title: 'Motivo', dataIndex: 'motivo', key: 'motivo', ellipsis: true },
    {
      title: 'Estado', dataIndex: 'estado', key: 'estado',
      render: (v) => <EstadoTag estado={v} />,
      filters: Object.entries(ESTADO_CONFIG).map(([k, v]) => ({ text: v.label, value: k })),
      onFilter: (value, record) => record.estado === value,
    },
    {
      title: 'Días fuera', dataIndex: 'dias_fuera', key: 'dias_fuera',
      align: 'center', width: 90,
      render: (v, r) => {
        if (r.estado === 'DEVUELTO') return <Text type="secondary">—</Text>
        const color = v >= 14 ? '#ff4d4f' : v >= 7 ? '#fa8c16' : '#52c41a'
        return <Text strong style={{ color }}>{v}d</Text>
      },
      sorter: (a, b) => (b.dias_fuera || 0) - (a.dias_fuera || 0),
    },
    {
      title: 'Dev. esperada', dataIndex: 'fecha_esperada_dev', key: 'fecha_esperada_dev',
      width: 120,
      render: (v, r) => {
        if (!v || r.estado === 'DEVUELTO') return <Text type="secondary">—</Text>
        const vencida = dayjs(v).isBefore(dayjs(), 'day')
        return (
          <Text style={{ color: vencida ? '#ff4d4f' : undefined }}>
            {vencida && <ExclamationCircleOutlined style={{ marginRight: 4 }} />}
            {dayjs(v).format('DD/MM/YYYY')}
          </Text>
        )
      },
    },
    {
      title: 'Salida', dataIndex: 'movimiento_fecha', key: 'movimiento_fecha', width: 120,
      render: (v) => dayjs(v).format('DD/MM/YY HH:mm'),
    },
    {
      title: 'Acciones', key: 'acciones', width: 130,
      render: (_, r) => (
        <Space>
          <Tooltip title="Ver detalle">
            <Button size="small" icon={<EyeOutlined />} onClick={() => abrirDetalle(r)} />
          </Tooltip>
          {r.estado !== 'DEVUELTO' && (
            <>
              <Tooltip title="Editar ubicación">
                <Button size="small" icon={<EditOutlined />} onClick={() => abrirEditar(r)} />
              </Tooltip>
              <Tooltip title="Marcar como devuelto">
                <Button
                  size="small"
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => abrirCerrar(r)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ]

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div>
      <BackendStatusBanner />
      <Title level={3} style={{ marginBottom: 16 }}>
        <EnvironmentOutlined /> Ubicaciones de material
      </Title>

      {/* Filtros */}
      <Card style={{ marginBottom: 16, borderRadius: 8 }}>
        <Space wrap>
          <Select
            placeholder="Estado"
            allowClear
            style={{ width: 160 }}
            onChange={(v) => setFiltros((f) => ({ ...f, estado: v }))}
          >
            {Object.entries(ESTADO_CONFIG).map(([k, v]) => (
              <Select.Option key={k} value={k}>{v.label}</Select.Option>
            ))}
          </Select>

          {esAdmin && (
            <Select
              placeholder="Técnico"
              allowClear
              style={{ width: 160 }}
              onChange={(v) => setFiltros((f) => ({ ...f, id_tecnico: v }))}
            >
              {tecnicos.map((t) => (
                <Select.Option key={t.id} value={t.id}>{t.nombre}</Select.Option>
              ))}
            </Select>
          )}

          <Select
            placeholder="Solo vencidas"
            allowClear
            style={{ width: 150 }}
            onChange={(v) => setFiltros((f) => ({ ...f, vencidas: v }))}
          >
            <Select.Option value="true">Fecha vencida</Select.Option>
          </Select>

          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => cargar(filtros)}
          >
            Filtrar
          </Button>
          <Button icon={<ClearOutlined />} onClick={limpiar}>Limpiar</Button>
          <Button icon={<DownloadOutlined />}
                  onClick={() => {
                    if (!exportarExcel('ubicaciones', data, COLS_EXCEL_UBI))
                      notify.msg.warning('Sin datos para exportar')
                  }}>
            Exportar Excel
          </Button>
        </Space>
      </Card>

      <Table
        dataSource={data}
        columns={columnas}
        rowKey="id"
        loading={loading}
        bordered
        size="small"
        scroll={{ x: 1100 }}
        pagination={PAGINACION}
        rowClassName={(r) => {
          if (r.estado === 'EXTRAVIADO') return 'ant-table-row-danger'
          if (r.estado === 'PENDIENTE_DEV' || r.dias_fuera >= 7) return 'ant-table-row-warning'
          return ''
        }}
      />

      {/* ── Modal: Detalle ──────────────────────────────────────────────────── */}
      <Modal
        title={
          <Space>
            <EnvironmentOutlined />
            Detalle de ubicación
          </Space>
        }
        open={modalDetalle}
        onCancel={() => setModalDetalle(false)}
        footer={[
          <Button key="close" onClick={() => setModalDetalle(false)}>Cerrar</Button>,
          seleccionado?.estado !== 'DEVUELTO' && (
            <Button
              key="edit"
              icon={<EditOutlined />}
              onClick={() => { setModalDetalle(false); abrirEditar(seleccionado) }}
            >
              Editar
            </Button>
          ),
          seleccionado?.estado !== 'DEVUELTO' && (
            <Button
              key="close-ub"
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => { setModalDetalle(false); abrirCerrar(seleccionado) }}
            >
              Marcar devuelto
            </Button>
          ),
        ].filter(Boolean)}
        width={560}
      >
        {seleccionado && (
          <Descriptions column={1} bordered size="small" style={{ marginTop: 16 }}>
            <Descriptions.Item label="Producto">
              <Text strong>{seleccionado.producto}</Text>
              <Text type="secondary"> — {seleccionado.categoria}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Técnico">
              <Tag color="purple">{seleccionado.tecnico}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Estado">
              <EstadoTag estado={seleccionado.estado} />
            </Descriptions.Item>
            <Descriptions.Item label="Ubicación">
              <EnvironmentOutlined style={{ color: '#1890ff', marginRight: 6 }} />
              {seleccionado.ubicacion}
            </Descriptions.Item>
            <Descriptions.Item label="Motivo">{seleccionado.motivo}</Descriptions.Item>
            {seleccionado.descripcion && (
              <Descriptions.Item label="Descripción">{seleccionado.descripcion}</Descriptions.Item>
            )}
            <Descriptions.Item label="Cantidad salida">
              {seleccionado.movimiento_cantidad}
            </Descriptions.Item>
            <Descriptions.Item label="Fecha de salida">
              {dayjs(seleccionado.movimiento_fecha).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="Días fuera">
              {seleccionado.estado === 'DEVUELTO'
                ? <Tag color="green">Devuelto</Tag>
                : <Text strong style={{ color: seleccionado.dias_fuera >= 7 ? '#ff4d4f' : '#52c41a' }}>
                    {seleccionado.dias_fuera} días
                  </Text>
              }
            </Descriptions.Item>
            {seleccionado.fecha_esperada_dev && (
              <Descriptions.Item label="Devolución esperada">
                {dayjs(seleccionado.fecha_esperada_dev).format('DD/MM/YYYY')}
              </Descriptions.Item>
            )}
            {seleccionado.id_orden_trabajo && (
              <Descriptions.Item label="Orden de trabajo">
                {seleccionado.id_orden_trabajo}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Reportado por">{seleccionado.reportado_por}</Descriptions.Item>
            {seleccionado.estado === 'DEVUELTO' && (
              <>
                <Divider style={{ margin: '8px 0' }} />
                <Descriptions.Item label="Cerrado por">{seleccionado.cerrado_por_nombre}</Descriptions.Item>
                <Descriptions.Item label="Fecha devolución">
                  {seleccionado.fecha_devolucion
                    ? dayjs(seleccionado.fecha_devolucion).format('DD/MM/YYYY HH:mm')
                    : '—'}
                </Descriptions.Item>
                {seleccionado.nota_cierre && (
                  <Descriptions.Item label="Nota de cierre">{seleccionado.nota_cierre}</Descriptions.Item>
                )}
              </>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* ── Modal: Editar ubicación ─────────────────────────────────────────── */}
      <FormModal
        title={<Space><EditOutlined /> Editar ubicación — {seleccionado?.producto}</Space>}
        open={modalEditar}
        onCancel={() => setModalEditar(false)}
        onFinish={guardarEdicion}
        form={formEditar}
        okText="Guardar cambios"
        width={520}
      >
        <Form.Item
          name="ubicacion"
          label="Ubicación actual"
          rules={[{ required: true, message: 'Indica dónde está el material' }]}
        >
          <Input
            prefix={<EnvironmentOutlined />}
            placeholder="Ej: Obra Av. Principal #45, Taller Norte..."
          />
        </Form.Item>

        <Form.Item
          name="motivo"
          label="Motivo"
          rules={[{ required: true, message: 'Indica el motivo' }]}
        >
          <Input placeholder="Ej: Instalación en curso, Reparación pendiente..." />
        </Form.Item>

        <Form.Item name="descripcion" label="Descripción adicional">
          <Input.TextArea
            rows={3}
            placeholder="Detalles adicionales sobre el estado o uso del material..."
          />
        </Form.Item>

        <Form.Item name="estado" label="Estado del material">
          <Select>
            {Object.entries(ESTADO_CONFIG)
              .filter(([k]) => k !== 'DEVUELTO')
              .map(([k, v]) => (
                <Select.Option key={k} value={k}>
                  <Tag color={v.color}>{v.label}</Tag>
                </Select.Option>
              ))}
          </Select>
        </Form.Item>

        <Form.Item name="fecha_esperada_dev" label="Fecha esperada de devolución">
          <DatePicker
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            placeholder="Seleccionar fecha"
            disabledDate={(d) => d && d.isBefore(dayjs(), 'day')}
          />
        </Form.Item>
      </FormModal>

      {/* ── Modal: Confirmar devolución ─────────────────────────────────────── */}
      <FormModal
        title={<Space><CheckCircleOutlined style={{ color: '#52c41a' }} /> Confirmar devolución</Space>}
        open={modalCerrar}
        onCancel={() => setModalCerrar(false)}
        onFinish={confirmarCierre}
        form={formCerrar}
        okText="Confirmar devolución"
        okButtonProps={{ type: 'primary' }}
        width={460}
      >
        {seleccionado && (
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            message={`Marcando "${seleccionado.producto}" como devuelto al almacén`}
            description={`Técnico: ${seleccionado.tecnico} · ${seleccionado.dias_fuera} días fuera`}
          />
        )}
        <Form.Item name="nota_cierre" label="Nota de cierre (opcional)">
          <Input.TextArea
            rows={3}
            placeholder="Ej: Material devuelto en buen estado, falta un accesorio..."
          />
        </Form.Item>
      </FormModal>
    </div>
  )
}
