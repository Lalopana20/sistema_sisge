import { useState, useEffect } from 'react'
import CambiarPasswordModal from '../CambiarPasswordModal'
import PanelApariencia from '../PanelApariencia'
import { Layout, Menu, Avatar, Dropdown, Typography, Space, theme, Tooltip } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined, AppstoreOutlined, InboxOutlined,
  SwapOutlined, HistoryOutlined, BarChartOutlined,
  UserOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  TeamOutlined, KeyOutlined, FileSearchOutlined, EnvironmentOutlined,
  BgColorsOutlined, CloudUploadOutlined, SafetyOutlined,
} from '@ant-design/icons'
import { useAuth } from '../../context/AuthContext'
import { usePermisos } from '../../hooks/usePermisos'
import { useTheme } from '../../context/ThemeContext'
import SisgeLogo from '../SisgeLogo'
import ThemeToggle from '../ThemeToggle'
import NotificacionesBandeja from '../NotificacionesBandeja'

const { Sider, Header, Content } = Layout
const { Text } = Typography

const menuItemsBase = [
  { key: '/dashboard',   icon: <DashboardOutlined />,    label: 'Dashboard',    tooltip: 'Panel principal',                       modulo: 'dashboard'   },
  { key: '/categorias',  icon: <AppstoreOutlined />,     label: 'Categorías',   tooltip: 'Gestión de categorías y subcategorías',  modulo: 'categorias'  },
  { key: '/productos',   icon: <InboxOutlined />,        label: 'Productos',    tooltip: 'Catálogo de productos e inventario',    modulo: 'productos'   },
  { key: '/movimientos', icon: <SwapOutlined />,         label: 'Movimientos',  tooltip: 'Registrar entradas, salidas y ajustes',  modulo: 'movimientos' },
  { key: '/historial',   icon: <HistoryOutlined />,      label: 'Historial',    tooltip: 'Historial completo de movimientos',     modulo: 'historial'   },
  { key: '/ubicaciones', icon: <EnvironmentOutlined />,  label: 'Ubicaciones',  tooltip: 'Material fuera del almacén',            modulo: 'ubicaciones' },
  { key: '/reportes',    icon: <BarChartOutlined />,     label: 'Reportes',     tooltip: 'Reportes y estadísticas',               modulo: 'reportes'    },
  { key: '/importar',    icon: <CloudUploadOutlined />,  label: 'Importar',     tooltip: 'Importar datos desde Excel/PDF/Word',   modulo: 'importar'    },
]

const menuItemsAdmin = [
  { key: '/usuarios',  icon: <TeamOutlined />,       label: 'Usuarios',  tooltip: 'Gestión de usuarios del sistema',     modulo: 'usuarios'  },
  { key: '/permisos',  icon: <SafetyOutlined />,     label: 'Permisos',  tooltip: 'Gestión de permisos por rol/usuario', modulo: 'permisos'  },
  { key: '/auditoria', icon: <FileSearchOutlined />, label: 'Auditoría', tooltip: 'Registro de actividad del sistema',   modulo: 'auditoria' },
]

export default function MainLayout() {
  const [collapsed,      setCollapsed]      = useState(() => localStorage.getItem('sisge_sidebar') === 'true')
  const [modalPass,      setModalPass]      = useState(false)
  const [panelAbierto,   setPanelAbierto]   = useState(false)

  useEffect(() => {
    localStorage.setItem('sisge_sidebar', String(collapsed))
  }, [collapsed])

  const { usuario, logout }  = useAuth()
  const { puedeVerModulo }   = usePermisos()
  const { config }           = useTheme()
  const navigate             = useNavigate()
  const location             = useLocation()
  const { token }            = theme.useToken()

  // Filtrar menú según permisos del usuario
  const todosLosItems = [...menuItemsBase, ...menuItemsAdmin]
  const menuItems = todosLosItems.filter(item => puedeVerModulo(item.modulo))

  // Cuando el sidebar está colapsado, envolvemos cada ítem en un Tooltip
  const itemsConTooltip = menuItems.map((item) => ({
    key:   item.key,
    icon:  collapsed
      ? <Tooltip title={item.label} placement="right">{item.icon}</Tooltip>
      : item.icon,
    label: item.label,
  }))

  const userMenu = {
    items: [
      { key: 'password',    icon: <KeyOutlined />,      label: 'Cambiar contraseña' },
      { key: 'apariencia',  icon: <BgColorsOutlined />, label: 'Personalizar apariencia' },
      { type: 'divider' },
      { key: 'logout', icon: <LogoutOutlined />, label: 'Cerrar sesión', danger: true },
    ],
    onClick: ({ key }) => {
      if (key === 'logout')     { logout(); navigate('/login') }
      if (key === 'password')   setModalPass(true)
      if (key === 'apariencia') setPanelAbierto(true)
    },
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        width={config.siderWidth}
        collapsedWidth={64}
        style={{
          background:  config.siderColor,
          overflow:    'auto',
          height:      '100vh',
          position:    'sticky',
          top:         0,
          left:        0,
          transition:  config.animaciones ? 'width 0.2s' : 'none',
        }}
      >
        {/* Logo */}
        <div
          className={`sider-brand ${collapsed ? 'sider-brand--collapsed' : ''}`}
          style={{ borderBottomColor: 'rgba(255,255,255,0.1)' }}
        >
          <SisgeLogo height={collapsed ? 32 : 44} />
        </div>

        {/* Menú */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={itemsConTooltip}
          onClick={({ key }) => navigate(key)}
          style={{
            background:  config.siderColor,
            marginTop:   8,
            border:      'none',
            fontSize:    config.fontSize,
          }}
        />

        {/* Botón de personalización en la parte inferior del sidebar */}
        <div style={{
          position:   'absolute',
          bottom:     48,           // justo encima del trigger de colapso
          width:      '100%',
          padding:    collapsed ? '8px 18px' : '8px 16px',
          borderTop:  '1px solid rgba(255,255,255,0.08)',
        }}>
          <Tooltip title="Personalizar apariencia" placement="right">
            <div
              onClick={() => setPanelAbierto(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') setPanelAbierto(true) }}
              style={{
                display:        'flex',
                alignItems:     'center',
                gap:            10,
                cursor:         'pointer',
                color:          'rgba(255,255,255,0.55)',
                padding:        '8px 12px',
                borderRadius:   config.borderRadius,
                transition:     'background 0.2s, color 0.2s',
                fontSize:       config.fontSize,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.color = '#fff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'rgba(255,255,255,0.55)'
              }}
            >
              <BgColorsOutlined style={{ fontSize: 16, flexShrink: 0 }} />
              {!collapsed && <span>Apariencia</span>}
            </div>
          </Tooltip>
        </div>
      </Sider>

      {/* ── Contenido principal ──────────────────────────────────────────── */}
      <Layout>
        <Header
          className="app-header"
          style={{ background: token.colorBgContainer }}
        >
          <div className="app-header__left">
            <span
              className="app-header__menu-btn"
              onClick={() => setCollapsed(!collapsed)}
              role="button"
              tabIndex={0}
              aria-label="Alternar menú"
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </span>
            <div className="app-header__brand">
              <SisgeLogo height={36} className="sisge-logo--header" />
              <Text type="secondary" style={{ fontSize: 13 }}>
                Gestión de almacén
              </Text>
            </div>
          </div>

          <div className="app-header__right">
            <ThemeToggle showLabel size="small" />

            <NotificacionesBandeja
              colorTextSecondary={token.colorTextSecondary}
              bgTextHover={token.colorBgTextHover}
            />

            {/* Botón de personalización en el header */}
            <Tooltip title="Personalizar apariencia">
              <div
                onClick={() => setPanelAbierto(true)}
                role="button"
                tabIndex={0}
                style={{
                  cursor:     'pointer',
                  padding:    '6px 10px',
                  borderRadius: config.borderRadius,
                  color:      token.colorTextSecondary,
                  fontSize:   18,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = token.colorBgTextHover}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <BgColorsOutlined />
              </div>
            </Tooltip>

            <Dropdown menu={userMenu} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar
                  icon={<UserOutlined />}
                  style={{ background: config.colorPrimary }}
                />
                <Text strong>{usuario?.nombre}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  ({usuario?.rol})
                </Text>
              </Space>
            </Dropdown>
          </div>
        </Header>

        <Content style={{ margin: '24px', minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>

      {/* ── Modales y drawers ────────────────────────────────────────────── */}
      <CambiarPasswordModal open={modalPass}    onClose={() => setModalPass(false)} />
      <PanelApariencia     open={panelAbierto} onClose={() => setPanelAbierto(false)} />
    </Layout>
  )
}
