import { Card, Empty, Spin, Tag, Tooltip } from 'antd'
import { 
  TrophyOutlined, 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  MinusOutlined,
  FireOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import './TopProductosRanking.css'

/**
 * ══════════════════════════════════════════════════════════════════════════
 * TOP PRODUCTOS RANKING - Lista con medallas y rankings bacanes
 * ══════════════════════════════════════════════════════════════════════════
 */

function getMedalIcon(posicion) {
  const medals = {
    1: { icon: '🥇', color: '#FFD700', label: 'Oro' },
    2: { icon: '🥈', color: '#C0C0C0', label: 'Plata' },
    3: { icon: '🥉', color: '#CD7F32', label: 'Bronce' },
  }
  return medals[posicion] || null
}

function TrendIcon({ tendencia }) {
  if (!tendencia || tendencia === 0) {
    return (
      <Tag color="default" icon={<MinusOutlined />} style={{ fontSize: 11 }}>
        Sin cambio
      </Tag>
    )
  }

  const isPositive = tendencia > 0

  return (
    <Tag
      color={isPositive ? 'success' : 'error'}
      icon={isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
      style={{ fontSize: 11 }}
    >
      {isPositive ? '+' : ''}{tendencia}%
    </Tag>
  )
}

function ProductoItem({ producto, onClick }) {
  const medal = getMedalIcon(producto.posicion)
  const isTopThree = producto.posicion <= 3

  return (
    <div
      className={`producto-item ${onClick ? 'clickable' : ''} ${isTopThree ? 'top-three' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={isTopThree && medal ? { borderLeft: `4px solid ${medal.color}` } : undefined}
    >
      <div className="producto-item__rank">
        {medal ? (
          <Tooltip title={`Posición ${producto.posicion} - ${medal.label}`}>
            <span className="producto-item__medal">{medal.icon}</span>
          </Tooltip>
        ) : (
          <span className="producto-item__number">{producto.posicion}</span>
        )}
      </div>

      <div className="producto-item__content">
        <div className="producto-item__header">
          <Tooltip title={producto.nombre}>
            <span className="producto-item__name">{producto.nombre}</span>
          </Tooltip>
          {producto.codigo && (
            <span className="producto-item__code">#{producto.codigo}</span>
          )}
        </div>

        {producto.categoria && (
          <span className="producto-item__category">{producto.categoria}</span>
        )}

        <div className="producto-item__stats">
          <span className="producto-item__movements">
            <FireOutlined style={{ color: '#ff4d4f' }} />
            {' '}{producto.total_movimientos} movimientos
          </span>
          <TrendIcon tendencia={producto.tendencia} />
        </div>
      </div>

      <div className="producto-item__quantity">
        <div className="producto-item__quantity-value">
          {producto.cantidad_total.toLocaleString()}
        </div>
        <div className="producto-item__quantity-label">unidades</div>
      </div>
    </div>
  )
}

export default function TopProductosRanking({
  data = [],
  loading = false,
  onProductoClick,
  title = 'Top 10 Productos Más Usados',
}) {
  const navigate = useNavigate()

  const handleClick = (producto) => {
    if (onProductoClick) {
      onProductoClick(producto)
    } else {
      navigate(`/productos/${producto.id}`)
    }
  }

  return (
    <Card
      className="top-productos-ranking"
      title={
        <span>
          <TrophyOutlined style={{ color: '#faad14', fontSize: 18, marginRight: 8 }} />
          {title}
        </span>
      }
    >
      {loading ? (
        <div className="top-productos-ranking__loading">
          <Spin size="large" tip="Cargando ranking..." />
        </div>
      ) : data.length === 0 ? (
        <Empty description="No hay datos de productos" />
      ) : (
        <div className="top-productos-ranking__list">
          {data.map((producto) => (
            <ProductoItem
              key={producto.id}
              producto={producto}
              onClick={() => handleClick(producto)}
            />
          ))}
        </div>
      )}
    </Card>
  )
}
