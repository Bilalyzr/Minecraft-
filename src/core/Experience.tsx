import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { SkyAtmosphere } from '../world/SkyAtmosphere';
import { Terrain } from '../world/Terrain';
import { SpringWater } from '../world/SpringWater';
import { SpringFoliage } from '../world/SpringFoliage';
import { SakuraParticles } from '../world/SakuraParticles';
import { PlayerController } from '../entities/player/PlayerController';
import { VehicleSystem } from '../entities/vehicles/VehicleSystem';
import { ProjectPavilions } from '../entities/pavilions/ProjectPavilions';
import { NPCSystem } from '../entities/npcs/NPCSystem';
import { CameraRig } from './CameraRig';
import { PostProcessing } from './PostProcessing';
import { useWorldStore } from '../store/useWorldStore';
import { soundEngine } from '../audio/soundEngine';

function WorldReadyNotifier() {
  const setWorldReady = useWorldStore((s) => s.setWorldReady);
  useEffect(() => {
    const timer = window.setTimeout(() => setWorldReady(true), 250);
    return () => window.clearTimeout(timer);
  }, [setWorldReady]);
  return null;
}

export function Experience() {
  const qualityTier = useWorldStore((s) => s.qualityTier);
  const soundEnabled = useWorldStore((s) => s.soundEnabled);

  useEffect(() => {
    soundEngine.setEnabled(soundEnabled);
  }, [soundEnabled]);

  const dpr: [number, number] =
    qualityTier === 'ultra' ? [1, 1.5] : qualityTier === 'balanced' ? [1, 1.25] : [1, 1];

  return (
    <Canvas
      shadows
      dpr={dpr}
      camera={{ position: [0, 5.5, 19], fov: 50, near: 0.25, far: 380 }}
      gl={{
        antialias: qualityTier !== 'performance',
        powerPreference: 'high-performance',
      }}
    >
      <Suspense fallback={null}>
        <SkyAtmosphere />

        <Physics gravity={[0, -20, 0]} timeStep={1 / 60}>
          <Terrain />
          <SpringFoliage />
          <PlayerController />
          <VehicleSystem />
          <ProjectPavilions />
        </Physics>

        <SpringWater />
        <SakuraParticles />
        <NPCSystem />
        <CameraRig />
        <PostProcessing />
        <WorldReadyNotifier />
      </Suspense>
    </Canvas>
  );
}
