import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useRapier } from '@react-three/rapier';
import { cameraState } from './cameraState';
import { useWorldStore } from '../store/useWorldStore';

export function CameraRig() {
  const { camera, gl } = useThree();
  const { rapier, world } = useRapier();

  const isDraggingRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const pinchDistRef = useRef<number | null>(null);
  const manualOrbitCooldownRef = useRef(0);
  const introTimerRef = useRef(0);
  const lastIntroNonceRef = useRef(0);

  const introSequenceNonce = useWorldStore((s) => s.introSequenceNonce);

  const desiredPos = useRef(new THREE.Vector3(0, 5.5, 19));
  const desiredLook = useRef(new THREE.Vector3(0, 1.5, 11));
  const rayDirHelper = useMemo(() => new THREE.Vector3(), []);

  // Trigger dramatic establishing dive when visitor clicks "Enter 3D Story World"
  useEffect(() => {
    if (introSequenceNonce > lastIntroNonceRef.current) {
      lastIntroNonceRef.current = introSequenceNonce;
      introTimerRef.current = 1.45;
      cameraState.azimuth = 0.08;
      cameraState.polar = 0.48;
      cameraState.distance = 13.5;
    }
  }, [introSequenceNonce]);

  useEffect(() => {
    const dom = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      isDraggingRef.current = true;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current || pinchDistRef.current !== null) return;
      const dx = e.clientX - lastPointerRef.current.x;
      const dy = e.clientY - lastPointerRef.current.y;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };

      cameraState.azimuth -= dx * 0.0065;
      cameraState.polar = THREE.MathUtils.clamp(cameraState.polar + dy * 0.0055, 0.14, 1.18);
      manualOrbitCooldownRef.current = 2.4;
      introTimerRef.current = 0;
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
      introTimerRef.current = 0;
    };

    const touchDist = (touches: TouchList) => {
      if (touches.length < 2) return 0;
      return Math.hypot(
        touches[0].clientX - touches[1].clientX,
        touches[0].clientY - touches[1].clientY
      );
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        pinchDistRef.current = touchDist(e.touches);
        isDraggingRef.current = false;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchDistRef.current !== null) {
        const nextDist = touchDist(e.touches);
        const diff = pinchDistRef.current - nextDist;
        pinchDistRef.current = nextDist;
        cameraState.distance = THREE.MathUtils.clamp(
          cameraState.distance + diff * 0.035,
          3.6,
          24.5
        );
        introTimerRef.current = 0;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        pinchDistRef.current = null;
      }
    };

    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: true });
    dom.addEventListener('touchstart', onTouchStart, { passive: true });
    dom.addEventListener('touchmove', onTouchMove, { passive: true });
    dom.addEventListener('touchend', onTouchEnd);

    return () => {
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('touchstart', onTouchStart);
      dom.removeEventListener('touchmove', onTouchMove);
      dom.removeEventListener('touchend', onTouchEnd);
    };
  }, [gl]);

  useFrame((_, delta) => {
    const store = useWorldStore.getState();

    // 1. Serene Scenic Skyline Pan Behind Onboarding / Character Selection Gate
    if (!store.hasEnteredWorld) {
      cameraState.azimuth += delta * 0.14;
      cameraState.polar = THREE.MathUtils.lerp(cameraState.polar, 0.34, Math.min(1, delta * 2));
      cameraState.distance = THREE.MathUtils.lerp(cameraState.distance, 18.5, Math.min(1, delta * 2));

      desiredLook.current.set(0, 2.2, 2);
      cameraState.currentLookAt.lerp(desiredLook.current, Math.min(1, delta * 3));

      const horiz = cameraState.distance * Math.cos(cameraState.polar);
      const vert = cameraState.distance * Math.sin(cameraState.polar);
      desiredPos.current.set(
        cameraState.currentLookAt.x + Math.sin(cameraState.azimuth) * horiz,
        cameraState.currentLookAt.y + vert,
        cameraState.currentLookAt.z + Math.cos(cameraState.azimuth) * horiz
      );
      camera.position.lerp(desiredPos.current, Math.min(1, delta * 4));
      camera.lookAt(cameraState.currentLookAt);
      return;
    }

    const [px, py, pz] = store.playerPosition;
    const isDriving = Boolean(store.drivingVehicleId);

    manualOrbitCooldownRef.current = Math.max(0, manualOrbitCooldownRef.current - delta);

    // 2. Smooth Post-Onboarding Intro Ease Down to Player
    if (introTimerRef.current > 0) {
      introTimerRef.current = Math.max(0, introTimerRef.current - delta);
      const rate = Math.min(1, delta * 3.2);
      cameraState.distance = THREE.MathUtils.lerp(cameraState.distance, 8.2, rate);
      cameraState.polar = THREE.MathUtils.lerp(cameraState.polar, 0.36, rate);
      let diff = 0 - cameraState.azimuth;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      cameraState.azimuth += diff * rate;
    }

    // 3. Gentle auto-chase alignment behind vehicle when driving & not actively orbiting mouse
    if (isDriving && manualOrbitCooldownRef.current <= 0 && store.vehicleSpeedKmh > 6) {
      let angleDiff = store.playerHeading - cameraState.azimuth;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      cameraState.azimuth += angleDiff * Math.min(1, delta * 2.6);
    }

    // 4. Gentle front-of-screen framing bias when walking onto a Project Pavilion Pad
    if (
      !isDriving &&
      store.nearbyProjectId &&
      manualOrbitCooldownRef.current <= 0 &&
      introTimerRef.current <= 0
    ) {
      const proj = store.projects.find((p) => p.id === store.nearbyProjectId);
      if (proj) {
        let screenDiff = proj.rotationY - cameraState.azimuth;
        while (screenDiff > Math.PI) screenDiff -= Math.PI * 2;
        while (screenDiff < -Math.PI) screenDiff += Math.PI * 2;
        cameraState.azimuth += screenDiff * Math.min(1, delta * 1.4);
      }
    }

    // Dynamic speed-reactive FOV & chase distance
    const speedBoostDist = isDriving ? Math.min(3.5, store.vehicleSpeedKmh * 0.032) : 0;
    const targetDist = cameraState.distance + (isDriving ? 2.2 : 0) + speedBoostDist;

    if (camera instanceof THREE.PerspectiveCamera) {
      const targetFov = isDriving && store.isBoosting ? 64 : isDriving ? 56 : 50;
      if (Math.abs(camera.fov - targetFov) > 0.1) {
        camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, Math.min(1, delta * 6));
        camera.updateProjectionMatrix();
      }
    }

    // Subtle upward framing toward nearby illuminated Project Pavilion Screen
    let focusX = px;
    let focusY = py + (isDriving ? 1.35 : 1.48);
    let focusZ = pz;

    if (store.nearbyProjectId) {
      const proj = store.projects.find((p) => p.id === store.nearbyProjectId);
      if (proj) {
        focusX = THREE.MathUtils.lerp(px, proj.position[0], 0.28);
        focusY += 0.9;
        focusZ = THREE.MathUtils.lerp(pz, proj.position[2], 0.28);
      }
    }

    desiredLook.current.set(focusX, focusY, focusZ);
    cameraState.currentLookAt.lerp(desiredLook.current, Math.min(1, delta * 10));

    const horizDist = targetDist * Math.cos(cameraState.polar);
    const vertOffset = targetDist * Math.sin(cameraState.polar);

    let camX = cameraState.currentLookAt.x + Math.sin(cameraState.azimuth) * horizDist;
    let camY = Math.max(1.25, cameraState.currentLookAt.y + vertOffset);
    let camZ = cameraState.currentLookAt.z + Math.cos(cameraState.azimuth) * horizDist;

    // 5. Anti-Clipping Camera Raycast against walls, cliffs & pavilion roofs
    rayDirHelper.set(
      camX - cameraState.currentLookAt.x,
      camY - cameraState.currentLookAt.y,
      camZ - cameraState.currentLookAt.z
    );
    const desiredRayLen = rayDirHelper.length();
    if (desiredRayLen > 0.5) {
      rayDirHelper.divideScalar(desiredRayLen);
      const camRay = new rapier.Ray(
        {
          x: cameraState.currentLookAt.x,
          y: cameraState.currentLookAt.y,
          z: cameraState.currentLookAt.z,
        },
        { x: rayDirHelper.x, y: rayDirHelper.y, z: rayDirHelper.z }
      );
      const hit = world.castRay(camRay, desiredRayLen, true);
      if (hit && hit.timeOfImpact > 1.45 && hit.timeOfImpact < desiredRayLen) {
        const clampedLen = Math.max(2.6, hit.timeOfImpact - 0.45);
        camX = cameraState.currentLookAt.x + rayDirHelper.x * clampedLen;
        camY = Math.max(1.25, cameraState.currentLookAt.y + rayDirHelper.y * clampedLen);
        camZ = cameraState.currentLookAt.z + rayDirHelper.z * clampedLen;
      }
    }

    desiredPos.current.set(camX, camY, camZ);
    camera.position.lerp(desiredPos.current, Math.min(1, delta * 10));
    camera.lookAt(cameraState.currentLookAt);
  });

  return null;
}
