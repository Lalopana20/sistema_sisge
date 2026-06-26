import { useEffect, useState, useCallback } from 'react'
import {
  Table, Button, Form, Input, Select, Space,
  Typography, Tabs, Tag,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons'
import api from '../services/api'
import { usePermisos } from '../hooks/usePermisos'
import { getApiError } from '../utils/apiError'
import { exportarExcel } from '../utils/exportExcel'
import notify from '../utils/notify'
import BackendStatusBanner from '../components/BackendStatusBanner'
import FormModal from '../components/FormModal'

const COLS_EXCEL_CAT = [
  { title: '#', key: 'id' },
  { title: 'Nombre', key: 'nombre' },
  { title: 'Descripción', key: 'descripcion', get: (r) => r.descripcion || '' },
]

const COLS_EXCEL_SUB = [
  { title: '#', key: 'id' },
  { title: 'Categoría', key: 'categoria' },
  { title: 'Subcategoría', key: 'nombre' },
  { title: 'Descripción', key: 'descripcion', get: (r) => r.descripcion || '' },
]

const { Title } = Typography

export default function Categorias() {
  const [categorias, setCategorias]     = useState([])
  const [subcategorias, setSubcategorias] = useState([])
  const [loading, setLoading]           = useState(false)
  const [modalCat, setModalCat]         = useState(false)
  const [modalSub, setModalSub]         = useState(false)
  const [editCat, setEditCat]           = useState(null)
  const [editSub, setEditSub]           = useState(null)
  const [filtroCat, setFiltroCat]       = useState(null)
  const [formCat] = Form.useForm()
  const [formSub] = Form.useForm()
  const { puedeCrear, puedeEditar, puedeEliminar } = usePermisos()
  const puedeCrearCat = puedeCrear('categorias')
  const puedeEditarCat = puedeEditar('categorias')
  const puedeEliminarCat = puedeEliminar('categorias')
  const puedeCrearSub = puedeCrear('subcategorias')
  const puedeEditarSub = puedeEditar('subcategorias')
  const puedeEliminarSub = puedeEliminar('subcategorias')

  const cargarCategorias = useCallback(async () => {
    const r = await api.get('/categorias')
    setCategorias(r.data)
  }, [])

  // Recibe id_categoria explícito para evitar stale closure sobre filtroCat
  const cargarSubcategorias = useCallback(async (id_categoria) => {
    const params = id_categoria ? { id_categoria } : {}
    const r = await api.get('/subcategorias', { params })
    setSubcategorias(r.data)
  }, [])

  const cargarTodo = useCallback(async () => {
    setLoading(true)
    try {
      await Promise.all([cargarCategorias(), cargarSubcategorias(null)])
    } catch (err) {
      notify.error('Error al cargar', getApiError(err, 'No se pudieron cargar los datos'))
    } finally {
      setLoading(false)
    }
  }, [cargarCategorias, cargarSubcategorias])

  useEffect(() => { cargarTodo() }, [cargarTodo])

  const guardarCategoria = async (valores) => {
    if (editCat) {
      await api.put(`/categorias/${editCat.id}`, valores)
      notify.success('Categoría actualizada', `"${valores.nombre}" guardada`)
    } else {
      await api.post('/categorias', valores)
      notify.success('Categoría creada', `"${valores.nombre}" registrada`)
    }
    cargarTodo()
  }

  const guardarSubcategoria = async (valores) => {
    if (editSub) {
      await api.put(`/subcategorias/${editSub.id}`, valores)
      notify.success('Subcategoría actualizada', `"${valores.nombre}" guardada`)
    } else {
      await api.post('/subcategorias', valores)
      notify.success('Subcategoría creada', `"${valores.nombre}" registrada`)
    }
    cargarSubcategorias(filtroCat)
  }

  const eliminarCategoria = async (registro) => {    const ok = await notify.confirm({
      title: '¿Eliminar categoría?',
      content: `Se eliminará "${registro.nombre}". Los productos asociados pueden verse afectados.`,
      okText: 'Sí, eliminar',
      tipo: 'danger',
    })
    if (!ok) return
    try {
      await api.delete(`/categorias/${registro.id}`)
      notify.success('Categoría eliminada', `"${registro.nombre}" fue eliminada`)
      cargarTodo()
    } catch (err) {
      notify.error('No se puede eliminar', getApiError(err, 'Tiene productos o subcategorías asociadas'))
    }
  }

  const eliminarSubcategoria = async (registro) => {
    const ok = await notify.confirm({
      title: '¿Eliminar subcategoría?',
      content: `Se eliminará "${registro.nombre}".`,
      okText: 'Sí, eliminar',
      tipo: 'danger',
    })
    if (!ok) return
    try {
      await api.delete(`/subcategorias/${registro.id}`)
      notify.success('Subcategoría eliminada', `"${registro.nombre}" fue eliminada`)
      cargarSubcategorias(filtroCat)
    } catch (err) {      notify.error('No se puede eliminar', getApiError(err))
    }
  }

  const colsCat = [
    { title: '#', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
    { title: 'Descripción', dataIndex: 'descripcion', key: 'descripcion',
      render: (v) => v || <span style={{ color: '#bbb' }}>—</span> },
    ...(puedeEditarCat || puedeEliminarCat ? [{
      title: 'Acciones', key: 'acciones', width: 120,
      render: (_, r) => (
        <Space>
          {puedeEditarCat && (
            <Button size="small" icon={<EditOutlined />}
                    onClick={() => { setEditCat(r); formCat.setFieldsValue(r); setModalCat(true) }} />
          )}
          {puedeEliminarCat && (
            <Button size="small" danger icon={<DeleteOutlined />}
                    onClick={() => eliminarCategoria(r)} />
          )}
        </Space>
      ),
    }] : []),
  ]

  const colsSub = [
    { title: '#', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Categoría', dataIndex: 'categoria', key: 'categoria',
      render: (v) => <Tag color="blue">{v}</Tag> },
    { title: 'Subcategoría', dataIndex: 'nombre', key: 'nombre' },
    { title: 'Descripción', dataIndex: 'descripcion', key: 'descripcion',
      render: (v) => v || <span style={{ color: '#bbb' }}>—</span> },
    ...(puedeEditarSub || puedeEliminarSub ? [{
      title: 'Acciones', key: 'acciones', width: 120,
      render: (_, r) => (
        <Space>
          {puedeEditarSub && (
            <Button size="small" icon={<EditOutlined />}
                    onClick={() => {
                      setEditSub(r)
                      formSub.setFieldsValue({ id_categoria: r.id_categoria, nombre: r.nombre, descripcion: r.descripcion })
                      setModalSub(true)
                    }} />
          )}
          {puedeEliminarSub && (
            <Button size="small" danger icon={<DeleteOutlined />}
                    onClick={() => eliminarSubcategoria(r)} />
          )}
        </Space>
      ),
    }] : []),
  ]

  const tabItems = [
    {
      key: 'cat',
      label: 'Categorías',
      children: (
        <>
          <Space style={{ marginBottom: 16 }}>
            {puedeCrearCat && (
              <Button type="primary" icon={<PlusOutlined />}
                      onClick={() => { setEditCat(null); formCat.resetFields(); setModalCat(true) }}>
                Nueva categoría
              </Button>
            )}
            <Button icon={<DownloadOutlined />}
                    onClick={() => {
                      if (!exportarExcel('categorias', categorias, COLS_EXCEL_CAT))
                        notify.msg.warning('Sin datos para exportar')
                    }}>
              Exportar Excel
            </Button>
          </Space>
          <Table dataSource={categorias} columns={colsCat} rowKey="id"
                 loading={loading} bordered size="middle" />
        </>
      ),
    },
    {
      key: 'sub',
      label: 'Subcategorías',
      children: (
        <>
          <Space style={{ marginBottom: 16 }} wrap>
            <Select placeholder="Filtrar por categoría" allowClear style={{ width: 220 }}
                    onChange={(v) => { setFiltroCat(v); cargarSubcategorias(v) }}>
              {categorias.map((c) => (
                <Select.Option key={c.id} value={c.id}>{c.nombre}</Select.Option>
              ))}
            </Select>
            {puedeCrearSub && (
              <Button type="primary" icon={<PlusOutlined />}
                      onClick={() => {
                        setEditSub(null)
                        formSub.setFieldsValue({ id_categoria: filtroCat || null, nombre: '', descripcion: '' })
                        setModalSub(true)
                      }}>
                Nueva subcategoría
              </Button>
            )}
            <Button icon={<DownloadOutlined />}
                    onClick={() => {
                      if (!exportarExcel('subcategorias', subcategorias, COLS_EXCEL_SUB))
                        notify.msg.warning('Sin datos para exportar')
                    }}>
              Exportar Excel
            </Button>
          </Space>
          <Table dataSource={subcategorias} columns={colsSub} rowKey="id"
                 loading={loading} bordered size="middle" />
        </>
      ),
    },
  ]

  return (
    <div>
      <BackendStatusBanner />
      <Title level={3} style={{ marginBottom: 16 }}>Categorías y subcategorías</Title>
      <Tabs items={tabItems} />

      <FormModal
        title={editCat ? 'Editar categoría' : 'Nueva categoría'}
        open={modalCat}
        onCancel={() => setModalCat(false)}
        onFinish={guardarCategoria}
        form={formCat}
      >
        <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="descripcion" label="Descripción">
          <Input.TextArea rows={2} />
        </Form.Item>
      </FormModal>

      <FormModal
        title={editSub ? 'Editar subcategoría' : 'Nueva subcategoría'}
        open={modalSub}
        onCancel={() => setModalSub(false)}
        onFinish={guardarSubcategoria}
        form={formSub}
      >
        <Form.Item name="id_categoria" label="Categoría padre" rules={[{ required: true }]}>
          <Select placeholder="Seleccionar categoría">
            {categorias.map((c) => (
              <Select.Option key={c.id} value={c.id}>{c.nombre}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="nombre" label="Nombre subcategoría" rules={[{ required: true }]}>
          <Input placeholder="Ej: Cables y conductores" />
        </Form.Item>
        <Form.Item name="descripcion" label="Descripción">
          <Input.TextArea rows={2} />
        </Form.Item>
      </FormModal>
    </div>
  )
}
