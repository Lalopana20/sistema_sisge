import { useState } from 'react'
import { Card, Button, Space, Checkbox, Empty, Spin } from 'antd'
import { LineChartOutlined, ReloadOutlined } from '@ant-design/icons'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, Legend, ResponsiveContainer,
} from 'recharts'
import dayjs from 'dayjs'
import './MovimientosChartPlus.css'

/**
 * ══════════════════════════════════════════════════════════════════════════
 * MOVIMIENTOS CHART PLUS - Gráfico de líneas moderno y bacán
 * ══════════════════════════════════════════════════════════════════════════
 */

const PERIOD_OPTIONS = [
  { label: '7 días', value: 7 },
  { label: '15 días', value: 15 },
  { label: '30 días', value: 30 },
  { label: '60 días', value: 60 },
  { label: '90 días', value: 90 },
]

const LINE_CONFIG = {
  ENTRADA: {
    label: 'Entradas',
    color: '#52c41a',
    strokeWidth: 3,
  },
  SALIDA: {
    label: 'Salidas',
    color: '#ff4d4f',
    strokeWidth: 3,
  },
  DEVOLUCION: {
    label: 'Devoluciones',
    color: '#1890ff',
    strokeWidth: 2,
  },
  AJUSTE: {
    label: 'Ajustes',
    color: '#fa8c16',
    strokeWidth: 2,
  },
}

// Tooltip personalizado bacán
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="movimientos-tooltip">
      <div className="movimientos-tooltip__title">
        {dayjs(label).format('ddd DD/MM/YYYY')}
      </div>
      <div className="movimientos-tooltip__content">
        {payload.map((item) => (
          <div key={item.dataKey} className="movimientos-tooltip__item">
            <span 
              className="movimientos-tooltip__dot" 
              style={{ backgroundColor: item.color }}
            />
            <span className="movimientos-tooltip__label">{item.name}:</span>
            <span className="movimientos-tooltip__value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function MovimientosChartPlus({
  data = [],
  loading = false,
  onPeriodChange,
  onRefresh,
  defaultPeriod = 30,
  isDark = false,
}) {
  const [selectedPeriod, setSelectedPeriod] = useState(defaultPeriod)
  const [visibleLines, setVisibleLines] = useState({
    ENTRADA: true,
    SALIDA: true,
    DEVOLUCION: false,
    AJUSTE: false,
  })

  const handlePeriodChange = (days) => {
    setSelectedPeriod(days)
    if (onPeriodChange) {
      onPeriodChange(days)
    }
  }

  const handleLineToggle = (lineKey) => {
    setVisibleLines(prev => ({
      ...prev,
      [lineKey]: !prev[lineKey],
    }))
  }

  const chartTextColor = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)'
  const chartGridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

  return (
    <Card
      className="movimientos-chart-plus"
      title={
        <Space>
          <LineChartOutlined className="movimientos-chart-plus__icon" />
          <span>Movimientos - Últimos {selectedPeriod} días</span>
        </Space>
      }
      extra={
        <Button
          size="small"
          icon={<ReloadOutlined spin={loading} />}
          onClick={onRefresh}
          loading={loading}
        >
          Actualizar
        </Button>
      }
    >
      {/* Controles superiores */}
      <div className="movimientos-chart-plus__controls">
        <Space size="small" wrap>
          <span className="movimientos-chart-plus__controls-label">Período:</span>
          {PERIOD_OPTIONS.map(option => (
            <Button
              key={option.value}
              size="small"
              type={selectedPeriod === option.value ? 'primary' : 'default'}
              onClick={() => handlePeriodChange(option.value)}
              className="period-button"
            >
              {option.label}
            </Button>
          ))}
        </Space>

        <Space size="middle" wrap className="movimientos-chart-plus__toggles">
          {Object.entries(LINE_CONFIG).map(([key, config]) => (
            <Checkbox
              key={key}
              checked={visibleLines[key]}
              onChange={() => handleLineToggle(key)}
            >
              <span style={{ color: config.color, fontWeight: 600 }}>
                {config.label}
              </span>
            </Checkbox>
          ))}
        </Space>
      </div>

      {/* Gráfico */}
      <div className="movimientos-chart-plus__chart">
        {loading ? (
          <div className="movimientos-chart-plus__loading">
            <Spin size="large" tip="Cargando datos..." />
          </div>
        ) : data.length === 0 ? (
          <Empty description="No hay datos de movimientos para el período seleccionado" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
            >
              <defs>
                {Object.entries(LINE_CONFIG).map(([key, config]) => (
                  <linearGradient key={key} id={`gradient${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={config.color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={config.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
              
              <XAxis
                dataKey="fecha"
                tick={{ fontSize: 11, fill: chartTextColor }}
                tickFormatter={(value) => dayjs(value).format('DD/MM')}
              />
              
              <YAxis
                tick={{ fontSize: 11, fill: chartTextColor }}
                allowDecimals={false}
              />
              
              <RTooltip content={<CustomTooltip />} />
              
              <Legend
                wrapperStyle={{ fontSize: 12 }}
                iconType="line"
              />

              {Object.entries(LINE_CONFIG).map(([key, config]) => (
                visibleLines[key] && (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={config.label}
                    stroke={config.color}
                    strokeWidth={config.strokeWidth}
                    dot={{ r: 4, fill: config.color }}
                    activeDot={{ r: 6 }}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  />
                )
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}
