import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CuboidCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier';
import { Html } from '@react-three/drei';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { VEHICLE_SPAWNS, type VehicleId, type VehicleSpawnSpec } from '../../config/world.config';
import { useWorldStore } from '../../store/useWorldStore';
import { keyInputState } from '../../core/cameraState';
import { VoxelCharacterModel } from '../shared/VoxelCharacterModel';
import { soundEngine } from '../../audio/soundEngine';

function DetailedWheel({
  radius,
  width,
  rimColor,
  spinRefSetter,
  isLeft,
}: {
  radius: number;
  width: number;
  rimColor: string;
  spinRefSetter: (el: THREE.Group | null) => void;
  isLeft: boolean;
}) {
  const tireGeo = useMemo(
    () => new RoundedBoxGeometry(width, radius * 2, radius * 2, 3, radius * 0.28),
    [width, radius]
  );

  return (
    <group ref={spinRefSetter}>
      {/* Chunky Treaded Rubber Tire */}
      <mesh geometry={tireGeo} castShadow>
        <meshStandardMaterial color="#18181b" roughness={0.82} />
      </mesh>
      {/* Multi-Spoke Metallic Alloy Rim & Brake Hub */}
      <mesh
        position={[isLeft ? -width * 0.48 : width * 0.48, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[radius * 0.58, radius * 0.58, 0.04, 12]} />
        <meshStandardMaterial color={rimColor} metalness={0.65} roughness={0.24} />
      </mesh>
      <mesh position={[isLeft ? -width * 0.51 : width * 0.51, 0, 0]}>
        <boxGeometry args={[0.02, radius * 0.95, radius * 0.18]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.7} roughness={0.2} />
      </mesh>
      <mesh position={[isLeft ? -width * 0.51 : width * 0.51, 0, 0]}>
        <boxGeometry args={[0.02, radius * 0.18, radius * 0.95]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.7} roughness={0.2} />
      </mesh>
    </group>
  );
}

function ContouredBucketSeat({
  position,
  leatherColor,
}: {
  position: [number, number, number];
  leatherColor: string;
}) {
  const cushionGeo = useMemo(() => new RoundedBoxGeometry(0.54, 0.13, 0.54, 2, 0.03), []);
  const backGeo = useMemo(() => new RoundedBoxGeometry(0.52, 0.58, 0.13, 2, 0.03), []);
  const headrestGeo = useMemo(() => new RoundedBoxGeometry(0.34, 0.2, 0.11, 2, 0.03), []);

  return (
    <group position={position}>
      {/* Seat Cushion */}
      <mesh geometry={cushionGeo} position={[0, 0, 0]} castShadow>
        <meshStandardMaterial color={leatherColor} roughness={0.55} />
      </mesh>
      {/* Side Bolsters */}
      <mesh position={[-0.24, 0.05, 0]}>
        <boxGeometry args={[0.08, 0.1, 0.5]} />
        <meshStandardMaterial color={leatherColor} roughness={0.52} />
      </mesh>
      <mesh position={[0.24, 0.05, 0]}>
        <boxGeometry args={[0.08, 0.1, 0.5]} />
        <meshStandardMaterial color={leatherColor} roughness={0.52} />
      </mesh>
      {/* Reclined Backrest (-0.12 rad) & Padded Headrest */}
      <group position={[0, 0.34, 0.24]} rotation={[-0.12, 0, 0]}>
        <mesh geometry={backGeo} castShadow>
          <meshStandardMaterial color={leatherColor} roughness={0.55} />
        </mesh>
        <mesh geometry={headrestGeo} position={[0, 0.39, 0]} castShadow>
          <meshStandardMaterial color={leatherColor} roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

function PhysicsVehicle({ spec }: { spec: VehicleSpawnSpec }) {
  const rbRef = useRef<RapierRigidBody>(null);
  const chassisTiltRef = useRef<THREE.Group>(null);
  const steerControlRef = useRef<THREE.Group>(null);
  const frontLeftPivotRef = useRef<THREE.Group>(null);
  const frontRightPivotRef = useRef<THREE.Group>(null);
  const wheelSpinRefs = useRef<(THREE.Group | null)[]>([null, null, null, null]);
  const dustTrailRef = useRef<THREE.InstancedMesh>(null);

  const [steerVisual, setSteerVisual] = useState(0);
  const steerAngleRef = useRef(0);
  const wheelSpinRef = useRef(0);

  const drivingVehicleId = useWorldStore((s) => s.drivingVehicleId);
  const nearbyVehicleId = useWorldStore((s) => s.nearbyVehicleId);
  const summonRequest = useWorldStore((s) => s.summonRequest);
  const timeOfDay = useWorldStore((s) => s.timeOfDay);

  const isDriven = drivingVehicleId === spec.id;
  const isPromptVisible = !drivingVehicleId && nearbyVehicleId === spec.id;
  const isScooter = spec.id === 'scooter';
  const isRover = spec.id === 'rover';

  const geos = useMemo(
    () => ({
      hoodRover: new RoundedBoxGeometry(1.76, 0.48, 1.24, 2, 0.06),
      sillRover: new RoundedBoxGeometry(0.22, 0.44, 1.54, 2, 0.04),
      rearRover: new RoundedBoxGeometry(1.82, 0.54, 1.02, 2, 0.05),
      fenderArch: new RoundedBoxGeometry(0.32, 0.22, 0.96, 2, 0.04),
      bumper: new RoundedBoxGeometry(1.94, 0.18, 0.24, 2, 0.04),

      noseKart: new RoundedBoxGeometry(1.78, 0.36, 1.26, 2, 0.06),
      sillKart: new RoundedBoxGeometry(0.24, 0.36, 1.48, 2, 0.04),
      rearKart: new RoundedBoxGeometry(1.84, 0.46, 1.06, 2, 0.06),

      scooterShield: new RoundedBoxGeometry(0.68, 0.86, 0.2, 2, 0.05),
      scooterFloor: new RoundedBoxGeometry(0.64, 0.14, 0.92, 2, 0.03),
      scooterCowl: new RoundedBoxGeometry(0.72, 0.46, 0.96, 2, 0.08),
      scooterSeat: new RoundedBoxGeometry(0.46, 0.16, 0.68, 2, 0.05),
    }),
    []
  );

  const trailParticles = useMemo(
    () =>
      Array.from({ length: 24 }, () => ({
        x: 0,
        y: -10,
        z: 0,
        life: 0,
        scale: 0.2,
      })),
    []
  );
  const trailIdxRef = useRef(0);
  const trailDummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (!summonRequest || summonRequest.vehicleId !== spec.id || !rbRef.current) return;
    const [sx, sy, sz] = summonRequest.position;
    const q = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      summonRequest.rotationY
    );
    rbRef.current.setTranslation({ x: sx, y: sy, z: sz }, true);
    rbRef.current.setRotation({ x: q.x, y: q.y, z: q.z, w: q.w }, true);
    rbRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    rbRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
    soundEngine.playChime('teleport');
  }, [summonRequest, spec.id]);

  const quatHelper = useMemo(() => new THREE.Quaternion(), []);
  const eulerHelper = useMemo(() => new THREE.Euler(0, 0, 0, 'YXZ'), []);
  const forwardVec = useMemo(() => new THREE.Vector3(), []);
  const rightVec = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const rb = rbRef.current;
    if (!rb) return;

    const store = useWorldStore.getState();
    const pos = rb.translation();
    const rot = rb.rotation();
    quatHelper.set(rot.x, rot.y, rot.z, rot.w);
    eulerHelper.setFromQuaternion(quatHelper, 'YXZ');

    store.updateVehiclePosition(spec.id, [pos.x, pos.y, pos.z]);

    if (pos.y < -6) {
      rb.setTranslation(
        { x: spec.position[0], y: spec.position[1] + 1, z: spec.position[2] },
        true
      );
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
      rb.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }

    if (!isDriven) {
      const lv = rb.linvel();
      if (Math.hypot(lv.x, lv.z) > 0.04) {
        rb.setLinvel({ x: lv.x * 0.88, y: lv.y, z: lv.z * 0.88 }, true);
      }
      return;
    }

    let throttle = 0;
    let steerInput = 0;

    if (!store.activeModalProjectId) {
      if (keyInputState['KeyW'] || keyInputState['ArrowUp']) throttle += 1;
      if (keyInputState['KeyS'] || keyInputState['ArrowDown']) throttle -= 0.72;
      if (keyInputState['KeyA'] || keyInputState['ArrowLeft']) steerInput += 1;
      if (keyInputState['KeyD'] || keyInputState['ArrowRight']) steerInput -= 1;

      if (Math.abs(store.mobileInput.moveY) > 0.05 || Math.abs(store.mobileInput.moveX) > 0.05) {
        throttle += store.mobileInput.moveY;
        steerInput -= store.mobileInput.moveX;
      }
    }

    const boostActive =
      (Boolean(keyInputState['ShiftLeft'] || keyInputState['ShiftRight']) ||
        store.mobileInput.sprint) &&
      throttle > 0.1;
    const handbrake = Boolean(keyInputState['Space']) || store.mobileInput.brake;
    const flipReset = Boolean(keyInputState['KeyR']);

    if (flipReset) {
      const uprightQ = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        eulerHelper.y
      );
      rb.setRotation(
        { x: uprightQ.x, y: uprightQ.y, z: uprightQ.z, w: uprightQ.w },
        true
      );
      rb.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }

    forwardVec.set(0, 0, -1).applyQuaternion(quatHelper);
    forwardVec.y = 0;
    if (forwardVec.lengthSq() > 0.001) forwardVec.normalize();
    rightVec.set(1, 0, 0).applyQuaternion(quatHelper);
    rightVec.y = 0;
    if (rightVec.lengthSq() > 0.001) rightVec.normalize();

    const lv = rb.linvel();
    const forwardSpeed = lv.x * forwardVec.x + lv.z * forwardVec.z;
    const lateralSpeed = lv.x * rightVec.x + lv.z * rightVec.z;

    const maxSpd = spec.maxSpeed * (boostActive ? spec.boostMultiplier : 1.0);
    const accel = spec.acceleration * (boostActive ? 1.45 : 1.0);

    let nextForwardSpeed = forwardSpeed;
    if (Math.abs(throttle) > 0.02) {
      nextForwardSpeed += throttle * accel * delta;
      nextForwardSpeed = THREE.MathUtils.clamp(nextForwardSpeed, -maxSpd * 0.48, maxSpd);
    } else {
      nextForwardSpeed *= Math.max(0, 1 - delta * 2.5);
    }

    if (handbrake) {
      nextForwardSpeed *= Math.max(0, 1 - delta * 4.2);
    }

    const gripFactor = handbrake ? 2.4 : 10.0;
    const nextLateralSpeed = lateralSpeed * Math.max(0, 1 - delta * gripFactor);

    steerAngleRef.current = THREE.MathUtils.lerp(
      steerAngleRef.current,
      steerInput * 0.56,
      Math.min(1, delta * 11)
    );
    if (Math.abs(steerAngleRef.current - steerVisual) > 0.025) {
      setSteerVisual(steerAngleRef.current);
    }

    const speedSign = nextForwardSpeed >= -0.2 ? 1 : -1;
    const turnAuthority = Math.min(1, Math.abs(nextForwardSpeed) / 2.8);
    const yawRate =
      steerAngleRef.current * (isScooter ? 3.5 : handbrake ? 3.8 : 2.95) * turnAuthority * speedSign;

    const newVx = forwardVec.x * nextForwardSpeed + rightVec.x * nextLateralSpeed;
    const newVz = forwardVec.z * nextForwardSpeed + rightVec.z * nextLateralSpeed;

    rb.setLinvel({ x: newVx, y: lv.y, z: newVz }, true);

    const av = rb.angvel();
    const rollStab = -eulerHelper.z * 7.0;
    const pitchStab = -eulerHelper.x * 5.2;
    rb.setAngvel({ x: av.x * 0.45 + pitchStab, y: yawRate, z: av.z * 0.45 + rollStab }, true);

    // Suspension Roll / Motorcycle Lean & Steering Wheel / Handlebar Rotation
    if (chassisTiltRef.current) {
      const speedRatio = Math.min(1, Math.abs(nextForwardSpeed) / 14);
      // Scooter leans INTO the turn (+steerAngle -> +roll tilts top toward -X left!), cars roll slightly outward
      const targetRoll = isScooter
        ? steerAngleRef.current * speedRatio * 0.28
        : -steerAngleRef.current * speedRatio * 0.11;
      const targetPitch = -throttle * 0.045;
      chassisTiltRef.current.rotation.z = THREE.MathUtils.lerp(
        chassisTiltRef.current.rotation.z,
        targetRoll,
        0.18
      );
      chassisTiltRef.current.rotation.x = THREE.MathUtils.lerp(
        chassisTiltRef.current.rotation.x,
        targetPitch,
        0.18
      );
      chassisTiltRef.current.position.y =
        Math.sin(performance.now() * 0.018) * Math.min(0.02, Math.abs(nextForwardSpeed) * 0.0012);
    }

    if (frontLeftPivotRef.current) {
      frontLeftPivotRef.current.rotation.y = steerAngleRef.current;
    }
    if (frontRightPivotRef.current) {
      frontRightPivotRef.current.rotation.y = steerAngleRef.current;
    }
    if (steerControlRef.current) {
      if (isScooter) {
        steerControlRef.current.rotation.y = steerAngleRef.current * 0.85;
      } else {
        // Turning left (+steerAngle) rotates steering wheel counter-clockwise (+Z rotation drops left rim, raises right rim!)
        steerControlRef.current.rotation.z = steerAngleRef.current * 1.65;
      }
    }

    wheelSpinRef.current -= nextForwardSpeed * delta * 2.5;
    wheelSpinRefs.current.forEach((w) => {
      if (w) w.rotation.x = wheelSpinRef.current;
    });

    const speedKmh = Math.round(Math.abs(nextForwardSpeed) * 3.6);
    if ((speedKmh > 18 || handbrake || boostActive) && dustTrailRef.current) {
      const p = trailParticles[trailIdxRef.current % trailParticles.length];
      trailIdxRef.current++;
      p.x = pos.x - forwardVec.x * (isScooter ? 1.1 : 1.9) + (Math.random() - 0.5) * 0.9;
      p.y = pos.y - 0.35;
      p.z = pos.z - forwardVec.z * (isScooter ? 1.1 : 1.9) + (Math.random() - 0.5) * 0.9;
      p.life = 1.0;
      p.scale = boostActive ? 0.34 : 0.22;
    }

    if (dustTrailRef.current) {
      trailParticles.forEach((p, idx) => {
        if (p.life > 0) {
          p.life -= delta * 1.9;
          p.y += delta * 0.75;
          const s = Math.max(0.001, p.scale * p.life);
          trailDummy.position.set(p.x, p.y, p.z);
          trailDummy.scale.set(s, s, s);
        } else {
          trailDummy.position.set(0, -20, 0);
          trailDummy.scale.set(0.001, 0.001, 0.001);
        }
        trailDummy.updateMatrix();
        dustTrailRef.current!.setMatrixAt(idx, trailDummy.matrix);
      });
      dustTrailRef.current.instanceMatrix.needsUpdate = true;
    }

    store.updatePlayerTransform([pos.x, pos.y, pos.z], eulerHelper.y);
    store.setVehicleTelemetry(speedKmh, boostActive);
    soundEngine.updateVehicleEngine(true, speedKmh, boostActive);
  });

  const headlightGlow = isDriven || timeOfDay === 'night' ? 3.5 : 1.2;

  return (
    <>
      <RigidBody
        ref={rbRef}
        colliders={false}
        ccd
        position={spec.position}
        rotation={[0, spec.rotationY, 0]}
        mass={isScooter ? 11 : 18}
        linearDamping={0.35}
        angularDamping={2.8}
        friction={0.08}
        restitution={0.02}
      >
        {/* Smooth Raised-Bottom Chassis Collider so Curb & Bridge Seams Never Catch! */}
        <CuboidCollider
          args={
            isScooter
              ? [0.46, 0.52, 1.08]
              : isRover
                ? [1.05, 0.56, 1.9]
                : [1.02, 0.48, 1.85]
          }
          position={[0, 0.04, 0]}
        />

        {/* Suspension-Animated Vehicle Body & Seated Driver */}
        <group ref={chassisTiltRef}>
          {/* =================================================================== */}
          {/* DESIGN 1: SAKURA TRAIL 4x4 SAFARI CRUISER (Open-Top Vintage 4x4)   */}
          {/* =================================================================== */}
          {isRover && (
            <group>
              {/* Recessed Cockpit Floorpan & Footwell Pedals */}
              <mesh position={[0, -0.14, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.78, 0.16, 3.65]} />
                <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.25} />
              </mesh>
              {/* Footwell Accelerator & Brake Pedals */}
              <mesh position={[-0.44, -0.02, -0.46]} rotation={[0.45, 0, 0]}>
                <boxGeometry args={[0.1, 0.14, 0.04]} />
                <meshStandardMaterial color="#64748b" metalness={0.5} />
              </mesh>
              <mesh position={[-0.28, -0.02, -0.46]} rotation={[0.45, 0, 0]}>
                <boxGeometry args={[0.12, 0.12, 0.04]} />
                <meshStandardMaterial color="#64748b" metalness={0.5} />
              </mesh>

              {/* Sculpted Front Engine Bay & Raised Safari Hood */}
              <mesh geometry={geos.hoodRover} position={[0, 0.22, -1.22]} castShadow receiveShadow>
                <meshPhysicalMaterial
                  color={spec.primaryColor}
                  roughness={0.24}
                  clearcoat={0.7}
                />
              </mesh>
              {/* Cream-Ivory Hood Power Dome Accent */}
              <mesh position={[0, 0.47, -1.18]} castShadow>
                <boxGeometry args={[1.18, 0.06, 1.02]} />
                <meshPhysicalMaterial color={spec.secondaryColor} roughness={0.25} clearcoat={0.65} />
              </mesh>

              {/* Classic 5-Slot Safari Radiator Grille & Round Halo Headlights */}
              <mesh position={[0, 0.22, -1.85]}>
                <boxGeometry args={[1.56, 0.36, 0.05]} />
                <meshStandardMaterial color="#0f172a" roughness={0.5} />
              </mesh>
              {[-0.36, -0.18, 0, 0.18, 0.36].map((gx) => (
                <mesh key={gx} position={[gx, 0.22, -1.87]}>
                  <boxGeometry args={[0.07, 0.26, 0.03]} />
                  <meshStandardMaterial color={spec.secondaryColor} roughness={0.3} />
                </mesh>
              ))}
              {[-0.58, 0.58].map((hx) => (
                <mesh key={hx} position={[hx, 0.24, -1.87]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.14, 0.14, 0.06, 16]} />
                  <meshStandardMaterial
                    color="#fef9c3"
                    emissive="#fef08a"
                    emissiveIntensity={headlightGlow}
                  />
                </mesh>
              ))}
              {/* Heavy Brushed-Steel Front & Rear Bumpers */}
              <mesh geometry={geos.bumper} position={[0, -0.05, -1.94]} castShadow>
                <meshStandardMaterial color="#334155" metalness={0.55} roughness={0.32} />
              </mesh>
              <mesh geometry={geos.bumper} position={[0, -0.05, 1.94]} castShadow>
                <meshStandardMaterial color="#334155" metalness={0.55} roughness={0.32} />
              </mesh>

              {/* Low Cut-Out Safari Doors, Oak Wood Side Trim & Running Boards */}
              {[-1, 1].map((side) => (
                <group key={side}>
                  <mesh geometry={geos.sillRover} position={[side * 0.84, 0.14, 0.12]} castShadow>
                    <meshPhysicalMaterial color={spec.primaryColor} roughness={0.24} clearcoat={0.7} />
                  </mesh>
                  {/* Warm Oak Country Trim Panel */}
                  <mesh position={[side * 0.96, 0.16, 0.12]}>
                    <boxGeometry args={[0.03, 0.16, 1.32]} />
                    <meshStandardMaterial color="#b45309" roughness={0.48} />
                  </mesh>
                  {/* Side-Step Running Board */}
                  <mesh position={[side * 1.0, -0.14, 0.12]} castShadow>
                    <boxGeometry args={[0.18, 0.06, 1.48]} />
                    <meshStandardMaterial color="#1e293b" metalness={0.4} roughness={0.5} />
                  </mesh>
                  {/* Side-View Mirror */}
                  <mesh position={[side * 0.98, 0.68, -0.52]} castShadow>
                    <boxGeometry args={[0.16, 0.12, 0.08]} />
                    <meshStandardMaterial color={spec.secondaryColor} roughness={0.3} />
                  </mesh>
                </group>
              ))}

              {/* 4 Flared Wheel Arches Over All 4 Tires */}
              {[
                [-0.96, 0.14, -1.24],
                [0.96, 0.14, -1.24],
                [-0.96, 0.14, 1.24],
                [0.96, 0.14, 1.24],
              ].map(([fx, fy, fz], idx) => (
                <mesh key={idx} geometry={geos.fenderArch} position={[fx, fy, fz]} castShadow>
                  <meshStandardMaterial color="#1e293b" roughness={0.55} />
                </mesh>
              ))}

              {/* Rear Cargo Deck, Blossom Picnic Crate & Tailgate Spare Tire! */}
              <mesh geometry={geos.rearRover} position={[0, 0.22, 1.34]} castShadow receiveShadow>
                <meshPhysicalMaterial color={spec.primaryColor} roughness={0.24} clearcoat={0.7} />
              </mesh>
              {/* Wooden Blossom Planter Crate in Cargo Bed */}
              <group position={[-0.36, 0.6, 1.34]}>
                <mesh castShadow>
                  <boxGeometry args={[0.72, 0.28, 0.56]} />
                  <meshStandardMaterial color="#92400e" roughness={0.65} />
                </mesh>
                <mesh position={[0, 0.2, 0]}>
                  <boxGeometry args={[0.64, 0.22, 0.48]} />
                  <meshStandardMaterial color="#f472b6" roughness={0.45} />
                </mesh>
              </group>
              {/* Tailgate-Mounted Full-Size Spare Tire */}
              <group position={[0.38, 0.42, 1.94]} rotation={[0, Math.PI / 2, 0]}>
                <DetailedWheel
                  radius={0.38}
                  width={0.32}
                  rimColor={spec.secondaryColor}
                  spinRefSetter={() => {}}
                  isLeft={false}
                />
              </group>

              {/* Framed Safari Windshield & Cream-Top Roll Hoop */}
              <group position={[0, 0.78, -0.56]} rotation={[0.28, 0, 0]}>
                <mesh>
                  <boxGeometry args={[1.68, 0.56, 0.05]} />
                  <meshPhysicalMaterial
                    color="#e0f2fe"
                    roughness={0.08}
                    transmission={0.75}
                    transparent
                    opacity={0.55}
                  />
                </mesh>
                <mesh position={[-0.86, 0, 0]}>
                  <boxGeometry args={[0.09, 0.62, 0.09]} />
                  <meshStandardMaterial color={spec.secondaryColor} roughness={0.3} />
                </mesh>
                <mesh position={[0.86, 0, 0]}>
                  <boxGeometry args={[0.09, 0.62, 0.09]} />
                  <meshStandardMaterial color={spec.secondaryColor} roughness={0.3} />
                </mesh>
                <mesh position={[0, 0.3, 0]}>
                  <boxGeometry args={[1.8, 0.08, 0.1]} />
                  <meshStandardMaterial color={spec.secondaryColor} roughness={0.3} />
                </mesh>
              </group>

              {/* Brushed Safari Roll-Hoop Behind Seats (Well Clear of Headrests at z = 0.88) */}
              <group position={[0, 0, 0.88]}>
                <mesh position={[-0.82, 0.85, 0]} castShadow>
                  <boxGeometry args={[0.1, 0.9, 0.1]} />
                  <meshStandardMaterial color="#1e293b" roughness={0.4} />
                </mesh>
                <mesh position={[0.82, 0.85, 0]} castShadow>
                  <boxGeometry args={[0.1, 0.9, 0.1]} />
                  <meshStandardMaterial color="#1e293b" roughness={0.4} />
                </mesh>
                <mesh position={[0, 1.32, 0]} castShadow>
                  <boxGeometry args={[1.74, 0.1, 0.12]} />
                  <meshStandardMaterial color={spec.secondaryColor} roughness={0.3} />
                </mesh>
              </group>

              {/* Wood-Trimmed Dashboard, Glowing Gauges & Center Console Shifter */}
              <mesh position={[0, 0.42, -0.46]} castShadow>
                <boxGeometry args={[1.64, 0.32, 0.28]} />
                <meshStandardMaterial color="#78350f" roughness={0.45} />
              </mesh>
              <mesh position={[-0.38, 0.46, -0.31]}>
                <boxGeometry args={[0.38, 0.14, 0.02]} />
                <meshStandardMaterial color="#0f172a" emissive="#38bdf8" emissiveIntensity={0.7} />
              </mesh>
              {/* Center Console & Gearstick Between Seats */}
              <mesh position={[0, 0.06, 0.18]}>
                <boxGeometry args={[0.18, 0.22, 0.92]} />
                <meshStandardMaterial color="#1e293b" roughness={0.5} />
              </mesh>
              <mesh position={[0, 0.25, 0.02]} rotation={[0.15, 0, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.22, 8]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.7} />
              </mesh>

              {/* Twin Contoured Tan-Leather Bucket Seats (Driver Left x=-0.38, Passenger Right x=+0.38) */}
              <ContouredBucketSeat position={[-0.38, 0.02, 0.36]} leatherColor={spec.interiorColor} />
              <ContouredBucketSeat position={[0.38, 0.02, 0.36]} leatherColor={spec.interiorColor} />

              {/* Left-Hand-Drive 3-Spoke Steering Wheel Directly Aligned With Driver's Hands! */}
              <group position={[-0.38, 0.56, -0.14]} rotation={[-0.42, 0, 0]}>
                <mesh position={[0, 0, -0.14]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.035, 0.035, 0.28, 8]} />
                  <meshStandardMaterial color="#334155" />
                </mesh>
                <group ref={steerControlRef}>
                  <mesh>
                    <torusGeometry args={[0.18, 0.028, 10, 20]} />
                    <meshStandardMaterial color="#1e293b" roughness={0.35} />
                  </mesh>
                  <mesh>
                    <boxGeometry args={[0.34, 0.035, 0.02]} />
                    <meshStandardMaterial color="#94a3b8" metalness={0.6} />
                  </mesh>
                  <mesh position={[0, -0.08, 0]}>
                    <boxGeometry args={[0.035, 0.16, 0.02]} />
                    <meshStandardMaterial color="#94a3b8" metalness={0.6} />
                  </mesh>
                </group>
              </group>

              {/* Tail Lamps */}
              {[-0.68, 0.68].map((tx) => (
                <mesh key={tx} position={[tx, 0.26, 1.86]}>
                  <boxGeometry args={[0.3, 0.16, 0.06]} />
                  <meshStandardMaterial color="#fda4af" emissive="#f43f5e" emissiveIntensity={2.5} />
                </mesh>
              ))}

              {/* Seated Driver Comfortably Inside Left Bucket Seat Gripping Wheel! */}
              {isDriven && (
                <group position={[-0.38, 0.11, 0.34]}>
                  <VoxelCharacterModel
                    skinColor="#f2c6a0"
                    jacketColor="#0ea5e9"
                    shirtColor="#f8fafc"
                    pantsColor="#1e293b"
                    hairColor="#18181b"
                    shoeColor="#f43f5e"
                    isSeated
                    seatPosture="car"
                    steerAngle={steerVisual}
                  />
                </group>
              )}
            </group>
          )}

          {/* =================================================================== */}
          {/* DESIGN 2: BLOSSOM GT CONVERTIBLE ROADSTER (Sleek Sports Tourer)     */}
          {/* =================================================================== */}
          {spec.id === 'kart' && (
            <group>
              {/* Low Carbon-Slate Undertray & Splitter */}
              <mesh position={[0, -0.16, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.82, 0.14, 3.66]} />
                <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.4} />
              </mesh>
              {/* Aerodynamic Sculpted Nose & Pearl Racing Stripes */}
              <mesh geometry={geos.noseKart} position={[0, 0.12, -1.2]} castShadow receiveShadow>
                <meshPhysicalMaterial
                  color={spec.primaryColor}
                  roughness={0.16}
                  metalness={0.18}
                  clearcoat={0.88}
                />
              </mesh>
              <mesh position={[0, 0.31, -1.18]}>
                <boxGeometry args={[0.38, 0.02, 1.18]} />
                <meshPhysicalMaterial color={spec.secondaryColor} clearcoat={0.85} roughness={0.18} />
              </mesh>

              {/* Sculpted Side Aero Skirts & Air Intakes */}
              {[-1, 1].map((side) => (
                <group key={side}>
                  <mesh geometry={geos.sillKart} position={[side * 0.82, 0.08, 0.1]} castShadow>
                    <meshPhysicalMaterial
                      color={spec.primaryColor}
                      roughness={0.16}
                      clearcoat={0.88}
                    />
                  </mesh>
                  <mesh position={[side * 0.95, 0.08, 0.45]}>
                    <boxGeometry args={[0.04, 0.18, 0.48]} />
                    <meshStandardMaterial color="#09090b" roughness={0.6} />
                  </mesh>
                  <mesh position={[side * 0.96, 0.52, -0.45]} castShadow>
                    <boxGeometry args={[0.15, 0.09, 0.1]} />
                    <meshPhysicalMaterial color={spec.primaryColor} clearcoat={0.85} />
                  </mesh>
                </group>
              ))}

              {/* Rear Engine Deck, Twin Chrome Roll Hoops & Active GT Wing */}
              <mesh geometry={geos.rearKart} position={[0, 0.18, 1.32]} castShadow receiveShadow>
                <meshPhysicalMaterial color={spec.primaryColor} roughness={0.16} clearcoat={0.88} />
              </mesh>
              {[-0.36, 0.36].map((hx) => (
                <mesh key={hx} position={[hx, 0.64, 0.84]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                  <torusGeometry args={[0.18, 0.035, 8, 16, Math.PI]} />
                  <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.18} />
                </mesh>
              ))}
              {/* Elevated Carbon & Pearl GT Wing */}
              <group position={[0, 0.66, 1.66]}>
                <mesh position={[-0.54, -0.14, 0]}>
                  <boxGeometry args={[0.08, 0.3, 0.22]} />
                  <meshStandardMaterial color="#0f172a" />
                </mesh>
                <mesh position={[0.54, -0.14, 0]}>
                  <boxGeometry args={[0.08, 0.3, 0.22]} />
                  <meshStandardMaterial color="#0f172a" />
                </mesh>
                <mesh castShadow>
                  <boxGeometry args={[1.86, 0.08, 0.42]} />
                  <meshPhysicalMaterial color={spec.secondaryColor} clearcoat={0.88} roughness={0.15} />
                </mesh>
              </group>

              {/* Swept Frameless Sport Windshield */}
              <group position={[0, 0.6, -0.52]} rotation={[0.52, 0, 0]}>
                <mesh>
                  <boxGeometry args={[1.64, 0.52, 0.04]} />
                  <meshPhysicalMaterial
                    color="#bae6fd"
                    roughness={0.06}
                    transmission={0.78}
                    transparent
                    opacity={0.55}
                  />
                </mesh>
              </group>

              {/* Sport Cockpit Dashboard, Center Tunnel & Twin Leather Bucket Seats */}
              <mesh position={[0, 0.32, -0.45]}>
                <boxGeometry args={[1.6, 0.28, 0.26]} />
                <meshStandardMaterial color="#18181b" roughness={0.45} />
              </mesh>
              <mesh position={[0, 0.02, 0.16]}>
                <boxGeometry args={[0.18, 0.2, 0.92]} />
                <meshStandardMaterial color="#27272a" roughness={0.45} />
              </mesh>
              <ContouredBucketSeat position={[-0.36, -0.02, 0.36]} leatherColor={spec.interiorColor} />
              <ContouredBucketSeat position={[0.36, -0.02, 0.36]} leatherColor={spec.interiorColor} />

              {/* Sport Steering Wheel Aligned With Left-Hand Driver */}
              <group position={[-0.36, 0.5, -0.13]} rotation={[-0.38, 0, 0]}>
                <mesh position={[0, 0, -0.14]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.03, 0.03, 0.26, 8]} />
                  <meshStandardMaterial color="#334155" />
                </mesh>
                <group ref={steerControlRef}>
                  <mesh>
                    <torusGeometry args={[0.165, 0.028, 10, 20]} />
                    <meshStandardMaterial color="#09090b" roughness={0.3} />
                  </mesh>
                  <mesh position={[0, 0.16, 0]}>
                    <boxGeometry args={[0.04, 0.035, 0.035]} />
                    <meshStandardMaterial color={spec.accentColor} />
                  </mesh>
                </group>
              </group>

              {/* Angular LED Headlights & Full-Width LED Tail Lightbar + Twin Chrome Exhausts */}
              {[-0.62, 0.62].map((hx) => (
                <mesh key={hx} position={[hx, 0.16, -1.84]}>
                  <boxGeometry args={[0.38, 0.12, 0.06]} />
                  <meshStandardMaterial
                    color="#fef9c3"
                    emissive="#fef08a"
                    emissiveIntensity={headlightGlow}
                  />
                </mesh>
              ))}
              <mesh position={[0, 0.24, 1.86]}>
                <boxGeometry args={[1.62, 0.1, 0.05]} />
                <meshStandardMaterial color="#fda4af" emissive="#f43f5e" emissiveIntensity={2.8} />
              </mesh>

              {/* Seated Driver Inside Sport Roadster */}
              {isDriven && (
                <group position={[-0.36, 0.06, 0.34]}>
                  <VoxelCharacterModel
                    skinColor="#f2c6a0"
                    jacketColor="#0ea5e9"
                    shirtColor="#f8fafc"
                    pantsColor="#1e293b"
                    hairColor="#18181b"
                    shoeColor="#f43f5e"
                    isSeated
                    seatPosture="car"
                    steerAngle={steerVisual}
                  />
                </group>
              )}
            </group>
          )}

          {/* =================================================================== */}
          {/* DESIGN 3: MEADOW BREEZE SPRING SCOOTER (Electric Vespa Moped)       */}
          {/* =================================================================== */}
          {isScooter && (
            <group>
              {/* Teak-Wood Step-Through Floorboard */}
              <mesh geometry={geos.scooterFloor} position={[0, -0.1, -0.05]} castShadow receiveShadow>
                <meshPhysicalMaterial color={spec.primaryColor} roughness={0.22} clearcoat={0.8} />
              </mesh>
              <mesh position={[0, -0.02, -0.05]}>
                <boxGeometry args={[0.5, 0.03, 0.78]} />
                <meshStandardMaterial color="#b45309" roughness={0.55} />
              </mesh>

              {/* Curved Front Leg-Shield Apron & Front Fender */}
              <mesh
                geometry={geos.scooterShield}
                position={[0, 0.32, -0.54]}
                rotation={[0.18, 0, 0]}
                castShadow
              >
                <meshPhysicalMaterial color={spec.primaryColor} roughness={0.2} clearcoat={0.82} />
              </mesh>
              <mesh position={[0, 0.34, -0.64]} rotation={[0.18, 0, 0]}>
                <boxGeometry args={[0.24, 0.56, 0.04]} />
                <meshPhysicalMaterial color={spec.secondaryColor} roughness={0.25} clearcoat={0.7} />
              </mesh>
              <mesh position={[0, 0.06, -0.84]} castShadow>
                <boxGeometry args={[0.34, 0.22, 0.46]} />
                <meshPhysicalMaterial color={spec.primaryColor} roughness={0.2} clearcoat={0.8} />
              </mesh>

              {/* Sculpted Rear Vespa Side Cowls & Tan-Leather Saddle */}
              <mesh geometry={geos.scooterCowl} position={[0, 0.14, 0.48]} castShadow>
                <meshPhysicalMaterial color={spec.primaryColor} roughness={0.2} clearcoat={0.82} />
              </mesh>
              <mesh geometry={geos.scooterSeat} position={[0, 0.42, 0.38]} castShadow>
                <meshStandardMaterial color={spec.interiorColor} roughness={0.52} />
              </mesh>

              {/* Woven Rattan Rear Basket Filled With Spring Blossoms! */}
              <group position={[0, 0.54, 0.94]}>
                <mesh castShadow>
                  <boxGeometry args={[0.48, 0.28, 0.38]} />
                  <meshStandardMaterial color="#b45309" roughness={0.68} />
                </mesh>
                <mesh position={[0, 0.18, 0]}>
                  <boxGeometry args={[0.44, 0.18, 0.34]} />
                  <meshStandardMaterial color="#f472b6" roughness={0.42} />
                </mesh>
                <mesh position={[0.1, 0.24, 0.04]}>
                  <boxGeometry args={[0.14, 0.12, 0.14]} />
                  <meshStandardMaterial color="#facc15" roughness={0.4} />
                </mesh>
              </group>

              {/* Rotating Steering Handlebar Mast, Chrome Headlamp, Grips & Stalk Mirrors */}
              <group ref={steerControlRef} position={[0, 0.82, -0.44]}>
                <mesh castShadow>
                  <boxGeometry args={[0.74, 0.09, 0.12]} />
                  <meshPhysicalMaterial color={spec.secondaryColor} roughness={0.25} clearcoat={0.7} />
                </mesh>
                {/* Round Chrome-Bezel Headlight */}
                <mesh position={[0, 0.02, -0.09]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.11, 0.11, 0.06, 16]} />
                  <meshStandardMaterial
                    color="#fef9c3"
                    emissive="#fef08a"
                    emissiveIntensity={headlightGlow}
                  />
                </mesh>
                {/* Left & Right Leather Handlebar Grips & Mirrors */}
                {[-1, 1].map((side) => (
                  <group key={side}>
                    <mesh
                      position={[side * 0.42, 0, 0.04]}
                      rotation={[0, 0, Math.PI / 2]}
                    >
                      <cylinderGeometry args={[0.032, 0.032, 0.18, 8]} />
                      <meshStandardMaterial color={spec.interiorColor} roughness={0.55} />
                    </mesh>
                    <mesh position={[side * 0.36, 0.2, -0.02]}>
                      <cylinderGeometry args={[0.06, 0.06, 0.03, 12]} />
                      <meshStandardMaterial color="#e2e8f0" metalness={0.85} roughness={0.15} />
                    </mesh>
                  </group>
                ))}
              </group>

              {/* Tail Light */}
              <mesh position={[0, 0.2, 0.98]}>
                <boxGeometry args={[0.22, 0.12, 0.05]} />
                <meshStandardMaterial color="#fda4af" emissive="#f43f5e" emissiveIntensity={2.5} />
              </mesh>

              {/* Seated Scooter Rider With Feet on Floorboard & Hands Gripping Handlebars! */}
              {isDriven && (
                <group position={[0, 0.28, 0.24]}>
                  <VoxelCharacterModel
                    skinColor="#f2c6a0"
                    jacketColor="#0ea5e9"
                    shirtColor="#f8fafc"
                    pantsColor="#1e293b"
                    hairColor="#18181b"
                    shoeColor="#f43f5e"
                    isSeated
                    seatPosture="scooter"
                    steerAngle={steerVisual}
                  />
                </group>
              )}
            </group>
          )}

          {/* Real Night/Driving Headlight Beam */}
          {(isDriven || timeOfDay === 'night') && (
            <pointLight
              position={[0, 0.65, isScooter ? -1.4 : -2.5]}
              intensity={timeOfDay === 'night' ? 14 : 4}
              distance={22}
              color="#fef3c7"
            />
          )}
        </group>

        {/* Wheels (4 Wheels for Rover/Roadster, 2 Centerline Wheels for Scooter) */}
        {isScooter ? (
          <>
            <group ref={frontLeftPivotRef} position={[0, -0.18, -0.82]}>
              <DetailedWheel
                radius={0.26}
                width={0.2}
                rimColor={spec.secondaryColor}
                spinRefSetter={(el) => {
                  wheelSpinRefs.current[0] = el;
                }}
                isLeft
              />
            </group>
            <group position={[0, -0.18, 0.68]}>
              <DetailedWheel
                radius={0.26}
                width={0.22}
                rimColor={spec.secondaryColor}
                spinRefSetter={(el) => {
                  wheelSpinRefs.current[2] = el;
                }}
                isLeft
              />
            </group>
          </>
        ) : (
          [
            [-1.04, -0.18, -1.24, true],
            [1.04, -0.18, -1.24, true],
            [-1.04, -0.18, 1.24, false],
            [1.04, -0.18, 1.24, false],
          ].map(([wx, wy, wz, isFront], idx) => {
            const radius = isRover ? 0.41 : 0.35;
            const width = isRover ? 0.36 : 0.34;
            const wheelNode = (
              <DetailedWheel
                radius={radius as number}
                width={width}
                rimColor={spec.secondaryColor}
                spinRefSetter={(el) => {
                  wheelSpinRefs.current[idx] = el;
                }}
                isLeft={(wx as number) < 0}
              />
            );

            if (isFront) {
              return (
                <group
                  key={idx}
                  ref={(wx as number) < 0 ? frontLeftPivotRef : frontRightPivotRef}
                  position={[wx as number, wy as number, wz as number]}
                >
                  {wheelNode}
                </group>
              );
            }
            return (
              <group key={idx} position={[wx as number, wy as number, wz as number]}>
                {wheelNode}
              </group>
            );
          })
        )}

        {/* Crisp 1:1 Floating Drive Prompt */}
        {isPromptVisible && (
          <Html position={[0, 1.95, 0]} center zIndexRange={[10, 0]}>
            <div className="pointer-events-none flex items-center gap-2 rounded-full border border-emerald-400/50 bg-slate-950/88 px-3 py-1 text-[11px] font-semibold text-white shadow-xl backdrop-blur-md whitespace-nowrap">
              <span className="rounded bg-emerald-500 px-1.5 py-0.5 font-mono-code text-[10px] font-bold text-slate-950">
                F
              </span>
              <span>Drive {spec.name}</span>
            </div>
          </Html>
        )}
      </RigidBody>

      {/* Sakura Petal & Trail Dust Wake Particles */}
      <instancedMesh
        ref={dustTrailRef}
        args={[undefined, undefined, trailParticles.length]}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#fbcfe8"
          emissive="#f9a8d4"
          emissiveIntensity={0.35}
          transparent
          opacity={0.72}
        />
      </instancedMesh>
    </>
  );
}

export function VehicleSystem() {
  const interactTriggerNonce = useWorldStore((s) => s.interactTriggerNonce);

  useFrame(() => {
    const store = useWorldStore.getState();
    if (store.drivingVehicleId) {
      if (store.nearbyVehicleId !== null) store.setNearbyVehicleId(null);
      return;
    }

    const [px, , pz] = store.playerPosition;
    let closestId: VehicleId | null = null;
    let closestDist = 4.2;

    (['rover', 'kart', 'scooter'] as VehicleId[]).forEach((id) => {
      const [vx, , vz] = store.vehiclePositions[id];
      const d = Math.hypot(px - vx, pz - vz);
      if (d < closestDist) {
        closestDist = d;
        closestId = id;
      }
    });

    if (closestId !== store.nearbyVehicleId) {
      store.setNearbyVehicleId(closestId);
    }
  });

  useEffect(() => {
    const toggleMount = () => {
      const store = useWorldStore.getState();
      if (store.activeModalProjectId) return;

      if (store.drivingVehicleId) {
        store.setDrivingVehicleId(null);
        soundEngine.updateVehicleEngine(false, 0, false);
        soundEngine.playChime('mount');
      } else if (store.nearbyVehicleId) {
        store.setDrivingVehicleId(store.nearbyVehicleId);
        soundEngine.playChime('mount');
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === 'KeyF') {
        toggleMount();
      } else if (e.code === 'KeyV' || e.code === 'Digit1') {
        useWorldStore.getState().requestSummonVehicle('rover');
      } else if (e.code === 'Digit2') {
        useWorldStore.getState().requestSummonVehicle('kart');
      } else if (e.code === 'Digit3') {
        useWorldStore.getState().requestSummonVehicle('scooter');
      } else if (e.code === 'KeyH') {
        const store = useWorldStore.getState();
        if (store.drivingVehicleId) {
          store.setHornActive(true);
          soundEngine.playChime('horn');
          setTimeout(() => useWorldStore.getState().setHornActive(false), 650);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (interactTriggerNonce === 0) return;
    const store = useWorldStore.getState();
    if (store.drivingVehicleId) {
      store.setDrivingVehicleId(null);
      soundEngine.updateVehicleEngine(false, 0, false);
      soundEngine.playChime('mount');
    } else if (store.nearbyVehicleId) {
      store.setDrivingVehicleId(store.nearbyVehicleId);
      soundEngine.playChime('mount');
    } else if (store.nearbyProjectId) {
      store.openProjectModal(store.nearbyProjectId);
    }
  }, [interactTriggerNonce]);

  return (
    <group>
      {VEHICLE_SPAWNS.map((spec) => (
        <PhysicsVehicle key={spec.id} spec={spec} />
      ))}
    </group>
  );
}
