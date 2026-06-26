import { Card, Progress, Empty, Spin, Tooltip, Tag } from 'antd'
import { AppstoreOutlined, WarningOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import './StockCategoriasBar.css'

/**
 * ══════════════════════════════════════════════════════════════════════════
 * STOCK CATEGORIAS BAR - Barras de progreso bacanas por categoría
 * ══════════════════════════════════════════════════════════════════════════
 */

function getStatusConfig(porcentaje) {
  if (porcentaje >= 70) {
    return {
      status: 'success',
      color: '#52c41a',
      icon: <CheckCircleOutlined />,
      label: 'Bueno',
      bgColor: 'rgba(82, 196, 26, 0.1)',
    }
  } else if (porcentaje >= 40) {
    return {
      status: 'warning',
      color: '#fadb14',
      icon: <ExclamationCircleOutlined />,
      label: 'Medio',
      bgColor: 'rgba(250, 219, 20, 0.1)',
    }
  } else {
    return {
      status: 'exception',
      color: '#ff4d4f',
      icon: <WarningOutlined />,
      label: 'Crítico',
      bgColor: 'rgba(255, 77, 79, 0.1)',
      pulse: true,
    }
  }
}

function CategoriaItem({ categoria, onClick }) {
  const statusConfig = getStatusConfig(categoria.porcentaje)

  return (
    <div
      className={`categoria-item ${onClick ? 'clickable' : ''} ${statusConfig.pulse ? 'pulse' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{ backgroundColor: statusConfig.bgColor }}
    >
      <div className="categoria-item__header">
        <Tooltip title={`${categoria.total_productos} productos`}>
          <span className="categoria-item__name">{categoria.categoria}</span>
        </Tooltip>
        <div className="categoria-item__badges">
          {categoria.productos_bajo_stock > 0 && (
            <Tooltip title={`${categoria.productos_bajo_stock} productos bajo stock`}>
              <Tag color="red" style={{ margin: 0, fontSize: 11 }}>
                {categoria.productos_bajo_stock} ⚠️
              </Tag>
            </Tooltip>
          )}
          <Tag 
            color={statusConfig.status === 'success' ? 'success' : statusConfig.status === 'warning' ? 'warning' : 'error'}
            icon={statusConfig.icon}
            style={{ margin: 0, fontSize: 11 }}
          >
            {statusConfig.label}
          </Tag>
        </div>
      </div>

      <div className="categoria-item__progress-container">
        <Progress
          percent={Math.round(categoria.porcentaje)}
          strokeColor={statusConfig.color}
          trailColor="rgba(0, 0, 0, 0.06)"
          strokeWidth={12}
          showInfo={false}
          className="categoria-item__progress"
        />
        <div className="categoria-item__percentage" style={{ color: statusConfig.color }}>
          {Math.round(categoria.porcentaje)}%
        </div>
      </div>

      <div className="categoria-item__details">
        <span className="categoria-item__stock">
          Stock: {categoria.stock_actual.toLocaleString()} unidades
        </span>
        <span className="categoria-item__minimo">
          Mínimo: {categoria.stock_minimo.toLocaleString()}
        </span>
      </div>
    </div>
  )
}

export default function StockCategoriasBar({
  data = [],
  loading = false,
  onCategoriaClick,
}) {
  const navigate = useNavigate()

  const handleClick = (categoria) => {
    if (onCategoriaClick) {
      onCategoriaClick(categoria)
    } else {
      navigate(`/productos?categoria=${categoria.id}`)
    }
  }

  return (
    <Card
      className="stock-categorias-bar"
      title={
        <span>
          <AppstoreOutlined style={{ color: '#667eea', fontSize: 18, marginRight: 8 }} />
          Stock por Categoría
        </span>
      }
    >
      {loading ? (
        <div className="stock-categorias-bar__loading">
          <Spin size="large" tip="Cargando categorías..." />
        </div>
      ) : data.length === 0 ? (
        <Empty description="No hay categorías disponibles" />
      ) : (
        <div className="stock-categorias-bar__list">
          {data.map((categoria) => (
            <CategoriaItem
              key={categoria.id}
              categoria={categoria}
              onClick={() => handleClick(categoria)}
            />
          ))}
        </div>
      )}
    </Card>
  )
}
