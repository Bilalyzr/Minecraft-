import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { getPBRBlockMaps } from '../textures/pbrTextures';
import {
  RIVER_BED_Y,
  RIVER_CENTER_Z,
  RIVER_WATER_Y,
  RIVER_Z_MAX,
  RIVER_Z_MIN,
  WORLD_BRIDGES,
  WORLD_HALF_EXTENT,
} from '../config/world.config';
import { useWorldStore } from '../store/useWorldStore';

interface BlockInstance {
  x: number;
  y: number;
  z: number;
  sx: number;
  sy: number;
  sz: number;
  rotY?: number;
}

export function Terrain() {
  const timeOfDay = useWorldStore((s) => s.timeOfDay);
  const lanternGlow = timeOfDay === 'night' ? 3.5 : timeOfDay === 'sunset' ? 2.4 : 1.15;

  const windmillBladesRef = useRef<THREE.Group>(null);
  const campfireFlameRef = useRef<THREE.Mesh>(null);

  // Authentic Minecraft Spring PBR Texture Sets
  const grassNorthMaps = useMemo(() => getPBRBlockMaps('grass_meadow', 84, 54), []);
  const grassSouthMaps = useMemo(() => getPBRBlockMaps('grass_meadow', 84, 34), []);
  const grassHillTopMaps = useMemo(() => getPBRBlockMaps('grass_meadow', 4, 4), []);
  const grassSideMaps = useMemo(() => getPBRBlockMaps('grass_side', 4, 1), []);
  const cobbleRoadEWMaps = useMemo(() => getPBRBlockMaps('cobble_road', 26, 2), []);
  const cobbleRoadNSMaps = useMemo(() => getPBRBlockMaps('cobble_road', 2, 12), []);
  const cobbleRoadNSShortMaps = useMemo(() => getPBRBlockMaps('cobble_road', 3, 4), []);
  const cobbleRoadNSLongMaps = useMemo(() => getPBRBlockMaps('cobble_road', 2, 16), []);
  const stonePathMaps = useMemo(() => getPBRBlockMaps('stone_path', 12, 12), []);
  const mossyMaps = useMemo(() => getPBRBlockMaps('mossy_stone', 6, 2), []);
  const mossyCurbMaps = useMemo(() => getPBRBlockMaps('mossy_stone', 20, 1), []);
  const quartzMaps = useMemo(() => getPBRBlockMaps('chiseled_quartz', 4, 4), []);
  const oakMaps = useMemo(() => getPBRBlockMaps('oak_planks', 6, 2), []);
  const cherryPlankMaps = useMemo(() => getPBRBlockMaps('pink_cherry_planks', 6, 2), []);
  const sandBeachMaps = useMemo(() => getPBRBlockMaps('sand_beach', 68, 2), []);
  const pebbleMaps = useMemo(() => getPBRBlockMaps('river_pebbles', 76, 4), []);
  const blossomMaps = useMemo(() => getPBRBlockMaps('sakura_blossom', 3, 1), []);
  const lanternMaps = useMemo(() => getPBRBlockMaps('sea_lantern', 1, 1), []);

  // Multi-face Minecraft Grass Block material array: [+X, -X, +Y (Top), -Y, +Z, -Z]
  const grassBlockMaterials = useMemo(
    () => [
      new THREE.MeshStandardMaterial({ ...grassSideMaps }),
      new THREE.MeshStandardMaterial({ ...grassSideMaps }),
      new THREE.MeshStandardMaterial({ ...grassHillTopMaps }),
      new THREE.MeshStandardMaterial({ ...grassSideMaps }),
      new THREE.MeshStandardMaterial({ ...grassSideMaps }),
      new THREE.MeshStandardMaterial({ ...grassSideMaps }),
    ],
    [grassSideMaps, grassHillTopMaps]
  );

  // Continuous 360° Multi-Layered Horizon Mountain Ring (Zero Gaps Anywhere!)
  const { mountainTurf, mountainCliffs } = useMemo(() => {
    const turf: BlockInstance[] = [];
    const cliffs: BlockInstance[] = [];

    // Inner lush terraced foothills ring (radius ~102m, every 4.5 degrees -> overlapping continuous ring!)
    for (let deg = 0; deg < 360; deg += 4.5) {
      const rad = (deg * Math.PI) / 180;
      const r1 = 104 + Math.sin(deg * 0.19) * 7 + Math.cos(deg * 0.37) * 4;
      const x1 = Math.cos(rad) * r1;
      const z1 = Math.sin(rad) * r1;

      // Leave narrow river canyon notch on far West/East while framing with cliffs
      if (Math.abs(z1 - RIVER_CENTER_Z) < 5.5) continue;

      const h1 = 4.5 + Math.abs(Math.sin(deg * 0.14)) * 6.5;
      cliffs.push({ x: x1, y: h1 * 0.42, z: z1, sx: 15, sy: h1, sz: 15, rotY: rad });
      turf.push({ x: x1, y: h1 * 0.92, z: z1, sx: 15.4, sy: 1.8, sz: 15.4, rotY: rad });

      // Second upper terrace step
      const r2 = r1 + 11;
      const h2 = h1 + 5.5 + Math.abs(Math.cos(deg * 0.21)) * 7.5;
      const x2 = Math.cos(rad) * r2;
      const z2 = Math.sin(rad) * r2;
      cliffs.push({ x: x2, y: h2 * 0.46, z: z2, sx: 18, sy: h2, sz: 18, rotY: rad });
      turf.push({ x: x2, y: h2 * 0.95, z: z2, sx: 18.4, sy: 2.2, sz: 18.4, rotY: rad });
    }

    // Grand Eastern Waterfall Cliff Mountain at x = 99, z = 36.5
    cliffs.push({ x: 101, y: 7.5, z: RIVER_CENTER_Z, sx: 12, sy: 16, sz: 18 });
    turf.push({ x: 101.5, y: 16.0, z: RIVER_CENTER_Z, sx: 12.6, sy: 1.8, sz: 18.6 });

    return { mountainTurf: turf, mountainCliffs: cliffs };
  }, []);

  const turfInstRef = useRef<THREE.InstancedMesh>(null);
  const cliffInstRef = useRef<THREE.InstancedMesh>(null);
  const roundedBlockGeo = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 2, 0.035), []);

  useEffect(() => {
    const dummy = new THREE.Object3D();
    if (turfInstRef.current) {
      mountainTurf.forEach((b, i) => {
        dummy.position.set(b.x, b.y, b.z);
        dummy.rotation.set(0, b.rotY ?? 0, 0);
        dummy.scale.set(b.sx, b.sy, b.sz);
        dummy.updateMatrix();
        turfInstRef.current!.setMatrixAt(i, dummy.matrix);
      });
      turfInstRef.current.instanceMatrix.needsUpdate = true;
    }
    if (cliffInstRef.current) {
      mountainCliffs.forEach((b, i) => {
        dummy.position.set(b.x, b.y, b.z);
        dummy.rotation.set(0, b.rotY ?? 0, 0);
        dummy.scale.set(b.sx, b.sy, b.sz);
        dummy.updateMatrix();
        cliffInstRef.current!.setMatrixAt(i, dummy.matrix);
      });
      cliffInstRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [mountainTurf, mountainCliffs]);

  useFrame(({ clock }, delta) => {
    if (windmillBladesRef.current) {
      windmillBladesRef.current.rotation.z -= delta * 0.55;
    }
    if (campfireFlameRef.current) {
      const t = clock.getElapsedTime();
      const flicker = 0.92 + Math.sin(t * 11) * 0.14;
      campfireFlameRef.current.scale.set(1, flicker, 1);
    }
  });

  // Walkable Interior Stepped Minecraft Knolls & Terraces
  const walkableKnolls = useMemo(
    () => [
      { pos: [-70, 0, -14] as [number, number, number], w: 18, d: 22, h1: 1.1, h2: 2.2 },
      { pos: [70, 0, -14] as [number, number, number], w: 18, d: 22, h1: 1.1, h2: 2.2 },
      { pos: [-66, 0, 66] as [number, number, number], w: 20, d: 18, h1: 1.0, h2: 2.1 },
      { pos: [66, 0, 66] as [number, number, number], w: 20, d: 18, h1: 1.0, h2: 2.1 },
      { pos: [-56, 0, -56] as [number, number, number], w: 22, d: 18, h1: 1.2, h2: 2.5 },
      { pos: [56, 0, -56] as [number, number, number], w: 22, d: 18, h1: 1.2, h2: 2.5 },
    ],
    []
  );

  // Boulevard Lantern Posts
  const streetLanterns = useMemo<[number, number][]>(
    () => [
      [-14, -10],
      [14, -10],
      [-14, 15],
      [14, 15],
      [-24, -18],
      [24, -18],
      [-39, 14],
      [39, 14],
      [-34, 24],
      [34, 24],
      [-6, 25],
      [6, 25],
      [-6, 47],
      [6, 47],
      [-22, 49],
      [22, 49],
      [-8, -32],
      [8, -32],
    ],
    []
  );

  // Wooden Park Benches around Plaza, River Promenade & Overlooks
  const parkBenches = useMemo<{ pos: [number, number, number]; rotY: number }[]>(
    () => [
      { pos: [-8.5, 0.08, -8.5], rotY: Math.PI * 0.2 },
      { pos: [8.5, 0.08, -8.5], rotY: -Math.PI * 0.2 },
      { pos: [-11.5, 0, 28.5], rotY: 0 },
      { pos: [11.5, 0, 28.5], rotY: 0 },
      { pos: [-14, 0, 45.2], rotY: Math.PI },
      { pos: [18, 0, 45.2], rotY: Math.PI },
    ],
    []
  );

  // Scenic Oak Post-and-Rail Meadow Fences
  const fenceSegments = useMemo<{ pos: [number, number, number]; len: number; rotY: number }[]>(
    () => [
      { pos: [-22, 0, -13.5], len: 11, rotY: 0 },
      { pos: [22, 0, -13.5], len: 11, rotY: 0 },
      { pos: [-22, 0, 18.2], len: 12, rotY: 0 },
      { pos: [22, 0, 18.2], len: 12, rotY: 0 },
      { pos: [-18, 0, 29.2], len: 14, rotY: 0 },
      { pos: [18, 0, 29.2], len: 14, rotY: 0 },
    ],
    []
  );

  // Blossom Trellis / Torii Archways framing key avenues
  const blossomArches = useMemo<{ pos: [number, number, number]; rotY: number }[]>(
    () => [
      { pos: [0, 0, -12.5], rotY: 0 },
      { pos: [0, 0, 25.5], rotY: 0 },
      { pos: [-22, 0, 13.5], rotY: Math.PI / 2 },
      { pos: [22, 0, 13.5], rotY: Math.PI / 2 },
    ],
    []
  );

  const northDepth = RIVER_Z_MIN - 1.2 + WORLD_HALF_EXTENT;
  const northCenterZ = (-WORLD_HALF_EXTENT + (RIVER_Z_MIN - 1.2)) / 2;

  const southDepth = WORLD_HALF_EXTENT - (RIVER_Z_MAX + 1.2);
  const southCenterZ = (RIVER_Z_MAX + 1.2 + WORLD_HALF_EXTENT) / 2;

  const riverWidth = RIVER_Z_MAX - RIVER_Z_MIN;
  const beachTilt = Math.atan2(Math.abs(RIVER_BED_Y), 2.2);

  return (
    <group>
      {/* Static Valley Ground, Sloped Sandy Beaches, Shallow Pebble Riverbed & Outer Horizon */}
      <RigidBody type="fixed" colliders={false} friction={0.95} restitution={0.02}>
        {/* North Lush Meadow Slab (10m Deep Bedrock Collider — Zero Tunneling!) */}
        <CuboidCollider
          args={[WORLD_HALF_EXTENT, 5.0, northDepth / 2]}
          position={[0, -5.0, northCenterZ]}
        />
        <mesh position={[0, -1.0, northCenterZ]} receiveShadow>
          <boxGeometry args={[WORLD_HALF_EXTENT * 2, 2.0, northDepth]} />
          <meshStandardMaterial
            map={grassNorthMaps.map}
            normalMap={grassNorthMaps.normalMap}
            roughnessMap={grassNorthMaps.roughnessMap}
          />
        </mesh>

        {/* South Lakeside Meadow Slab (10m Deep Bedrock Collider — Zero Tunneling!) */}
        <CuboidCollider
          args={[WORLD_HALF_EXTENT, 5.0, southDepth / 2]}
          position={[0, -5.0, southCenterZ]}
        />
        <mesh position={[0, -1.0, southCenterZ]} receiveShadow>
          <boxGeometry args={[WORLD_HALF_EXTENT * 2, 2.0, southDepth]} />
          <meshStandardMaterial
            map={grassSouthMaps.map}
            normalMap={grassSouthMaps.normalMap}
            roughnessMap={grassSouthMaps.roughnessMap}
          />
        </mesh>

        {/* Central Blossom Courtyard Stone Paver Collider (Player/Vehicles stand flush on pavers) */}
        <CuboidCollider args={[14.0, 0.05, 12.5]} position={[0, 0.04, 2]} />

        {/* Gentle Walkable & Driveable Golden-Sand River Beaches (Zero Vertical Trench Trap!) */}
        <CuboidCollider
          args={[WORLD_HALF_EXTENT, 0.25, 1.35]}
          position={[0, RIVER_BED_Y * 0.5 - 0.18, RIVER_Z_MIN - 0.1]}
          rotation={[beachTilt, 0, 0]}
        />
        <mesh
          position={[0, RIVER_BED_Y * 0.5 - 0.18, RIVER_Z_MIN - 0.1]}
          rotation={[beachTilt, 0, 0]}
          receiveShadow
        >
          <boxGeometry args={[WORLD_HALF_EXTENT * 2, 0.5, 2.7]} />
          <meshStandardMaterial {...sandBeachMaps} />
        </mesh>

        <CuboidCollider
          args={[WORLD_HALF_EXTENT, 0.25, 1.35]}
          position={[0, RIVER_BED_Y * 0.5 - 0.18, RIVER_Z_MAX + 0.1]}
          rotation={[-beachTilt, 0, 0]}
        />
        <mesh
          position={[0, RIVER_BED_Y * 0.5 - 0.18, RIVER_Z_MAX + 0.1]}
          rotation={[-beachTilt, 0, 0]}
          receiveShadow
        >
          <boxGeometry args={[WORLD_HALF_EXTENT * 2, 0.5, 2.7]} />
          <meshStandardMaterial {...sandBeachMaps} />
        </mesh>

        {/* Shallow Wet Pebble Riverbed (Driveable 4x4 Ford! 10m Deep Bedrock Collider) */}
        <CuboidCollider
          args={[WORLD_HALF_EXTENT, 5.0, riverWidth / 2]}
          position={[0, RIVER_BED_Y - 5.0, RIVER_CENTER_Z]}
        />
        <mesh position={[0, RIVER_BED_Y - 0.5, RIVER_CENTER_Z]} receiveShadow>
          <boxGeometry args={[WORLD_HALF_EXTENT * 2, 1.0, riverWidth]} />
          <meshStandardMaterial
            map={pebbleMaps.map}
            normalMap={pebbleMaps.normalMap}
            roughnessMap={pebbleMaps.roughnessMap}
          />
        </mesh>

        {/* Outer Mountain Rim Safety Boundary at ±96m */}
        <CuboidCollider args={[WORLD_HALF_EXTENT, 12, 1]} position={[0, 6, -96]} />
        <CuboidCollider args={[WORLD_HALF_EXTENT, 12, 1]} position={[0, 6, 96]} />
        <CuboidCollider args={[1, 12, WORLD_HALF_EXTENT]} position={[-96, 6, 0]} />
        <CuboidCollider args={[1, 12, WORLD_HALF_EXTENT]} position={[96, 6, 0]} />
      </RigidBody>

      {/* Central Blossom Courtyard & Tiered Quartz Fountain (Solid 10cm Slab — Zero Z-Fighting!) */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.04, 2]} receiveShadow>
          <boxGeometry args={[28, 0.1, 25]} />
          <meshStandardMaterial {...stonePathMaps} />
        </mesh>
        {/* Mossy Cobble Decorative Courtyard Border Curbs */}
        <mesh position={[0, 0.055, -10.5]} receiveShadow>
          <boxGeometry args={[28.6, 0.11, 0.7]} />
          <meshStandardMaterial {...mossyCurbMaps} />
        </mesh>
        <mesh position={[0, 0.055, 14.5]} receiveShadow>
          <boxGeometry args={[28.6, 0.11, 0.7]} />
          <meshStandardMaterial {...mossyCurbMaps} />
        </mesh>

        {/* Central Tiered Spring Fountain */}
        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider args={[3.8, 0.45, 3.8]} position={[0, 0.45, -2]} />
          <mesh position={[0, 0.38, -2]} castShadow receiveShadow>
            <cylinderGeometry args={[3.8, 4.1, 0.76, 8]} />
            <meshStandardMaterial {...quartzMaps} />
          </mesh>
          <mesh position={[0, 1.32, -2]} castShadow receiveShadow>
            <boxGeometry args={[1.25, 2.3, 1.25]} />
            <meshStandardMaterial {...quartzMaps} />
          </mesh>
          <mesh position={[0, 2.75, -2]} castShadow>
            <boxGeometry args={[0.92, 0.92, 0.92]} />
            <meshStandardMaterial
              map={lanternMaps.map}
              emissive="#7dd3fc"
              emissiveIntensity={lanternGlow * 1.15}
            />
          </mesh>
        </RigidBody>
      </group>

      {/* Solid Raised Cobblestone Boulevards (y = 0.035 center, top = 0.085m — Square Paver UVs!) */}
      <group>
        {/* Central North-South Spine Avenue (Windmill Hill to Central Bridge) */}
        <mesh position={[0, 0.035, -29]} receiveShadow>
          <boxGeometry args={[7.4, 0.09, 38]} />
          <meshStandardMaterial {...cobbleRoadNSMaps} />
        </mesh>
        <mesh position={[0, 0.035, 20.5]} receiveShadow>
          <boxGeometry args={[8.6, 0.09, 13]} />
          <meshStandardMaterial {...cobbleRoadNSShortMaps} />
        </mesh>
        {/* North Cross Avenue (-34 to +34) */}
        <mesh position={[0, 0.035, -18]} receiveShadow>
          <boxGeometry args={[74, 0.09, 7.0]} />
          <meshStandardMaterial {...cobbleRoadEWMaps} />
        </mesh>
        {/* Mid Grand Boulevard (-48 to +48) */}
        <mesh position={[0, 0.035, 13.5]} receiveShadow>
          <boxGeometry args={[92, 0.09, 7.2]} />
          <meshStandardMaterial {...cobbleRoadEWMaps} />
        </mesh>
        {/* West & East District Avenues */}
        <mesh position={[-34, 0.035, 2.5]} receiveShadow>
          <boxGeometry args={[6.8, 0.09, 50]} />
          <meshStandardMaterial {...cobbleRoadNSLongMaps} />
        </mesh>
        <mesh position={[34, 0.035, 2.5]} receiveShadow>
          <boxGeometry args={[6.8, 0.09, 50]} />
          <meshStandardMaterial {...cobbleRoadNSLongMaps} />
        </mesh>
        {/* South Lakeside Promenade */}
        <mesh position={[0, 0.035, 50]} receiveShadow>
          <boxGeometry args={[82, 0.09, 7.2]} />
          <meshStandardMaterial {...cobbleRoadEWMaps} />
        </mesh>
      </group>

      {/* 3 Arched Cherry-Wood & Mossy-Stone Bridges with Smooth Driveable Ramps */}
      {WORLD_BRIDGES.map((b) => {
        const deckLen = 10.8;
        const rampLen = 4.6;
        const rampAngle = Math.atan2(b.deckHeight, rampLen);
        const rampHypot = Math.sqrt(rampLen * rampLen + b.deckHeight * b.deckHeight);

        return (
          <group key={b.id} position={[b.x, 0, RIVER_CENTER_Z]}>
            <RigidBody type="fixed" colliders={false} friction={1.0}>
              <CuboidCollider
                args={[b.width / 2, 0.22, deckLen / 2]}
                position={[0, b.deckHeight - 0.22, 0]}
              />
              <mesh position={[0, b.deckHeight - 0.22, 0]} castShadow receiveShadow>
                <boxGeometry args={[b.width, 0.44, deckLen]} />
                <meshStandardMaterial {...cherryPlankMaps} />
              </mesh>

              {/* Smooth North Approach Ramp */}
              <CuboidCollider
                args={[b.width / 2, 0.22, rampHypot / 2]}
                position={[0, b.deckHeight / 2 - 0.2, -(deckLen / 2 + rampLen / 2 - 0.18)]}
                rotation={[rampAngle, 0, 0]}
              />
              <mesh
                position={[0, b.deckHeight / 2 - 0.2, -(deckLen / 2 + rampLen / 2 - 0.18)]}
                rotation={[rampAngle, 0, 0]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[b.width, 0.42, rampHypot]} />
                <meshStandardMaterial {...cherryPlankMaps} />
              </mesh>

              {/* Smooth South Approach Ramp */}
              <CuboidCollider
                args={[b.width / 2, 0.22, rampHypot / 2]}
                position={[0, b.deckHeight / 2 - 0.2, deckLen / 2 + rampLen / 2 - 0.18]}
                rotation={[-rampAngle, 0, 0]}
              />
              <mesh
                position={[0, b.deckHeight / 2 - 0.2, deckLen / 2 + rampLen / 2 - 0.18]}
                rotation={[-rampAngle, 0, 0]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[b.width, 0.42, rampHypot]} />
                <meshStandardMaterial {...cherryPlankMaps} />
              </mesh>

              {/* Sculpted Stone Parapets, Piers & Warm Bridge Lanterns */}
              {[-1, 1].map((side) => (
                <group key={side}>
                  <CuboidCollider
                    args={[0.24, 0.52, deckLen / 2]}
                    position={[side * (b.width / 2 - 0.24), b.deckHeight + 0.42, 0]}
                  />
                  <mesh
                    position={[side * (b.width / 2 - 0.24), b.deckHeight + 0.42, 0]}
                    castShadow
                    receiveShadow
                  >
                    <boxGeometry args={[0.42, 0.82, deckLen]} />
                    <meshStandardMaterial {...mossyMaps} />
                  </mesh>
                  {[-3.4, 3.4].map((pz) => (
                    <mesh
                      key={pz}
                      position={[side * (b.width / 2 - 0.45), -0.25, pz]}
                      castShadow
                      receiveShadow
                    >
                      <boxGeometry args={[0.9, 1.8, 0.95]} />
                      <meshStandardMaterial {...mossyMaps} />
                    </mesh>
                  ))}
                  <mesh position={[side * (b.width / 2 - 0.24), b.deckHeight + 1.32, 0]} castShadow>
                    <boxGeometry args={[0.52, 0.52, 0.52]} />
                    <meshStandardMaterial
                      map={lanternMaps.map}
                      emissive="#fbbf24"
                      emissiveIntensity={lanternGlow}
                    />
                  </mesh>
                </group>
              ))}
            </RigidBody>
          </group>
        );
      })}

      {/* Northern Climbable Terraced Minecraft Hill & Rotating Spring Windmill Overlook! */}
      <group position={[0, 0, -60]}>
        <RigidBody type="fixed" colliders={false} friction={1.0}>
          {/* Tier 1 Grass Block Terrace (y = 0..1.2) */}
          <CuboidCollider args={[14, 0.6, 11]} position={[0, 0.6, 0]} />
          <mesh position={[0, 0.6, 0]} material={grassBlockMaterials} castShadow receiveShadow>
            <boxGeometry args={[28, 1.2, 22]} />
          </mesh>

          {/* Tier 2 Grass Block Overlook Terrace (y = 1.2..2.5) */}
          <CuboidCollider args={[10, 0.65, 8]} position={[0, 1.85, -1.5]} />
          <mesh position={[0, 1.85, -1.5]} material={grassBlockMaterials} castShadow receiveShadow>
            <boxGeometry args={[20, 1.3, 16]} />
          </mesh>

          {/* Wide Walkable & Driveable Stone-Ramp Stairway up the Front of Windmill Hill */}
          <CuboidCollider
            args={[3.4, 0.25, 5.2]}
            position={[0, 1.15, 10.2]}
            rotation={[0.25, 0, 0]}
          />
          <mesh position={[0, 1.15, 10.2]} rotation={[0.25, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[6.8, 0.5, 10.4]} />
            <meshStandardMaterial {...stonePathMaps} />
          </mesh>

          {/* Spring Timber & Chiseled-Quartz Windmill Tower */}
          <CuboidCollider args={[2.6, 5.5, 2.6]} position={[0, 7.8, -3.2]} />
          <mesh position={[0, 4.6, -3.2]} castShadow receiveShadow>
            <boxGeometry args={[5.4, 4.4, 5.4]} />
            <meshStandardMaterial {...mossyMaps} />
          </mesh>
          <mesh position={[0, 9.4, -3.2]} castShadow receiveShadow>
            <boxGeometry args={[4.4, 5.4, 4.4]} />
            <meshStandardMaterial {...quartzMaps} />
          </mesh>
          {/* Peaked Cherry-Timber Windmill Roof */}
          <mesh position={[0, 12.8, -3.2]} castShadow>
            <coneGeometry args={[3.7, 2.6, 4]} />
            <meshStandardMaterial {...cherryPlankMaps} />
          </mesh>
        </RigidBody>

        {/* Rotating 4-Blade Oak & Cream-Canvas Windmill Sails */}
        <group ref={windmillBladesRef} position={[0, 10.4, -0.7]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.38, 0.38, 0.8, 12]} />
            <meshStandardMaterial {...oakMaps} />
          </mesh>
          {[0, 1, 2, 3].map((arm) => (
            <group key={arm} rotation={[0, 0, (arm * Math.PI) / 2]}>
              <mesh position={[0, 3.6, 0.1]} castShadow>
                <boxGeometry args={[0.24, 7.2, 0.2]} />
                <meshStandardMaterial {...oakMaps} />
              </mesh>
              <mesh position={[0.62, 4.1, 0.14]} castShadow>
                <boxGeometry args={[1.08, 5.4, 0.06]} />
                <meshStandardMaterial color="#fefce8" roughness={0.65} />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* Walkable Stepped Minecraft Grass-Block Terraces & Knolls Across the Valley */}
      {walkableKnolls.map((k, idx) => (
        <RigidBody key={idx} type="fixed" colliders={false} position={k.pos} friction={0.95}>
          <CuboidCollider args={[k.w / 2, k.h1 / 2, k.d / 2]} position={[0, k.h1 / 2, 0]} />
          <mesh position={[0, k.h1 / 2, 0]} material={grassBlockMaterials} castShadow receiveShadow>
            <boxGeometry args={[k.w, k.h1, k.d]} />
          </mesh>
          <CuboidCollider
            args={[k.w * 0.32, (k.h2 - k.h1) / 2, k.d * 0.32]}
            position={[0, k.h1 + (k.h2 - k.h1) / 2, 0]}
          />
          <mesh
            position={[0, k.h1 + (k.h2 - k.h1) / 2, 0]}
            material={grassBlockMaterials}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[k.w * 0.64, k.h2 - k.h1, k.d * 0.64]} />
          </mesh>
        </RigidBody>
      ))}

      {/* Blossom Timber Trellis Archways Over Grand Avenues */}
      {blossomArches.map((arch, idx) => (
        <group key={idx} position={arch.pos} rotation={[0, arch.rotY, 0]}>
          {[-4.4, 4.4].map((px) => (
            <mesh key={px} position={[px, 2.4, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.48, 4.8, 0.48]} />
              <meshStandardMaterial {...oakMaps} />
            </mesh>
          ))}
          <mesh position={[0, 4.9, 0]} castShadow>
            <boxGeometry args={[10.2, 0.46, 0.62]} />
            <meshStandardMaterial {...cherryPlankMaps} />
          </mesh>
          <mesh position={[0, 5.45, 0]} castShadow>
            <boxGeometry args={[9.4, 0.72, 1.15]} />
            <meshStandardMaterial {...blossomMaps} />
          </mesh>
          {[-2.8, 2.8].map((lx) => (
            <mesh key={lx} position={[lx, 4.35, 0]}>
              <boxGeometry args={[0.38, 0.46, 0.38]} />
              <meshStandardMaterial
                color="#fef3c7"
                emissive="#fbbf24"
                emissiveIntensity={lanternGlow}
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* South-Bank Wooden Pier, Moored Voxel Rowboat & Cozy Campfire Lounge */}
      <group position={[11.5, 0, 42.2]}>
        {/* Wooden Pier Extending Over the River */}
        <mesh position={[0, 0.12, -2.2]} castShadow receiveShadow>
          <boxGeometry args={[3.4, 0.24, 5.4]} />
          <meshStandardMaterial {...oakMaps} />
        </mesh>
        {[-1.4, 1.4].map((px) => (
          <mesh key={px} position={[px, -0.25, -4.4]} castShadow>
            <boxGeometry args={[0.28, 1.4, 0.28]} />
            <meshStandardMaterial {...oakMaps} />
          </mesh>
        ))}
        {/* Moored Minecraft Oak Voxel Rowboat */}
        <group position={[3.0, RIVER_WATER_Y + 0.14, -3.2]} rotation={[0, 0.22, 0]}>
          <mesh castShadow>
            <boxGeometry args={[1.45, 0.32, 2.5]} />
            <meshStandardMaterial {...oakMaps} />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <boxGeometry args={[1.1, 0.25, 1.9]} />
            <meshStandardMaterial color="#78350f" roughness={0.75} />
          </mesh>
        </group>
      </group>

      {/* Cozy Riverside Campfire & Oak Log Seating Circle */}
      <group position={[-12.5, 0, 45.8]}>
        <mesh position={[0, 0.12, 0]} rotation={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[1.1, 0.24, 0.28]} />
          <meshStandardMaterial {...oakMaps} />
        </mesh>
        <mesh position={[0, 0.12, 0]} rotation={[0, -0.6, 0]} castShadow>
          <boxGeometry args={[1.1, 0.24, 0.28]} />
          <meshStandardMaterial {...oakMaps} />
        </mesh>
        <mesh ref={campfireFlameRef} position={[0, 0.48, 0]}>
          <coneGeometry args={[0.38, 0.85, 5]} />
          <meshStandardMaterial
            color="#fb923c"
            emissive="#f97316"
            emissiveIntensity={3.2}
            transparent
            opacity={0.9}
          />
        </mesh>
        <pointLight position={[0, 0.9, 0]} color="#fb923c" intensity={4.5} distance={11} />
        {/* Log Seats */}
        <mesh position={[-1.8, 0.24, 0.5]} rotation={[0, 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.48, 0.48, 1.6]} />
          <meshStandardMaterial {...oakMaps} />
        </mesh>
        <mesh position={[1.8, 0.24, 0.5]} rotation={[0, -0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.48, 0.48, 1.6]} />
          <meshStandardMaterial {...oakMaps} />
        </mesh>
      </group>

      {/* Handcrafted Wooden Park Benches */}
      {parkBenches.map((bench, idx) => (
        <group key={idx} position={bench.pos} rotation={[0, bench.rotY, 0]}>
          <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.1, 0.12, 0.62]} />
            <meshStandardMaterial {...cherryPlankMaps} />
          </mesh>
          <mesh position={[0, 0.72, -0.26]} rotation={[0.12, 0, 0]} castShadow>
            <boxGeometry args={[2.1, 0.52, 0.1]} />
            <meshStandardMaterial {...cherryPlankMaps} />
          </mesh>
          {[-0.85, 0.85].map((lx) => (
            <mesh key={lx} position={[lx, 0.2, 0]} castShadow>
              <boxGeometry args={[0.16, 0.4, 0.56]} />
              <meshStandardMaterial color="#334155" roughness={0.5} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Scenic Oak Post-and-Rail Meadow Fences */}
      {fenceSegments.map((f, idx) => {
        const posts = Math.max(2, Math.round(f.len / 2.6) + 1);
        return (
          <group key={idx} position={f.pos} rotation={[0, f.rotY, 0]}>
            <mesh position={[0, 0.76, 0]} castShadow>
              <boxGeometry args={[f.len, 0.12, 0.1]} />
              <meshStandardMaterial {...oakMaps} />
            </mesh>
            <mesh position={[0, 0.42, 0]} castShadow>
              <boxGeometry args={[f.len, 0.12, 0.1]} />
              <meshStandardMaterial {...oakMaps} />
            </mesh>
            {Array.from({ length: posts }).map((_, pIdx) => {
              const px = -f.len / 2 + (pIdx / (posts - 1)) * f.len;
              return (
                <mesh key={pIdx} position={[px, 0.5, 0]} castShadow>
                  <boxGeometry args={[0.2, 1.0, 0.2]} />
                  <meshStandardMaterial {...oakMaps} />
                </mesh>
              );
            })}
          </group>
        );
      })}

      {/* Boulevard Oak & Glowing Sea-Lantern Street Lamps */}
      {streetLanterns.map(([lx, lz], idx) => (
        <group key={idx} position={[lx, 0, lz]}>
          <mesh position={[0, 0.25, 0]} castShadow>
            <boxGeometry args={[0.56, 0.5, 0.56]} />
            <meshStandardMaterial {...mossyMaps} />
          </mesh>
          <mesh position={[0, 2.05, 0]} castShadow>
            <boxGeometry args={[0.26, 3.6, 0.26]} />
            <meshStandardMaterial {...oakMaps} />
          </mesh>
          <mesh position={[0, 3.95, 0]} castShadow>
            <boxGeometry args={[0.62, 0.62, 0.62]} />
            <meshStandardMaterial
              map={lanternMaps.map}
              emissive="#fde68a"
              emissiveIntensity={lanternGlow}
            />
          </mesh>
        </group>
      ))}

      {/* Continuous 360° Horizon Voxel Mountain Range */}
      <instancedMesh
        ref={turfInstRef}
        args={[roundedBlockGeo, undefined, mountainTurf.length]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial {...grassHillTopMaps} />
      </instancedMesh>
      <instancedMesh
        ref={cliffInstRef}
        args={[roundedBlockGeo, undefined, mountainCliffs.length]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial {...mossyMaps} />
      </instancedMesh>
    </group>
  );
}
