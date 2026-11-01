import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Environment, Lightformer, Sky, Stars } from '@react-three/drei';
import { useWorldStore } from '../store/useWorldStore';

interface CloudCluster {
  x: number;
  y: number;
  z: number;
  sx: number;
  sy: number;
  sz: number;
  speed: number;
}

export function SkyAtmosphere() {
  const timeOfDay = useWorldStore((s) => s.timeOfDay);
  const qualityTier = useWorldStore((s) => s.qualityTier);
  const cloudsRef = useRef<THREE.Group>(null);

  const lighting = useMemo(() => {
    if (timeOfDay === 'sunset') {
      return {
        sunPos: [-92, 22, -52] as [number, number, number],
        sunColor: '#ffa86b',
        sunIntensity: 3.15,
        ambientIntensity: 0.54,
        hemiSky: '#fecdd3',
        hemiGround: '#4d7c0f',
        fogColor: '#f6b89e',
        bgColor: '#ea927c',
        cloudTop: '#fff7ed',
        cloudBottom: '#fed7aa',
        turbidity: 7.2,
        rayleigh: 2.4,
      };
    }
    if (timeOfDay === 'night') {
      return {
        sunPos: [-58, 64, 52] as [number, number, number],
        sunColor: '#93c5fd',
        sunIntensity: 0.95,
        ambientIntensity: 0.34,
        hemiSky: '#1e3a8a',
        hemiGround: '#1e293b',
        fogColor: '#0c182d',
        bgColor: '#071020',
        cloudTop: '#475569',
        cloudBottom: '#1e293b',
        turbidity: 2.0,
        rayleigh: 0.5,
      };
    }
    // Crisp, bright Minecraft Spring Morning palette
    return {
      sunPos: [76, 68, -56] as [number, number, number],
      sunColor: '#fff9eb',
      sunIntensity: 3.25,
      ambientIntensity: 0.65,
      hemiSky: '#cbeafe',
      hemiGround: '#558b2f',
      fogColor: '#d9f0ff',
      bgColor: '#a7dbff',
      cloudTop: '#ffffff',
      cloudBottom: '#e0f2fe',
      turbidity: 2.6,
      rayleigh: 1.05,
    };
  }, [timeOfDay]);

  const clouds = useMemo<CloudCluster[]>(() => {
    const list: CloudCluster[] = [];
    for (let i = 0; i < 30; i++) {
      const seed = i * 137.5;
      list.push({
        x: ((seed * 17) % 320) - 160,
        y: 48 + (i % 5) * 3.6,
        z: ((seed * 31) % 300) - 150,
        sx: 14 + (i % 4) * 6,
        sy: 2.2 + (i % 3) * 0.7,
        sz: 9 + ((i + 2) % 4) * 4.5,
        speed: 0.75 + (i % 5) * 0.2,
      });
    }
    return list;
  }, []);

  useFrame((_, delta) => {
    if (!cloudsRef.current) return;
    cloudsRef.current.children.forEach((child, idx) => {
      const c = clouds[idx];
      if (!c) return;
      child.position.x += c.speed * delta;
      if (child.position.x > 165) {
        child.position.x = -165;
      }
    });
  });

  const shadowMapSize = qualityTier === 'ultra' ? 2048 : qualityTier === 'balanced' ? 1536 : 1024;

  return (
    <>
      <color attach="background" args={[lighting.bgColor]} />
      <fogExp2 attach="fog" args={[lighting.fogColor, timeOfDay === 'night' ? 0.0042 : 0.0024]} />

      {timeOfDay !== 'night' ? (
        <Sky
          distance={4500}
          sunPosition={lighting.sunPos}
          turbidity={lighting.turbidity}
          rayleigh={lighting.rayleigh}
          mieCoefficient={0.004}
          mieDirectionalG={0.8}
        />
      ) : (
        <Stars radius={220} depth={80} count={3800} factor={4.4} saturation={0.35} fade speed={0.5} />
      )}

      {/* Offline Zero-Latency Procedural HDR Environment Map */}
      <Environment resolution={128} frames={1}>
        <color attach="background" args={[lighting.hemiSky]} />
        <Lightformer
          form="circle"
          intensity={timeOfDay === 'night' ? 1.4 : 5.2}
          color={lighting.sunColor}
          scale={[22, 22, 1]}
          position={lighting.sunPos}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={timeOfDay === 'night' ? 0.55 : 1.75}
          color={lighting.hemiSky}
          scale={[110, 40, 1]}
          position={[0, 45, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        <Lightformer
          form="ring"
          intensity={1.15}
          color="#fbcfe8"
          scale={[55, 55, 1]}
          position={[0, 10, -55]}
        />
      </Environment>

      <ambientLight intensity={lighting.ambientIntensity} color={lighting.hemiSky} />
      <hemisphereLight args={[lighting.hemiSky, lighting.hemiGround, 0.72]} />

      <directionalLight
        position={lighting.sunPos}
        intensity={lighting.sunIntensity}
        color={lighting.sunColor}
        castShadow
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
        shadow-camera-near={5}
        shadow-camera-far={280}
        shadow-camera-left={-105}
        shadow-camera-right={105}
        shadow-camera-top={105}
        shadow-camera-bottom={-105}
        shadow-bias={-0.0004}
      />

      {/* Crisp Self-Lit Stylized Minecraft Volumetric Clouds (Zero Muddy Ground Bounce!) */}
      <group ref={cloudsRef}>
        {clouds.map((c, idx) => (
          <group key={idx} position={[c.x, c.y, c.z]}>
            <mesh position={[0, 0.25, 0]} scale={[c.sx, c.sy * 0.78, c.sz]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial
                color={lighting.cloudTop}
                transparent
                opacity={timeOfDay === 'night' ? 0.42 : 0.92}
                fog={false}
              />
            </mesh>
            <mesh position={[0, -c.sy * 0.32, 0]} scale={[c.sx * 0.96, c.sy * 0.28, c.sz * 0.96]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial
                color={lighting.cloudBottom}
                transparent
                opacity={timeOfDay === 'night' ? 0.35 : 0.88}
                fog={false}
              />
            </mesh>
            <mesh
              position={[c.sx * 0.22, c.sy * 0.62, c.sz * 0.08]}
              scale={[c.sx * 0.56, c.sy * 0.62, c.sz * 0.68]}
            >
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial
                color={lighting.cloudTop}
                transparent
                opacity={timeOfDay === 'night' ? 0.38 : 0.9}
                fog={false}
              />
            </mesh>
          </group>
        ))}
      </group>
    </>
  );
}
