import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { cameraState } from './cameraState';
import { useWorldStore } from '../store/useWorldStore';

export function CameraRig() {
  const { camera, gl } = useThree();
  const isDraggingRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const manualOrbitCooldownRef = useRef(0);

  const desiredPos = useRef(new THREE.Vector3(0, 5, 19));
  const desiredLook = useRef(new THREE.Vector3(0, 1.5, 11));

  useEffect(() => {
    const dom = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastPointerRef.current.x;
      const dy = e.clientY - lastPointerRef.current.y;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };

      cameraState.azimuth -= dx * 0.0065;
      cameraState.polar = THREE.MathUtils.clamp(cameraState.polar + dy * 0.0055, 0.14, 1.18);
      manualOrbitCooldownRef.current = 2.2;
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      cameraState.distance = THREE.MathUtils.clamp(
        cameraState.distance + e.deltaY * 0.007,
        3.6,
        24.5
      );
    };

    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: true });

    return () => {
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('wheel', onWheel);
    };
  }, [gl]);

  useFrame((_, delta) => {
    const store = useWorldStore.getState();
    const [px, py, pz] = store.playerPosition;
    const isDriving = Boolean(store.drivingVehicleId);

    manualOrbitCooldownRef.current = Math.max(0, manualOrbitCooldownRef.current - delta);

    // Gentle auto-chase alignment behind vehicle when driving & not actively orbiting mouse
    if (isDriving && manualOrbitCooldownRef.current <= 0 && store.vehicleSpeedKmh > 6) {
      let angleDiff = store.playerHeading - cameraState.azimuth;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      cameraState.azimuth += angleDiff * Math.min(1, delta * 2.6);
    }

    // Dynamic speed-reactive FOV & chase distance
    const speedBoostDist = isDriving ? Math.min(3.5, store.vehicleSpeedKmh * 0.032) : 0;
    const activeDist = cameraState.distance + (isDriving ? 2.2 : 0) + speedBoostDist;

    if (camera instanceof THREE.PerspectiveCamera) {
      const targetFov = isDriving && store.isBoosting ? 64 : isDriving ? 56 : 50;
      if (Math.abs(camera.fov - targetFov) > 0.1) {
        camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, Math.min(1, delta * 6));
        camera.updateProjectionMatrix();
      }
    }

    // Subtle upward framing toward nearby illuminated Project Pavilion Screen!
    let focusX = px;
    let focusY = py + (isDriving ? 1.35 : 1.48);
    let focusZ = pz;

    if (store.nearbyProjectId) {
      const proj = store.projects.find((p) => p.id === store.nearbyProjectId);
      if (proj) {
        focusX = THREE.MathUtils.lerp(px, proj.position[0], 0.24);
        focusY += 0.75;
        focusZ = THREE.MathUtils.lerp(pz, proj.position[2], 0.24);
      }
    }

    desiredLook.current.set(focusX, focusY, focusZ);
    cameraState.currentLookAt.lerp(desiredLook.current, Math.min(1, delta * 10));

    const horizDist = activeDist * Math.cos(cameraState.polar);
    const vertOffset = activeDist * Math.sin(cameraState.polar);

    const camX = cameraState.currentLookAt.x + Math.sin(cameraState.azimuth) * horizDist;
    const camY = Math.max(1.25, cameraState.currentLookAt.y + vertOffset);
    const camZ = cameraState.currentLookAt.z + Math.cos(cameraState.azimuth) * horizDist;

    desiredPos.current.set(camX, camY, camZ);
    camera.position.lerp(desiredPos.current, Math.min(1, delta * 9.5));
    camera.lookAt(cameraState.currentLookAt);
  });

  return null;
}
