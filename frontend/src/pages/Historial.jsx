import { useEffect, useState, useCallback } from 'react'
import { Table, Select, DatePicker, Space, Tag, Typography,
         Button, Card, Form, Input, Tooltip, Alert } from 'antd'
import FormModal from '../components/FormModal'
import { SearchOutlined, ClearOutlined, DownloadOutlined,
         EnvironmentOutlined, FileExcelOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import api from '../services/api'
import { getApiError } from '../utils/apiError'
import { exportarCsv } from '../utils/exportCsv'
import { exportarExcel } from '../utils/exportExcel'
import notify from '../utils/notify'
import BackendStatusBanner from '../components/BackendStatusBanner'

const { Title } = Typography
const { RangePicker } = DatePicker

const PAGINACION = {
  pageSize: 20,
  showSizeChanger: true,
  showTotal: (t) => `${t} registros`,
  pageSizeOptions: ['10', '20', '50', '100'],
}

const ESTADOS_UB = {
  EN_USO:        { color: 'blue',   label: 'En uso' },
  EN_OBRA:       { color: 'cyan',   label: 'En obra' },
  PENDIENTE_DEV: { color: 'orange', label: 'Pendiente dev.' },
  EXTRAVIADO:    { color: 'red',    label: 'Extraviado' },
  DEVUELTO:      { color: 'green',  label: 'Devuelto' },
}

const tipoTag = {
  ENTRADA:    <Tag color="success">ENTRADA</Tag>,
  SALIDA:     <Tag color="error">SALIDA</Tag>,
  DEVOLUCION: <Tag color="processing">DEVOLUCIÓN</Tag>,
  AJUSTE:     <Tag color="warning">AJUSTE</Tag>,
}

const COLS_EXPORT = [
  { title: 'Fecha',        key: 'fecha',            get: (r) => dayjs(r.fecha).format('DD/MM/YYYY HH:mm') },
  { title: 'Tipo',         key: 'tipo',             get: (r) => r.tipo },
  { title: 'Producto',     key: 'producto',         get: (r) => r.producto },
  { title: 'Categoría',    key: 'categoria',        get: (r) => r.categoria },
  { title: 'Subcategoría', key: 'subcategoria',     get: (r) => r.subcategoria || '' },
  { title: 'Cantidad',     key: 'cantidad',         get: (r) => r.cantidad },
  { title: 'Stock ant.',   key: 'stock_anterior',   get: (r) => r.stock_anterior },
  { title: 'Stock nuevo',  key: 'stock_nuevo',      get: (r) => r.stock_nuevo },
  { title: 'Técnico',      key: 'tecnico',          get: (r) => r.tecnico || '' },
  { title: 'Usuario',      key: 'usuario',          get: (r) => r.usuario },
  { title: 'Motivo',       key: 'motivo',           get: (r) => r.motivo || '' },
  { title: 'Referencia',   key: 'referencia_doc',   get: (r) => r.referencia_doc || '' },
  { title: 'OT',           key: 'id_orden_trabajo', get: (r) => r.id_orden_trabajo || '' },
]

export default function Historial() {
  const [data,           setData]           = useState([])
  const [categorias,     setCategorias]     = useState([])
  const [subcategorias,  setSubcats]        = useState([])
  const [tecnicos,       setTecnicos]       = useState([])
  const [loading,        setLoading]        = useState(false)
  const [filtros,        setFiltros]        = useState({})

  // Estado del modal de ubicación
  const [modalUbicacion,  setModalUbicacion]  = useState(false)
  const [movSeleccionado, setMovSeleccionado] = useState(null)
  const [formUbicacion]                       = Form.useForm()

  // ── Cargar historial de movimientos ──────────────────────────────────────
  const cargar = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const r = await api.get('/movimientos', { params })
      const raw = r.data
      setData(Array.isArray(raw) ? raw : (raw?.data || raw || []))
    } catch (err) {
      notify.error('Error al cargar historial', getApiError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  // Carga inicial: historial + selectores de filtro
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar({})
    api.get('/categorias')
      .then(r => setCategorias(r.data))
      .catch(() => {})
    api.get('/usuarios/operarios')
      .then(r => setTecnicos(r.data))
      .catch(() => {})
  }, [cargar])

  // ── Filtros ───────────────────────────────────────────────────────────────
  const onCategoriaFiltro = async (id_categoria) => {
    setFiltros((prev) => ({ ...prev, id_categoria, id_subcategoria: undefined }))
    if (id_categoria) {
      try {
        const r = await api.get('/subcategorias', { params: { id_categoria } })
        setSubcats(r.data)
      } catch {
        setSubcats([])
      }
    } else {
      setSubcats([])
    }
  }

  const limpiar = () => {
    setFiltros({})
    setSubcats([])
    cargar({})
  }

  const exportar = () => {
    if (exportarCsv('historial-movimientos', data, COLS_EXPORT)) {
      notify.msg.success('CSV descargado')
    } else {
      notify.msg.warning('Sin datos para exportar')
    }
  }

  const exportarExcelHist = () => {
    if (exportarExcel('historial-movimientos', data, COLS_EXPORT)) {
      notify.msg.success('Excel descargado')
    } else {
      notify.msg.warning('Sin datos para exportar')
    }
  }

  // ── Modal de ubicación ────────────────────────────────────────────────────
  const abrirModalUbicacion = (movimiento) => {
    setMovSeleccionado(movimiento)
    formUbicacion.resetFields()
    formUbicacion.setFieldsValue({ estado: 'EN_USO' })
    setModalUbicacion(true)
  }

  const guardarUbicacion = async (valores) => {
    const payload = {
      ...valores,
      id_movimiento: movSeleccionado.id,
      fecha_esperada_dev: valores.fecha_esperada_dev
        ? valores.fecha_esperada_dev.format('YYYY-MM-DD')
        : null,
    }
    await api.post('/ubicaciones', payload)
    notify.success(
      'Ubicación registrada',
      `Se registró la ubicación de "${movSeleccionado.producto}"`
    )
    setModalUbicacion(false)
    cargar(filtros)
  }

  // ── Columnas de la tabla ──────────────────────────────────────────────────
  const columnas = [
    {
      title: 'Fecha', dataIndex: 'fecha', width: 140,
      render: (v) => dayjs(v).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Tipo', dataIndex: 'tipo', width: 110,
      render: (v) => tipoTag[v] ?? <Tag>{v}</Tag>,
    },
    { title: 'Producto', dataIndex: 'producto' },
    {
      title: 'Categoría', dataIndex: 'categoria',
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: 'Subcategoría', dataIndex: 'subcategoria',
      render: (v) => v ? <Tag>{v}</Tag> : <span style={{ color: '#bbb' }}>—</span>,
    },
    { title: 'Cantidad',   dataIndex: 'cantidad',       align: 'right', width: 90 },
    { title: 'Stock ant.', dataIndex: 'stock_anterior', align: 'right', width: 90 },
    {
      title: 'Stock nuevo', dataIndex: 'stock_nuevo', align: 'right', width: 90,
      render: (v) => <strong style={{ color: '#1890ff' }}>{v}</strong>,
    },
    {
      title: 'Técnico', dataIndex: 'tecnico', width: 120,
      render: (v) => v
        ? <Tag color="purple">{v}</Tag>
        : <span style={{ color: '#bbb' }}>—</span>,
    },
    { title: 'Usuario', dataIndex: 'usuario', width: 110 },
    { title: 'Motivo',  dataIndex: 'motivo',  ellipsis: true },
    {
      title: 'Ubicación', key: 'ubicacion', width: 100,
      render: (_, r) => {
        if (r.tipo !== 'SALIDA' || !r.id_tecnico) return null
        return (
          <Tooltip title="Reportar dónde está este material">
            <Button
              size="small"
              icon={<EnvironmentOutlined />}
              onClick={() => abrirModalUbicacion(r)}
            >
              Ubicar
            </Button>
          </Tooltip>
        )
      },
    },
  ]

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      <BackendStatusBanner />
      <Title level={3} style={{ marginBottom: 16 }}>Historial de Movimientos</Title>

      {/* Filtros */}
      <Card style={{ marginBottom: 16, borderRadius: 8 }}>
        <Space wrap>
          <RangePicker
            format="YYYY-MM-DD"
            placeholder={['Fecha inicio', 'Fecha fin']}
            onChange={(_, [i, f]) =>
              setFiltros((prev) => ({
                ...prev,
                fecha_inicio: i || undefined,
                fecha_fin:    f || undefined,
              }))
            }
          />

          <Select
            placeholder="Tipo"
            allowClear
            style={{ width: 140 }}
            onChange={(v) => setFiltros((f) => ({ ...f, tipo: v }))}
          >
            {['ENTRADA', 'SALIDA', 'DEVOLUCION', 'AJUSTE'].map((t) => (
              <Select.Option key={t} value={t}>{t}</Select.Option>
            ))}
          </Select>

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

          <Select
            placeholder="Categoría"
            allowClear
            style={{ width: 180 }}
            onChange={onCategoriaFiltro}
          >
            {categorias.map((c) => (
              <Select.Option key={c.id} value={c.id}>{c.nombre}</Select.Option>
            ))}
          </Select>

          <Select
            placeholder="Subcategoría"
            allowClear
            style={{ width: 180 }}
            disabled={!filtros.id_categoria}
            onChange={(v) => setFiltros((f) => ({ ...f, id_subcategoria: v }))}
          >
            {subcategorias.map((s) => (
              <Select.Option key={s.id} value={s.id}>{s.nombre}</Select.Option>
            ))}
          </Select>

          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => cargar(filtros)}
          >
            Filtrar
          </Button>

          <Button icon={<ClearOutlined />} onClick={limpiar}>
            Limpiar
          </Button>

          <Button icon={<DownloadOutlined />} onClick={exportar}>
            Exportar CSV
          </Button>
          <Button icon={<FileExcelOutlined />} onClick={exportarExcelHist}>
            Exportar Excel
          </Button>
        </Space>
      </Card>

      {/* Tabla */}
      <Table
        dataSource={data}
        columns={columnas}
        rowKey="id"
        loading={loading}
        bordered
        size="small"
        scroll={{ x: 1500 }}
        pagination={PAGINACION}
      />

      {/* Modal: Reportar ubicación de material */}
      <FormModal
        title={
          <Space>
            <EnvironmentOutlined style={{ color: '#1890ff' }} />
            Reportar ubicación — {movSeleccionado?.producto}
          </Space>
        }
        open={modalUbicacion}
        onCancel={() => { setModalUbicacion(false); formUbicacion.resetFields() }}
        onFinish={guardarUbicacion}
        form={formUbicacion}
        okText="Registrar ubicación"
        width={520}
      >
        {movSeleccionado && (
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            message={
              `Salida del ${dayjs(movSeleccionado.fecha).format('DD/MM/YYYY')} · ` +
              `Técnico: ${movSeleccionado.tecnico} · Cantidad: ${movSeleccionado.cantidad}`
            }
          />
        )}

        <Form.Item
          name="ubicacion"
          label="¿Dónde está el material?"
          rules={[{ required: true, message: 'Indica la ubicación' }]}
        >
          <Input
            prefix={<EnvironmentOutlined />}
            placeholder="Ej: Obra Av. Principal #45, Taller Norte, Bodega cliente..."
          />
        </Form.Item>

        <Form.Item
          name="motivo"
          label="Motivo por el que no ha sido devuelto"
          rules={[{ required: true, message: 'Indica el motivo' }]}
        >
          <Input placeholder="Ej: Instalación en curso, Trabajo pendiente, En reparación..." />
        </Form.Item>

        <Form.Item name="descripcion" label="Descripción adicional">
          <Input.TextArea
            rows={3}
            placeholder="Detalles sobre el estado del material, condiciones, etc."
          />
        </Form.Item>

        <Form.Item name="estado" label="Estado actual del material">
          <Select defaultValue="EN_USO">
            {Object.entries(ESTADOS_UB)
              .filter(([k]) => k !== 'DEVUELTO')
              .map(([k, v]) => (
                <Select.Option key={k} value={k}>
                  <Tag color={v.color}>{v.label}</Tag>
                </Select.Option>
              ))}
          </Select>
        </Form.Item>

        <Form.Item name="fecha_esperada_dev" label="Fecha estimada de devolución">
          <DatePicker
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            placeholder="Seleccionar fecha"
            disabledDate={(d) => d && d.isBefore(dayjs(), 'day')}
          />
        </Form.Item>
      </FormModal>
    </div>
  )
}
