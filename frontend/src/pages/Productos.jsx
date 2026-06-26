import { useEffect, useState, useCallback } from 'react'
import { Table, Button, Input, InputNumber, Select,
         Space, Tag, Typography, Alert, Form } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons'
import api from '../services/api'
import { usePermisos } from '../hooks/usePermisos'
import { getApiError } from '../utils/apiError'
import { exportarExcel } from '../utils/exportExcel'
import notify from '../utils/notify'
import BackendStatusBanner from '../components/BackendStatusBanner'
import FormModal from '../components/FormModal'

const PAGINACION = { pageSize: 15, showSizeChanger: true, showTotal: (t) => `${t} registros`, pageSizeOptions: ['10', '15', '25', '50'] }

const { Title } = Typography

const stockColor = (actual, minimo) => {
  if (actual <= minimo)          return 'stock-critico'
  if (actual <= minimo * 1.5)    return 'stock-alerta'
  return 'stock-ok'
}

export default function Productos() {
  const [data,       setData]       = useState([])
  const [categorias, setCategorias] = useState([])
  const [subcategorias, setSubcategorias] = useState([])
  const [catModal, setCatModal] = useState(null)
  const [loading,    setLoading]    = useState(false)
  const [modal,      setModal]      = useState(false)
  const [editando,   setEditando]   = useState(null)
  const [filtrocat,  setFiltrocat]  = useState(null)
  const [filtroSub,  setFiltroSub]  = useState(null)
  const [subFiltro,  setSubFiltro]  = useState([])
  const [form]                      = Form.useForm()
  const { puedeCrear, puedeEditar, puedeEliminar } = usePermisos()
  const puedeCrearProd = puedeCrear('productos')
  const puedeEditarProd = puedeEditar('productos')
  const puedeEliminarProd = puedeEliminar('productos')

  const cargar = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const r = await api.get('/productos', { params })
      setData(r.data)
    } catch (err) {
      notify.error('Error al cargar', getApiError(err, 'No se pudieron cargar los productos'))
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    cargar()
    api.get('/categorias')
      .then((r) => setCategorias(r.data))
      .catch((err) => notify.error('Error', getApiError(err)))
  }, [cargar])

  const onFiltroCategoria = async (id_categoria) => {
    setFiltrocat(id_categoria)
    setFiltroSub(null)
    if (id_categoria) {
      const r = await api.get('/subcategorias', { params: { id_categoria } })
      setSubFiltro(r.data)
      cargar({ id_categoria })
    } else {
      setSubFiltro([])
      cargar({})
    }
  }

  const cargarSubcategorias = async (id_categoria) => {
    if (!id_categoria) { setSubcategorias([]); return }
    const r = await api.get('/subcategorias', { params: { id_categoria } })
    setSubcategorias(r.data)
  }

  const abrirModal = (registro = null) => {
    setEditando(registro)
    const catId = registro?.id_categoria ?? null
    setCatModal(catId)
    form.setFieldsValue(registro || {
      nombre: '', descripcion: '', id_categoria: null, id_subcategoria: null,
      stock_minimo: 0, unidad_medida: 'unidad',
    })
    if (catId) cargarSubcategorias(catId)
    setModal(true)
  }

  const onCategoriaChange = (id) => {
    setCatModal(id)
    form.setFieldsValue({ id_subcategoria: null })
    cargarSubcategorias(id)
  }

  const guardar = async (valores) => {
    const payload = { ...valores, id_subcategoria: valores.id_subcategoria || null }
    if (editando) {
      await api.put(`/productos/${editando.id}`, payload)
      notify.success('Producto actualizado', `"${valores.nombre}" guardado`)
    } else {
      await api.post('/productos', payload)
      notify.success('Producto creado', `"${valores.nombre}" registrado (stock inicial 0)`)
    }
    cargar({ id_categoria: filtrocat, id_subcategoria: filtroSub })
  }

  const eliminar = async (registro) => {
    const ok = await notify.confirm({
      title: '¿Eliminar producto?',
      content: `Se eliminará "${registro.nombre}". Solo es posible si no tiene movimientos.`,
      okText: 'Sí, eliminar',
      tipo: 'danger',
    })
    if (!ok) return
    try {
      await api.delete(`/productos/${registro.id}`)
      notify.success('Producto eliminado', `"${registro.nombre}" fue eliminado`)
      cargar({ id_categoria: filtrocat, id_subcategoria: filtroSub })
    } catch (err) {
      notify.error('No se puede eliminar', getApiError(err, 'Tiene movimientos de inventario'))
    }
  }

  const columnas = [
    { title: '#',           dataIndex: 'id',           key: 'id', width: 60 },
    { title: 'Nombre',      dataIndex: 'nombre',       key: 'nombre' },
    { title: 'Categoría',   dataIndex: 'categoria',    key: 'categoria',
      render: v => <Tag color="blue">{v}</Tag> },
    { title: 'Subcategoría', dataIndex: 'subcategoria', key: 'subcategoria',
      render: v => v ? <Tag>{v}</Tag> : <span style={{ color: '#bbb' }}>—</span> },
    { title: 'Stock',       dataIndex: 'stock_actual', key: 'stock_actual',
      align: 'right',
      render: (v, r) => (
        <span className={stockColor(v, r.stock_minimo)}>
          {v} {r.unidad_medida}
        </span>
      ),
    },
    { title: 'Mínimo',      dataIndex: 'stock_minimo', key: 'stock_minimo', align: 'right' },
    { title: 'Unidad',      dataIndex: 'unidad_medida',key: 'unidad_medida' },
    ...(puedeEditarProd || puedeEliminarProd ? [{
      title: 'Acciones', key: 'acciones', width: 120,
      render: (_, r) => (
        <Space>
          {puedeEditarProd && (
            <Button size="small" icon={<EditOutlined />} onClick={() => abrirModal(r)} />
          )}
          {puedeEliminarProd && (
            <Button size="small" danger icon={<DeleteOutlined />}
                    onClick={() => eliminar(r)} />
          )}
        </Space>
      ),
    }] : []),
  ]

  return (
    <div>
      <BackendStatusBanner />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Productos</Title>
        <Space wrap>
          <Select placeholder="Categoría" allowClear style={{ width: 180 }}
                  onChange={onFiltroCategoria}>
            {categorias.map((c) => <Select.Option key={c.id} value={c.id}>{c.nombre}</Select.Option>)}
          </Select>
          <Select placeholder="Subcategoría" allowClear style={{ width: 180 }}
                  disabled={!filtrocat} value={filtroSub}
                  onChange={(v) => { setFiltroSub(v); cargar({ id_categoria: filtrocat, id_subcategoria: v }) }}>
            {subFiltro.map((s) => <Select.Option key={s.id} value={s.id}>{s.nombre}</Select.Option>)}
          </Select>
          <Button icon={<DownloadOutlined />}
                  onClick={() => {
                    const cols = [
                      { title: '#', key: 'id' },
                      { title: 'Nombre', key: 'nombre' },
                      { title: 'Categoría', key: 'categoria' },
                      { title: 'Subcategoría', key: 'subcategoria', get: (r) => r.subcategoria || '' },
                      { title: 'Stock', key: 'stock_actual' },
                      { title: 'Mínimo', key: 'stock_minimo' },
                      { title: 'Unidad', key: 'unidad_medida' },
                      { title: 'Descripción', key: 'descripcion', get: (r) => r.descripcion || '' },
                    ]
                    if (!exportarExcel('productos', data, cols))
                      notify.msg.warning('Sin datos para exportar')
                  }}>
            Exportar Excel
          </Button>
          {puedeCrearProd && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => abrirModal()}>
              Nuevo producto
            </Button>
          )}
        </Space>
      </div>

      <Table dataSource={data} columns={columnas} rowKey="id"
             loading={loading} bordered size="middle" pagination={PAGINACION}
             rowClassName={(r) => r.stock_actual <= r.stock_minimo ? 'ant-table-row-danger' : ''} />

      <FormModal
        title={editando ? 'Editar producto' : 'Nuevo producto'}
        open={modal}
        onCancel={() => setModal(false)}
        onFinish={guardar}
        form={form}
        width={520}
      >
        {!editando && (
          <Alert type="info" showIcon style={{ marginBottom: 16 }}
                 message="El stock inicial es 0. Registra una ENTRADA en Movimientos para cargar inventario." />
        )}
        <Form.Item name="nombre" label="Nombre"
                   rules={[{ required: true, message: 'El nombre es obligatorio' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="id_categoria" label="Categoría"
                   rules={[{ required: true, message: 'Selecciona una categoría' }]}>
          <Select placeholder="Seleccionar categoría" onChange={onCategoriaChange}>
            {categorias.map(c => <Select.Option key={c.id} value={c.id}>{c.nombre}</Select.Option>)}
          </Select>
        </Form.Item>
        <Form.Item name="id_subcategoria" label="Subcategoría"
                   rules={[
                     ({ getFieldValue }) => ({
                       validator(_, value) {
                         if (!value) return Promise.resolve()
                         const catId = getFieldValue('id_categoria')
                         const sub = subcategorias.find((s) => s.id === value)
                         if (sub && sub.id_categoria === catId) return Promise.resolve()
                         return Promise.reject(new Error('La subcategoría no corresponde a la categoría'))
                       },
                     }),
                   ]}>
          <Select placeholder="Opcional" allowClear disabled={!catModal}>
            {subcategorias.map((s) => (
              <Select.Option key={s.id} value={s.id}>{s.nombre}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Space style={{ width: '100%' }} size="large">
          <Form.Item name="stock_minimo" label="Stock mínimo">
            <InputNumber min={0} style={{ width: 130 }} />
          </Form.Item>
          <Form.Item name="unidad_medida" label="Unidad">
            <Select style={{ width: 120 }}>
              {['unidad','kg','litro','metro','caja','rollo','par','juego'].map(u =>
                <Select.Option key={u} value={u}>{u}</Select.Option>)}
            </Select>
          </Form.Item>
        </Space>
        <Form.Item name="descripcion" label="Descripción">
          <Input.TextArea rows={2} />
        </Form.Item>
      </FormModal>
    </div>
  )
}
