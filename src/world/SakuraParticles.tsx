import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useWorldStore } from '../store/useWorldStore';

interface PetalSeed {
  x: number;
  y: number;
  z: number;
  speedY: number;
  driftPhase: number;
  spinSpeed: number;
  scale: number;
}

export function SakuraParticles() {
  const qualityTier = useWorldStore((s) => s.qualityTier);
  const timeOfDay = useWorldStore((s) => s.timeOfDay);
  const count = qualityTier === 'ultra' ? 950 : qualityTier === 'balanced' ? 550 : 260;

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const seeds = useMemo<PetalSeed[]>(() => {
    const arr: PetalSeed[] = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 130,
        y: Math.random() * 18 + 0.5,
        z: (Math.random() - 0.5) * 130,
        speedY: 0.55 + Math.random() * 0.75,
        driftPhase: Math.random() * Math.PI * 2,
        spinSpeed: 1.2 + Math.random() * 2.2,
        scale: 0.08 + Math.random() * 0.07,
      });
    }
    return arr;
  }, [count]);

  useFrame(({ clock }, delta) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    for (let i = 0; i < seeds.length; i++) {
      const p = seeds[i];
      p.y -= p.speedY * delta;
      p.x += Math.sin(t * 0.9 + p.driftPhase) * 0.55 * delta;
      p.z += Math.cos(t * 0.7 + p.driftPhase) * 0.42 * delta;

      if (p.y < 0.15) {
        p.y = 16 + Math.random() * 4;
        p.x = (Math.random() - 0.5) * 130;
        p.z = (Math.random() - 0.5) * 130;
      }

      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(
        t * p.spinSpeed + p.driftPhase,
        t * p.spinSpeed * 0.7,
        Math.sin(t + p.driftPhase)
      );
      dummy.scale.set(p.scale, p.scale * 0.35, p.scale * 1.4);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  const isNight = timeOfDay === 'night';

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={isNight ? '#fde047' : '#fbcfe8'}
        emissive={isNight ? '#facc15' : '#f472b6'}
        emissiveIntensity={isNight ? 2.4 : 0.45}
        roughness={0.35}
      />
    </instancedMesh>
  );
}
