import { useEffect, useState, useCallback } from 'react'
import {
  Card, Table, Switch, Select, Button, Space, Tag, Typography,
  Drawer, Alert, Tooltip, Row, Col, Popconfirm,
  Tabs, Form, Input,
} from 'antd'
import {
  SafetyOutlined, UserOutlined, TeamOutlined,
  CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined,
  EditOutlined,
  LockOutlined, UnlockOutlined, WarningOutlined,
} from '@ant-design/icons'
import { useSearchParams } from 'react-router-dom'
import api from '../services/api'
import { getApiError } from '../utils/apiError'
import notify from '../utils/notify'
import BackendStatusBanner from '../components/BackendStatusBanner'

const { Title, Text } = Typography

// ── Configuración de módulos ──────────────────────────────────────────────────
const MODULOS = [
  { key: 'dashboard',     label: 'Dashboard',      desc: 'Panel principal con KPIs' },
  { key: 'productos',     label: 'Productos',       desc: 'Catálogo e inventario' },
  { key: 'categorias',    label: 'Categorías',      desc: 'Categorías y subcategorías' },
  { key: 'subcategorias', label: 'Subcategorías',   desc: 'Subcategorías de productos' },
  { key: 'movimientos',   label: 'Movimientos',     desc: 'Entradas, salidas, ajustes' },
  { key: 'historial',     label: 'Historial',       desc: 'Historial de movimientos' },
  { key: 'ubicaciones',   label: 'Ubicaciones',     desc: 'Material en campo' },
  { key: 'reportes',      label: 'Reportes',        desc: 'Estadísticas y exportación' },
  { key: 'importar',      label: 'Importar',        desc: 'Carga masiva de datos' },
  { key: 'usuarios',      label: 'Usuarios',        desc: 'Gestión de usuarios' },
  { key: 'auditoria',     label: 'Auditoría',       desc: 'Registro de actividad' },
]

const ACCIONES = ['ver', 'crear', 'editar', 'eliminar']
const ACCION_LABELS = { ver: 'Ver', crear: 'Crear', editar: 'Editar', eliminar: 'Eliminar' }
const ACCION_CAMPOS = { ver: 'puede_ver', crear: 'puede_crear', editar: 'puede_editar', eliminar: 'puede_eliminar' }

const ROL_COLORS = { admin: 'red', supervisor: 'blue', operario: 'green' }
const ROL_LABELS = { admin: 'Administrador', supervisor: 'Supervisor', operario: 'Operario/Técnico' }

// ── Celda de switch de permiso ────────────────────────────────────────────────
function SwitchPermiso({ checked, onChange, disabled, loading }) {
  return (
    <Switch
      size="small"
      checked={!!checked}
      onChange={onChange}
      disabled={disabled}
      loading={loading}
      checkedChildren={<CheckCircleOutlined />}
      unCheckedChildren={<CloseCircleOutlined />}
    />
  )
}

// ── Tab 1: Permisos por ROL ───────────────────────────────────────────────────
function TabPermisosPorRol() {
  const [permisosRoles, setPermisosRoles] = useState({})
  const [rolSeleccionado, setRolSeleccionado] = useState('operario')
  const [guardando, setGuardando] = useState({}) // { 'modulo-accion': true }
  const [cargando, setCargando] = useState(false)

  const cargar = useCallback(async () => {
    setCargando(true)
    try {
      const { data } = await api.get('/permisos')
      // data = { admin: [...], supervisor: [...], operario: [...] }
      const mapa = {}
      Object.entries(data).forEach(([rol, lista]) => {
        mapa[rol] = {}
        lista.forEach(p => { mapa[rol][p.modulo] = p })
      })
      setPermisosRoles(mapa)
    } catch (err) {
      notify.error('Error', getApiError(err))
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const cambiarPermiso = async (rol, modulo, accion, valor) => {
    const key = `${rol}-${modulo}-${accion}`
    setGuardando(prev => ({ ...prev, [key]: true }))
    try {
      const actual = permisosRoles[rol]?.[modulo] || {}
      await api.put('/permisos', {
        rol, modulo,
        puede_ver:      accion === 'ver'      ? valor : !!actual.puede_ver,
        puede_crear:    accion === 'crear'    ? valor : !!actual.puede_crear,
        puede_editar:   accion === 'editar'   ? valor : !!actual.puede_editar,
        puede_eliminar: accion === 'eliminar' ? valor : !!actual.puede_eliminar,
      })
      // Actualizar estado local sin recargar
      setPermisosRoles(prev => ({
        ...prev,
        [rol]: {
          ...prev[rol],
          [modulo]: { ...prev[rol]?.[modulo], [ACCION_CAMPOS[accion]]: valor },
        },
      }))
    } catch (err) {
      notify.error('Error al guardar', getApiError(err))
    } finally {
      setGuardando(prev => ({ ...prev, [key]: false }))
    }
  }

  const columnas = [
    {
      title: 'Módulo', dataIndex: 'key', width: 160,
      render: (k) => {
        const m = MODULOS.find(x => x.key === k)
        return (
          <div>
            <Text strong style={{ fontSize: 13 }}>{m?.label || k}</Text>
            <Text type="secondary" style={{ display: 'block', fontSize: 11 }}>{m?.desc}</Text>
          </div>
        )
      },
    },
    ...ACCIONES.map(accion => ({
      title: ACCION_LABELS[accion],
      key: accion,
      align: 'center',
      width: 90,
      render: (_, row) => {
        if (rolSeleccionado === 'admin') {
          return <Tag color="green" style={{ fontSize: 11 }}>Siempre</Tag>
        }
        const campo = ACCION_CAMPOS[accion]
        const checked = !!permisosRoles[rolSeleccionado]?.[row.key]?.[campo]
        const key = `${rolSeleccionado}-${row.key}-${accion}`
        return (
          <SwitchPermiso
            checked={checked}
            loading={!!guardando[key]}
            onChange={(val) => cambiarPermiso(rolSeleccionado, row.key, accion, val)}
          />
        )
      },
    })),
  ]

  return (
    <div>
      <Alert
        type="info" showIcon style={{ marginBottom: 16, borderRadius: 8 }}
        message="Los permisos de rol aplican a TODOS los usuarios con ese rol. Para excepciones individuales usa la pestaña 'Por usuario'."
      />
      <Space style={{ marginBottom: 16 }}>
        <Text strong>Rol:</Text>
        {['admin', 'supervisor', 'operario'].map(rol => (
          <Button
            key={rol}
            type={rolSeleccionado === rol ? 'primary' : 'default'}
            size="small"
            onClick={() => setRolSeleccionado(rol)}
            style={{ borderRadius: 20 }}
          >
            <Tag color={ROL_COLORS[rol]} style={{ margin: 0, border: 'none', background: 'transparent', padding: 0 }}>
              {ROL_LABELS[rol]}
            </Tag>
          </Button>
        ))}
        <Button icon={<ReloadOutlined />} size="small" onClick={cargar} loading={cargando}>
          Recargar
        </Button>
      </Space>

      {rolSeleccionado === 'admin' && (
        <Alert
          type="warning" showIcon style={{ marginBottom: 12, borderRadius: 8 }}
          message="Los administradores tienen acceso total al sistema. Sus permisos no se pueden modificar."
        />
      )}

      <Table
        dataSource={MODULOS}
        columns={columnas}
        rowKey="key"
        loading={cargando}
        pagination={false}
        bordered
        size="small"
      />
    </div>
  )
}

// ── Tab 2: Permisos por USUARIO ───────────────────────────────────────────────
function TabPermisosPorUsuario({ usuarioIdInicial = null }) {
  const [usuarios, setUsuarios] = useState([])
  const [usuarioSel, setUsuarioSel] = useState(usuarioIdInicial)
  const [vistaPermisos, setVistaPermisos] = useState([])
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false)
  const [cargandoPermisos, setCargandoPermisos] = useState(false)
  const [guardando, setGuardando] = useState({})
  const [drawerMotivo, setDrawerMotivo] = useState(null) // { modulo, accion, valor }
  const [formMotivo] = Form.useForm()

  // Cargar permisos del usuario seleccionado
  const cargarPermisos = useCallback(async (id) => {
    if (!id) return
    setCargandoPermisos(true)
    try {
      const { data } = await api.get(`/permisos/usuario/${id}`)
      setVistaPermisos(data.vista || [])
    } catch (err) {
      notify.error('Error', getApiError(err))
    } finally {
      setCargandoPermisos(false)
    }
  }, [])

  // Cargar lista de usuarios
  useEffect(() => {
    setCargandoUsuarios(true)
    api.get('/usuarios')
      .then(r => setUsuarios((r.data || []).filter(u => u.rol !== 'admin')))
      .catch(err => notify.error('Error', getApiError(err)))
      .finally(() => setCargandoUsuarios(false))
  }, [])

  // Si viene un ID inicial (desde Usuarios.jsx), cargar sus permisos automáticamente
  useEffect(() => {
    if (usuarioIdInicial) cargarPermisos(usuarioIdInicial)
  }, [usuarioIdInicial, cargarPermisos])

  const onSeleccionarUsuario = (id) => {
    setUsuarioSel(id)
    cargarPermisos(id)
  }

  // Guardar override con motivo opcional
  const guardarOverride = async ({ motivo }) => {
    const { modulo, accion, valor } = drawerMotivo
    const key = `${modulo}-${accion}`
    setGuardando(prev => ({ ...prev, [key]: true }))
    setDrawerMotivo(null)
    formMotivo.resetFields()

    try {
      const actual = vistaPermisos.find(v => v.modulo === modulo)
      // Solo envía el campo modificado como override explícito.
      // Los campos no enviados se almacenan como NULL en BD
      // y heredan el valor del rol al calcular permisos efectivos.
      const o = actual?.override || {}
      await api.put(`/permisos/usuario/${usuarioSel}`, {
        modulo,
        puede_ver:      accion === 'ver'      ? valor : o.puede_ver,
        puede_crear:    accion === 'crear'    ? valor : o.puede_crear,
        puede_editar:   accion === 'editar'   ? valor : o.puede_editar,
        puede_eliminar: accion === 'eliminar' ? valor : o.puede_eliminar,
        motivo: motivo || null,
      })
      notify.success('Permiso actualizado', `Módulo "${modulo}" actualizado`)
      cargarPermisos(usuarioSel)
    } catch (err) {
      notify.error('Error', getApiError(err))
    } finally {
      setGuardando(prev => ({ ...prev, [key]: false }))
    }
  }

  const iniciarCambio = (modulo, accion, valor) => {
    setDrawerMotivo({ modulo, accion, valor })
  }

  const resetearModulo = async (modulo) => {
    try {
      await api.delete(`/permisos/usuario/${usuarioSel}/modulo/${modulo}`)
      notify.success('Override eliminado', `"${modulo}" vuelve a usar permisos del rol`)
      cargarPermisos(usuarioSel)
    } catch (err) {
      notify.error('Error', getApiError(err))
    }
  }

  const resetearTodo = async () => {
    const ok = await notify.confirm({
      title: '¿Eliminar todos los permisos personalizados?',
      content: 'El usuario volverá a usar únicamente los permisos de su rol.',
      okText: 'Sí, resetear',
      tipo: 'warning',
    })
    if (!ok) return
    try {
      await api.delete(`/permisos/usuario/${usuarioSel}/reset`)
      notify.success('Permisos reseteados', 'El usuario usa ahora solo los permisos del rol')
      cargarPermisos(usuarioSel)
    } catch (err) {
      notify.error('Error', getApiError(err))
    }
  }

  const usuarioActual = usuarios.find(u => u.id === usuarioSel)
  const tieneOverrides = vistaPermisos.some(v => v.override !== null)

  const columnas = [
    {
      title: 'Módulo', dataIndex: 'modulo', width: 150,
      render: (k) => {
        const m = MODULOS.find(x => x.key === k)
        return (
          <div>
            <Text strong style={{ fontSize: 13 }}>{m?.label || k}</Text>
            <Text type="secondary" style={{ display: 'block', fontSize: 11 }}>{m?.desc}</Text>
          </div>
        )
      },
    },
    ...ACCIONES.map(accion => ({
      title: (
        <Tooltip title={`Permiso de ${ACCION_LABELS[accion].toLowerCase()}`}>
          {ACCION_LABELS[accion]}
        </Tooltip>
      ),
      key: accion,
      align: 'center',
      width: 100,
      render: (_, row) => {
        const campo = ACCION_CAMPOS[accion]
        const efectivo = !!row.efectivo?.[campo]
        const tieneOverride = row.override !== null
        const key = `${row.modulo}-${accion}`

        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <SwitchPermiso
              checked={efectivo}
              loading={!!guardando[key]}
              onChange={(val) => iniciarCambio(row.modulo, accion, val)}
            />
            {tieneOverride && (
              <Tag
                color="orange"
                style={{ fontSize: 9, padding: '0 4px', lineHeight: '14px', marginTop: 2 }}
              >
                personalizado
              </Tag>
            )}
          </div>
        )
      },
    })),
    {
      title: 'Estado', key: 'estado', width: 110, align: 'center',
      render: (_, row) => {
        if (row.override) {
          return (
            <Space direction="vertical" size={2} style={{ alignItems: 'center' }}>
              <Tag color="orange" icon={<EditOutlined />} style={{ fontSize: 11 }}>Override</Tag>
              <Popconfirm
                title="¿Eliminar personalización?"
                description="Volverá a usar los permisos del rol"
                onConfirm={() => resetearModulo(row.modulo)}
                okText="Sí" cancelText="No"
              >
                <Button type="link" size="small" danger style={{ padding: 0, fontSize: 11 }}>
                  Resetear
                </Button>
              </Popconfirm>
            </Space>
          )
        }
        return <Tag color="default" style={{ fontSize: 11 }}>Del rol</Tag>
      },
    },
  ]

  return (
    <div>
      <Alert
        type="info" showIcon style={{ marginBottom: 16, borderRadius: 8 }}
        message={
          <span>
            Aquí puedes <strong>ampliar o restringir</strong> permisos para un usuario específico,
            independientemente de su rol. Los cambios se aplican solo a ese usuario.
          </span>
        }
      />

      {/* Selector de usuario */}
      <Card size="small" style={{ marginBottom: 16, borderRadius: 10 }}>
        <Space wrap>
          <Text strong>Usuario:</Text>
          <Select
            style={{ width: 260 }}
            placeholder="Selecciona un usuario..."
            loading={cargandoUsuarios}
            onChange={onSeleccionarUsuario}
            value={usuarioSel}
            showSearch
            optionFilterProp="label"
            options={usuarios.map(u => ({
              value: u.id,
              label: `${u.nombre} (${u.username}) — ${ROL_LABELS[u.rol] || u.rol}`,
            }))}
          />
          {usuarioActual && (
            <Tag color={ROL_COLORS[usuarioActual.rol]}>
              {ROL_LABELS[usuarioActual.rol]}
            </Tag>
          )}
          {usuarioSel && tieneOverrides && (
            <Popconfirm
              title="¿Resetear todos los permisos personalizados?"
              description="El usuario volverá a usar solo los permisos de su rol"
              onConfirm={resetearTodo}
              okText="Sí, resetear todo" cancelText="Cancelar"
            >
              <Button danger size="small" icon={<ReloadOutlined />}>
                Resetear todo
              </Button>
            </Popconfirm>
          )}
        </Space>
      </Card>

      {/* Leyenda */}
      {usuarioSel && (
        <Space style={{ marginBottom: 12 }} wrap>
          <Tag color="default">Del rol — hereda del rol base</Tag>
          <Tag color="orange" icon={<EditOutlined />}>Override — permiso personalizado para este usuario</Tag>
          <Tag color="green" icon={<CheckCircleOutlined />}>Activo</Tag>
          <Tag color="red" icon={<CloseCircleOutlined />}>Inactivo</Tag>
        </Space>
      )}

      {usuarioSel ? (
        <Table
          dataSource={vistaPermisos}
          columns={columnas}
          rowKey="modulo"
          loading={cargandoPermisos}
          pagination={false}
          bordered
          size="small"
          rowClassName={(row) => row.override ? 'row-override' : ''}
        />
      ) : (
        <Card style={{ textAlign: 'center', padding: 40, borderRadius: 10 }}>
          <UserOutlined style={{ fontSize: 48, color: '#d9d9d9', display: 'block', marginBottom: 12 }} />
          <Text type="secondary">Selecciona un usuario para ver y editar sus permisos</Text>
        </Card>
      )}

      {/* Drawer para confirmar cambio con motivo */}
      <Drawer
        title={
          <Space>
            <SafetyOutlined style={{ color: '#1890ff' }} />
            Confirmar cambio de permiso
          </Space>
        }
        open={!!drawerMotivo}
        onClose={() => { setDrawerMotivo(null); formMotivo.resetFields() }}
        width={400}
        footer={
          <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
            <Button onClick={() => { setDrawerMotivo(null); formMotivo.resetFields() }}>
              Cancelar
            </Button>
            <Button type="primary" onClick={() => formMotivo.submit()}>
              Confirmar cambio
            </Button>
          </Space>
        }
      >
        {drawerMotivo && (
          <>
            <Alert
              type={drawerMotivo.valor ? 'success' : 'warning'}
              showIcon
              style={{ marginBottom: 16, borderRadius: 8 }}
              icon={drawerMotivo.valor ? <UnlockOutlined /> : <LockOutlined />}
              message={
                <span>
                  {drawerMotivo.valor ? 'Otorgando' : 'Quitando'} permiso de{' '}
                  <strong>{ACCION_LABELS[drawerMotivo.accion]}</strong> en{' '}
                  <strong>{MODULOS.find(m => m.key === drawerMotivo.modulo)?.label || drawerMotivo.modulo}</strong>
                  {' '}a <strong>{usuarioActual?.nombre}</strong>
                </span>
              }
            />
            <Form form={formMotivo} layout="vertical" onFinish={guardarOverride}>
              <Form.Item
                name="motivo"
                label="Motivo (opcional)"
                extra="Queda registrado en auditoría para trazabilidad"
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Ej: Asignado temporalmente para proyecto OT-2025-001..."
                />
              </Form.Item>
            </Form>
          </>
        )}
      </Drawer>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function GestionPermisos() {
  const [searchParams] = useSearchParams()
  // Si viene ?usuario=ID desde Usuarios.jsx, abrir directamente la pestaña de usuario
  const usuarioIdParam = searchParams.get('usuario')
  const tabInicial = usuarioIdParam ? 'usuarios' : 'roles'

  return (
    <div>
      <BackendStatusBanner />

      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          <SafetyOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          Gestión de permisos
        </Title>
        <Text type="secondary">
          Controla qué puede hacer cada rol y cada usuario en el sistema.
          Los cambios se aplican en el próximo inicio de sesión del usuario.
        </Text>
      </div>

      {/* Resumen visual de la jerarquía */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {[
          {
            rol: 'admin',
            icon: <SafetyOutlined style={{ fontSize: 22, color: '#ff4d4f' }} />,
            titulo: 'Administrador',
            desc: 'Acceso total al sistema. No se puede restringir.',
            color: '#fff2f0',
            border: '#ffccc7',
          },
          {
            rol: 'supervisor',
            icon: <TeamOutlined style={{ fontSize: 22, color: '#1890ff' }} />,
            titulo: 'Supervisor',
            desc: 'Puede ver y crear en casi todos los módulos. No puede eliminar.',
            color: '#e6f7ff',
            border: '#91d5ff',
          },
          {
            rol: 'operario',
            icon: <UserOutlined style={{ fontSize: 22, color: '#52c41a' }} />,
            titulo: 'Operario / Técnico',
            desc: 'Solo movimientos, consultas y ubicaciones. Sin acceso a configuración.',
            color: '#f6ffed',
            border: '#b7eb8f',
          },
        ].map(item => (
          <Col key={item.rol} xs={24} md={8}>
            <Card
              size="small"
              style={{
                borderRadius: 10,
                background: item.color,
                borderColor: item.border,
              }}
            >
              <Space>
                {item.icon}
                <div>
                  <Text strong style={{ display: 'block' }}>{item.titulo}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>{item.desc}</Text>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Alert
        type="warning"
        showIcon
        icon={<WarningOutlined />}
        style={{ marginBottom: 20, borderRadius: 8 }}
        message={
          <span>
            <strong>Importante:</strong> Los cambios de permisos se reflejan en el{' '}
            <strong>próximo inicio de sesión</strong> del usuario afectado.
            Si el usuario ya tiene sesión activa, debe cerrar sesión y volver a entrar.
          </span>
        }
      />

      <Card style={{ borderRadius: 12 }}>
        <Tabs
          defaultActiveKey={tabInicial}
          items={[
            {
              key: 'roles',
              label: (
                <Space>
                  <TeamOutlined />
                  Permisos por rol
                </Space>
              ),
              children: <TabPermisosPorRol />,
            },
            {
              key: 'usuarios',
              label: (
                <Space>
                  <UserOutlined />
                  Permisos por usuario
                </Space>
              ),
              children: <TabPermisosPorUsuario usuarioIdInicial={usuarioIdParam ? Number(usuarioIdParam) : null} />,
            },
          ]}
        />
      </Card>

      <style>{`
        .row-override td {
          background-color: rgba(250, 140, 22, 0.04) !important;
        }
      `}</style>
    </div>
  )
}
