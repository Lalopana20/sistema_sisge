import { useState, useEffect, useCallback } from 'react'
import { Form, Input, Button, Card, Typography, Alert } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import SisgeLogo from '../components/SisgeLogo'
import Mascot3D from '../components/Mascot3D'
import ThemeToggle from '../components/ThemeToggle'

const { Text, Title } = Typography

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [focusedField, setFocusedField] = useState(null)
  const { login } = useAuth()
  const { config } = useTheme()
  const navigate = useNavigate()

  const onFinish = async ({ username, password }) => {
    if (failedAttempts >= 3) {
      const delay = Math.min(1000 * (failedAttempts - 2), 5000)
      await new Promise(r => setTimeout(r, delay))
    }
    setLoading(true)
    setError(null)
    try {
      await login(username, password)
      setFailedAttempts(0)
      navigate('/dashboard')
    } catch (err) {
      setFailedAttempts(p => p + 1)
      const status = err.response?.status
      if (status === 429) {
        setError('Demasiados intentos. Espera 15 minutos.')
      } else if (status === 401) {
        setError('Usuario o contraseña incorrectos.')
      } else if (err.message === 'Network Error') {
        setError('No se pudo conectar al servidor.')
      } else {
        setError(err.response?.data?.error || 'Error al iniciar sesión.')
      }
    } finally {
      setLoading(false)
    }
  }

  const isDark = config?.isDark
  const accentColor = '#1677ff'

  return (
    <div style={{
      position: 'relative', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: isDark
        ? 'linear-gradient(135deg, #0f1419 0%, #1a1f26 50%, #0f1419 100%)'
        : 'linear-gradient(135deg, #f0f2f5 0%, #fafafa 50%, #f0f2f5 100%)',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0, opacity: isDark ? 0.03 : 0.04,
        backgroundImage: `radial-gradient(circle at 25% 25%, ${accentColor} 0%, transparent 50%),
                          radial-gradient(circle at 75% 75%, ${accentColor} 0%, transparent 50%)`,
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'absolute', top: 20, right: 24, zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <ThemeToggle showLabel size="small" />
      </div>

      <Card
        style={{
          width: 400, maxWidth: '90vw',
          borderRadius: 16,
          border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)',
          background: isDark
            ? 'rgba(20, 26, 35, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: isDark
            ? '0 2px 16px rgba(0,0,0,0.3)'
            : '0 2px 16px rgba(0,0,0,0.06)',
          animation: 'cardIn 0.4s ease-out',
        }}
      >
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          marginBottom: 28,
        }}>
          <SisgeLogo height={56} />
          <Title level={3} style={{
            margin: '10px 0 2px',
            color: isDark ? '#e8eaed' : '#1a1a1a',
            fontSize: 22, fontWeight: 700, letterSpacing: 1,
          }}>
            SISGE
          </Title>
          <Text style={{
            fontSize: 13,
            color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
            marginBottom: 4,
          }}>
            Sistema de Gestión de Almacén
          </Text>
          <div style={{ marginTop: 8 }}>
            <Mascot3D size={120} />
          </div>
        </div>

        {error && (
          <Alert
            message={error} type="error" showIcon closable
            onClose={() => setError(null)}
            style={{
              marginBottom: 20, borderRadius: 10,
              border: 'none',
              background: isDark ? 'rgba(255,77,79,0.1)' : 'rgba(255,77,79,0.05)',
            }}
          />
        )}

        <Form layout="vertical" onFinish={onFinish} size="large" requiredMark={false}>
          <Form.Item
            label={<span style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#ccc' : '#333' }}>Usuario</span>}
            name="username"
            rules={[
              { required: true, message: 'Ingresa tu usuario' },
              { min: 3, message: 'Mínimo 3 caracteres' },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{
                color: focusedField === 'username' ? accentColor : isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
              }} />}
              placeholder="Nombre de usuario"
              autoComplete="username"
              onFocus={() => setFocusedField('username')}
              onBlur={() => setFocusedField(null)}
              style={{
                borderRadius: 10,
                background: isDark ? 'rgba(255,255,255,0.04)' : '#f5f5f5',
                border: focusedField === 'username'
                  ? `1.5px solid ${accentColor}`
                  : isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
                transition: 'all 0.2s ease',
                height: 44,
                color: isDark ? '#e8eaed' : undefined,
              }}
            />
          </Form.Item>

          <Form.Item
            label={<span style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#ccc' : '#333' }}>Contraseña</span>}
            name="password"
            rules={[
              { required: true, message: 'Ingresa tu contraseña' },
              { min: 6, message: 'Mínimo 6 caracteres' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{
                color: focusedField === 'password' ? accentColor : isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
              }} />}
              placeholder="Contraseña"
              autoComplete="current-password"
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              style={{
                borderRadius: 10,
                background: isDark ? 'rgba(255,255,255,0.04)' : '#f5f5f5',
                border: focusedField === 'password'
                  ? `1.5px solid ${accentColor}`
                  : isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
                transition: 'all 0.2s ease',
                height: 44,
                color: isDark ? '#e8eaed' : undefined,
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 4 }}>
            <Button
              type="primary" htmlType="submit" block
              loading={loading}
              style={{
                height: 46, borderRadius: 10, fontSize: 15, fontWeight: 500,
                background: accentColor,
                border: 'none',
                boxShadow: `0 2px 8px rgba(22,119,255,0.25)`,
                transition: 'all 0.2s ease',
              }}
              className="login-btn"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </Form.Item>
        </Form>

        <div style={{
          textAlign: 'center', marginTop: 20, paddingTop: 14,
          borderTop: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)',
        }}>
          <Text style={{
            fontSize: 11,
            color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
          }}>
            &copy; {new Date().getFullYear()} SISGE
          </Text>
        </div>
      </Card>

      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .login-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(22,119,255,0.35) !important;
        }
        .login-btn:active {
          transform: translateY(0);
        }
        .ant-input-affix-wrapper-focused {
          box-shadow: 0 0 0 2px rgba(22,119,255,0.08) !important;
        }
      `}</style>
    </div>
  )
}
