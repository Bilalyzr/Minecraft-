import { useEffect } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useWorldStore } from '../store/useWorldStore';

// Configures Three.js native ACES Filmic HDR Tone Mapping & PCFSoft Shadows cleanly across all GPUs
export function PostProcessing() {
  const { gl } = useThree();
  const timeOfDay = useWorldStore((s) => s.timeOfDay);

  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = timeOfDay === 'night' ? 1.22 : 1.1;
  }, [gl, timeOfDay]);

  return null;
}
