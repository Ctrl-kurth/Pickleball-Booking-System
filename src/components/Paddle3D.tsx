"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Float, useTexture, Center } from "@react-three/drei";
import * as THREE from "three";

const carbonDataURL = "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'>
  <rect width='32' height='32' fill='#091610'/>
  <path d='M-8,40 L40,-8 M-8,8 L8,-8 M24,40 L40,24' stroke='#162c1e' stroke-width='16'/>
  <path d='M-8,40 L40,-8 M-8,8 L8,-8 M24,40 L40,24' stroke='#050d0a' stroke-width='4'/>
  <path d='M-8,40 L40,-8 M-8,8 L8,-8 M24,40 L40,24' stroke='#112217' stroke-width='1'/>
</svg>
`);

function PremiumPaddle() {
  const group = useRef<THREE.Group>(null);
  
  // Load textures
  const logoTexture = useTexture('/pb4_clean.png');
  const carbonTexture = useTexture(carbonDataURL, (texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
  });

  // Drive rotation based on scroll performance with smoothing
  const targetRotation = useRef(0);
  useFrame(() => {
    if (group.current) {
      const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
      // Target rotation (slower: smaller multiplier)
      targetRotation.current = scrollY * 0.0015;
      
      // lerp current rotation to target for that "buttery smooth" high-end feel
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        targetRotation.current,
        0.05
      );
    }
  });

  // Perfect flat paddle shape with rounded corners
  const paddleShape = useMemo(() => {
    const shape = new THREE.Shape();
    const width = 2.5;
    const height = 3.1;
    const radius = 0.55;
    const x = -width / 2;
    const y = -height / 2;
    shape.moveTo(x, y + radius);
    shape.lineTo(x, y + height - radius);
    shape.quadraticCurveTo(x, y + height, x + radius, y + height);
    shape.lineTo(x + width - radius, y + height);
    shape.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
    shape.lineTo(x + width, y + radius);
    shape.quadraticCurveTo(x + width, y, x + width - radius, y);
    shape.lineTo(x + radius, y);
    shape.quadraticCurveTo(x, y, x, y + radius);
    return shape;
  }, []);

  const extrudeSettings = useMemo(() => ({
    depth: 0.14,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.015,
    bevelThickness: 0.015
  }), []);

  return (
    <group ref={group} dispose={null} scale={0.75}>
      <Float speed={2} rotationIntensity={0.3} floatIntensity={1.2}>

        {/* PADDLE FACE (CARBON FIBER) */}
        {/* ExtrudeGeometry extrudes in +Z, so we center it by pulling it back half the depth */}
        <mesh position={[0, 0.8, -0.07]}>
          <extrudeGeometry args={[paddleShape, extrudeSettings]} />
          <meshPhysicalMaterial
            color="#ffffff"
            map={carbonTexture}
            metalness={0.6}
            roughness={0.7}
            clearcoat={1.0}
            clearcoatRoughness={0.2}
            envMapIntensity={1.5}
          />
        </mesh>

        {/* INNER TRIM (METALLIC ACCENT) */}
        <mesh position={[0, 0.8, -0.05]} scale={[1.015, 1.015, 0.7]}>
          <extrudeGeometry args={[paddleShape, extrudeSettings]} />
          <meshPhysicalMaterial
            color="#222"
            metalness={0.9}
            roughness={0.1}
            envMapIntensity={2.0}
          />
        </mesh>

        {/* OUTER EDGE GUARD (RUBBER SIMULATION) */}
        <mesh position={[0, 0.8, -0.08]} scale={[1.04, 1.04, 1.15]}>
          <extrudeGeometry args={[paddleShape, { ...extrudeSettings, bevelEnabled: false }]} />
          <meshStandardMaterial
            color="#080808"
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>

        {/* BRAND DECAL (FACE LOGO) FRONT */}
        <mesh position={[0, 0.8, 0.09]}>
          <planeGeometry args={[1.9, 1.9]} />
          <meshBasicMaterial
            map={logoTexture}
            transparent
            opacity={0.9}
            depthWrite={false}
          />
        </mesh>

        {/* BRAND DECAL BACK */}
        <mesh position={[0, 0.8, -0.09]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[1.9, 1.9]} />
          <meshBasicMaterial
            map={logoTexture}
            transparent
            opacity={0.8}
            depthWrite={false}
          />
        </mesh>

        {/*
          5. LOWER THROAT BLOCK (Transition from face to handle)
        */}
        <mesh position={[0, -0.5, 0]}>
          <boxGeometry args={[0.6, 0.3, 0.15]} />
          <meshStandardMaterial color="#111" roughness={0.8} />
        </mesh>

        {/*
          6. HANDLE CORE
        */}
        <mesh position={[0, -1.2, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 1.4, 32]} />
          <meshStandardMaterial color="#000" roughness={1.0} />
        </mesh>

        {/*
          7. HANDLE GRIP WRAP
          Overlapping slanted rings to simulate sports overgrip tape.
        */}
        {Array.from({ length: 18 }).map((_, i) => (
          <mesh
            key={i}
            position={[0, -0.55 - i * 0.075, 0]}
            rotation={[0.15, i * 1.5, 0]}
          >
            <cylinderGeometry args={[0.175, 0.175, 0.07, 32]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? "#1a1a1a" : "#222"}
              roughness={0.9}
            />
          </mesh>
        ))}

        {/*
          8. POMMEL / BASE CAP
        */}
        <mesh position={[0, -1.9, 0]}>
          <cylinderGeometry args={[0.22, 0.18, 0.15, 32]} />
          <meshStandardMaterial color="#4ade80" roughness={0.5} metalness={0.5} />
        </mesh>

        {/* Base Cap Bottom Decal/Trim */}
        <mesh position={[0, -1.98, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.05, 32]} />
          <meshStandardMaterial color="#222" />
        </mesh>

      </Float>
    </group>
  );
}

export default function Paddle3DScene() {
  return (
    <div className="w-full h-full min-h-[400px] md:min-h-[600px] cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 8.5], fov: 40 }}>
        {/* Dynamic Studio Lighting setup */}
        <ambientLight intensity={0.4} />
        <spotLight
          position={[10, 15, 10]}
          angle={0.3}
          penumbra={1}
          intensity={2.5}
          castShadow
          color="#ffffff"
        />
        {/* Backlight to give a crisp glowing edge on the paddle */}
        <spotLight
          position={[-10, -10, -10]}
          angle={0.5}
          penumbra={0.5}
          intensity={4}
          color="#4ade80"
        />

        <Suspense fallback={null}>
          <Environment preset="studio" />
          <Center>
            {/* Rotate slightly for initial impressive angle */}
            <group rotation={[0.2, -0.5, 0.2]}>
              <PremiumPaddle />
            </group>
          </Center>

          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            maxPolarAngle={Math.PI / 1.5} 
            minPolarAngle={Math.PI / 4} 
          />

          {/* Ground reflection shadow */}
          <ContactShadows
            position={[0, -3.5, 0]}
            opacity={0.7}
            scale={15}
            blur={2.5}
            far={5}
            color="#000000"
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
