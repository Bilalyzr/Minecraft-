import { create } from 'zustand';
import type { VehicleId } from '../config/world.config';

export type { VehicleId };
export type TimeOfDay = 'morning' | 'sunset' | 'night';
export type QualityTier = 'ultra' | 'balanced' | 'performance';

export interface TeleportRequest {
  position: [number, number, number];
  lookAt?: [number, number, number];
  nonce: number;
}

export interface SummonVehicleRequest {
  vehicleId: VehicleId;
  position: [number, number, number];
  rotationY: number;
  nonce: number;
}

export interface MobileInputState {
  moveX: number;
  moveY: number;
  sprint: boolean;
  jump: boolean;
  brake: boolean;
}

interface WorldStoreState {
  isWorldReady: boolean;
  setWorldReady: (ready: boolean) => void;

  timeOfDay: TimeOfDay;
  setTimeOfDay: (tod: TimeOfDay) => void;
  cycleTimeOfDay: () => void;

  qualityTier: QualityTier;
  setQualityTier: (tier: QualityTier) => void;

  soundEnabled: boolean;
  toggleSound: () => void;

  // Player & Vehicle modes
  drivingVehicleId: VehicleId | null;
  nearbyVehicleId: VehicleId | null;
  vehicleSpeedKmh: number;
  isBoosting: boolean;
  isHornActive: boolean;

  setDrivingVehicleId: (id: VehicleId | null) => void;
  setNearbyVehicleId: (id: VehicleId | null) => void;
  setVehicleTelemetry: (speedKmh: number, boosting: boolean) => void;
  setHornActive: (active: boolean) => void;

  // High-frequency mutable shared coordinates
  playerPosition: [number, number, number];
  playerHeading: number;
  vehiclePositions: Record<VehicleId, [number, number, number]>;
  updatePlayerTransform: (pos: [number, number, number], heading: number) => void;
  updateVehiclePosition: (id: VehicleId, pos: [number, number, number]) => void;

  // Project Pavilion Interactions
  nearbyProjectId: string | null;
  activeModalProjectId: string | null;
  isDirectoryOpen: boolean;
  isControlsHelpOpen: boolean;

  setNearbyProjectId: (id: string | null) => void;
  openProjectModal: (id: string) => void;
  closeProjectModal: () => void;
  setDirectoryOpen: (open: boolean) => void;
  setControlsHelpOpen: (open: boolean) => void;

  // Teleport & Summon Vehicle actions
  teleportRequest: TeleportRequest | null;
  requestTeleport: (position: [number, number, number], lookAt?: [number, number, number]) => void;

  summonRequest: SummonVehicleRequest | null;
  requestSummonVehicle: (vehicleId?: VehicleId) => void;

  // Mobile virtual input
  mobileInput: MobileInputState;
  setMobileMove: (x: number, y: number) => void;
  setMobileButton: (btn: 'sprint' | 'jump' | 'brake', active: boolean) => void;

  interactTriggerNonce: number;
  triggerInteract: () => void;
}

const TIME_ORDER: TimeOfDay[] = ['morning', 'sunset', 'night'];

export const useWorldStore = create<WorldStoreState>((set, get) => ({
  isWorldReady: false,
  setWorldReady: (ready) => set({ isWorldReady: ready }),

  timeOfDay: 'morning',
  setTimeOfDay: (timeOfDay) => set({ timeOfDay }),
  cycleTimeOfDay: () => {
    const idx = TIME_ORDER.indexOf(get().timeOfDay);
    set({ timeOfDay: TIME_ORDER[(idx + 1) % TIME_ORDER.length] });
  },

  qualityTier: 'ultra',
  setQualityTier: (qualityTier) => set({ qualityTier }),

  soundEnabled: false,
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),

  drivingVehicleId: null,
  nearbyVehicleId: null,
  vehicleSpeedKmh: 0,
  isBoosting: false,
  isHornActive: false,

  setDrivingVehicleId: (id) => set({ drivingVehicleId: id, vehicleSpeedKmh: 0, isBoosting: false }),
  setNearbyVehicleId: (id) => set({ nearbyVehicleId: id }),
  setVehicleTelemetry: (vehicleSpeedKmh, isBoosting) => set({ vehicleSpeedKmh, isBoosting }),
  setHornActive: (isHornActive) => set({ isHornActive }),

  playerPosition: [0, 0.5, 11.5],
  playerHeading: 0,
  vehiclePositions: {
    rover: [10.8, 0.9, 8.8],
    kart: [-10.8, 0.85, 8.8],
    scooter: [6.8, 0.78, 13.8],
  },
  updatePlayerTransform: (pos, heading) => {
    const state = get();
    state.playerPosition[0] = pos[0];
    state.playerPosition[1] = pos[1];
    state.playerPosition[2] = pos[2];
    state.playerHeading = heading;
  },
  updateVehiclePosition: (id, pos) => {
    const target = get().vehiclePositions[id];
    if (target) {
      target[0] = pos[0];
      target[1] = pos[1];
      target[2] = pos[2];
    }
  },

  nearbyProjectId: null,
  activeModalProjectId: null,
  isDirectoryOpen: false,
  isControlsHelpOpen: false,

  setNearbyProjectId: (id) => set({ nearbyProjectId: id }),
  openProjectModal: (id) => set({ activeModalProjectId: id, isDirectoryOpen: false }),
  closeProjectModal: () => set({ activeModalProjectId: null }),
  setDirectoryOpen: (open) => set({ isDirectoryOpen: open }),
  setControlsHelpOpen: (open) => set({ isControlsHelpOpen: open }),

  teleportRequest: null,
  requestTeleport: (position, lookAt) =>
    set({
      drivingVehicleId: null,
      activeModalProjectId: null,
      isDirectoryOpen: false,
      teleportRequest: {
        position,
        lookAt,
        nonce: Date.now() + Math.random(),
      },
    }),

  summonRequest: null,
  requestSummonVehicle: (preferredId) => {
    const state = get();
    if (state.drivingVehicleId) return;
    const vehicleId: VehicleId = preferredId ?? 'rover';
    const [px, py, pz] = state.playerPosition;
    const heading = state.playerHeading;
    const spawnX = Math.max(-110, Math.min(110, px + Math.cos(heading) * 3.6));
    let spawnZ = Math.max(-110, Math.min(110, pz - Math.sin(heading) * 3.6));
    if (spawnZ > 30.2 && spawnZ < 42.8) {
      spawnZ = spawnZ < 36.5 ? 29.0 : 44.0;
    }
    set({
      summonRequest: {
        vehicleId,
        position: [spawnX, Math.max(1.2, py + 0.95), spawnZ],
        rotationY: heading,
        nonce: Date.now() + Math.random(),
      },
    });
  },

  mobileInput: {
    moveX: 0,
    moveY: 0,
    sprint: false,
    jump: false,
    brake: false,
  },
  setMobileMove: (moveX, moveY) =>
    set((s) => ({
      mobileInput: { ...s.mobileInput, moveX, moveY },
    })),
  setMobileButton: (btn, active) =>
    set((s) => ({
      mobileInput: { ...s.mobileInput, [btn]: active },
    })),

  interactTriggerNonce: 0,
  triggerInteract: () => set((s) => ({ interactTriggerNonce: s.interactTriggerNonce + 1 })),
}));

if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__WORLD_STORE__ = useWorldStore;
}
