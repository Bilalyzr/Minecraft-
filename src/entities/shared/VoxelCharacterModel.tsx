import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export interface VoxelCharacterProps {
  skinColor?: string;
  jacketColor?: string;
  shirtColor?: string;
  pantsColor?: string;
  hairColor?: string;
  shoeColor?: string;
  hasCape?: boolean;
  capeColor?: string;
  speedRef?: { current: number };
  staticSpeed?: number;
  isSprinting?: boolean;
  isJumping?: boolean;
  isWaving?: boolean;
  isSeated?: boolean;
  seatPosture?: 'car' | 'scooter';
  steerAngle?: number;
  headYawOffset?: number;
}

export function VoxelCharacterModel({
  skinColor = '#f2c6a0',
  jacketColor = '#2563eb',
  shirtColor = '#f8fafc',
  pantsColor = '#1e293b',
  hairColor = '#1c1917',
  shoeColor = '#f1f5f9',
  hasCape = false,
  capeColor = '#ec4899',
  speedRef,
  staticSpeed = 0,
  isSprinting = false,
  isJumping = false,
  isWaving = false,
  isSeated = false,
  seatPosture = 'car',
  steerAngle = 0,
  headYawOffset = 0,
}: VoxelCharacterProps) {
  const rootRef = useRef<THREE.Group>(null);
  const torsoGroupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftThighRef = useRef<THREE.Group>(null);
  const rightThighRef = useRef<THREE.Group>(null);
  const leftShinRef = useRef<THREE.Group>(null);
  const rightShinRef = useRef<THREE.Group>(null);
  const capeRef = useRef<THREE.Group>(null);

  const geos = useMemo(
    () => ({
      head: new RoundedBoxGeometry(0.46, 0.46, 0.46, 2, 0.045),
      hairTop: new RoundedBoxGeometry(0.5, 0.16, 0.5, 2, 0.035),
      hairBack: new RoundedBoxGeometry(0.5, 0.34, 0.14, 2, 0.03),
      torso: new RoundedBoxGeometry(0.46, 0.64, 0.25, 2, 0.035),
      jacket: new RoundedBoxGeometry(0.52, 0.6, 0.29, 2, 0.04),
      hoodCollar: new RoundedBoxGeometry(0.44, 0.12, 0.32, 2, 0.03),
      arm: new RoundedBoxGeometry(0.19, 0.58, 0.19, 2, 0.03),
      sleeve: new RoundedBoxGeometry(0.225, 0.38, 0.225, 2, 0.03),
      thigh: new RoundedBoxGeometry(0.205, 0.34, 0.205, 2, 0.03),
      shin: new RoundedBoxGeometry(0.195, 0.32, 0.195, 2, 0.025),
      shoe: new RoundedBoxGeometry(0.215, 0.14, 0.27, 2, 0.03),
      cape: new RoundedBoxGeometry(0.42, 0.66, 0.045, 2, 0.015),
    }),
    []
  );

  const phaseRef = useRef(Math.random() * Math.PI * 2);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    const speed = speedRef ? speedRef.current : staticSpeed;

    // 1. Natural Forward-Facing Seated Driving / Riding Kinematics!
    // Note: Character faces -Z. Around +X axis, POSITIVE angle rotates downward (-Y) limbs FORWARD (-Z)!
    if (isSeated) {
      const isScooter = seatPosture === 'scooter';

      if (rootRef.current) {
        rootRef.current.position.y = -0.44;
        rootRef.current.rotation.x = 0;
        rootRef.current.rotation.z = THREE.MathUtils.lerp(
          rootRef.current.rotation.z,
          -steerAngle * 0.1,
          0.18
        );
      }

      if (torsoGroupRef.current) {
        // Gentle relaxed recline against car bucket seat (-0.11 rad) or slight forward poise on scooter (+0.07 rad)
        torsoGroupRef.current.rotation.x = isScooter ? 0.07 : -0.11;
      }

      if (leftThighRef.current && rightThighRef.current && leftShinRef.current && rightShinRef.current) {
        // Thighs extend FORWARD (-Z) resting comfortably on the seat cushion
        const thighPitch = isScooter ? 1.32 : 1.44;
        // Knees bend comfortably downward so shoes rest in the footwell / scooter floorboard!
        const kneeBend = isScooter ? -1.18 : -0.84;

        leftThighRef.current.rotation.set(thighPitch, 0.08, 0);
        rightThighRef.current.rotation.set(thighPitch, -0.08, 0);
        leftShinRef.current.rotation.x = kneeBend;
        rightShinRef.current.rotation.x = kneeBend;
      }

      if (leftArmRef.current && rightArmRef.current) {
        // Arms reach FORWARD (+1.18 rad around +X -> -Z) and slightly inward to hold the steering wheel / handlebars!
        const basePitch = isScooter ? 1.05 : 1.18;
        const wheelDifferential = isScooter ? 0.16 : 0.32;
        const inwardRoll = isScooter ? 0.08 : 0.2;

        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(
          leftArmRef.current.rotation.x,
          basePitch - steerAngle * wheelDifferential,
          0.25
        );
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(
          rightArmRef.current.rotation.x,
          basePitch + steerAngle * wheelDifferential,
          0.25
        );
        leftArmRef.current.rotation.z = inwardRoll;
        rightArmRef.current.rotation.z = -inwardRoll;
      }

      if (headRef.current) {
        // Look naturally into the turn (+Y positive rotates -Z toward -X = left)
        headRef.current.rotation.y = THREE.MathUtils.lerp(
          headRef.current.rotation.y,
          steerAngle * 0.48,
          0.18
        );
        headRef.current.rotation.x = 0.04;
      }
      return;
    }

    // 2. On-Foot Walking, Sprinting, Jumping & Waving Cycle
    if (torsoGroupRef.current) {
      torsoGroupRef.current.rotation.x = 0;
    }
    if (rootRef.current) {
      rootRef.current.rotation.z = 0;
    }

    const isMoving = speed > 0.2;
    if (isMoving) {
      phaseRef.current += delta * (2.3 + speed * 1.42);
    }
    const p = phaseRef.current;
    const strideAmp = isJumping ? 0.58 : Math.min(0.92, speed * 0.125);

    if (rootRef.current) {
      const bob =
        isMoving && !isJumping ? Math.abs(Math.sin(p)) * 0.055 : Math.sin(t * 2.2) * 0.012;
      rootRef.current.position.y = bob;
      rootRef.current.rotation.x = THREE.MathUtils.lerp(
        rootRef.current.rotation.x,
        isSprinting && isMoving ? -0.1 : 0,
        0.15
      );
    }

    if (leftThighRef.current && rightThighRef.current && leftShinRef.current && rightShinRef.current) {
      const swingL = isJumping ? 0.45 : isMoving ? Math.sin(p) * strideAmp : 0;
      const swingR = isJumping ? -0.25 : isMoving ? -Math.sin(p) * strideAmp : 0;

      leftThighRef.current.rotation.x = THREE.MathUtils.lerp(
        leftThighRef.current.rotation.x,
        swingL,
        0.24
      );
      leftThighRef.current.rotation.y = 0;
      rightThighRef.current.rotation.x = THREE.MathUtils.lerp(
        rightThighRef.current.rotation.x,
        swingR,
        0.24
      );
      rightThighRef.current.rotation.y = 0;

      // Subtle natural knee bend on trailing/lifting leg!
      const kneeL = isJumping ? -0.55 : isMoving ? -Math.max(0, -Math.cos(p)) * 0.42 : 0;
      const kneeR = isJumping ? -0.45 : isMoving ? -Math.max(0, Math.cos(p)) * 0.42 : 0;
      leftShinRef.current.rotation.x = THREE.MathUtils.lerp(
        leftShinRef.current.rotation.x,
        kneeL,
        0.24
      );
      rightShinRef.current.rotation.x = THREE.MathUtils.lerp(
        rightShinRef.current.rotation.x,
        kneeR,
        0.24
      );
    }

    if (leftArmRef.current && rightArmRef.current) {
      const targetArmL = isJumping
        ? 0.65
        : isMoving
          ? -Math.sin(p) * strideAmp * 0.88
          : Math.sin(t * 1.7) * 0.04;
      leftArmRef.current.rotation.x = THREE.MathUtils.lerp(
        leftArmRef.current.rotation.x,
        targetArmL,
        0.24
      );
      leftArmRef.current.rotation.z = THREE.MathUtils.lerp(
        leftArmRef.current.rotation.z,
        -0.06,
        0.2
      );

      if (isWaving) {
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(
          rightArmRef.current.rotation.x,
          2.65,
          0.22
        );
        rightArmRef.current.rotation.z = -0.32 - Math.sin(t * 9.5) * 0.28;
      } else {
        const targetArmR = isJumping
          ? 0.65
          : isMoving
            ? Math.sin(p) * strideAmp * 0.88
            : -Math.sin(t * 1.7) * 0.04;
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(
          rightArmRef.current.rotation.x,
          targetArmR,
          0.24
        );
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(
          rightArmRef.current.rotation.z,
          0.06,
          0.2
        );
      }
    }

    if (headRef.current) {
      headRef.current.rotation.y = THREE.MathUtils.lerp(
        headRef.current.rotation.y,
        headYawOffset,
        0.15
      );
      headRef.current.rotation.x = Math.sin(t * 1.6) * 0.03;
    }

    if (capeRef.current) {
      const targetCapeAngle = 0.16 + Math.min(0.85, speed * 0.1) + Math.sin(t * 5.0) * 0.05;
      capeRef.current.rotation.x = THREE.MathUtils.lerp(
        capeRef.current.rotation.x,
        targetCapeAngle,
        0.18
      );
    }
  });

  return (
    <group ref={rootRef}>
      {/* Upper Body Group (Pivots from Waist at y = 0.68 for Natural Seat Recline) */}
      <group ref={torsoGroupRef} position={[0, 0.68, 0]}>
        {/* Head & Layered Hair */}
        <group ref={headRef} position={[0, 0.88, 0]}>
          <mesh geometry={geos.head} castShadow>
            <meshStandardMaterial color={skinColor} roughness={0.54} />
          </mesh>
          <mesh geometry={geos.hairTop} position={[0, 0.2, 0]} castShadow>
            <meshStandardMaterial color={hairColor} roughness={0.72} />
          </mesh>
          <mesh geometry={geos.hairBack} position={[0, 0.06, 0.2]} castShadow>
            <meshStandardMaterial color={hairColor} roughness={0.72} />
          </mesh>
          {/* Side Hair Locks */}
          <mesh position={[-0.22, 0.08, -0.02]}>
            <boxGeometry args={[0.06, 0.2, 0.42]} />
            <meshStandardMaterial color={hairColor} roughness={0.72} />
          </mesh>
          <mesh position={[0.22, 0.08, -0.02]}>
            <boxGeometry args={[0.06, 0.2, 0.42]} />
            <meshStandardMaterial color={hairColor} roughness={0.72} />
          </mesh>
          {/* Eyes & Brows (Facing -Z forward) */}
          <mesh position={[-0.1, 0.02, -0.235]}>
            <boxGeometry args={[0.075, 0.065, 0.02]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} />
          </mesh>
          <mesh position={[0.1, 0.02, -0.235]}>
            <boxGeometry args={[0.075, 0.065, 0.02]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} />
          </mesh>
          <mesh position={[-0.115, 0.03, -0.24]}>
            <boxGeometry args={[0.025, 0.025, 0.02]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.25} />
          </mesh>
          <mesh position={[0.085, 0.03, -0.24]}>
            <boxGeometry args={[0.025, 0.025, 0.02]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.25} />
          </mesh>
        </group>

        {/* Torso, Layered 3D Spring Hoodie/Jacket & Collar */}
        <group position={[0, 0.32, 0]}>
          <mesh geometry={geos.torso} castShadow>
            <meshStandardMaterial color={shirtColor} roughness={0.6} />
          </mesh>
          <mesh geometry={geos.jacket} position={[0, 0.01, 0.01]} castShadow>
            <meshStandardMaterial color={jacketColor} roughness={0.48} />
          </mesh>
          <mesh geometry={geos.hoodCollar} position={[0, 0.3, 0.03]} castShadow>
            <meshStandardMaterial color={jacketColor} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.01, -0.14]}>
            <boxGeometry args={[0.13, 0.56, 0.03]} />
            <meshStandardMaterial color={shirtColor} roughness={0.55} />
          </mesh>

          {/* Billowing Explorer Cape (Automatically tucked when seated so zero seat clipping!) */}
          {hasCape && !isSeated && (
            <group ref={capeRef} position={[0, 0.28, 0.16]}>
              <mesh geometry={geos.cape} position={[0, -0.32, 0.02]} castShadow>
                <meshStandardMaterial color={capeColor} roughness={0.42} />
              </mesh>
            </group>
          )}
        </group>

        {/* Left Arm Pivot */}
        <group ref={leftArmRef} position={[-0.35, 0.62, 0]}>
          <mesh geometry={geos.arm} position={[0, -0.25, 0]} castShadow>
            <meshStandardMaterial color={skinColor} roughness={0.55} />
          </mesh>
          <mesh geometry={geos.sleeve} position={[0, -0.15, 0]} castShadow>
            <meshStandardMaterial color={jacketColor} roughness={0.48} />
          </mesh>
        </group>

        {/* Right Arm Pivot */}
        <group ref={rightArmRef} position={[0.35, 0.62, 0]}>
          <mesh geometry={geos.arm} position={[0, -0.25, 0]} castShadow>
            <meshStandardMaterial color={skinColor} roughness={0.55} />
          </mesh>
          <mesh geometry={geos.sleeve} position={[0, -0.15, 0]} castShadow>
            <meshStandardMaterial color={jacketColor} roughness={0.48} />
          </mesh>
        </group>
      </group>

      {/* Articulated 2-Segment Left Leg (Hip -> Thigh -> Knee -> Shin & Sneaker) */}
      <group ref={leftThighRef} position={[-0.13, 0.67, 0]}>
        <mesh geometry={geos.thigh} position={[0, -0.16, 0]} castShadow>
          <meshStandardMaterial color={pantsColor} roughness={0.65} />
        </mesh>
        <group ref={leftShinRef} position={[0, -0.31, 0]}>
          <mesh geometry={geos.shin} position={[0, -0.15, 0]} castShadow>
            <meshStandardMaterial color={pantsColor} roughness={0.65} />
          </mesh>
          <mesh geometry={geos.shoe} position={[0, -0.3, -0.025]} castShadow>
            <meshStandardMaterial color={shoeColor} roughness={0.4} />
          </mesh>
        </group>
      </group>

      {/* Articulated 2-Segment Right Leg (Hip -> Thigh -> Knee -> Shin & Sneaker) */}
      <group ref={rightThighRef} position={[0.13, 0.67, 0]}>
        <mesh geometry={geos.thigh} position={[0, -0.16, 0]} castShadow>
          <meshStandardMaterial color={pantsColor} roughness={0.65} />
        </mesh>
        <group ref={rightShinRef} position={[0, -0.31, 0]}>
          <mesh geometry={geos.shin} position={[0, -0.15, 0]} castShadow>
            <meshStandardMaterial color={pantsColor} roughness={0.65} />
          </mesh>
          <mesh geometry={geos.shoe} position={[0, -0.3, -0.025]} castShadow>
            <meshStandardMaterial color={shoeColor} roughness={0.4} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
