import { useState } from 'react'
import {
  Drawer, Typography, Divider, Switch, Slider, Select,
  ColorPicker, Button, Space, Tooltip, Input,
  Row, Tag, Alert,
} from 'antd'
import {
  BgColorsOutlined, FontSizeOutlined, BorderOutlined,
  PictureOutlined,   ReloadOutlined, CheckOutlined,
  LinkOutlined, CompressOutlined,
  ThunderboltOutlined, LayoutOutlined,
} from '@ant-design/icons'
import { useTheme } from '../context/ThemeContext'

const { Text } = Typography

// ── Paleta de colores primarios predefinidos ──────────────────────────────────
const COLORES_PRIMARIOS = [
  { label: 'Azul (default)', value: '#1890ff' },
  { label: 'Azul marino',    value: '#003a8c' },
  { label: 'Verde',          value: '#52c41a' },
  { label: 'Verde oscuro',   value: '#135200' },
  { label: 'Morado',         value: '#722ed1' },
  { label: 'Rojo',           value: '#f5222d' },
  { label: 'Naranja',        value: '#fa8c16' },
  { label: 'Cian',           value: '#13c2c2' },
  { label: 'Rosa',           value: '#eb2f96' },
]

const COLORES_SIDEBAR = [
  { label: 'Azul marino (default)', value: '#001529' },
  { label: 'Negro',                 value: '#000000' },
  { label: 'Gris oscuro',           value: '#1f1f1f' },
  { label: 'Azul oscuro',           value: '#0d1b2a' },
  { label: 'Verde oscuro',          value: '#0a2e1a' },
  { label: 'Morado oscuro',         value: '#1a0a2e' },
  { label: 'Rojo oscuro',           value: '#2e0a0a' },
]

// ── Sección con título ────────────────────────────────────────────────────────
function Seccion({ icon, titulo, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <Space style={{ marginBottom: 10 }}>
        {icon}
        <Text strong style={{ fontSize: 13 }}>{titulo}</Text>
      </Space>
      {children}
    </div>
  )
}

// ── Selector de color con chips ───────────────────────────────────────────────
function ChipsColor({ opciones, valor, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
      {opciones.map((op) => (
        <Tooltip key={op.value} title={op.label}>
          <div
            onClick={() => onChange(op.value)}
            style={{
              width: 28, height: 28,
              borderRadius: '50%',
              background: op.value,
              cursor: 'pointer',
              border: valor === op.value
                ? '3px solid #fff'
                : '2px solid transparent',
              boxShadow: valor === op.value
                ? `0 0 0 2px ${op.value}`
                : '0 1px 4px rgba(0,0,0,0.3)',
              transition: 'transform 0.15s',
            }}
          />
        </Tooltip>
      ))}
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function PanelApariencia({ open, onClose }) {
  const { config, actualizar, toggleTheme, resetear } = useTheme()
  const [logoUrl, setLogoUrl] = useState(config.logoUrl || '')
  const [loginBgUrl, setLoginBgUrl] = useState(config.loginBgImage || '')

  const aplicarLogo = () => {
    actualizar({ logoUrl: logoUrl.trim() })
  }

  const aplicarLoginBg = () => {
    actualizar({ loginBgImage: loginBgUrl.trim() })
  }

  const limpiarLogo = () => {
    setLogoUrl('')
    actualizar({ logoUrl: '' })
  }

  const limpiarLoginBg = () => {
    setLoginBgUrl('')
    actualizar({ loginBgImage: '' })
  }

  return (
    <Drawer
      title={
        <Space>
          <BgColorsOutlined style={{ color: config.colorPrimary }} />
          <span>Personalización</span>
        </Space>
      }
      placement="right"
      width={340}
      open={open}
      onClose={onClose}
      styles={{ body: { padding: '16px 20px', overflowY: 'auto' } }}
      footer={
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => { resetear(); setLogoUrl(''); setLoginBgUrl('') }}
          >
            Restablecer
          </Button>
          <Button type="primary" icon={<CheckOutlined />} onClick={onClose}>
            Listo
          </Button>
        </Space>
      }
    >

      {/* ── Modo oscuro ──────────────────────────────────────────────────── */}
      <Seccion icon={<ThunderboltOutlined />} titulo="Modo de visualización">
        <Row align="middle" justify="space-between">
          <Text>Modo oscuro</Text>
          <Switch
            checked={config.isDark}
            onChange={toggleTheme}
            checkedChildren="🌙"
            unCheckedChildren="☀️"
          />
        </Row>
        <Row align="middle" justify="space-between" style={{ marginTop: 10 }}>
          <Text>Modo compacto</Text>
          <Switch
            checked={config.compactMode}
            onChange={(v) => actualizar({ compactMode: v })}
            checkedChildren="Sí"
            unCheckedChildren="No"
          />
        </Row>
        <Row align="middle" justify="space-between" style={{ marginTop: 10 }}>
          <Text>Animaciones</Text>
          <Switch
            checked={config.animaciones}
            onChange={(v) => actualizar({ animaciones: v })}
            checkedChildren="Sí"
            unCheckedChildren="No"
          />
        </Row>
      </Seccion>

      <Divider style={{ margin: '12px 0' }} />

      {/* ── Color primario ───────────────────────────────────────────────── */}
      <Seccion icon={<BgColorsOutlined />} titulo="Color principal">
        <ChipsColor
          opciones={COLORES_PRIMARIOS}
          valor={config.colorPrimary}
          onChange={(v) => actualizar({ colorPrimary: v })}
        />
        <Space>
          <Text style={{ fontSize: 12 }}>Personalizado:</Text>
          <ColorPicker
            value={config.colorPrimary}
            onChange={(_, hex) => actualizar({ colorPrimary: hex })}
            size="small"
            showText
          />
        </Space>
      </Seccion>

      <Divider style={{ margin: '12px 0' }} />

      {/* ── Color del sidebar ────────────────────────────────────────────── */}
      <Seccion icon={<LayoutOutlined />} titulo="Color del menú lateral">
        <ChipsColor
          opciones={COLORES_SIDEBAR}
          valor={config.siderColor}
          onChange={(v) => actualizar({ siderColor: v })}
        />
        <Space>
          <Text style={{ fontSize: 12 }}>Personalizado:</Text>
          <ColorPicker
            value={config.siderColor}
            onChange={(_, hex) => actualizar({ siderColor: hex })}
            size="small"
            showText
          />
        </Space>
      </Seccion>

      <Divider style={{ margin: '12px 0' }} />

      {/* ── Tipografía ───────────────────────────────────────────────────── */}
      <Seccion icon={<FontSizeOutlined />} titulo={`Tamaño de fuente — ${config.fontSize}px`}>
        <Slider
          min={12}
          max={18}
          step={1}
          value={config.fontSize}
          onChange={(v) => actualizar({ fontSize: v })}
          marks={{ 12: '12', 14: '14', 16: '16', 18: '18' }}
        />
      </Seccion>

      <Divider style={{ margin: '12px 0' }} />

      {/* ── Bordes ───────────────────────────────────────────────────────── */}
      <Seccion icon={<BorderOutlined />} titulo={`Radio de bordes — ${config.borderRadius}px`}>
        <Slider
          min={0}
          max={20}
          step={2}
          value={config.borderRadius}
          onChange={(v) => actualizar({ borderRadius: v })}
          marks={{ 0: 'Recto', 8: 'Normal', 16: 'Redondeado', 20: 'Pill' }}
        />
      </Seccion>

      <Divider style={{ margin: '12px 0' }} />

      {/* ── Ancho del sidebar ────────────────────────────────────────────── */}
      <Seccion icon={<CompressOutlined />} titulo={`Ancho del menú — ${config.siderWidth}px`}>
        <Slider
          min={180}
          max={280}
          step={10}
          value={config.siderWidth}
          onChange={(v) => actualizar({ siderWidth: v })}
          marks={{ 180: '180', 220: '220', 260: '260', 280: '280' }}
        />
      </Seccion>

      <Divider style={{ margin: '12px 0' }} />

      {/* ── Fondo del login ──────────────────────────────────────────────── */}
      <Seccion icon={<PictureOutlined />} titulo="Fondo de pantalla de login">
        <Select
          value={config.loginBg}
          onChange={(v) => actualizar({ loginBg: v })}
          style={{ width: '100%', marginBottom: 10 }}
          options={[
            { value: 'gradient', label: '🎨 Degradado automático' },
            { value: 'solid',    label: '🟦 Color sólido' },
            { value: 'image',    label: '🖼️ Imagen de fondo' },
          ]}
        />

        {config.loginBg === 'solid' && (
          <Space>
            <Text style={{ fontSize: 12 }}>Color:</Text>
            <ColorPicker
              value={config.loginBgColor}
              onChange={(_, hex) => actualizar({ loginBgColor: hex })}
              size="small"
              showText
            />
          </Space>
        )}

        {config.loginBg === 'image' && (
          <div>
            <Text style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
              URL de imagen:
            </Text>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                prefix={<LinkOutlined />}
                placeholder="https://..."
                value={loginBgUrl}
                onChange={(e) => setLoginBgUrl(e.target.value)}
                size="small"
              />
              <Button size="small" onClick={aplicarLoginBg} type="primary">
                Aplicar
              </Button>
            </Space.Compact>
            {config.loginBgImage && (
              <Button
                size="small"
                danger
                style={{ marginTop: 6 }}
                onClick={limpiarLoginBg}
              >
                Quitar imagen
              </Button>
            )}
          </div>
        )}
      </Seccion>

      <Divider style={{ margin: '12px 0' }} />

      {/* ── Logo personalizado ───────────────────────────────────────────── */}
      <Seccion icon={<PictureOutlined />} titulo="Logo personalizado">
        <Text style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
          URL del logo (PNG, SVG):
        </Text>
        <Space.Compact style={{ width: '100%', marginBottom: 8 }}>
          <Input
            prefix={<LinkOutlined />}
            placeholder="https://... o /mi-logo.png"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            size="small"
          />
          <Button size="small" type="primary" onClick={aplicarLogo}>
            Aplicar
          </Button>
        </Space.Compact>
        {config.logoUrl && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{
              background: config.siderColor,
              padding: 8,
              borderRadius: 6,
              textAlign: 'center',
            }}>
              <img
                src={config.logoUrl}
                alt="Logo preview"
                style={{ height: 40, objectFit: 'contain' }}
                onError={(e) => { e.target.style.display = 'none' }}
              />
            </div>
            <Button size="small" danger onClick={limpiarLogo}>
              Restaurar logo original
            </Button>
          </Space>
        )}
        {!config.logoUrl && (
          <Alert
            type="info"
            showIcon
            message="Se usa el logo por defecto de SISGE"
            style={{ fontSize: 11 }}
          />
        )}
      </Seccion>

      <Divider style={{ margin: '12px 0' }} />

      {/* ── Vista previa de colores ──────────────────────────────────────── */}
      <Seccion icon={<BgColorsOutlined />} titulo="Vista previa">
        <div style={{
          background: config.siderColor,
          borderRadius: config.borderRadius,
          padding: '10px 14px',
          marginBottom: 8,
        }}>
          <Text style={{ color: '#fff', fontSize: 12 }}>Menú lateral</Text>
          <div style={{
            background: config.colorPrimary,
            borderRadius: config.borderRadius / 2,
            padding: '4px 10px',
            marginTop: 6,
            display: 'inline-block',
          }}>
            <Text style={{ color: '#fff', fontSize: 11 }}>Ítem activo</Text>
          </div>
        </div>
        <Space wrap>
          <Tag color={config.colorPrimary} style={{ borderRadius: config.borderRadius }}>
            Etiqueta
          </Tag>
          <Tag color="success" style={{ borderRadius: config.borderRadius }}>Éxito</Tag>
          <Tag color="error"   style={{ borderRadius: config.borderRadius }}>Error</Tag>
        </Space>
      </Seccion>

    </Drawer>
  )
}
