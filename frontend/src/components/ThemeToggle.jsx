import { Switch, Tooltip, Typography } from 'antd'
import { MoonOutlined, SunOutlined } from '@ant-design/icons'
import { useTheme } from '../context/ThemeContext'

const { Text } = Typography

export default function ThemeToggle({ showLabel = true, size = 'default' }) {
  const { isDark, toggleTheme, pulse } = useTheme()

  return (
    <Tooltip title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro (cuida tu vista)'}>
      <div
        className={`theme-toggle ${pulse ? 'theme-toggle--pulse' : ''}`}
        onClick={toggleTheme}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleTheme() }}
        aria-label="Alternar modo oscuro"
      >
        {showLabel && (
          <Text className="theme-toggle__label">
            {isDark ? 'Modo claro' : 'Modo oscuro'}
          </Text>
        )}
        <Switch
          checked={isDark}
          size={size}
          checkedChildren={<MoonOutlined />}
          unCheckedChildren={<SunOutlined />}
          onChange={toggleTheme}
          onClick={(_, e) => e.stopPropagation()}
        />
      </div>
    </Tooltip>
  )
}
