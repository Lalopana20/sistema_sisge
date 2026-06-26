import { useEffect, useRef } from 'react'
import { useTheme } from '../context/ThemeContext'

export default function WavesBackground() {
  const canvasRef = useRef(null)
  const { config } = useTheme()
  const isDark = config?.isDark

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let running = true
    let animId
    let mouseX = -9999

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const handleMouse = (e) => { mouseX = e.clientX }
    window.addEventListener('mousemove', handleMouse)

    const waves = isDark ? [
      { start: 0.58, amp: 65, freq: 0.005, speed: 0.15, color: '59,130,246', opacity: 0.06 },
      { start: 0.48, amp: 45, freq: 0.009, speed: 0.30, color: '99,102,241', opacity: 0.09 },
      { start: 0.38, amp: 28, freq: 0.014, speed: 0.50, color: '139,92,246', opacity: 0.12 },
    ] : [
      { start: 0.58, amp: 65, freq: 0.005, speed: 0.15, color: '24,144,255', opacity: 0.03 },
      { start: 0.48, amp: 45, freq: 0.009, speed: 0.30, color: '24,144,255', opacity: 0.05 },
      { start: 0.38, amp: 28, freq: 0.014, speed: 0.50, color: '64,150,255', opacity: 0.07 },
    ]

    const STEP = 1.5

    const animate = () => {
      if (!running) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const time = Date.now() / 1000
      const mousePhase = mouseX > -1000 ? (mouseX / canvas.width - 0.5) * 0.5 : 0

      for (const wave of waves) {
        const startY = canvas.height * wave.start
        ctx.beginPath()
        ctx.moveTo(0, canvas.height)
        for (let x = 0; x <= canvas.width; x += STEP) {
          const y = startY + wave.amp * Math.sin(x * wave.freq + time * wave.speed + mousePhase)
          ctx.lineTo(x, y)
        }
        ctx.lineTo(canvas.width, canvas.height)
        ctx.closePath()
        ctx.fillStyle = `rgba(${wave.color},${wave.opacity})`
        ctx.fill()
      }

      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      running = false
      if (animId) cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouse)
    }
  }, [isDark])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 0, pointerEvents: 'none',
      }}
    />
  )
}
