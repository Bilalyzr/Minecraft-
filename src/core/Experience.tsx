import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { SkyAtmosphere } from '../world/SkyAtmosphere';
import { Terrain } from '../world/Terrain';
import { SpringWater } from '../world/SpringWater';
import { SpringFoliage } from '../world/SpringFoliage';
import { SakuraParticles } from '../world/SakuraParticles';
import { PlayerController } from '../entities/player/PlayerController';
import { VehicleSystem } from '../entities/vehicles/VehicleSystem';
import { ProjectPavilions } from '../entities/pavilions/ProjectPavilions';
import { WardrobeBoutique } from '../entities/wardrobe/WardrobeBoutique';
import { NPCSystem } from '../entities/npcs/NPCSystem';
import { CameraRig } from './CameraRig';
import { PostProcessing } from './PostProcessing';
import { useWorldStore } from '../store/useWorldStore';
import { soundEngine } from '../audio/soundEngine';

function WorldReadyNotifier() {
  const frameCountRef = useRef(0);
  const completedRef = useRef(false);
  const setWorldReady = useWorldStore((s) => s.setWorldReady);
  const setLoadingProgress = useWorldStore((s) => s.setLoadingProgress);

  useEffect(() => {
    setLoadingProgress(52, 'Initializing Physics & Pavilions...');
    // Safety fallback if background tab throttles requestAnimationFrame
    const safetyTimer = window.setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        setWorldReady(true);
      }
    }, 3500);
    return () => window.clearTimeout(safetyTimer);
  }, [setLoadingProgress, setWorldReady]);

  useFrame(() => {
    if (completedRef.current) return;
    frameCountRef.current += 1;

    if (frameCountRef.current === 1) {
      setLoadingProgress(76, 'Compiling Shaders & Lighting...');
    } else if (frameCountRef.current === 3) {
      setLoadingProgress(94, 'Preparing Blossom Plaza...');
    } else if (frameCountRef.current >= 5) {
      completedRef.current = true;
      setWorldReady(true);
    }
  });

  return null;
}

export function Experience() {
  const qualityTier = useWorldStore((s) => s.qualityTier);
  const soundEnabled = useWorldStore((s) => s.soundEnabled);
  const setLoadingProgress = useWorldStore((s) => s.setLoadingProgress);

  useEffect(() => {
    soundEngine.setEnabled(soundEnabled);
  }, [soundEnabled]);

  const dpr: [number, number] =
    qualityTier === 'ultra' ? [1, 1.5] : qualityTier === 'balanced' ? [1, 1.25] : [1, 1];

  return (
    <div
      className="h-full w-full"
      onContextMenu={(e) => e.preventDefault()}
    >
      <Canvas
        shadows
        dpr={dpr}
        camera={{ position: [0, 5.5, 19], fov: 50, near: 0.25, far: 600 }}
        gl={{
          antialias: qualityTier !== 'performance',
          powerPreference: 'high-performance',
        }}
        onCreated={() => {
          setLoadingProgress(35, 'Mounting 3D Valley...');
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
            <WardrobeBoutique />
            <CameraRig />
          </Physics>

          <SpringWater />
          <SakuraParticles />
          <NPCSystem />
          <PostProcessing />
          <WorldReadyNotifier />
        </Suspense>
      </Canvas>
    </div>
  );
}
