"use client";

import { useRef, useMemo, Suspense, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Float,
  useTexture,
  Center,
  Html,
  Line
} from "@react-three/drei";
import * as THREE from "three";
import { animated, useSpring } from "@react-spring/three";

const carbonDataURL = "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'>
  <rect width='32' height='32' fill='#091610'/>
  <path d='M-8,40 L40,-8 M-8,8 L8,-8 M24,40 L40,24' stroke='#162c1e' stroke-width='16'/>
  <path d='M-8,40 L40,-8 M-8,8 L8,-8 M24,40 L40,24' stroke='#050d0a' stroke-width='4'/>
  <path d='M-8,40 L40,-8 M-8,8 L8,-8 M24,40 L40,24' stroke='#112217' stroke-width='1'/>
</svg>
`);

const honeycombDataURL = "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg width="40" height="34" viewBox="0 0 40 34" xmlns="http://www.w3.org/2000/svg">
  <path d="M10 0 L30 0 L40 17 L30 34 L10 34 L0 17 Z" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.6"/>
</svg>
`);

const woodDataURL = "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'>
  <rect width='128' height='128' fill='#241a12'/>
  <path d='M0,20 Q64,25 128,20 M0,60 Q64,55 128,60 M0,100 Q64,105 128,100' stroke='#1a120d' stroke-width='4' fill='none' opacity='0.4'/>
  <path d='M0,40 Q64,35 128,40 M0,80 Q64,85 128,80' stroke='#2c221a' stroke-width='2' fill='none' opacity='0.3'/>
</svg>
`);

function ExplodablePaddle({
  isExploded,
  onToggle
}: {
  isExploded: boolean;
  onToggle: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const group = useRef<THREE.Group>(null);

  // Textures
  const logoTexture = useTexture('/pb4_clean.png');
  const carbonTexture = useTexture(carbonDataURL, (t) => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(4, 4);
  });
  const honeyTexture = useTexture(honeycombDataURL, (t) => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(12, 12);
  });
  const woodTexture = useTexture(woodDataURL, (t) => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1, 4);
  });

  // Smooth cursor
  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto";
    return () => { document.body.style.cursor = "auto"; };
  }, [hovered]);

  // Drive rotation
  const targetRotation = useRef(0);
  useFrame(() => {
    if (group.current) {
      const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
      targetRotation.current = scrollY * 0.0015;
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRotation.current, 0.05);
    }
  });

  // Base Paddle Geometry Definition (Shared Reference)
  const paddleParams = { w: 2.4, h: 3.0, r: 0.5 };

  const paddleShape = useMemo(() => {
    const { w, h, r } = paddleParams;
    const s = new THREE.Shape();
    s.moveTo(-w / 2, -h / 2 + r);
    s.lineTo(-w / 2, h / 2 - r);
    s.quadraticCurveTo(-w / 2, h / 2, -w / 2 + r, h / 2);
    s.lineTo(w / 2 - r, h / 2);
    s.quadraticCurveTo(w / 2, h / 2, w / 2, h / 2 - r);
    s.lineTo(w / 2, -h / 2 + r);
    s.quadraticCurveTo(w / 2, -h / 2, w / 2 - r, -h / 2);
    s.lineTo(-w / 2 + r, -h / 2);
    s.quadraticCurveTo(-w / 2, -h / 2, -w / 2, -h / 2 + r);
    return s;
  }, []);

  // EXACT-SIZE EDGE GUARD (Matches Face Sheets perfectly)
  const edgeGuardGeometry = useMemo(() => {
    const { w, h, r } = paddleParams;
    const t = 0.12; // thickness of the ribbon

    const s = new THREE.Shape();
    // Outer Path (U-shape) - uses EXACT same dimensions as head
    s.moveTo(0.2, -h / 2);
    s.lineTo(w / 2 - r, -h / 2);
    s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    s.lineTo(w / 2, h / 2 - r);
    s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    s.lineTo(-w / 2 + r, h / 2);
    s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    s.lineTo(-w / 2, -h / 2 + r);
    s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    s.lineTo(-0.2, -h / 2);

    // Create Thickness Inward
    s.lineTo(-0.2 + t, -h / 2);
    s.lineTo(-w / 2 + r, -h / 2 + t);
    s.lineTo(-w / 2 + t, -h / 2 + r);
    s.lineTo(-w / 2 + t, h / 2 - r);
    s.quadraticCurveTo(-w / 2 + t, h / 2 - t, -w / 2 + r, h / 2 - t);
    s.lineTo(w / 2 - r, h / 2 - t);
    s.quadraticCurveTo(w / 2 - t, h / 2 - t, w / 2 - t, h / 2 - r);
    s.lineTo(w / 2 - t, -h / 2 + r);
    s.lineTo(w / 2 - r, -h / 2 + t);
    s.lineTo(0.2 - t, -h / 2);
    s.closePath();

    return new THREE.ExtrudeGeometry(s, { depth: 0.18, bevelEnabled: false, curveSegments: 8 });
  }, []);

  // Animation (Optimized for snappiness)
  const springConfig = { mass: 0.8, tension: 220, friction: 28 };
  const {
    guardZ, guardScale,
    topZ, coreScale, bottomZ,
    handleScaleZ, labelOpacity
  } = useSpring({
    guardZ: isExploded ? 1.8 : 0,
    guardScale: isExploded ? 1.05 : 1.0,
    topZ: isExploded ? 1.0 : 0.06,
    coreScale: isExploded ? 1.0 : 0.98,
    bottomZ: isExploded ? -1.0 : -0.06,
    handleScaleZ: isExploded ? 0.6 : 0.08,
    labelOpacity: isExploded ? 1 : 0,
    config: springConfig
  });

  return (
    <group
      ref={group}
      scale={0.65}
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Float speed={2} rotationIntensity={isExploded ? 0.05 : 0.2} floatIntensity={isExploded ? 0.2 : 1.0}>

        {/* 1. EDGE GUARD (Matched Size) */}
        <animated.group position-y={0.8} position-z={guardZ} scale={guardScale}>
          <mesh position={[0, 0, -0.09]} geometry={edgeGuardGeometry}>
            <meshStandardMaterial color="#080808" roughness={0.9} />
          </mesh>
          {isExploded && (
            <>
              <Line points={[[1.1, 1.4, 0], [1.5, 1.6, 0]]} color="#4ade80" lineWidth={1} transparent opacity={0.6} />
              <Html position={[1.5, 1.6, 0]} style={{ opacity: isExploded ? 1 : 0, transition: 'opacity 0.5s' }}>
                <div className="bg-black/90 backdrop-blur-md px-3 py-1 rounded border border-green-500/50 text-[10px] text-green-400 font-black whitespace-nowrap uppercase tracking-widest">
                  Edge Guard
                </div>
              </Html>
            </>
          )}
        </animated.group>

        {/* 2. TOP FACE SHEET */}
        <animated.group position-y={0.8} position-z={topZ}>
          <mesh position={[0, 0, 0]}>
            <extrudeGeometry args={[paddleShape, { depth: 0.01, bevelEnabled: false, curveSegments: 8 }]} />
            <meshPhysicalMaterial color="#fff" map={carbonTexture} metalness={0.6} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0, 0.015]}>
            <planeGeometry args={[1.8, 1.8]} />
            <meshBasicMaterial map={logoTexture} transparent opacity={0.9} depthWrite={false} />
          </mesh>
          {isExploded && (
            <>
              <Line points={[[-1.1, 1.0, 0], [-1.5, 1.2, 0]]} color="#4ade80" lineWidth={1} transparent opacity={0.6} />
              <Html position={[-1.5, 1.2, 0]} style={{ opacity: isExploded ? 1 : 0, transition: 'opacity 0.5s' }}>
                <div className="bg-black/90 backdrop-blur-md px-3 py-1 rounded border border-green-500/50 text-[10px] text-green-400 font-black whitespace-nowrap uppercase tracking-widest">
                  Top Face Sheet
                </div>
              </Html>
            </>
          )}
        </animated.group>

        {/* 3. HONEYCOMB CORE */}
        <animated.mesh scale={coreScale} position={[0, 0.8, -0.05]}>
          <extrudeGeometry args={[paddleShape, { depth: 0.1, bevelEnabled: false, curveSegments: 8 }]} />
          <meshStandardMaterial 
            color="#aaa" 
            map={honeyTexture} 
            transparent 
            opacity={1.0} 
            roughness={0.2} 
            emissive="#222"
          />
          {isExploded && (
            <>
              <Line points={[[0, 0, 0], [1.1, 0, 0]]} color="#4ade80" lineWidth={1} transparent opacity={0.6} />
              <Html position={[1.1, 0, 0]} style={{ opacity: isExploded ? 1 : 0, transition: 'opacity 0.5s' }}>
                <div className="bg-black/90 backdrop-blur-md px-3 py-1 rounded border border-green-500/50 text-[10px] text-green-400 font-black whitespace-nowrap uppercase tracking-widest">
                  Honeycomb Core
                </div>
              </Html>
            </>
          )}
        </animated.mesh>

        {/* 4. BOTTOM FACE SHEET */}
        <animated.group position-y={0.8} position-z={bottomZ}>
          <mesh position={[0, 0, -0.01]} rotation={[0, Math.PI, 0]}>
            <extrudeGeometry args={[paddleShape, { depth: 0.01, bevelEnabled: false, curveSegments: 8 }]} />
            <meshPhysicalMaterial color="#fff" map={carbonTexture} metalness={0.6} roughness={0.7} />
          </mesh>
          {isExploded && (
            <>
              <Line points={[[-1.1, -1.0, 0], [-1.5, -1.2, 0]]} color="#4ade80" lineWidth={1} transparent opacity={0.6} />
              <Html position={[-1.5, -1.2, 0]} style={{ opacity: isExploded ? 1 : 0, transition: 'opacity 0.5s' }}>
                <div className="bg-black/90 backdrop-blur-md px-3 py-1 rounded border border-green-500/50 text-[10px] text-green-400 font-black whitespace-nowrap uppercase tracking-widest">
                  Bottom Face Sheet
                </div>
              </Html>
            </>
          )}
        </animated.group>

        {/* 5. PREMIUM HANDLE ASSEMBLY */}
        <group position={[0, -1.4, -0.05]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.35, 1.4, 0.08]} />
            <meshStandardMaterial color="#0b0b0b" roughness={0.4} metalness={0.9} />
          </mesh>
          <animated.mesh position-z={handleScaleZ} position-y={0}>
            <boxGeometry args={[0.36, 1.4, 0.06]} />
            <meshPhysicalMaterial color="#3d2b1f" map={woodTexture} roughness={0.6} clearcoat={0.3} clearcoatRoughness={0.5} reflectivity={0.1} />
            {isExploded && (
              <>
                <Line points={[[0.17, 0, 0], [0.8, 0, 0]]} color="#4ade80" lineWidth={1} transparent opacity={0.6} />
                <Html position={[0.8, 0, 0]} style={{ opacity: isExploded ? 1 : 0, transition: 'opacity 0.5s' }}>
                  <div className="bg-black/90 backdrop-blur-md px-3 py-1 rounded border border-green-500/50 text-[10px] text-green-400 font-black whitespace-nowrap uppercase tracking-widest">
                    Ebony Grip
                  </div>
                </Html>
              </>
            )}
          </animated.mesh>
          <animated.mesh position-z={handleScaleZ.to(z => -z)} position-y={0}>
            <boxGeometry args={[0.36, 1.4, 0.06]} />
            <meshPhysicalMaterial color="#3d2b1f" map={woodTexture} roughness={0.6} clearcoat={0.3} clearcoatRoughness={0.5} reflectivity={0.1} />
          </animated.mesh>
          <mesh position={[0, -0.75, 0]}>
            <boxGeometry args={[0.4, 0.1, 0.15]} />
            <meshStandardMaterial color="#4ade80" roughness={0.1} metalness={1.0} />
          </mesh>
        </group>

      </Float>
    </group>
  );
}

export default function Paddle3DScene({
  isExploded = false,
  onExplodeChange
}: {
  isExploded?: boolean;
  onExplodeChange?: (val: boolean) => void;
}) {
  return (
    <div className="w-full h-full min-h-[400px] md:min-h-[600px] cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 8.5], fov: 40 }}>
        <ambientLight intensity={0.4} />
        <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={2.5} castShadow color="#ffffff" />
        <spotLight position={[-10, -10, -10]} angle={0.5} penumbra={0.5} intensity={4} color="#4ade80" />

        <Suspense fallback={null}>
          <Environment preset="studio" />
          <Center>
            <group rotation={[0.2, -0.5, 0.2]}>
              <ExplodablePaddle
                isExploded={isExploded}
                onToggle={() => onExplodeChange?.(!isExploded)}
              />
            </group>
          </Center>

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 1.5}
            minPolarAngle={Math.PI / 4}
          />

          <ContactShadows position={[0, -3.5, 0]} opacity={0.7} scale={15} blur={2.5} far={5} color="#000000" />
        </Suspense>
      </Canvas>
    </div>
  );
}
