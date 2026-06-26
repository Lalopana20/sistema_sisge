import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

function MascotCharacter() {
  const groupRef = useRef()
  const leftEyeRef = useRef()
  const rightEyeRef = useRef()
  const blinkRef = useRef(0)
  const mouseRef = useRef({ x: 0, y: 0 })

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime

    // Floating bob
    groupRef.current.position.y = Math.sin(t * 0.8) * 0.1

    // Follow mouse slightly
    const mx = (state.pointer.x || 0) * 0.3
    const my = (state.pointer.y || 0) * 0.2
    groupRef.current.rotation.y = mx * 0.5
    groupRef.current.rotation.x = my * 0.3

    // Blink every 3-5 seconds
    blinkRef.current -= 0.016
    if (blinkRef.current <= 0) {
      blinkRef.current = 3 + Math.random() * 2
      if (leftEyeRef.current && rightEyeRef.current) {
        leftEyeRef.current.scale.y = 0.1
        rightEyeRef.current.scale.y = 0.1
        setTimeout(() => {
          if (leftEyeRef.current) leftEyeRef.current.scale.y = 1
          if (rightEyeRef.current) rightEyeRef.current.scale.y = 1
        }, 120)
      }
    }

    // Pupils follow mouse
    if (leftEyeRef.current && rightEyeRef.current) {
      const px = state.pointer.x * 0.15 || 0
      const py = state.pointer.y * 0.1 || 0
      leftEyeRef.current.position.x = 0.12 + px
      leftEyeRef.current.position.y = 0.12 + py
      rightEyeRef.current.position.x = 0.38 + px
      rightEyeRef.current.position.y = 0.12 + py
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Shadow */}
      <mesh position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.8, 16]} />
        <meshBasicMaterial color="rgba(0,0,0,0.15)" transparent />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.2, -0.9, 0]}>
        <boxGeometry args={[0.2, 0.4, 0.2]} />
        <meshPhysicalMaterial color="#096dd9" metalness={0.2} roughness={0.6} />
      </mesh>
      <mesh position={[0.2, -0.9, 0]}>
        <boxGeometry args={[0.2, 0.4, 0.2]} />
        <meshPhysicalMaterial color="#096dd9" metalness={0.2} roughness={0.6} />
      </mesh>

      {/* Body */}
      <Float speed={1.5} rotationIntensity={0.02} floatIntensity={0.05}>
        <mesh position={[0, -0.4, 0]}>
          <boxGeometry args={[0.8, 0.6, 0.5]} />
          <meshPhysicalMaterial
            color="#1890ff"
            metalness={0.3}
            roughness={0.4}
            emissive="#1890ff"
            emissiveIntensity={0.05}
          />
        </mesh>

        {/* Box on body */}
        <mesh position={[0, -0.1, 0.35]}>
          <boxGeometry args={[0.7, 0.2, 0.15]} />
          <meshPhysicalMaterial color="#f6ad55" metalness={0.1} roughness={0.7} />
        </mesh>

        {/* Arms */}
        <mesh position={[-0.55, -0.3, 0]}>
          <boxGeometry args={[0.15, 0.35, 0.15]} />
          <meshPhysicalMaterial color="#1890ff" metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh position={[0.55, -0.3, 0]}>
          <boxGeometry args={[0.15, 0.35, 0.15]} />
          <meshPhysicalMaterial color="#1890ff" metalness={0.3} roughness={0.4} />
        </mesh>
      </Float>

      {/* Head */}
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.4, 24, 24]} />
        <meshPhysicalMaterial
          color="#1890ff"
          metalness={0.2}
          roughness={0.3}
          emissive="#1890ff"
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* Hard hat */}
      <group position={[0, 0.55, 0]}>
        <mesh>
          <sphereGeometry args={[0.42, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial color="#f0c040" metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.08, 0]}>
          <torusGeometry args={[0.42, 0.04, 8, 24]} />
          <meshPhysicalMaterial color="#d4a820" metalness={0.4} roughness={0.4} />
        </mesh>
      </group>

      {/* Eye whites */}
      <mesh position={[0.12, 0.38, 0.35]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshBasicMaterial color="white" />
      </mesh>
      <mesh position={[0.38, 0.38, 0.35]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshBasicMaterial color="white" />
      </mesh>

      {/* Pupils */}
      <mesh ref={leftEyeRef} position={[0.12, 0.38, 0.45]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#2c3e50" />
      </mesh>
      <mesh ref={rightEyeRef} position={[0.38, 0.38, 0.45]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#2c3e50" />
      </mesh>

      {/* Mouth */}
      <mesh position={[0.25, 0.28, 0.38]}>
        <boxGeometry args={[0.2, 0.03, 0.02]} />
        <meshBasicMaterial color="#2c3e50" />
      </mesh>

      {/* Cheeks */}
      <mesh position={[0.04, 0.32, 0.36]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="rgba(255,150,150,0.2)" transparent />
      </mesh>
      <mesh position={[0.46, 0.32, 0.36]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="rgba(255,150,150,0.2)" transparent />
      </mesh>
    </group>
  )
}

export default function Mascot3D({ size = 200 }) {
  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 30 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-5, 2, 3]} intensity={0.3} color="#764ba2" />
        <MascotCharacter />
      </Canvas>
    </div>
  )
}
