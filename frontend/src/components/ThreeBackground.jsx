import { useRef, useMemo } from 'react'
import { Canvas, useFrame, extend } from '@react-three/fiber'
import { Float, shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

const Torus4DShader = shaderMaterial(
  { uTime: 0, uColor1: new THREE.Color('#1890ff'), uColor2: new THREE.Color('#764ba2') },
  `
    varying vec3 vPosition;
    varying float vHeight;
    void main() {
      vec3 pos = position;
      float twist = sin(pos.x * 1.5 + pos.y * 0.8) * 0.15;
      pos.z += twist;
      vPosition = pos;
      vHeight = pos.y;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    varying vec3 vPosition;
    varying float vHeight;
    void main() {
      float hueShift = sin(uTime * 0.3 + vHeight * 1.5 + vPosition.x * 0.8) * 0.5 + 0.5;
      vec3 color = mix(uColor1, uColor2, hueShift);
      float glow = sin(uTime * 0.5 + vHeight * 2.0) * 0.2 + 0.8;
      gl_FragColor = vec4(color * glow, 0.6);
    }
  `
)

extend({ Torus4DShader })

function Torus4D() {
  const ref = useRef()
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.3
      ref.current.rotation.y = state.clock.elapsedTime * 0.5
      ref.current.material.uniforms.uTime.value = state.clock.elapsedTime
    }
  })
  return (
    <mesh ref={ref} scale={1.8}>
      <torusKnotGeometry args={[1, 0.35, 180, 24]} />
      <torus4DShader key="torus4d" transparent side={THREE.DoubleSide} />
    </mesh>
  )
}

function FloatingGeometry({ count = 40 }) {
  const meshRef = useRef()
  const geometries = useMemo(() => {
    const shapes = [
      new THREE.OctahedronGeometry(0.3),
      new THREE.IcosahedronGeometry(0.25),
      new THREE.TetrahedronGeometry(0.3),
    ]
    const data = Array.from({ length: count }, (_, i) => ({
      pos: [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 10 - 5,
      ],
      rotSpeed: 0.2 + Math.random() * 0.8,
      geo: shapes[i % shapes.length],
      color: new THREE.Color().setHSL(0.55 + Math.random() * 0.15, 0.7, 0.5 + Math.random() * 0.3),
    }))
    return data
  }, [count])

  const instancedMesh = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((state) => {
    if (!instancedMesh.current) return
    geometries.forEach((d, i) => {
      const t = state.clock.elapsedTime * d.rotSpeed
      dummy.position.set(
        d.pos[0] + Math.sin(t * 0.5 + i) * 0.5,
        d.pos[1] + Math.cos(t * 0.3 + i * 0.7) * 0.5,
        d.pos[2] + Math.sin(t * 0.4 + i * 1.3) * 0.3,
      )
      dummy.rotation.set(t * 0.5, t * 0.8, t * 0.3)
      dummy.updateMatrix()
      instancedMesh.current.setMatrixAt(i, dummy.matrix)
    })
    instancedMesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={instancedMesh} args={[null, null, count]}>
      <sphereGeometry args={[0.15, 8, 8]} />
      <meshPhysicalMaterial
        metalness={0.6}
        roughness={0.2}
        transparent
        opacity={0.7}
        color="#4facfe"
      />
    </instancedMesh>
  )
}

function Racks3D() {
  const groupRef = useRef()
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    }
  })

  const rackColor = new THREE.Color('#4a5568')
  const shelfColor = new THREE.Color('#718096')
  const boxColors = ['#fc8181', '#68d391', '#63b3ed', '#f6ad55', '#b794f4', '#f687b3']

  const racks = useMemo(() => {
    const items = []
    for (let r = 0; r < 2; r++) {
      for (let s = 0; s < 3; s++) {
        items.push({
          x: -6 + r * 5,
          y: -3 + s * 1.8,
          z: 4,
          boxes: Array.from({ length: 3 }, (_, i) => ({
            x: (i - 1) * 0.6,
            color: boxColors[Math.floor(Math.random() * boxColors.length)],
            height: 0.3 + Math.random() * 0.3,
          })),
        })
      }
    }
    return items
  }, [])

  return (
    <group ref={groupRef}>
      {racks.map((rack, ri) => (
        <group key={ri} position={[rack.x, rack.y, rack.z]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[2.6, 0.05, 1.2]} />
            <meshPhysicalMaterial color={shelfColor} metalness={0.3} roughness={0.6} />
          </mesh>
          <mesh position={[-1.25, 0.4, 0]}>
            <boxGeometry args={[0.08, 0.8, 1.2]} />
            <meshPhysicalMaterial color={rackColor} metalness={0.4} roughness={0.5} />
          </mesh>
          <mesh position={[1.25, 0.4, 0]}>
            <boxGeometry args={[0.08, 0.8, 1.2]} />
            <meshPhysicalMaterial color={rackColor} metalness={0.4} roughness={0.5} />
          </mesh>
          {rack.boxes.map((box, bi) => (
            <Float key={bi} speed={0.5 + Math.random() * 0.5} rotationIntensity={0.05} floatIntensity={0.05}>
              <mesh position={[box.x, 0.2 + box.height / 2, 0]}>
                <boxGeometry args={[0.45, box.height, 0.4]} />
                <meshPhysicalMaterial
                  color={box.color}
                  metalness={0.2}
                  roughness={0.8}
                  transparent
                  opacity={0.9}
                />
              </mesh>
            </Float>
          ))}
        </group>
      ))}
    </group>
  )
}

function ParticlesField() {
  const count = 600
  const pointsRef = useRef()
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 25
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return pos
  }, [count])

  useFrame((state) => {
    if (!pointsRef.current) return
    const pos = pointsRef.current.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const angle = state.clock.elapsedTime * 0.05 + i * 0.01
      pos[i3 + 1] += Math.sin(angle + pos[i3] * 0.1) * 0.002
      pos[i3] += Math.cos(angle + pos[i3 + 1] * 0.1) * 0.002
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#4facfe"
        transparent
        opacity={0.4}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default function ThreeBackground() {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      zIndex: 0, pointerEvents: 'none',
    }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#4facfe" />
        <pointLight position={[-10, -10, 5]} intensity={0.4} color="#764ba2" />
        <Torus4D />
        <FloatingGeometry count={30} />
        <Racks3D />
        <ParticlesField />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]}>
          <planeGeometry args={[30, 30]} />
          <meshBasicMaterial color="#0a1628" transparent opacity={0.3} />
        </mesh>
      </Canvas>
    </div>
  )
}
