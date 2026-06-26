import { useEffect, useState, useCallback } from 'react'
import {
  Table, Button, Form, Input, Select, Space,
  Typography, Tag, Tooltip,
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  UserOutlined, SafetyOutlined, DownloadOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { getApiError } from '../utils/apiError'
import { exportarExcel } from '../utils/exportExcel'
import notify from '../utils/notify'
import BackendStatusBanner from '../components/BackendStatusBanner'
import FormModal from '../components/FormModal'

const { Title, Text } = Typography

const ROL_TAG = {
  admin:      <Tag color="red">Administrador</Tag>,
  supervisor: <Tag color="blue">Supervisor</Tag>,
  operario:   <Tag color="green">Operario</Tag>,
}

export default function Usuarios() {
  const [data,     setData]     = useState([])
  const [loading,  setLoading]  = useState(false)
  const [modal,    setModal]    = useState(false)
  const [editando, setEditando] = useState(null)
  const [form]                  = Form.useForm()
  const navigate                = useNavigate()

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const r = await api.get('/usuarios')
      setData(r.data)
    } catch (err) {
      notify.error('Error al cargar', getApiError(err, 'No tienes permiso o el servidor no responde'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const abrirModal = (registro = null) => {
    setEditando(registro)
    form.setFieldsValue(registro
      ? { nombre: registro.nombre, username: registro.username, email: registro.email, rol: registro.rol }
      : { nombre: '', username: '', email: '', password: '', rol: 'operario' })
    setModal(true)
  }

  const guardar = async (valores) => {
    if (editando) {
      const body = {
        nombre:   valores.nombre,
        username: valores.username,
        email:    valores.email || null,
        rol:      valores.rol,
      }
      if (valores.password) body.password = valores.password
      await api.put(`/usuarios/${editando.id}`, body)
      notify.success('Usuario actualizado', `${valores.nombre} guardado correctamente`)
    } else {
      await api.post('/usuarios', valores)
      notify.success('Usuario creado', `${valores.nombre} registrado en el sistema`)
    }
    cargar()
  }
  const eliminar = async (registro) => {
    const identificador = registro.email || registro.username || registro.nombre
    const ok = await notify.confirm({
      title: '¿Eliminar usuario?',
      content: `Se eliminará a "${registro.nombre}" (${identificador}). Esta acción no se puede deshacer.`,
      okText: 'Sí, eliminar',
      tipo: 'danger',
    })
    if (!ok) return
    try {
      await api.delete(`/usuarios/${registro.id}`)
      notify.success('Usuario eliminado', `${registro.nombre} fue eliminado`)
      cargar()
    } catch (err) {
      notify.error('No se puede eliminar', getApiError(err, 'El usuario tiene registros asociados o es el último administrador'))
    }
  }

  const columnas = [
    { title: '#',       dataIndex: 'id',       key: 'id',       width: 55 },
    { title: 'Nombre',  dataIndex: 'nombre',   key: 'nombre',
      render: (v, r) => (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <Text strong>{v}</Text>
          {r.rol === 'admin' && (
            <Tooltip title="Administrador — acceso total">
              <SafetyOutlined style={{ color: '#ff4d4f', fontSize: 13 }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
    { title: 'Usuario', dataIndex: 'username', key: 'username',
      render: v => <Text code style={{ fontSize: 12 }}>{v}</Text>,
    },
    { title: 'Email',   dataIndex: 'email',    key: 'email',
      render: v => v || <Text type="secondary">—</Text>,
    },
    { title: 'Rol',     dataIndex: 'rol',      key: 'rol',
      render: v => ROL_TAG[v] || <Tag>{v}</Tag>,
    },
    {
      title: 'Acciones', key: 'acciones', width: 160,
      render: (_, r) => (
        <Space>
          <Tooltip title="Editar usuario">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => abrirModal(r)}
            />
          </Tooltip>
          {r.rol !== 'admin' && (
            <Tooltip title="Gestionar permisos individuales">
              <Button
                size="small"
                icon={<SafetyOutlined />}
                style={{ color: '#1890ff', borderColor: '#1890ff' }}
                onClick={() => navigate(`/permisos?usuario=${r.id}`)}
              />
            </Tooltip>
          )}
          <Tooltip title="Eliminar usuario">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => eliminar(r)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <BackendStatusBanner />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            <UserOutlined style={{ marginRight: 8 }} />
            Gestión de usuarios
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Administra los usuarios del sistema. Usa el ícono{' '}
            <SafetyOutlined style={{ color: '#1890ff' }} /> para gestionar permisos individuales.
          </Text>
        </div>
        <Space>
          <Button icon={<DownloadOutlined />}
                  onClick={() => {
                    const cols = [
                      { title: '#', key: 'id' },
                      { title: 'Nombre', key: 'nombre' },
                      { title: 'Usuario', key: 'username' },
                      { title: 'Email', key: 'email', get: (r) => r.email || '' },
                      { title: 'Rol', key: 'rol' },
                    ]
                    if (!exportarExcel('usuarios', data, cols))
                      notify.msg.warning('Sin datos para exportar')
                  }}>
            Exportar Excel
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => abrirModal()}>
            Nuevo usuario
          </Button>
        </Space>
      </div>

      <Table
        dataSource={data}
        columns={columnas}
        rowKey="id"
        loading={loading}
        bordered
        size="middle"
        rowClassName={(r) => r.rol === 'admin' ? 'row-admin' : ''}
      />

      <FormModal
        title={editando ? `Editar: ${editando.nombre}` : 'Nuevo usuario'}
        open={modal}
        onCancel={() => setModal(false)}
        onFinish={guardar}
        form={form}
        width={480}
      >
        <Form.Item
          name="nombre"
          label="Nombre completo"
          rules={[{ required: true, message: 'Obligatorio' }]}
        >
          <Input prefix={<UserOutlined />} />
        </Form.Item>

        <Form.Item
          name="username"
          label="Nombre de usuario"
          rules={[
            { required: true, message: 'Obligatorio' },
            { min: 3, message: 'Mínimo 3 caracteres' },
            { pattern: /^[a-z0-9]+$/, message: 'Solo letras minúsculas y números, sin espacios' },
          ]}
        >
          <Input autoComplete="off" placeholder="Ej: fernando, omar, santiago" />
        </Form.Item>

        <Form.Item name="email" label="Email (opcional)">
          <Input type="email" placeholder="usuario@empresa.com" />
        </Form.Item>

        <Form.Item
          name="password"
          label={editando ? 'Nueva contraseña (opcional)' : 'Contraseña'}
          rules={editando ? [] : [{ required: true, min: 6, message: 'Mínimo 6 caracteres' }]}
        >
          <Input.Password placeholder={editando ? 'Dejar vacío para no cambiar' : 'Mínimo 6 caracteres'} />
        </Form.Item>

        <Form.Item
          name="rol"
          label="Rol / Nivel de acceso"
          rules={[{ required: true, message: 'Selecciona un rol' }]}
        >
          <Select>
            <Select.Option value="admin">
              <Space>
                <SafetyOutlined style={{ color: '#ff4d4f' }} />
                Administrador — control total del sistema
              </Space>
            </Select.Option>
            <Select.Option value="supervisor">
              <Space>
                <UserOutlined style={{ color: '#1890ff' }} />
                Supervisor — catálogo completo, sin eliminar
              </Space>
            </Select.Option>
            <Select.Option value="operario">
              <Space>
                <UserOutlined style={{ color: '#52c41a' }} />
                Operario/Técnico — movimientos y consultas
              </Space>
            </Select.Option>
          </Select>
        </Form.Item>
      </FormModal>

      <style>{`
        .row-admin td { background-color: rgba(255, 77, 79, 0.03) !important; }
      `}</style>
    </div>
  )
}
