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
    if (timeOfDay === 'night') {
      return {
        sunPos: [-58, 66, 52] as [number, number, number],
        sunColor: '#a5ccff',
        sunIntensity: 1.35,
        ambientIntensity: 0.44,
        hemiSky: '#3b82f6',
        hemiGround: '#1e293b',
        fogColor: '#091529',
        bgColor: '#050c1a',
        cloudTop: '#475569',
        cloudBottom: '#1e293b',
        turbidity: 2.0,
        rayleigh: 0.5,
      };
    }

    // Golden-Hour Sakura Evening Twilight Palette
    return {
      sunPos: [-92, 24, -52] as [number, number, number],
      sunColor: '#ffad70',
      sunIntensity: 3.15,
      ambientIntensity: 0.58,
      hemiSky: '#fbcfe8',
      hemiGround: '#3f6212',
      fogColor: '#eca895',
      bgColor: '#df8578',
      cloudTop: '#fff3e6',
      cloudBottom: '#fdba74',
      turbidity: 6.4,
      rayleigh: 2.25,
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
  const isNight = timeOfDay === 'night';

  return (
    <>
      <color attach="background" args={[lighting.bgColor]} />
      <fogExp2 attach="fog" args={[lighting.fogColor, isNight ? 0.0038 : 0.0022]} />

      {!isNight ? (
        <Sky
          distance={4500}
          sunPosition={lighting.sunPos}
          turbidity={lighting.turbidity}
          rayleigh={lighting.rayleigh}
          mieCoefficient={0.005}
          mieDirectionalG={0.82}
        />
      ) : (
        <>
          <Stars
            radius={220}
            depth={80}
            count={4200}
            factor={4.6}
            saturation={0.4}
            fade
            speed={0.45}
          />
          {/* Luminous Stylized Moon */}
          <mesh position={[-85, 88, 72]}>
            <boxGeometry args={[9, 9, 9]} />
            <meshBasicMaterial color="#e0f2fe" fog={false} />
          </mesh>
        </>
      )}

      {/* Offline Zero-Latency Procedural HDR Environment Map */}
      <Environment resolution={128} frames={1}>
        <color attach="background" args={[lighting.hemiSky]} />
        <Lightformer
          form="circle"
          intensity={isNight ? 1.8 : 4.8}
          color={lighting.sunColor}
          scale={[22, 22, 1]}
          position={lighting.sunPos}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={isNight ? 0.75 : 1.55}
          color={lighting.hemiSky}
          scale={[110, 40, 1]}
          position={[0, 45, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        <Lightformer
          form="ring"
          intensity={isNight ? 1.35 : 1.25}
          color={isNight ? '#38bdf8' : '#fbcfe8'}
          scale={[55, 55, 1]}
          position={[0, 10, -55]}
        />
      </Environment>

      <ambientLight intensity={lighting.ambientIntensity} color={lighting.hemiSky} />
      <hemisphereLight args={[lighting.hemiSky, lighting.hemiGround, isNight ? 0.68 : 0.8]} />

      {/* Warm Central Plaza Bounce Fill Light */}
      <pointLight
        position={[0, 5.5, 2]}
        color={isNight ? '#38bdf8' : '#fdba74'}
        intensity={isNight ? 4.2 : 2.2}
        distance={42}
      />

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
        shadow-bias={-0.00035}
        shadow-normalBias={0.02}
      />

      {/* Stylized Volumetric Minecraft Clouds */}
      <group ref={cloudsRef}>
        {clouds.map((c, idx) => (
          <group key={idx} position={[c.x, c.y, c.z]}>
            <mesh position={[0, 0.25, 0]} scale={[c.sx, c.sy * 0.78, c.sz]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial
                color={lighting.cloudTop}
                transparent
                opacity={isNight ? 0.36 : 0.9}
                fog={false}
              />
            </mesh>
            <mesh position={[0, -c.sy * 0.32, 0]} scale={[c.sx * 0.96, c.sy * 0.28, c.sz * 0.96]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial
                color={lighting.cloudBottom}
                transparent
                opacity={isNight ? 0.28 : 0.85}
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
                opacity={isNight ? 0.32 : 0.88}
                fog={false}
              />
            </mesh>
          </group>
        ))}
      </group>
    </>
  );
}
