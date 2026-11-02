import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { VoxelCharacterModel } from '../shared/VoxelCharacterModel';
import {
  AMBIENT_STROLL_NPCS,
  RIVER_CENTER_Z,
  RIVER_Z_MAX,
  RIVER_Z_MIN,
  WORLD_BRIDGES,
} from '../../config/world.config';
import { useWorldStore } from '../../store/useWorldStore';

interface UnifiedNPCActor {
  id: string;
  name: string;
  role: string;
  accentColor: string;
  jacketColor: string;
  pantsColor: string;
  hairColor: string;
  skinColor: string;
  speed: number;
  dialogue: string;
  waypoints: [number, number][];
  linkedProjectId?: string;
}

// Compute accurate ground elevation across arched bridges, raised stone boulevards, and courtyard slabs
function sampleWorldHeight(x: number, z: number): number {
  for (const b of WORLD_BRIDGES) {
    if (Math.abs(x - b.x) <= b.width * 0.52) {
      const halfDeck = 5.4;
      const rampLen = 4.6;
      const dz = Math.abs(z - RIVER_CENTER_Z);
      if (dz <= halfDeck) return b.deckHeight + 0.14;
      if (dz <= halfDeck + rampLen) {
        const t = 1 - (dz - halfDeck) / rampLen;
        return t * (b.deckHeight + 0.14);
      }
    }
  }

  // Central Blossom Courtyard stone slab (top = 0.09m)
  if (Math.abs(x) <= 14.2 && z >= -10.6 && z <= 14.6) {
    return 0.09;
  }

  // Cobblestone boulevards (top = 0.08m)
  if (
    (Math.abs(x) <= 4.3 && z >= -48 && z <= 28) ||
    (Math.abs(z + 18) <= 3.6 && Math.abs(x) <= 38) ||
    (Math.abs(z - 13.5) <= 3.7 && Math.abs(x) <= 46) ||
    (Math.abs(z - 48) <= 3.6 && Math.abs(x) <= 40) ||
    (Math.abs(Math.abs(x) - 34) <= 3.5 && z >= 12 && z <= 50)
  ) {
    return 0.08;
  }

  if (z > RIVER_Z_MIN && z < RIVER_Z_MAX) return -0.15;
  return 0;
}

function AutonomousNPC({ actor, index }: { actor: UnifiedNPCActor; index: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const posRef = useRef({
    x: actor.waypoints[0][0],
    y: sampleWorldHeight(actor.waypoints[0][0], actor.waypoints[0][1]),
    z: actor.waypoints[0][1],
  });
  const wpIndexRef = useRef((index + 1) % actor.waypoints.length);
  const pauseTimerRef = useRef(0);
  const headingRef = useRef(0);
  const speedRef = useRef(actor.speed);

  const [interactionMode, setInteractionMode] = useState<'none' | 'greet' | 'vehicle_yield'>('none');
  const [labelInView, setLabelInView] = useState(false);
  const camDirHelper = useMemo(() => new THREE.Vector3(), []);
  const toNpcHelper = useMemo(() => new THREE.Vector3(), []);
  const openProjectModal = useWorldStore((s) => s.openProjectModal);
  const visitorName = useWorldStore((s) => s.visitorName);

  useFrame(({ camera }, delta) => {
    const store = useWorldStore.getState();
    const [px, , pz] = store.playerPosition;
    const cur = posRef.current;

    camera.getWorldDirection(camDirHelper);
    toNpcHelper.set(
      cur.x - camera.position.x,
      cur.y + 1.8 - camera.position.y,
      cur.z - camera.position.z
    );
    const shouldShowTag = toNpcHelper.dot(camDirHelper) > 1.8 && toNpcHelper.length() < 34;
    if (shouldShowTag !== labelInView) {
      setLabelInView(shouldShowTag);
    }

    // Dynamic obstacle list: all 3 vehicles + Central Fountain + Style Atelier
    const [rx, , rz] = store.vehiclePositions.rover;
    const [kx, , kz] = store.vehiclePositions.kart;
    const [sx, , sz] = store.vehiclePositions.scooter;
    const obstacles: [number, number, number][] = [
      [rx, rz, 3.35],
      [kx, kz, 3.1],
      [sx, sz, 2.15],
      [0, -2, 4.65],
      [-19.5, 1.5, 4.85],
    ];

    const distToPlayer = Math.hypot(px - cur.x, pz - cur.z);

    // Check distance to actively driven / honking vehicles
    let vehicleThreat = false;
    if (store.drivingVehicleId) {
      const [vx, , vz] = store.vehiclePositions[store.drivingVehicleId];
      const dVeh = Math.hypot(vx - cur.x, vz - cur.z);
      if (dVeh < 6.2 || (store.isHornActive && dVeh < 13.5)) {
        vehicleThreat = true;
      }
    }

    if (vehicleThreat) {
      if (interactionMode !== 'vehicle_yield') setInteractionMode('vehicle_yield');
      speedRef.current = 0;
      const dx = px - cur.x;
      const dz = pz - cur.z;
      const targetYaw = Math.atan2(-dx, -dz);
      let diff = targetYaw - headingRef.current;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      headingRef.current += diff * Math.min(1, delta * 9);
    } else if (distToPlayer < 5.6 && !store.drivingVehicleId) {
      if (interactionMode !== 'greet') setInteractionMode('greet');
      speedRef.current = 0;
      const dx = px - cur.x;
      const dz = pz - cur.z;
      const targetYaw = Math.atan2(-dx, -dz);
      let diff = targetYaw - headingRef.current;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      headingRef.current += diff * Math.min(1, delta * 8);
    } else {
      if (interactionMode !== 'none') setInteractionMode('none');

      if (pauseTimerRef.current > 0) {
        pauseTimerRef.current -= delta;
        speedRef.current = 0;
      } else {
        const targetWp = actor.waypoints[wpIndexRef.current];
        const dx = targetWp[0] - cur.x;
        const dz = targetWp[1] - cur.z;
        const dist = Math.hypot(dx, dz);

        if (dist < 0.7) {
          wpIndexRef.current = (wpIndexRef.current + 1) % actor.waypoints.length;
          if (actor.linkedProjectId && wpIndexRef.current === 1) {
            pauseTimerRef.current = 2.4;
          }
        } else {
          let steerX = dx / dist;
          let steerZ = dz / dist;

          // Smooth tangential obstacle avoidance around parked vehicles & fountain
          for (const [ox, oz, rad] of obstacles) {
            const odx = cur.x - ox;
            const odz = cur.z - oz;
            const od = Math.hypot(odx, odz);
            const avoidRadius = rad + 1.65;
            if (od < avoidRadius && od > 0.001) {
              const weight = (avoidRadius - od) / avoidRadius;
              const nx = odx / od;
              const nz = odz / od;
              // Choose tangent direction aligned with waypoint direction
              const t1x = -nz;
              const t1z = nx;
              const dot = t1x * steerX + t1z * steerZ >= 0 ? 1 : -1;
              steerX += (nx * 1.35 + t1x * dot * 1.15) * weight * 1.8;
              steerZ += (nz * 1.35 + t1z * dot * 1.15) * weight * 1.8;
            }
          }

          const sMag = Math.hypot(steerX, steerZ) || 1;
          steerX /= sMag;
          steerZ /= sMag;

          const step = Math.min(dist, actor.speed * delta);
          cur.x += steerX * step;
          cur.z += steerZ * step;
          speedRef.current = actor.speed;

          const targetYaw = Math.atan2(-steerX, -steerZ);
          let diff = targetYaw - headingRef.current;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          headingRef.current += diff * Math.min(1, delta * 9);
        }
      }
    }

    // Hard non-penetration projection so NPCs never clip inside parked or driven vehicles
    for (const [ox, oz, rad] of obstacles) {
      const odx = cur.x - ox;
      const odz = cur.z - oz;
      const od = Math.hypot(odx, odz);
      if (od < rad) {
        const safeD = Math.max(0.01, od);
        cur.x = ox + (odx / safeD) * rad;
        cur.z = oz + (odz / safeD) * rad;
      }
    }

    cur.y = sampleWorldHeight(cur.x, cur.z);

    if (groupRef.current) {
      groupRef.current.position.set(cur.x, cur.y, cur.z);
      groupRef.current.rotation.y = headingRef.current;
    }
  });

  return (
    <group ref={groupRef} position={[actor.waypoints[0][0], 0, actor.waypoints[0][1]]}>
      <VoxelCharacterModel
        skinColor={actor.skinColor}
        jacketColor={actor.jacketColor}
        pantsColor={actor.pantsColor}
        hairColor={actor.hairColor}
        speedRef={speedRef}
        isWaving={interactionMode !== 'none'}
      />

      {/* Crisp 1:1 Pixel-Perfect Name Tag or Interactive Speech Bubble When In Front of Camera */}
      {labelInView &&
        (interactionMode !== 'none' ? (
          <Html position={[0, 2.32, 0]} center zIndexRange={[10, 0]}>
            <div
              onClick={() => {
                if (actor.linkedProjectId) openProjectModal(actor.linkedProjectId);
              }}
              className={`w-56 rounded-xl border border-white/20 bg-slate-950/88 px-3 py-2 text-left shadow-xl backdrop-blur-md transition-all ${
                actor.linkedProjectId
                  ? 'cursor-pointer hover:border-pink-400/60'
                  : 'pointer-events-none'
              }`}
            >
              <div className="mb-0.5 flex items-center justify-between gap-1.5">
                <span className="font-display text-[11px] font-bold text-white">{actor.name}</span>
                <span
                  className="rounded-full px-1.5 py-0.5 font-mono-code text-[8px] font-semibold"
                  style={{
                    backgroundColor: `${actor.accentColor}26`,
                    color: actor.accentColor,
                  }}
                >
                  {actor.role}
                </span>
              </div>
              <p className="text-[10px] leading-snug text-slate-200">
                {interactionMode === 'vehicle_yield'
                  ? `Whoa, sweet ride${visitorName ? `, ${visitorName}` : ''}! Watch the Sakura blossoms on those corners!`
                  : visitorName
                    ? `Hi ${visitorName}! ${actor.dialogue}`
                    : actor.dialogue}
              </p>
            </div>
          </Html>
        ) : (
          <Html position={[0, 2.12, 0]} center zIndexRange={[5, 0]}>
            <div className="pointer-events-none whitespace-nowrap rounded-full border border-white/15 bg-slate-950/65 px-2 py-0.5 text-[9px] font-medium text-slate-200 backdrop-blur-sm">
              {actor.name}
            </div>
          </Html>
        ))}
    </group>
  );
}

export function NPCSystem() {
  const projects = useWorldStore((s) => s.projects);

  const allActors = useMemo<UnifiedNPCActor[]>(() => {
    const skins = ['#f3cfb3', '#e0ac69', '#c68642', '#ffdbac', '#f1c27d', '#d2996c'];

    // 1. Dedicated Project Specialist Characters Walking Near Each Project Pavilion!
    const projectGuides: UnifiedNPCActor[] = projects.map((proj, idx) => {
      const sin = Math.sin(proj.rotationY);
      const cos = Math.cos(proj.rotationY);
      const toWorld = (lx: number, lz: number): [number, number] => [
        proj.position[0] + lx * cos + lz * sin,
        proj.position[2] - lx * sin + lz * cos,
      ];

      return {
        id: `guide-${proj.id}`,
        name: proj.npcGuide.name,
        role: proj.npcGuide.role,
        accentColor: proj.accentColor,
        jacketColor: proj.npcGuide.jacketColor,
        pantsColor: proj.npcGuide.pantsColor,
        hairColor: proj.npcGuide.hairColor,
        skinColor: skins[idx % skins.length],
        speed: 2.05,
        dialogue: proj.npcGuide.dialogue,
        linkedProjectId: proj.id,
        waypoints: [
          toWorld(-3.4, 5.2),
          toWorld(3.4, 5.2),
          toWorld(4.8, 9.6),
          toWorld(-4.8, 9.6),
        ],
      };
    });

    // 2. Ambient Valley Strolling Characters Walking Across Roads, Plaza & Bridges
    const strollers: UnifiedNPCActor[] = AMBIENT_STROLL_NPCS.map((npc) => ({
      id: npc.id,
      name: npc.name,
      role: npc.role,
      accentColor: '#f472b6',
      jacketColor: npc.jacketColor,
      pantsColor: npc.pantsColor,
      hairColor: npc.hairColor,
      skinColor: npc.skinColor,
      speed: npc.speed,
      dialogue: npc.dialogue,
      waypoints: npc.waypoints,
    }));

    return [...projectGuides, ...strollers];
  }, [projects]);

  return (
    <group>
      {allActors.map((actor, idx) => (
        <AutonomousNPC key={actor.id} actor={actor} index={idx} />
      ))}
    </group>
  );
}
