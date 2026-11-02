import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { CapsuleCollider, RigidBody, useRapier, type RapierRigidBody } from '@react-three/rapier';
import { VoxelCharacterModel } from '../shared/VoxelCharacterModel';
import { cameraState, keyInputState } from '../../core/cameraState';
import { useWorldStore } from '../../store/useWorldStore';
import { soundEngine } from '../../audio/soundEngine';

export function PlayerController() {
  const { rapier, world } = useRapier();
  const bodyRef = useRef<RapierRigidBody>(null);
  const visualGroupRef = useRef<THREE.Group>(null);
  const speedRef = useRef(0);
  const headingRef = useRef(0);
  const jumpCooldownRef = useRef(0);

  const [isSprinting, setIsSprinting] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [isWaving, setIsWaving] = useState(false);

  const drivingVehicleId = useWorldStore((s) => s.drivingVehicleId);
  const teleportRequest = useWorldStore((s) => s.teleportRequest);
  const characterAppearance = useWorldStore((s) => s.characterAppearance);
  const visitorName = useWorldStore((s) => s.visitorName);
  const visitorRole = useWorldStore((s) => s.visitorRole);
  const hasEnteredWorld = useWorldStore((s) => s.hasEnteredWorld);
  const activeModalProjectId = useWorldStore((s) => s.activeModalProjectId);
  const isWardrobeOpen = useWorldStore((s) => s.isWardrobeOpen);
  const isProjectCreatorOpen = useWorldStore((s) => s.isProjectCreatorOpen);
  const isResumeModalOpen = useWorldStore((s) => s.isResumeModalOpen);
  const isDirectoryOpen = useWorldStore((s) => s.isDirectoryOpen);

  const anyModalOpen =
    !hasEnteredWorld ||
    Boolean(activeModalProjectId) ||
    isWardrobeOpen ||
    isProjectCreatorOpen ||
    isResumeModalOpen ||
    isDirectoryOpen;

  // Handle Fast-Travel / Minimap Teleport Requests
  useEffect(() => {
    if (!teleportRequest || !bodyRef.current) return;
    const [tx, ty, tz] = teleportRequest.position;
    bodyRef.current.setGravityScale(1, true);
    bodyRef.current.setTranslation({ x: tx, y: ty + 1.15, z: tz }, true);
    bodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);

    if (teleportRequest.lookAt) {
      const dx = teleportRequest.lookAt[0] - tx;
      const dz = teleportRequest.lookAt[2] - tz;
      const angle = Math.atan2(-dx, -dz);
      headingRef.current = angle;
      cameraState.azimuth = angle;
      if (visualGroupRef.current) {
        visualGroupRef.current.rotation.y = angle;
      }
    }
    soundEngine.playChime('teleport');
  }, [teleportRequest]);

  // Toggle gravity & place capsule cleanly beside the driver door when dismounting
  const prevDrivingRef = useRef(drivingVehicleId);
  useEffect(() => {
    const rb = bodyRef.current;
    if (!rb) return;

    if (drivingVehicleId) {
      rb.setGravityScale(0, true);
      rb.setLinvel({ x: 0, y: 0, z: 0 }, false);
    } else if (prevDrivingRef.current && !drivingVehicleId) {
      rb.setGravityScale(1, true);
      const state = useWorldStore.getState();
      const vPos = state.vehiclePositions[prevDrivingRef.current];
      const yaw = state.playerHeading;
      const leftX = -Math.cos(yaw);
      const leftZ = Math.sin(yaw);
      const dismountDist = prevDrivingRef.current === 'scooter' ? 1.55 : 2.35;
      const dismountX = THREE.MathUtils.clamp(vPos[0] + leftX * dismountDist, -108, 108);
      const dismountY = Math.max(1.25, vPos[1] + 0.85);
      const dismountZ = THREE.MathUtils.clamp(vPos[2] + leftZ * dismountDist, -108, 108);
      rb.setTranslation({ x: dismountX, y: dismountY, z: dismountZ }, true);
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
      headingRef.current = yaw;
      if (visualGroupRef.current) {
        visualGroupRef.current.rotation.y = yaw;
      }
    }
    prevDrivingRef.current = drivingVehicleId;
  }, [drivingVehicleId]);

  useFrame((_, delta) => {
    const rb = bodyRef.current;
    if (!rb) return;

    const store = useWorldStore.getState();

    // While driving, park capsule safely overhead with 0 gravity
    if (store.drivingVehicleId) {
      const vPos = store.vehiclePositions[store.drivingVehicleId];
      rb.setTranslation({ x: vPos[0], y: vPos[1] + 28, z: vPos[2] }, false);
      rb.setLinvel({ x: 0, y: 0, z: 0 }, false);
      return;
    }

    // Pause character movement when onboarding or any modal is open
    if (
      !store.hasEnteredWorld ||
      store.activeModalProjectId ||
      store.isWardrobeOpen ||
      store.isProjectCreatorOpen ||
      store.isResumeModalOpen ||
      store.isDirectoryOpen
    ) {
      const curVel = rb.linvel();
      rb.setLinvel({ x: 0, y: curVel.y, z: 0 }, true);
      speedRef.current = 0;
      return;
    }

    // Gather Keyboard + Mobile Thumbstick Input
    let forward = 0;
    let right = 0;
    if (keyInputState['KeyW'] || keyInputState['ArrowUp']) forward += 1;
    if (keyInputState['KeyS'] || keyInputState['ArrowDown']) forward -= 1;
    if (keyInputState['KeyD'] || keyInputState['ArrowRight']) right += 1;
    if (keyInputState['KeyA'] || keyInputState['ArrowLeft']) right -= 1;

    if (Math.abs(store.mobileInput.moveY) > 0.05 || Math.abs(store.mobileInput.moveX) > 0.05) {
      forward += store.mobileInput.moveY;
      right += store.mobileInput.moveX;
    }

    const sprintPressed =
      Boolean(keyInputState['ShiftLeft'] || keyInputState['ShiftRight']) || store.mobileInput.sprint;
    const jumpPressed = Boolean(keyInputState['Space']) || store.mobileInput.jump;
    const wavePressed = Boolean(keyInputState['KeyG']);

    if (sprintPressed !== isSprinting) setIsSprinting(sprintPressed);
    if (wavePressed !== isWaving) setIsWaving(wavePressed);

    // Camera-relative movement direction on XZ plane
    const camAz = cameraState.azimuth;
    const fwdX = -Math.sin(camAz);
    const fwdZ = -Math.cos(camAz);
    const rightX = Math.cos(camAz);
    const rightZ = -Math.sin(camAz);

    let moveX = fwdX * forward + rightX * right;
    let moveZ = fwdZ * forward + rightZ * right;
    const mag = Math.hypot(moveX, moveZ);

    let moveDirX = 0;
    let moveDirZ = 0;

    const maxWalkSpeed = sprintPressed ? 10.2 : 6.1;
    if (mag > 0.001) {
      const norm = Math.min(1, mag);
      moveDirX = moveX / mag;
      moveDirZ = moveZ / mag;
      moveX = moveDirX * maxWalkSpeed * norm;
      moveZ = moveDirZ * maxWalkSpeed * norm;

      const targetAngle = Math.atan2(-moveX, -moveZ);
      let diff = targetAngle - headingRef.current;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      headingRef.current += diff * Math.min(1, delta * 14);
      if (visualGroupRef.current) {
        visualGroupRef.current.rotation.y = headingRef.current;
      }
    } else {
      moveX = 0;
      moveZ = 0;
    }

    const curVel = rb.linvel();
    const pos = rb.translation();

    jumpCooldownRef.current = Math.max(0, jumpCooldownRef.current - delta);
    const downRay = new rapier.Ray({ x: pos.x, y: pos.y, z: pos.z }, { x: 0, y: -1, z: 0 });
    const centerGroundHit = world.castRay(downRay, 1.14, true, undefined, undefined, undefined, rb);
    const leadRay =
      mag > 0.05
        ? new rapier.Ray(
            { x: pos.x + moveDirX * 0.24, y: pos.y, z: pos.z + moveDirZ * 0.24 },
            { x: 0, y: -1, z: 0 }
          )
        : null;
    const leadGroundHit = leadRay
      ? world.castRay(leadRay, 1.16, true, undefined, undefined, undefined, rb)
      : null;

    const isGrounded =
      (centerGroundHit !== null || leadGroundHit !== null) && jumpCooldownRef.current < 0.24;

    if (!isGrounded !== isJumping) {
      setIsJumping(!isGrounded);
    }

    let nextVelY = curVel.y;

    // Smooth Minecraft Step-Assist for curbs, pavilion steps, and terraced grass knolls (<= 0.62m)
    if (isGrounded && mag > 0.15 && jumpCooldownRef.current <= 0) {
      const ankleRay = new rapier.Ray(
        { x: pos.x, y: pos.y - 0.66, z: pos.z },
        { x: moveDirX, y: 0, z: moveDirZ }
      );
      const kneeClearRay = new rapier.Ray(
        { x: pos.x, y: pos.y + 0.06, z: pos.z },
        { x: moveDirX, y: 0, z: moveDirZ }
      );
      const hitLowStep = world.castRay(ankleRay, 0.64, true, undefined, undefined, undefined, rb);
      const hitHighWall = world.castRay(
        kneeClearRay,
        0.72,
        true,
        undefined,
        undefined,
        undefined,
        rb
      );
      if (hitLowStep !== null && hitHighWall === null) {
        nextVelY = Math.max(nextVelY, 4.15);
      }
    }

    if (jumpPressed && isGrounded && jumpCooldownRef.current <= 0) {
      nextVelY = 7.15;
      jumpCooldownRef.current = 0.38;
      setIsJumping(true);
    }

    // Smooth horizontal velocity damping
    const lerpRate = Math.min(1, delta * (isGrounded ? 16 : 8));
    const vx = THREE.MathUtils.lerp(curVel.x, moveX, lerpRate);
    const vz = THREE.MathUtils.lerp(curVel.z, moveZ, lerpRate);
    rb.setLinvel({ x: vx, y: nextVelY, z: vz }, true);

    const horizSpeed = Math.hypot(vx, vz);
    speedRef.current = horizSpeed;

    if (horizSpeed > 1.2 && isGrounded) {
      const onRoad =
        (Math.abs(pos.x) < 14 && Math.abs(pos.z) < 14) ||
        Math.abs(pos.x) < 3.6 ||
        Math.abs(pos.z) < 3.6;
      soundEngine.playFootstep(onRoad);
    }

    // Safety respawn if ever out of bounds
    if (pos.y < -1.8 || Math.abs(pos.x) > 125 || Math.abs(pos.z) > 125) {
      rb.setTranslation({ x: 0, y: 2.2, z: 11 }, true);
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }

    store.updatePlayerTransform([pos.x, pos.y - 0.9, pos.z], headingRef.current);
  });

  return (
    <RigidBody
      ref={bodyRef}
      colliders={false}
      ccd
      position={[0, 1.85, 11]}
      enabledRotations={[false, false, false]}
      mass={1.2}
      linearDamping={0.35}
      friction={0.15}
    >
      <CapsuleCollider args={[0.48, 0.42]} position={[0, 0, 0]} />
      <group ref={visualGroupRef} position={[0, -0.9, 0]} visible={!drivingVehicleId}>
        <VoxelCharacterModel
          skinColor={characterAppearance.skinColor}
          jacketColor={characterAppearance.jacketColor}
          shirtColor={characterAppearance.shirtColor}
          pantsColor={characterAppearance.pantsColor}
          hairColor={characterAppearance.hairColor}
          shoeColor={characterAppearance.shoeColor}
          hairStyle={characterAppearance.hairStyle}
          outfitStyle={characterAppearance.outfitStyle}
          accessory={characterAppearance.accessory}
          capeColor={characterAppearance.capeColor}
          speedRef={speedRef}
          isSprinting={isSprinting}
          isJumping={isJumping}
          isWaving={isWaving}
        />

        {/* Visitor Name & Role Tag Above Player Character */}
        {!anyModalOpen && visitorName && (
          <Html position={[0, 2.24, 0]} center zIndexRange={[5, 0]}>
            <div className="pointer-events-none flex items-center gap-1.5 whitespace-nowrap rounded-full border border-pink-400/40 bg-slate-950/80 px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-lg backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>{visitorName}</span>
              {visitorRole && (
                <span className="rounded bg-white/10 px-1 py-0.2 font-mono-code text-[8px] text-pink-300">
                  {visitorRole}
                </span>
              )}
            </div>
          </Html>
        )}
      </group>
    </RigidBody>
  );
}
