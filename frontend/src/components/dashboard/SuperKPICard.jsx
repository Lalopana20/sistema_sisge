import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, Skeleton, Tooltip } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from '@ant-design/icons'
import './SuperKPICard.css'

/**
 * ══════════════════════════════════════════════════════════════════════════
 * SUPER KPI CARD - Tarjeta KPI con gradientes y animaciones bacanas
 * ══════════════════════════════════════════════════════════════════════════
 */

// Contador animado con efecto de "odómetro"
function AnimatedCounter({ value, duration = 1200, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(0)
  const rafRef = useRef(null)
  const startRef = useRef(null)

  const animate = useCallback((timestamp) => {
    if (!startRef.current) startRef.current = timestamp
    const progress = Math.min((timestamp - startRef.current) / duration, 1)
    
    // Easing function para animación suave
    const eased = 1 - Math.pow(1 - progress, 3)
    setDisplay(Math.floor(eased * value))
    
    if (progress < 1) {
      rafRef.current = requestAnimationFrame(animate)
    }
  }, [value, duration])

  useEffect(() => {
    startRef.current = null
    if (value > 0) {
      rafRef.current = requestAnimationFrame(animate)
    } else {
      setDisplay(0)
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [value, animate])

  const formattedValue = display.toLocaleString('es-PE')
  
  return (
    <span className="animated-counter">
      {prefix}{formattedValue}{suffix}
    </span>
  )
}

// Indicador de tendencia con color y animación
function TrendIndicator({ value, showPercentage = true }) {
  if (value === 0 || value === null || value === undefined) {
    return (
      <span className="trend-indicator neutral">
        <MinusOutlined />
        {showPercentage && ' Sin cambio'}
      </span>
    )
  }

  const isPositive = value > 0
  const displayValue = showPercentage ? `${Math.abs(value)}%` : Math.abs(value)

  return (
    <span className={`trend-indicator ${isPositive ? 'positive' : 'negative'}`}>
      {isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
      {' '}{displayValue}
    </span>
  )
}

export default function SuperKPICard({
  title,
  value,
  icon,
  gradient,
  suffix = '',
  prefix = '',
  trend,
  trendLabel = 'vs período anterior',
  onClick,
  loading = false,
  extra,
  tooltip,
  decimals = 0,
}) {
  const [isHovered, setIsHovered] = useState(false)

  const cardContent = (
    <Card
      className={`super-kpi-card ${onClick ? 'clickable' : ''} ${isHovered ? 'hovered' : ''}`}
      style={{ 
        background: gradient,
        border: 'none',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      bodyStyle={{ padding: '20px' }}
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 2 }} title={false} />
      ) : (
        <div className="super-kpi-card__content">
          <div className="super-kpi-card__header">
            <div className="super-kpi-card__icon">
              {icon}
            </div>
            <div className="super-kpi-card__title">{title}</div>
          </div>
          
          <div className="super-kpi-card__value">
            <AnimatedCounter 
              value={decimals > 0 ? parseFloat(value).toFixed(decimals) : parseInt(value || 0)} 
              prefix={prefix}
              suffix={suffix}
            />
          </div>

          <div className="super-kpi-card__footer">
            {trend !== undefined && trend !== null ? (
              <div className="super-kpi-card__trend">
                <TrendIndicator value={trend} />
                <span className="super-kpi-card__trend-label">{trendLabel}</span>
              </div>
            ) : extra ? (
              <div className="super-kpi-card__extra">{extra}</div>
            ) : null}
          </div>
        </div>
      )}
    </Card>
  )

  if (tooltip) {
    return <Tooltip title={tooltip}>{cardContent}</Tooltip>
  }

  return cardContent
}
