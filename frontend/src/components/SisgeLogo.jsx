import { useRef, useEffect, useState, useCallback } from 'react'
import { Typography } from 'antd'
import { useTheme } from '../context/ThemeContext'

const { Text } = Typography

function Eye({ side, mousePos }) {
  const blinkRef = useRef(0)
  const [isBlinking, setIsBlinking] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      blinkRef.current--
      if (blinkRef.current <= 0) {
        blinkRef.current = 3 + Math.random() * 3
        setIsBlinking(true)
        setTimeout(() => setIsBlinking(false), 120)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [])

  const cx = side === 'left' ? 38 : 62
  const cy = 38
  const r = 5

  const px = mousePos ? Math.max(-2, Math.min(2, (mousePos.x - 0.5) * 4)) : 0
  const py = mousePos ? Math.max(-2, Math.min(2, (mousePos.y - 0.5) * 3)) : 0

  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={r} ry={isBlinking ? 1 : r} fill="white" className="logo-eye">
        <animate attributeName="ry" values={`${r};${r};1;${r}`}
          dur={isBlinking ? '0.12s' : '0s'} fill="freeze" />
      </ellipse>
      <circle cx={cx + px} cy={cy + py} r={2.5} fill="#2c3e50" />
    </g>
  )
}

export default function SisgeLogo({ height = 64, showText = false, className = '' }) {
  const { config } = useTheme()
  const [mousePos, setMousePos] = useState(null)
  const containerRef = useRef(null)
  const src = config?.logoUrl || '/logo-sisge.png'

  const handleMouseMove = useCallback((e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setMousePos({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      })
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`sisge-logo ${className}`.trim()}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos(null)}
      style={{ cursor: 'pointer', position: 'relative' }}
    >
      <svg
        width={height}
        height={height}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
      >
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1890ff" />
            <stop offset="100%" stopColor="#096dd9" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background circle */}
        <circle cx="50" cy="50" r="45" fill="url(#logoGrad)" opacity="0.1" />

        {/* Gear icon - outer */}
        <path
          d="M50 15 L55 18 L58 15 L62 18 L65 16 L66 20 L70 20 L69 24 L73 26 L71 29 L74 32 L72 35 L75 38 L72 41 L74 44 L71 47 L73 50 L70 52 L72 55 L69 57 L71 60 L68 62 L69 65 L66 66 L68 69 L64 70 L65 73 L61 73 L62 76 L58 75 L58 78 L54 77 L53 80 L50 78 L47 80 L46 77 L42 78 L42 75 L38 76 L38 73 L35 73 L36 70 L32 69 L33 66 L30 65 L31 62 L28 60 L29 57 L26 55 L28 52 L25 50 L27 47 L24 44 L26 41 L23 38 L25 35 L22 32 L24 29 L21 26 L23 23 L20 20 L22 18 L25 20 L28 18 L31 16 L34 18 L37 15 L40 18 L43 15 L46 18 L50 15 Z"
          fill="url(#logoGrad)"
          filter="url(#glow)"
          opacity="0.9"
        >
          <animateTransform attributeName="transform" type="rotate"
            from="0 50 50" to="360 50 50"
            dur="20s" repeatCount="indefinite" />
        </path>

        {/* Inner circle */}
        <circle cx="50" cy="50" r="18" fill="#0a1628" opacity="0.8">
          <animate attributeName="r" values="18;18.5;18" dur="3s" repeatCount="indefinite" />
        </circle>

        {/* Letter S */}
        <text
          x="50" y="57"
          textAnchor="middle"
          fontSize="22"
          fontWeight="bold"
          fill="url(#logoGrad)"
          dominantBaseline="middle"
        >
          S
        </text>

        {/* Eyes */}
        <Eye side="left" mousePos={mousePos} />
        <Eye side="right" mousePos={mousePos} />

        {/* Decorative dots */}
        <circle cx="50" cy="18" r="1.5" fill="#1890ff" opacity="0.5">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="50" cy="82" r="1.5" fill="#1890ff" opacity="0.5">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite" begin="0.5s" />
        </circle>
        <circle cx="18" cy="50" r="1.5" fill="#1890ff" opacity="0.5">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite" begin="1s" />
        </circle>
        <circle cx="82" cy="50" r="1.5" fill="#1890ff" opacity="0.5">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2.2s" repeatCount="indefinite" begin="0.3s" />
        </circle>
      </svg>
      {showText && (
        <Text strong className="sisge-logo__text" style={{ display: 'block', textAlign: 'center', marginTop: 4 }}>
          SISGE
        </Text>
      )}
    </div>
  )
}
