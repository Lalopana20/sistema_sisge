import { useEffect, useState } from 'react'
import { Form, Select, InputNumber, Input, Button, Card,
         Alert, Descriptions, Tag, Typography, Space, Divider } from 'antd'
import { SwapOutlined, CheckCircleOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import api from '../services/api'
import { getApiError } from '../utils/apiError'
import notify from '../utils/notify'
import { useAuth } from '../context/AuthContext'

const { Title, Text } = Typography

const tipoOpciones = [
  { value: 'ENTRADA',    label: '🟢 ENTRADA — ingreso de mercancía' },
  { value: 'SALIDA',     label: '🔴 SALIDA — despacho a técnico/obra' },
  { value: 'DEVOLUCION', label: '🔵 DEVOLUCIÓN — material devuelto' },
  { value: 'AJUSTE',     label: '🟠 AJUSTE — corrección de inventario' },
]

export default function Movimientos() {
  const [productos,        setProductos]        = useState([])
  const [tecnicos,         setTecnicos]         = useState([])
  const [producto,         setProducto]         = useState(null)
  const [resultado,        setResultado]        = useState(null)
  const [loading,          setLoading]          = useState(false)
  const [error,            setError]            = useState(null)
  const [tipo,             setTipo]             = useState(null)
  // Movimientos de SALIDA disponibles para seleccionar como origen de devolución
  const [salidasDisponibles, setSalidasDisponibles] = useState([])
  const [loadingSalidas,     setLoadingSalidas]     = useState(false)
  const [form]                                  = Form.useForm()

  const { tienePermiso } = useAuth()

  useEffect(() => {
    api.get('/productos')
      .then(r => setProductos(r.data))
      .catch(() => notify.error('Error', 'No se pudieron cargar los productos'))
    api.get('/usuarios/operarios')
      .then(r => setTecnicos(r.data))
      .catch(() => notify.error('Error', 'No se pudieron cargar los técnicos'))
  }, [tienePermiso])

  const onProductoChange = (id) => {
    const p = productos.find(x => x.id === id)
    setProducto(p || null)
    // Limpiar movimiento origen al cambiar producto
    form.setFieldValue('id_movimiento_origen', undefined)
    setSalidasDisponibles([])
    // Si ya se seleccionó DEVOLUCIÓN, cargar salidas del nuevo producto
    if (tipo === 'DEVOLUCION' && id) {
      cargarSalidasProducto(id)
    }
  }

  // Cargar movimientos de SALIDA disponibles para devolver de un producto
  const cargarSalidasProducto = async (id_producto) => {
    setLoadingSalidas(true)
    try {
      const r = await api.get('/movimientos', { params: { id_producto, tipo: 'SALIDA' } })
      const movs = Array.isArray(r.data) ? r.data : (r.data?.data || [])
      // Solo mostrar SALIDAs que tienen cantidad pendiente de devolver
      setSalidasDisponibles(movs)
    } catch {
      setSalidasDisponibles([])
    } finally {
      setLoadingSalidas(false)
    }
  }

  const onTipoChange = (v) => {
    setTipo(v)
    form.setFieldValue('id_movimiento_origen', undefined)
    setSalidasDisponibles([])
    // Si seleccionó DEVOLUCIÓN y ya hay producto, cargar las salidas
    const idProducto = form.getFieldValue('id_producto')
    if (v === 'DEVOLUCION' && idProducto) {
      cargarSalidasProducto(idProducto)
    }
  }

  const onFinish = async (valores) => {
    setLoading(true)
    setError(null)
    setResultado(null)
    try {
      const { data } = await api.post('/movimientos', valores)
      setResultado(data)
      notify.success(
        'Movimiento registrado',
        `${data.tipo}: ${data.cantidad} × ${data.producto} — stock nuevo: ${data.stock_nuevo}`
      )
      form.resetFields()
      setProducto(null)
      setTipo(null)
      setSalidasDisponibles([])
      // Refrescar lista de productos para mostrar stock actualizado
      const r = await api.get('/productos')
      setProductos(r.data)
    } catch (err) {
      const msg = getApiError(err, 'Error al registrar movimiento')
      setError(msg)
      notify.error('Movimiento rechazado', msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>Registrar Movimiento</Title>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {/* Formulario */}
        <Card style={{ flex: 1, minWidth: 340, borderRadius: 8 }}>
          {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}

          <Form form={form} layout="vertical" onFinish={onFinish} size="large">
            <Form.Item name="id_producto" label="Producto"
                       rules={[{ required: true, message: 'Selecciona un producto' }]}>
              <Select showSearch placeholder="Buscar producto..."
                      optionFilterProp="children" onChange={onProductoChange}>
                {productos.map(p => (
                  <Select.Option key={p.id} value={p.id}>
                    {p.nombre} — <Text type="secondary">{p.categoria}</Text>
                    {' '}(<strong>{p.stock_actual} {p.unidad_medida}</strong>)
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="tipo" label="Tipo de movimiento"
                       rules={[{ required: true, message: 'Selecciona el tipo' }]}>
              <Select placeholder="Seleccionar tipo" onChange={onTipoChange}>
                {tipoOpciones.map(o => (
                  <Select.Option key={o.value} value={o.value}>{o.label}</Select.Option>
                ))}
              </Select>
            </Form.Item>

            {/* Campo obligatorio solo para DEVOLUCIÓN: movimiento de SALIDA origen */}
            {tipo === 'DEVOLUCION' && (
              <Form.Item
                name="id_movimiento_origen"
                label="Despacho que se está devolviendo"
                rules={[{ required: true, message: 'Selecciona el despacho de SALIDA original' }]}
                extra="Selecciona el movimiento de SALIDA que originó este material"
              >
                <Select
                  placeholder={loadingSalidas ? 'Cargando salidas...' : 'Seleccionar despacho original...'}
                  loading={loadingSalidas}
                  notFoundContent={
                    !form.getFieldValue('id_producto')
                      ? 'Primero selecciona un producto'
                      : 'No hay SALIDAs registradas para este producto'
                  }
                >
                  {salidasDisponibles.map(m => (
                    <Select.Option key={m.id} value={m.id}>
                      #{m.id} — {dayjs(m.fecha).format('DD/MM/YYYY')} — {m.cantidad} {producto?.unidad_medida || 'uds'}
                      {m.tecnico ? ` — Técnico: ${m.tecnico}` : ''}
                      {m.motivo ? ` — ${m.motivo}` : ''}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            <Form.Item name="cantidad" label={tipo === 'AJUSTE' ? 'Nuevo stock (cantidad final)' : 'Cantidad'}
                       rules={[{ required: true, message: 'Ingresa la cantidad' }]}>
              <InputNumber min={0.01} step={1} style={{ width: '100%' }}
                           placeholder={tipo === 'AJUSTE' ? 'Stock final deseado' : 'Cantidad a mover'} />
            </Form.Item>

            <Form.Item name="motivo" label="Motivo">
              <Input placeholder="Ej: Compra a proveedor, Trabajo OT-001..." />
            </Form.Item>

            <Form.Item name="referencia_doc" label="N° Documento / Referencia">
              <Input placeholder="Ej: OC-2024-045, Guía #123..." />
            </Form.Item>

            {(tipo === 'SALIDA' || tipo === 'DEVOLUCION') && (
              <Form.Item name="id_tecnico" label="Técnico asignado">
                <Select placeholder="Seleccionar técnico" allowClear>
                  {tecnicos.map(t => (
                    <Select.Option key={t.id} value={t.id}>{t.nombre}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            {tipo === 'SALIDA' && (
              <Form.Item name="id_orden_trabajo" label="Orden de Trabajo">
                <Input placeholder="Ej: OT-2024-001" />
              </Form.Item>
            )}

            <Form.Item name="observaciones" label="Observaciones">
              <Input.TextArea rows={2} />
            </Form.Item>

            <Button type="primary" htmlType="submit" block loading={loading}
                    icon={<SwapOutlined />} style={{ height: 44 }}>
              Registrar movimiento
            </Button>
          </Form>
        </Card>

        {/* Panel derecho: info del producto + resultado */}
        <div style={{ width: 300 }}>
          {producto && (
            <Card title="Stock actual" style={{ borderRadius: 8, marginBottom: 16 }}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Producto">{producto.nombre}</Descriptions.Item>
                <Descriptions.Item label="Categoría">
                  <Tag color="blue">{producto.categoria}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Stock actual">
                  <Text strong style={{
                    color: producto.stock_actual <= producto.stock_minimo ? '#ff4d4f' : '#52c41a',
                    fontSize: 20,
                  }}>
                    {producto.stock_actual} {producto.unidad_medida}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Stock mínimo">{producto.stock_minimo}</Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          {resultado && (
            <Card style={{ borderRadius: 8, borderColor: '#52c41a' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
                  <CheckCircleOutlined /> Movimiento registrado
                </Text>
                <Divider style={{ margin: '8px 0' }} />
                <Text>Producto: <strong>{resultado.producto}</strong></Text>
                <Text>Tipo: {resultado.tipo}</Text>
                <Text>Cantidad: <strong>{resultado.cantidad}</strong></Text>
                <Text>Stock anterior: {resultado.stock_anterior}</Text>
                <Text>Stock nuevo: <strong style={{ color: '#1890ff', fontSize: 16 }}>
                  {resultado.stock_nuevo}
                </strong></Text>
              </Space>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
