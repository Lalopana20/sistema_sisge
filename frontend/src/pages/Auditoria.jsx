import { useEffect, useState, useCallback } from 'react'
import {
  Table, Select, DatePicker, Button, Space, Tag, Typography,
  Drawer, Descriptions, Card,
} from 'antd'
import { SearchOutlined, DownloadOutlined, FileSearchOutlined, FileExcelOutlined } from '@ant-design/icons'
import api from '../services/api'
import { getApiError } from '../utils/apiError'
import { exportarCsv } from '../utils/exportCsv'
import { exportarExcel } from '../utils/exportExcel'
import notify from '../utils/notify'
import BackendStatusBanner from '../components/BackendStatusBanner'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

const PAGINACION = { showSizeChanger: true, showTotal: (t) => `${t} registros`, pageSizeOptions: ['20', '50', '100'] }

const accionTag = {
  LOGIN:                <Tag color="green">LOGIN</Tag>,
  LOGIN_FALLIDO:        <Tag color="red">LOGIN FALLIDO</Tag>,
  LOGOUT:               <Tag color="default">LOGOUT</Tag>,
  CREAR:                <Tag color="blue">CREAR</Tag>,
  EDITAR:               <Tag color="orange">EDITAR</Tag>,
  ELIMINAR:             <Tag color="red">ELIMINAR</Tag>,
  REGISTRAR_MOVIMIENTO: <Tag color="purple">MOVIMIENTO</Tag>,
  CAMBIAR_PASSWORD:     <Tag color="gold">CONTRASEÑA</Tag>,
  CERRAR_UBICACION:     <Tag color="cyan">CERRAR UBIC.</Tag>,
}

const modulos = ['auth', 'usuarios', 'categorias', 'subcategorias', 'productos', 'movimientos']

export default function Auditoria() {
  const [registros, setRegistros] = useState([])
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [pageSize, setPageSize]   = useState(50)
  const [loading, setLoading]     = useState(false)
  const [filtros, setFiltros]     = useState({})
  const [detalle, setDetalle]     = useState(null)

  const cargar = useCallback(async (p = 1, ps = 50, f = {}) => {
    setLoading(true)
    try {
      const { data } = await api.get('/auditoria', { params: { ...f, page: p, limit: ps } })
      setRegistros(data.data)
      setTotal(data.total)
    } catch (err) {
      notify.error('Error al cargar', getApiError(err, 'Error al cargar auditoría. Ejecuta: npm run setup:auditoria'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargar(1, pageSize, filtros) }, [cargar])

  const colsExport = [
    { title: 'Fecha', key: 'fecha', get: (r) => r.fecha },
    { title: 'Usuario', key: 'usuario_nombre', get: (r) => r.usuario_nombre || '—' },
    { title: 'Email', key: 'usuario_email', get: (r) => r.usuario_email || '—' },
    { title: 'Rol', key: 'usuario_rol', get: (r) => r.usuario_rol || '' },
    { title: 'Acción', key: 'accion', get: (r) => r.accion },
    { title: 'Módulo', key: 'modulo', get: (r) => r.modulo },
    { title: 'Entidad', key: 'entidad_nombre', get: (r) => r.entidad_nombre || '—' },
  ]

  const exportar = () => {
    if (exportarCsv('auditoria-sisge', registros, colsExport)) notify.success('Exportación lista', 'CSV de auditoría descargado')
    else notify.warning('Sin datos', 'No hay registros para exportar')
  }

  const exportarExcelAud = () => {
    if (exportarExcel('auditoria-sisge', registros, colsExport)) notify.success('Exportación lista', 'Excel de auditoría descargado')
    else notify.warning('Sin datos', 'No hay registros para exportar')
  }

  const columnas = [
    {
      title: 'Fecha', dataIndex: 'fecha', width: 160,
      render: (v) => new Date(v).toLocaleString('es-PE'),
    },
    { title: 'Usuario', dataIndex: 'usuario_nombre', width: 120,
      render: (v, r) => v || <Text type="secondary">{r.usuario_email || '—'}</Text> },
    { title: 'Rol', dataIndex: 'usuario_rol', width: 90,
      render: (v) => v ? <Tag>{v}</Tag> : '—' },
    { title: 'Acción', dataIndex: 'accion', width: 130, render: (v) => accionTag[v] || v },
    { title: 'Módulo', dataIndex: 'modulo', width: 110,
      render: (v) => <Tag color="blue">{v}</Tag> },
    { title: 'Entidad', dataIndex: 'entidad_nombre', ellipsis: true },
    {
      title: '', key: 'ver', width: 70,
      render: (_, r) => (
        <Button size="small" onClick={() => setDetalle(r)}>Ver</Button>
      ),
    },
  ]

  return (
    <div>
      <BackendStatusBanner />
      <Title level={3} style={{ marginBottom: 16 }}>
        <FileSearchOutlined /> Auditoría del sistema
      </Title>

      <Card style={{ marginBottom: 16, borderRadius: 8 }}>
        <Space wrap>
          <RangePicker format="YYYY-MM-DD" placeholder={['Desde', 'Hasta']}
                       onChange={(_, [i, f]) => setFiltros((prev) => ({
                         ...prev, fecha_inicio: i || undefined, fecha_fin: f || undefined,
                       }))} />
          <Select placeholder="Módulo" allowClear style={{ width: 140 }}
                  onChange={(v) => setFiltros((f) => ({ ...f, modulo: v }))}>
            {modulos.map((m) => <Select.Option key={m} value={m}>{m}</Select.Option>)}
          </Select>
          <Select placeholder="Acción" allowClear style={{ width: 160 }}
                  onChange={(v) => setFiltros((f) => ({ ...f, accion: v }))}>
            {Object.keys(accionTag).map((a) => (
              <Select.Option key={a} value={a}>{a}</Select.Option>
            ))}
          </Select>
          <Button type="primary" icon={<SearchOutlined />}
                  onClick={() => { setPage(1); cargar(1, pageSize, filtros) }}>
            Buscar
          </Button>          <Button icon={<DownloadOutlined />} onClick={exportar}>Exportar CSV</Button>
          <Button icon={<FileExcelOutlined />} onClick={exportarExcelAud}>Exportar Excel</Button>
        </Space>
      </Card>

      <Table
        dataSource={registros}
        columns={columnas}
        rowKey="id"
        loading={loading}
        bordered
        size="small"
        scroll={{ x: 900 }}
        pagination={{
          ...PAGINACION,
          current: page,
          pageSize,
          total,
          onChange: (p, ps) => { setPage(p); setPageSize(ps); cargar(p, ps, filtros) },        }}
      />

      <Drawer
        title="Detalle del registro"
        open={!!detalle}
        onClose={() => setDetalle(null)}
        width={480}
      >
        {detalle && (
          <>
            <Descriptions column={1} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Fecha">
                {new Date(detalle.fecha).toLocaleString('es-PE')}
              </Descriptions.Item>
              <Descriptions.Item label="Usuario">{detalle.usuario_nombre || '—'}</Descriptions.Item>
              <Descriptions.Item label="Email">{detalle.usuario_email || '—'}</Descriptions.Item>
              <Descriptions.Item label="Acción">{accionTag[detalle.accion]}</Descriptions.Item>
              <Descriptions.Item label="Módulo">{detalle.modulo}</Descriptions.Item>
              <Descriptions.Item label="Entidad">{detalle.entidad_nombre || '—'}</Descriptions.Item>
              <Descriptions.Item label="IP">{detalle.ip || '—'}</Descriptions.Item>
            </Descriptions>
            {detalle.detalle && (
              <Card title="Cambios registrados" size="small">
                <pre style={{ fontSize: 12, overflow: 'auto', maxHeight: 320 }}>
                  {JSON.stringify(detalle.detalle, null, 2)}
                </pre>
              </Card>
            )}
          </>
        )}
      </Drawer>
    </div>
  )
}
