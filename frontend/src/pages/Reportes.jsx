import { useEffect, useState, useCallback } from 'react'
import {
  Card, Table, DatePicker, Button, Space, Tag, Alert,
  Typography, Row, Col, Tabs, Select, Statistic,
} from 'antd'
import {
  SearchOutlined, WarningOutlined, DownloadOutlined,
  UserOutlined, ArrowUpOutlined, ArrowDownOutlined, FileExcelOutlined,
} from '@ant-design/icons'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import api from '../services/api'
import { getApiError } from '../utils/apiError'
import { useAuth } from '../context/AuthContext'
import { exportarCsv } from '../utils/exportCsv'
import { exportarExcel } from '../utils/exportExcel'
import notify from '../utils/notify'
import BackendStatusBanner from '../components/BackendStatusBanner'

const { Title } = Typography
const { RangePicker } = DatePicker

const COLORES = [
  '#1890ff', '#52c41a', '#ff4d4f', '#fa8c16',
  '#722ed1', '#13c2c2', '#eb2f96', '#fadb14', '#a0d911',
]

const PAGINACION = {
  pageSize: 15,
  showSizeChanger: true,
  showTotal: (t) => `${t} registros`,
  pageSizeOptions: ['10', '15', '25', '50'],
}

// ─── Definición de columnas para exportación CSV ────────────────────────────
const COLS_CSV_CATEGORIA = [
  { title: 'Categoría',    key: 'categoria',         get: (r) => r.categoria },
  { title: 'Entradas',     key: 'total_entradas',    get: (r) => r.total_entradas },
  { title: 'Salidas',      key: 'total_salidas',     get: (r) => r.total_salidas },
  { title: 'Movimientos',  key: 'total_movimientos', get: (r) => r.total_movimientos },
]

const COLS_CSV_PRODUCTO = [
  { title: 'Producto',     key: 'producto',       get: (r) => r.producto },
  { title: 'Categoría',   key: 'categoria',      get: (r) => r.categoria },
  { title: 'Stock actual', key: 'stock_actual',   get: (r) => r.stock_actual },
  { title: 'Entradas',    key: 'total_entradas', get: (r) => r.total_entradas },
  { title: 'Salidas',     key: 'total_salidas',  get: (r) => r.total_salidas },
]

const COLS_CSV_TECNICO_RESUMEN = [
  { title: 'Técnico',       key: 'tecnico',            get: (r) => r.tecnico },
  { title: 'Movimientos',   key: 'total_movimientos',  get: (r) => r.total_movimientos },
  { title: 'Salidas',       key: 'total_salidas',      get: (r) => r.total_salidas },
  { title: 'Devoluciones',  key: 'total_devoluciones', get: (r) => r.total_devoluciones },
  { title: 'Neto consumido',key: 'neto_consumido',     get: (r) => r.neto_consumido },
]

const COLS_EXCEL_STOCK = [
  { title: 'Producto', key: 'nombre' },
  { title: 'Categoría', key: 'categoria' },
  { title: 'Stock actual', key: 'stock_actual' },
  { title: 'Stock mínimo', key: 'stock_minimo' },
]

const COLS_CSV_TECNICO_DETALLE = [
  { title: 'Técnico',       key: 'tecnico',       get: (r) => r.tecnico },
  { title: 'Producto',      key: 'producto',      get: (r) => r.producto },
  { title: 'Categoría',     key: 'categoria',     get: (r) => r.categoria },
  { title: 'Unidad',        key: 'unidad_medida', get: (r) => r.unidad_medida },
  { title: 'Salidas',       key: 'salidas',       get: (r) => r.salidas },
  { title: 'Devoluciones',  key: 'devoluciones',  get: (r) => r.devoluciones },
  { title: 'Neto',          key: 'neto',          get: (r) => r.neto },
]

// ─── Componente principal ────────────────────────────────────────────────────
export default function Reportes() {
  const [porCategoria, setPorCategoria] = useState([])
  const [porProducto,  setPorProducto]  = useState([])
  const [stockBajo,    setStockBajo]    = useState([])
  const [tecnicoData,  setTecnicoData]  = useState({ resumen: [], detalle: [] })
  const [tecnicos,     setTecnicos]     = useState([])

  const [fechas,          setFechas]          = useState({})
  const [tecnicoFiltro,   setTecnicoFiltro]   = useState(undefined)
  const [loading,         setLoading]         = useState(false)
  const [loadingTecnico,  setLoadingTecnico]  = useState(false)
  const [error,           setError]           = useState(null)

  // ── Carga reportes generales (categoría, producto, stock) ─────────────────
  const cargar = useCallback(async (params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const [r1, r2, r3] = await Promise.all([
        api.get('/reportes/por-categoria', { params }),
        api.get('/reportes/por-producto',  { params }),
        api.get('/reportes/stock-bajo'),
      ])
      setPorCategoria(r1.data)
      setPorProducto(r2.data)
      setStockBajo(r3.data)
    } catch (err) {
      setError(getApiError(err, 'Error al generar reportes'))
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Carga reporte por técnico ─────────────────────────────────────────────
  const cargarTecnico = useCallback(async (params = {}) => {
    setLoadingTecnico(true)
    try {
      const { data } = await api.get('/reportes/consumo-tecnico', { params })
      setTecnicoData(data)
    } catch (err) {
      notify.error('Error al cargar reporte de técnicos', getApiError(err))
    } finally {
      setLoadingTecnico(false)
    }
  }, [])

  const { tienePermiso } = useAuth()

  // Cargar lista de técnicos para el selector
  useEffect(() => {
    api.get('/usuarios/operarios')
      .then((r) => setTecnicos(r.data))
      .catch(() => {})
    cargar()
  }, [cargar, tienePermiso])

  // Cargar reporte técnico al montar
  useEffect(() => { cargarTecnico() }, [cargarTecnico])

  // ── Columnas de tablas ────────────────────────────────────────────────────
  const colsCategoria = [
    {
      title: 'Categoría', dataIndex: 'categoria',
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: 'Entradas', dataIndex: 'total_entradas', align: 'right',
      render: (v) => <span style={{ color: '#52c41a', fontWeight: 600 }}>{v}</span>,
    },
    {
      title: 'Salidas', dataIndex: 'total_salidas', align: 'right',
      render: (v) => <span style={{ color: '#ff4d4f', fontWeight: 600 }}>{v}</span>,
    },
    { title: 'Movimientos', dataIndex: 'total_movimientos', align: 'right' },
  ]

  const colsProducto = [
    { title: 'Producto',  dataIndex: 'producto' },
    { title: 'Categoría', dataIndex: 'categoria', render: (v) => <Tag color="blue">{v}</Tag> },
    { title: 'Stock',     dataIndex: 'stock_actual', align: 'right' },
    {
      title: 'Entradas', dataIndex: 'total_entradas', align: 'right',
      render: (v) => <span style={{ color: '#52c41a' }}>{v}</span>,
    },
    {
      title: 'Salidas', dataIndex: 'total_salidas', align: 'right',
      render: (v) => <span style={{ color: '#ff4d4f' }}>{v}</span>,
    },
  ]

  const colsStockBajo = [
    { title: 'Producto',     dataIndex: 'nombre' },
    { title: 'Categoría',    dataIndex: 'categoria', render: (v) => <Tag color="blue">{v}</Tag> },
    {
      title: 'Stock actual', dataIndex: 'stock_actual', align: 'right',
      render: (v) => <span style={{ color: '#ff4d4f', fontWeight: 700 }}>{v}</span>,
    },
    { title: 'Mínimo',   dataIndex: 'stock_minimo', align: 'right' },
    {
      title: 'Faltante', key: 'faltante', align: 'right',
      // Calculado en el cliente: stock_minimo - stock_actual (nunca viene del backend)
      render: (_, r) => {
        const faltante = Math.max(0, Number(r.stock_minimo) - Number(r.stock_actual))
        return <span style={{ color: '#fa8c16' }}>+{faltante}</span>
      },
    },
  ]

  const colsTecnicoResumen = [
    {
      title: 'Técnico', dataIndex: 'tecnico',
      render: (v) => (
        <Space>
          <UserOutlined style={{ color: '#722ed1' }} />
          <strong>{v}</strong>
        </Space>
      ),
    },
    { title: 'Movimientos', dataIndex: 'total_movimientos', align: 'right' },
    {
      title: 'Salidas', dataIndex: 'total_salidas', align: 'right',
      render: (v) => (
        <span style={{ color: '#ff4d4f', fontWeight: 600 }}>
          <ArrowUpOutlined /> {v}
        </span>
      ),
    },
    {
      title: 'Devoluciones', dataIndex: 'total_devoluciones', align: 'right',
      render: (v) => (
        <span style={{ color: '#52c41a', fontWeight: 600 }}>
          <ArrowDownOutlined /> {v}
        </span>
      ),
    },
    {
      title: 'Neto consumido', dataIndex: 'neto_consumido', align: 'right',
      render: (v) => (
        <Tag color={v > 0 ? 'orange' : 'green'} style={{ fontWeight: 700, fontSize: 13 }}>
          {v}
        </Tag>
      ),
      sorter: (a, b) => b.neto_consumido - a.neto_consumido,
      defaultSortOrder: 'ascend',
    },
  ]

  const colsTecnicoDetalle = [
    { title: 'Técnico',  dataIndex: 'tecnico',  render: (v) => <Tag color="purple">{v}</Tag> },
    { title: 'Producto', dataIndex: 'producto' },
    { title: 'Categoría', dataIndex: 'categoria', render: (v) => <Tag color="blue">{v}</Tag> },
    { title: 'Unidad',   dataIndex: 'unidad_medida', width: 80 },
    {
      title: 'Salidas', dataIndex: 'salidas', align: 'right',
      render: (v) => <span style={{ color: '#ff4d4f' }}>{v}</span>,
    },
    {
      title: 'Devoluciones', dataIndex: 'devoluciones', align: 'right',
      render: (v) => <span style={{ color: '#52c41a' }}>{v}</span>,
    },
    {
      title: 'Neto', dataIndex: 'neto', align: 'right',
      render: (v) => <strong style={{ color: v > 0 ? '#fa8c16' : '#52c41a' }}>{v}</strong>,
      sorter: (a, b) => b.neto - a.neto,
    },
  ]

  // ── Datos para gráficas ───────────────────────────────────────────────────
  const dataTorta = porCategoria
    .filter((c) => c.total_salidas > 0)
    .map((c) => ({ name: c.categoria, value: Number(c.total_salidas) }))

  const dataTecnicoGrafica = tecnicoData.resumen.map((t) => ({
    tecnico:     t.tecnico,
    salidas:     Number(t.total_salidas),
    devoluciones: Number(t.total_devoluciones),
    neto:        Number(t.neto_consumido),
  }))

  // ── Tabs ──────────────────────────────────────────────────────────────────
  const tabItems = [
    // ── Tab 1: Por categoría ────────────────────────────────────────────────
    {
      key: 'cat',
      label: 'Por categoría',
      children: (
        <>
          <div style={{ textAlign: 'right', marginBottom: 12 }}>
            <Button icon={<DownloadOutlined />}
                    onClick={() => {
                      if (!exportarCsv('reporte-categorias', porCategoria, COLS_CSV_CATEGORIA))
                        notify.msg.warning('Sin datos para exportar')
                    }}>
              Exportar CSV
            </Button>
            <Button icon={<FileExcelOutlined />}
                    onClick={() => {
                      if (!exportarExcel('reporte-categorias', porCategoria, COLS_CSV_CATEGORIA))
                        notify.msg.warning('Sin datos para exportar')
                    }}>
              Exportar Excel
            </Button>
          </div>
          <Table
            dataSource={porCategoria}
            columns={colsCategoria}
            rowKey="categoria"
            loading={loading}
            bordered
            size="small"
            pagination={PAGINACION}
          />
        </>
      ),
    },

    // ── Tab 2: Por producto ─────────────────────────────────────────────────
    {
      key: 'prod',
      label: 'Por producto',
      children: (
        <>
          <div style={{ textAlign: 'right', marginBottom: 12 }}>
            <Button icon={<DownloadOutlined />}
                    onClick={() => {
                      if (!exportarCsv('reporte-productos', porProducto, COLS_CSV_PRODUCTO))
                        notify.msg.warning('Sin datos para exportar')
                    }}>
              Exportar CSV
            </Button>
            <Button icon={<FileExcelOutlined />}
                    onClick={() => {
                      if (!exportarExcel('reporte-productos', porProducto, COLS_CSV_PRODUCTO))
                        notify.msg.warning('Sin datos para exportar')
                    }}>
              Exportar Excel
            </Button>
          </div>
          <Table
            dataSource={porProducto}
            columns={colsProducto}
            rowKey="id"
            loading={loading}
            bordered
            size="small"
            pagination={PAGINACION}
          />
        </>
      ),
    },

    // ── Tab 3: Stock bajo ───────────────────────────────────────────────────
    {
      key: 'stock',
      label: (
        <Space>
          <WarningOutlined style={{ color: '#ff4d4f' }} />
          Stock bajo
          {stockBajo.length > 0 && <Tag color="error">{stockBajo.length}</Tag>}
        </Space>
      ),
      children: stockBajo.length === 0
        ? <Alert message="Todos los productos tienen stock suficiente" type="success" showIcon />
        : (
          <>
            <div style={{ textAlign: 'right', marginBottom: 12 }}>
              <Button icon={<FileExcelOutlined />}
                      onClick={() => {
                        if (!exportarExcel('reporte-stock-bajo', stockBajo, COLS_EXCEL_STOCK))
                          notify.msg.warning('Sin datos para exportar')
                      }}>
                Exportar Excel
              </Button>
            </div>
            <Table
              dataSource={stockBajo}
              columns={colsStockBajo}
              rowKey="id"
              bordered
              size="small"
              pagination={PAGINACION}
            />
          </>
        ),
    },

    // ── Tab 4: Por técnico ──────────────────────────────────────────────────
    {
      key: 'tecnico',
      label: (
        <Space>
          <UserOutlined />
          Por técnico
        </Space>
      ),
      children: (
        <div>
          {/* Filtros del tab técnico */}
          <Card size="small" style={{ marginBottom: 16, borderRadius: 8 }}>
            <Space wrap>
              <RangePicker
                format="YYYY-MM-DD"
                placeholder={['Fecha inicio', 'Fecha fin']}
                onChange={(_, [i, f]) => {
                  const params = {
                    fecha_inicio: i || undefined,
                    fecha_fin:    f || undefined,
                    id_tecnico:   tecnicoFiltro,
                  }
                  cargarTecnico(params)
                }}
              />
              <Select
                placeholder="Filtrar por técnico"
                allowClear
                style={{ width: 180 }}
                onChange={(v) => {
                  setTecnicoFiltro(v)
                  cargarTecnico({ id_tecnico: v })
                }}
              >
                {tecnicos.map((t) => (
                  <Select.Option key={t.id} value={t.id}>{t.nombre}</Select.Option>
                ))}
              </Select>
              <Button icon={<DownloadOutlined />}
                      onClick={() => {
                        const ok1 = exportarCsv('tecnico-resumen', tecnicoData.resumen, COLS_CSV_TECNICO_RESUMEN)
                        const ok2 = exportarCsv('tecnico-detalle', tecnicoData.detalle, COLS_CSV_TECNICO_DETALLE)
                        if (!ok1 && !ok2) notify.msg.warning('Sin datos para exportar')
                      }}>
                Exportar CSV
              </Button>
              <Button icon={<FileExcelOutlined />}
                      onClick={() => {
                        const ok1 = exportarExcel('tecnico-resumen', tecnicoData.resumen, COLS_CSV_TECNICO_RESUMEN)
                        const ok2 = exportarExcel('tecnico-detalle', tecnicoData.detalle, COLS_CSV_TECNICO_DETALLE)
                        if (!ok1 && !ok2) notify.msg.warning('Sin datos para exportar')
                      }}>
                Exportar Excel
              </Button>
            </Space>
          </Card>

          {/* Tarjetas de resumen rápido */}
          {tecnicoData.resumen.length > 0 && (
            <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
              {tecnicoData.resumen.map((t) => (
                <Col key={t.id_tecnico} xs={24} sm={12} md={8} lg={6}>
                  <Card size="small" style={{ borderRadius: 8, borderLeft: '4px solid #722ed1' }}>
                    <Statistic
                      title={t.tecnico}
                      value={t.neto_consumido}
                      suffix="uds. neto"
                      valueStyle={{ color: t.neto_consumido > 0 ? '#fa8c16' : '#52c41a', fontSize: 20 }}
                      prefix={<UserOutlined />}
                    />
                    <div style={{ marginTop: 4, fontSize: 12, color: '#888' }}>
                      {t.total_movimientos} movimientos · {t.total_devoluciones} devueltos
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {/* Gráfica de barras por técnico */}
          {dataTecnicoGrafica.length > 0 && (
            <Card
              title="Salidas vs Devoluciones por técnico"
              style={{ marginBottom: 16, borderRadius: 8 }}
            >
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={dataTecnicoGrafica} margin={{ bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tecnico" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend verticalAlign="top" />
                  <Bar dataKey="salidas"      name="Salidas"      fill="#ff4d4f" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="devoluciones" name="Devoluciones" fill="#52c41a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="neto"         name="Neto consumido" fill="#fa8c16" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Tabla resumen por técnico */}
          <Card
            title="Resumen por técnico"
            size="small"
            style={{ marginBottom: 16, borderRadius: 8 }}
          >
            {tecnicoData.resumen.length === 0
              ? <Alert message="No hay movimientos con técnico asignado en el período" type="info" showIcon />
              : (
                <Table
                  dataSource={tecnicoData.resumen}
                  columns={colsTecnicoResumen}
                  rowKey="id_tecnico"
                  loading={loadingTecnico}
                  bordered
                  size="small"
                  pagination={false}
                />
              )
            }
          </Card>

          {/* Tabla detalle: qué llevó cada técnico */}
          <Card
            title="Detalle de materiales por técnico"
            size="small"
            style={{ borderRadius: 8 }}
          >
            {tecnicoData.detalle.length === 0
              ? <Alert message="Sin detalle disponible" type="info" showIcon />
              : (
                <Table
                  dataSource={tecnicoData.detalle}
                  columns={colsTecnicoDetalle}
                  rowKey={(r) => `${r.id_tecnico}-${r.producto}`}
                  loading={loadingTecnico}
                  bordered
                  size="small"
                  pagination={PAGINACION}
                  scroll={{ x: 800 }}
                />
              )
            }
          </Card>
        </div>
      ),
    },
  ]

  return (
    <div>
      <BackendStatusBanner />
      <Title level={3} style={{ marginBottom: 16 }}>Reportes</Title>

      {error && (
        <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />
      )}

      {/* Filtro de fecha global (aplica a categoría y producto) */}
      <Card style={{ marginBottom: 16, borderRadius: 8 }}>
        <Space wrap>
          <RangePicker
            format="YYYY-MM-DD"
            placeholder={['Fecha inicio', 'Fecha fin']}
            onChange={(_, [i, f]) =>
              setFechas({ fecha_inicio: i || undefined, fecha_fin: f || undefined })
            }
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            loading={loading}
            onClick={() => cargar(fechas)}
          >
            Generar reporte
          </Button>
        </Space>
      </Card>

      {/* Gráficas generales */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={14}>
          <Card title="Entradas vs Salidas por Categoría" style={{ borderRadius: 8 }}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={porCategoria} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="categoria"
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 11 }}
                />
                <YAxis />
                <Tooltip />
                <Legend verticalAlign="top" />
                <Bar dataKey="total_entradas" name="Entradas" fill="#52c41a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total_salidas"  name="Salidas"  fill="#ff4d4f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Distribución de Salidas" style={{ borderRadius: 8 }}>
            {dataTorta.length === 0
              ? <Alert message="Sin datos de salidas en el período" type="info" showIcon />
              : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={dataTorta}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label
                    >
                      {dataTorta.map((_, i) => (
                        <Cell key={i} fill={COLORES[i % COLORES.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )
            }
          </Card>
        </Col>
      </Row>

      <Tabs items={tabItems} />
    </div>
  )
}
