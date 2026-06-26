import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Row, Col, Alert, Typography, Button, Space, Spin, message,
} from 'antd'
import {
  DollarOutlined, AppstoreOutlined, WarningOutlined, ClockCircleOutlined,
  EnvironmentOutlined, InboxOutlined, ReloadOutlined, FireOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import relativeTime from 'dayjs/plugin/relativeTime'
import api from '../services/api'
import BackendStatusBanner from '../components/BackendStatusBanner'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

// Componentes mejorados del Dashboard C2
import SuperKPICard from '../components/dashboard/SuperKPICard'
import MovimientosChartPlus from '../components/dashboard/MovimientosChartPlus'
import StockCategoriasBar from '../components/dashboard/StockCategoriasBar'
import TopProductosRanking from '../components/dashboard/TopProductosRanking'

dayjs.extend(relativeTime)
dayjs.locale('es')

const { Title, Text } = Typography

// Gradientes para las cards KPI
const GRADIENTS = {
  purple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  green: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  red: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
  orange: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
  blue: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  teal: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [dashboardData, setDashboardData] = useState({
    kpis: null,
    movimientos: [],
    stockCategorias: [],
    topProductos: [],
    alertas: null,
  })
  const [selectedPeriod, setSelectedPeriod] = useState(30)

  const navigate = useNavigate()
  const { usuario } = useAuth()
  const { isDark } = useTheme()
  const reintentosRef = useRef(0)

  // Cargar todos los datos del dashboard
  const cargarDatos = useCallback(async (silencioso = false) => {
    if (!silencioso) setLoading(true)
    else setRefreshing(true)

    try {
      // Promise.allSettled: si un endpoint falla, los demás siguen mostrándose
      const [kpisRes, movimientosRes, categoriasRes, topRes, alertasRes] = await Promise.allSettled([
        api.get('/dashboard/kpis'),
        api.get(`/dashboard/movimientos?dias=${selectedPeriod}`),
        api.get('/dashboard/stock-categorias'),
        api.get(`/dashboard/top-productos?limit=10&dias=${selectedPeriod}`),
        api.get('/dashboard/alertas'),
      ])

      // Extraer valores exitosos, dejar null si falló
      const getValue = (result, fallback = null) =>
        result.status === 'fulfilled' ? result.value.data : fallback

      const nuevosKpis          = getValue(kpisRes)
      const nuevosMovimientos    = getValue(movimientosRes, [])
      const nuevasCategorias     = getValue(categoriasRes, [])
      const nuevosTop            = getValue(topRes, [])
      const nuevasAlertas        = getValue(alertasRes)

      setDashboardData({
        kpis:            nuevosKpis,
        movimientos:     nuevosMovimientos,
        stockCategorias: nuevasCategorias,
        topProductos:    nuevosTop,
        alertas:         nuevasAlertas,
      })

      setLastUpdate(new Date())

      // Reportar solo los endpoints que fallaron, no bloquear toda la UI
      const fallidos = [kpisRes, movimientosRes, categoriasRes, topRes, alertasRes]
        .filter(r => r.status === 'rejected').length
      if (fallidos === 5 && reintentosRef.current < 1) {
        reintentosRef.current++
        setTimeout(() => cargarDatos(true), 3000)
      } else if (fallidos > 0) {
        reintentosRef.current = 0
        message.warning(`${fallidos} sección(es) del dashboard no pudieron cargar`)
      } else {
        reintentosRef.current = 0
        if (silencioso) message.success('Dashboard actualizado')
      }
    } catch (error) {
      console.error('Error al cargar dashboard:', error)
      message.error('Error al cargar los datos del dashboard')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [selectedPeriod])

  // Cargar al montar y configurar auto-refresh
  useEffect(() => {
    cargarDatos(true)
    const interval = setInterval(() => cargarDatos(true), 120000) // Cada 2 minutos
    return () => clearInterval(interval)
  }, [cargarDatos])

  // Manejar cambio de período en el gráfico
  const handlePeriodChange = (dias) => {
    setSelectedPeriod(dias)
  }

  // Loading skeleton
  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Spin size="large" tip="Cargando dashboard..." />
        </Space>
      </div>
    )
  }

  const { kpis, movimientos, stockCategorias, topProductos, alertas } = dashboardData

  return (
    <div className="dashboard-page" style={{ padding: '0' }}>
      <BackendStatusBanner />

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Title level={3} style={{ margin: 0, marginBottom: 4 }}>
              Dashboard
            </Title>
            <Text type="secondary">
              Resumen en tiempo real del almacén • Bienvenido, {usuario?.nombre}
            </Text>
          </div>
          <Space>
            {lastUpdate && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                {dayjs(lastUpdate).fromNow()}
              </Text>
            )}
            <Button
              icon={<ReloadOutlined spin={refreshing} />}
              onClick={() => cargarDatos(true)}
              loading={refreshing}
            >
              Actualizar
            </Button>
          </Space>
        </div>
      </div>

      {/* Alerta de stock crítico */}
      {alertas && alertas.stock_bajo > 0 && (
        <Alert
          type="warning"
          showIcon
          message={
            <span>
              <strong>{alertas.stock_bajo}</strong> producto(s) con stock bajo del mínimo.{' '}
              <a onClick={() => navigate('/productos?filtro=stock_bajo')} style={{ fontWeight: 600 }}>
                Ver productos →
              </a>
            </span>
          }
          style={{ marginBottom: 16, borderRadius: 8 }}
          closable
        />
      )}

      {/* KPIs Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={4}>
          <SuperKPICard
            title="Valor Inventario"
            value={kpis?.valor_inventario || 0}
            icon={<DollarOutlined />}
            gradient={GRADIENTS.purple}
            prefix="$"
            decimals={2}
            trend={kpis?.valor_inventario_cambio}
            onClick={() => navigate('/productos')}
            tooltip="Valor total del inventario (precio × stock)"
          />
        </Col>
        
        <Col xs={24} sm={12} lg={4}>
          <SuperKPICard
            title="Productos Activos"
            value={kpis?.total_productos || 0}
            icon={<AppstoreOutlined />}
            gradient={GRADIENTS.green}
            suffix=" items"
            trend={kpis?.productos_nuevos}
            trendLabel="nuevos esta semana"
            onClick={() => navigate('/productos')}
            tooltip="Total de productos en el catálogo"
          />
        </Col>

        <Col xs={24} sm={12} lg={4}>
          <SuperKPICard
            title="Stock Bajo"
            value={kpis?.stock_bajo || 0}
            icon={<WarningOutlined />}
            gradient={GRADIENTS.red}
            suffix=" productos"
            trend={kpis?.stock_bajo_cambio}
            onClick={() => navigate('/productos?filtro=stock_bajo')}
            tooltip="Productos con stock <= mínimo"
          />
        </Col>

        <Col xs={24} sm={12} lg={4}>
          <SuperKPICard
            title="Material Vencido"
            value={kpis?.material_vencido || 0}
            icon={<ClockCircleOutlined />}
            gradient={GRADIENTS.orange}
            suffix=" ubicaciones"
            trend={kpis?.material_vencido_cambio}
            onClick={() => navigate('/ubicaciones?vencidas=true')}
            tooltip="Material >7 días sin devolver"
          />
        </Col>

        <Col xs={24} sm={12} lg={4}>
          <SuperKPICard
            title="En Campo"
            value={kpis?.ubicaciones_activas || 0}
            icon={<EnvironmentOutlined />}
            gradient={GRADIENTS.blue}
            suffix=" activas"
            onClick={() => navigate('/ubicaciones')}
            tooltip="Ubicaciones activas (material fuera del almacén)"
          />
        </Col>

        <Col xs={24} sm={12} lg={4}>
          <SuperKPICard
            title="Total en Stock"
            value={kpis?.total_items_stock || 0}
            icon={<InboxOutlined />}
            gradient={GRADIENTS.teal}
            suffix=" unidades"
            tooltip="Suma total de todas las unidades en stock"
          />
        </Col>
      </Row>

      {/* Gráfico de Movimientos */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24}>
          <MovimientosChartPlus
            data={movimientos}
            loading={false}
            onPeriodChange={handlePeriodChange}
            onRefresh={() => cargarDatos(true)}
            defaultPeriod={selectedPeriod}
            isDark={isDark}
          />
        </Col>
      </Row>

      {/* Stock por Categorías y Top Productos */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={10}>
          <StockCategoriasBar
            data={stockCategorias}
            loading={false}
            onCategoriaClick={(cat) => navigate(`/productos?categoria=${cat.id}`)}
          />
        </Col>

        <Col xs={24} lg={14}>
          <TopProductosRanking
            data={topProductos}
            loading={false}
            title="🔥 Top 10 Productos Más Usados - Último mes"
            onProductoClick={(prod) => navigate(`/productos/${prod.id}`)}
          />
        </Col>
      </Row>

      {/* Panel de Alertas Resumido */}
      {alertas && (
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <div
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 16,
                padding: 24,
                color: 'white',
              }}
            >
              <Title level={4} style={{ color: 'white', margin: 0, marginBottom: 16 }}>
                📊 Resumen de Alertas
              </Title>
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={6}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 32, fontWeight: 700 }}>{alertas.stock_bajo}</div>
                    <div style={{ fontSize: 13, opacity: 0.9 }}>Stock Bajo</div>
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 32, fontWeight: 700 }}>{alertas.material_vencido}</div>
                    <div style={{ fontSize: 13, opacity: 0.9 }}>Material Vencido</div>
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 32, fontWeight: 700 }}>{alertas.sin_movimiento}</div>
                    <div style={{ fontSize: 13, opacity: 0.9 }}>Sin Movimiento</div>
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 32, fontWeight: 700 }}>{alertas.devoluciones_pendientes}</div>
                    <div style={{ fontSize: 13, opacity: 0.9 }}>Devoluciones Pendientes</div>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      )}
    </div>
  )
}
