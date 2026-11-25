import { create } from 'zustand';
import { WORLD_BRIDGES, type VehicleId } from '../config/world.config';
import {
  CHARACTER_PRESETS,
  type CharacterAppearance,
} from '../config/character.config';
import {
  CUSTOM_PAVILION_SLOTS,
  PORTFOLIO_PROJECTS,
  type PortfolioProject,
} from '../config/projects.config';
import {
  normalizeHexColor,
  sanitizeAppearance,
  sanitizeHttpUrl,
  sanitizeProjectList,
  sanitizeVisitedIds,
} from '../utils/validation';

export type { VehicleId };
export type TimeOfDay = 'evening' | 'night';
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

const STORAGE_KEYS = {
  VISITOR_NAME: 'bilal_world_visitor_name_v1',
  VISITOR_ROLE: 'bilal_world_visitor_role_v1',
  CHARACTER: 'bilal_world_character_v1',
  PROJECTS: 'bilal_world_projects_v1',
  VISITED: 'bilal_world_visited_chapters_v1',
};

function loadInitialAppearance(): CharacterAppearance {
  if (typeof window === 'undefined') return CHARACTER_PRESETS[0].appearance;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.CHARACTER);
    if (raw) {
      return sanitizeAppearance(JSON.parse(raw));
    }
  } catch {
    // ignore storage errors
  }
  return CHARACTER_PRESETS[0].appearance;
}

function loadInitialProjects(): PortfolioProject[] {
  if (typeof window === 'undefined') return PORTFOLIO_PROJECTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (raw) {
      return sanitizeProjectList(JSON.parse(raw));
    }
  } catch {
    // ignore storage errors
  }
  return PORTFOLIO_PROJECTS;
}

function saveProjectsToStorage(projects: PortfolioProject[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch {
    // ignore quota errors
  }
}

function loadInitialString(key: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  try {
    const val = window.localStorage.getItem(key);
    return typeof val === 'string' ? val.slice(0, 80) : fallback;
  } catch {
    return fallback;
  }
}

function loadVisitedChapters(projects: PortfolioProject[]): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.VISITED);
    if (raw) {
      return sanitizeVisitedIds(JSON.parse(raw), projects);
    }
  } catch {
    // ignore
  }
  return [];
}

function saveVisitedToStorage(visited: string[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.VISITED, JSON.stringify(visited));
  } catch {
    // ignore
  }
}

const ROMAN_NUMERALS = [
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'XI',
  'XII',
  'XIII',
  'XIV',
  'XV',
];

function findFreePavilionSlot(existingProjects: PortfolioProject[]): {
  position: [number, number, number];
  rotationY: number;
  districtName: string;
} {
  const isOccupied = (pos: [number, number, number]) =>
    existingProjects.some(
      (p) => Math.hypot(p.position[0] - pos[0], p.position[2] - pos[2]) < 14
    );

  for (const slot of CUSTOM_PAVILION_SLOTS) {
    if (!isOccupied(slot.position)) {
      return slot;
    }
  }

  // Fallback outer perimeter placements if all 7 curated slots are occupied
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2 + 0.25;
    const radius = 72;
    const x = Math.round(Math.cos(angle) * radius);
    const z = Math.round(Math.sin(angle) * radius);
    if (z > 24 && z < 48) continue; // keep clear of river
    const candidate: [number, number, number] = [x, 0, z];
    if (!isOccupied(candidate)) {
      return {
        position: candidate,
        rotationY: Math.atan2(-x, -z),
        districtName: 'Outer Valley Blossom Ring',
      };
    }
  }

  return CUSTOM_PAVILION_SLOTS[0];
}

interface WorldStoreState {
  isWorldReady: boolean;
  setWorldReady: (ready: boolean) => void;

  // Visitor Onboarding & Character Customization State
  hasEnteredWorld: boolean;
  visitorName: string;
  visitorRole: string;
  characterAppearance: CharacterAppearance;
  isWardrobeOpen: boolean;
  isNearWardrobe: boolean;

  setVisitorIdentity: (name: string, role?: string) => void;
  setCharacterAppearance: (updates: Partial<CharacterAppearance>) => void;
  selectCharacterPreset: (presetId: string) => void;
  completeVisitorOnboarding: (name: string, role: string, appearance: CharacterAppearance) => void;
  setWardrobeOpen: (open: boolean) => void;
  setNearWardrobe: (near: boolean) => void;

  // Dynamic & Manually Stored Portfolio Projects
  projects: PortfolioProject[];
  isProjectCreatorOpen: boolean;
  editingProjectId: string | null;
  openProjectCreator: (projectId?: string | null) => void;
  closeProjectCreator: () => void;
  saveManualProject: (
    projectData: Omit<PortfolioProject, 'id' | 'number' | 'position' | 'rotationY'> & {
      id?: string;
      position?: [number, number, number];
      rotationY?: number;
    }
  ) => PortfolioProject;
  deleteProject: (id: string) => void;
  resetProjectsToDefault: () => void;

  // Storytelling Quest & Resume Modal State
  storyChapterIndex: number;
  visitedProjectIds: string[];
  isResumeModalOpen: boolean;
  setStoryChapterIndex: (index: number) => void;
  markProjectVisited: (id: string) => void;
  teleportToStoryChapter: (index: number) => void;
  setResumeModalOpen: (open: boolean) => void;

  // Atmosphere & Audio
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

const TIME_ORDER: TimeOfDay[] = ['evening', 'night'];
const INITIAL_PROJECTS = loadInitialProjects();

export const useWorldStore = create<WorldStoreState>((set, get) => ({
  isWorldReady: false,
  setWorldReady: (ready) => set({ isWorldReady: ready }),

  // Visitor Onboarding & Character Customization
  hasEnteredWorld: false,
  visitorName: loadInitialString(STORAGE_KEYS.VISITOR_NAME, ''),
  visitorRole: loadInitialString(STORAGE_KEYS.VISITOR_ROLE, 'Tech Recruiter'),
  characterAppearance: loadInitialAppearance(),
  isWardrobeOpen: false,
  isNearWardrobe: false,

  setVisitorIdentity: (visitorName, visitorRole) => {
    const cleanName = visitorName.slice(0, 48);
    const nextRole = (visitorRole ?? get().visitorRole).slice(0, 40);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEYS.VISITOR_NAME, cleanName);
        window.localStorage.setItem(STORAGE_KEYS.VISITOR_ROLE, nextRole);
      } catch {
        // ignore
      }
    }
    set({ visitorName: cleanName, visitorRole: nextRole });
  },

  setCharacterAppearance: (updates) => {
    const next = sanitizeAppearance({ ...get().characterAppearance, ...updates });
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEYS.CHARACTER, JSON.stringify(next));
      } catch {
        // ignore
      }
    }
    set({ characterAppearance: next });
  },

  selectCharacterPreset: (presetId) => {
    const found = CHARACTER_PRESETS.find((p) => p.id === presetId);
    if (!found) return;
    const next = { ...found.appearance };
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEYS.CHARACTER, JSON.stringify(next));
      } catch {
        // ignore
      }
    }
    set({ characterAppearance: next });
  },

  completeVisitorOnboarding: (name, role, appearance) => {
    const cleanName = name.trim().slice(0, 48) || 'Guest Explorer';
    const cleanRole = role.trim().slice(0, 40) || 'Guest Explorer';
    const cleanAppearance = sanitizeAppearance(appearance);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEYS.VISITOR_NAME, cleanName);
        window.localStorage.setItem(STORAGE_KEYS.VISITOR_ROLE, cleanRole);
        window.localStorage.setItem(STORAGE_KEYS.CHARACTER, JSON.stringify(cleanAppearance));
      } catch {
        // ignore
      }
    }
    set({
      visitorName: cleanName,
      visitorRole: cleanRole,
      characterAppearance: cleanAppearance,
      hasEnteredWorld: true,
      isWardrobeOpen: false,
    });
  },

  setWardrobeOpen: (open) =>
    set((state) => ({
      isWardrobeOpen: open,
      activeModalProjectId: open ? null : state.activeModalProjectId,
      isDirectoryOpen: open ? false : state.isDirectoryOpen,
      isProjectCreatorOpen: open ? false : state.isProjectCreatorOpen,
      isResumeModalOpen: open ? false : state.isResumeModalOpen,
    })),

  setNearWardrobe: (near) => set({ isNearWardrobe: near }),

  // Dynamic & Manually Stored Portfolio Projects
  projects: INITIAL_PROJECTS,
  isProjectCreatorOpen: false,
  editingProjectId: null,

  openProjectCreator: (projectId = null) =>
    set({
      isProjectCreatorOpen: true,
      editingProjectId: projectId,
      activeModalProjectId: null,
      isDirectoryOpen: false,
      isWardrobeOpen: false,
      isResumeModalOpen: false,
    }),

  closeProjectCreator: () =>
    set({
      isProjectCreatorOpen: false,
      editingProjectId: null,
    }),

  saveManualProject: (projectData) => {
    const current = get().projects;
    const existingIndex = projectData.id
      ? current.findIndex((p) => p.id === projectData.id)
      : -1;

    const safeLiveUrl =
      sanitizeHttpUrl(projectData.liveUrl, 'https://github.com/MohammedBilalA')!;
    const safeRepoUrl =
      sanitizeHttpUrl(projectData.repoUrl, 'https://github.com/MohammedBilalA')!;
    const safeAccent = normalizeHexColor(projectData.accentColor, '#38bdf8');
    const safeSecondary = normalizeHexColor(projectData.secondaryColor, '#ec4899');

    if (existingIndex >= 0) {
      const existing = current[existingIndex];
      const updated: PortfolioProject = {
        ...existing,
        ...projectData,
        accentColor: safeAccent,
        secondaryColor: safeSecondary,
        liveUrl: safeLiveUrl,
        repoUrl: safeRepoUrl,
        npcGuide: {
          ...projectData.npcGuide,
          jacketColor: normalizeHexColor(projectData.npcGuide.jacketColor, safeAccent),
          pantsColor: normalizeHexColor(projectData.npcGuide.pantsColor, '#1e293b'),
          hairColor: normalizeHexColor(projectData.npcGuide.hairColor, '#18181b'),
        },
        id: existing.id,
        number: existing.number,
        position: projectData.position ?? existing.position,
        rotationY: projectData.rotationY ?? existing.rotationY,
      };
      const nextList = [...current];
      nextList[existingIndex] = updated;
      saveProjectsToStorage(nextList);
      set({ projects: nextList, isProjectCreatorOpen: false, editingProjectId: null });
      return updated;
    }

    const nextIndex = current.length;
    const numStr = String(nextIndex + 1).padStart(2, '0');
    const roman = ROMAN_NUMERALS[nextIndex] ?? String(nextIndex + 1);
    const slot = findFreePavilionSlot(current);

    const newProject: PortfolioProject = {
      ...projectData,
      accentColor: safeAccent,
      secondaryColor: safeSecondary,
      liveUrl: safeLiveUrl,
      repoUrl: safeRepoUrl,
      npcGuide: {
        ...projectData.npcGuide,
        jacketColor: normalizeHexColor(projectData.npcGuide.jacketColor, safeAccent),
        pantsColor: normalizeHexColor(projectData.npcGuide.pantsColor, '#1e293b'),
        hairColor: normalizeHexColor(projectData.npcGuide.hairColor, '#18181b'),
      },
      id: projectData.id || `custom-proj-${Date.now()}`,
      number: numStr,
      chapterNumber: projectData.chapterNumber || `Chapter ${roman}`,
      chapterTitle: projectData.chapterTitle || projectData.title,
      storyNarrative:
        projectData.storyNarrative ||
        `A custom engineering milestone added to Mohammed Bilal A’s 3D Story World in the ${
          projectData.districtName || slot.districtName
        }.`,
      districtName: projectData.districtName || slot.districtName,
      position: projectData.position ?? slot.position,
      rotationY: projectData.rotationY ?? slot.rotationY,
      isCustom: true,
    };

    const nextList = [...current, newProject];
    saveProjectsToStorage(nextList);
    set({
      projects: nextList,
      isProjectCreatorOpen: false,
      editingProjectId: null,
    });
    return newProject;
  },

  deleteProject: (id) => {
    const state = get();
    const filtered = state.projects
      .filter((p) => p.id !== id)
      .map((proj, idx) => ({
        ...proj,
        number: String(idx + 1).padStart(2, '0'),
      }));
    const finalProjects = filtered.length > 0 ? filtered : PORTFOLIO_PROJECTS;
    const nextVisited = sanitizeVisitedIds(state.visitedProjectIds, finalProjects);

    saveProjectsToStorage(finalProjects);
    saveVisitedToStorage(nextVisited);

    set({
      projects: finalProjects,
      visitedProjectIds: nextVisited,
      storyChapterIndex: Math.min(state.storyChapterIndex, finalProjects.length - 1),
      nearbyProjectId: state.nearbyProjectId === id ? null : state.nearbyProjectId,
      activeModalProjectId: state.activeModalProjectId === id ? null : state.activeModalProjectId,
      editingProjectId: state.editingProjectId === id ? null : state.editingProjectId,
      isProjectCreatorOpen: state.editingProjectId === id ? false : state.isProjectCreatorOpen,
    });
  },

  resetProjectsToDefault: () => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(STORAGE_KEYS.PROJECTS);
      } catch {
        // ignore
      }
    }
    const nextVisited = sanitizeVisitedIds(get().visitedProjectIds, PORTFOLIO_PROJECTS);
    saveVisitedToStorage(nextVisited);
    set({
      projects: PORTFOLIO_PROJECTS,
      visitedProjectIds: nextVisited,
      storyChapterIndex: 0,
      nearbyProjectId: null,
      activeModalProjectId: null,
      editingProjectId: null,
    });
  },

  // Storytelling Quest & Resume Modal State
  storyChapterIndex: 0,
  visitedProjectIds: loadVisitedChapters(INITIAL_PROJECTS),
  isResumeModalOpen: false,

  setStoryChapterIndex: (storyChapterIndex) => set({ storyChapterIndex }),

  markProjectVisited: (id) => {
    const state = get();
    if (!state.projects.some((p) => p.id === id)) return;
    if (state.visitedProjectIds.includes(id)) return;
    const next = [...state.visitedProjectIds, id];
    saveVisitedToStorage(next);
    set({ visitedProjectIds: next });
  },

  teleportToStoryChapter: (index) => {
    const projs = get().projects;
    if (projs.length === 0) return;
    const safeIdx = ((index % projs.length) + projs.length) % projs.length;
    const target = projs[safeIdx];
    const padX = target.position[0] + Math.sin(target.rotationY) * 8.2;
    const padZ = target.position[2] + Math.cos(target.rotationY) * 8.2;
    get().markProjectVisited(target.id);
    set({
      storyChapterIndex: safeIdx,
      drivingVehicleId: null,
      vehicleSpeedKmh: 0,
      isBoosting: false,
      activeModalProjectId: null,
      isDirectoryOpen: false,
      isWardrobeOpen: false,
      isProjectCreatorOpen: false,
      isResumeModalOpen: false,
      teleportRequest: {
        position: [padX, 0.25, padZ],
        lookAt: target.position,
        nonce: Date.now() + Math.random(),
      },
    });
  },

  setResumeModalOpen: (open) =>
    set((state) => ({
      isResumeModalOpen: open,
      activeModalProjectId: open ? null : state.activeModalProjectId,
      isDirectoryOpen: open ? false : state.isDirectoryOpen,
      isWardrobeOpen: open ? false : state.isWardrobeOpen,
      isProjectCreatorOpen: open ? false : state.isProjectCreatorOpen,
    })),

  timeOfDay: 'evening',
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

  setNearbyProjectId: (id) => {
    if (id) {
      get().markProjectVisited(id);
      const idx = get().projects.findIndex((p) => p.id === id);
      if (idx >= 0) {
        set({ nearbyProjectId: id, storyChapterIndex: idx });
        return;
      }
    }
    set({ nearbyProjectId: id });
  },
  openProjectModal: (id) => {
    get().markProjectVisited(id);
    const idx = get().projects.findIndex((p) => p.id === id);
    set({
      activeModalProjectId: id,
      isDirectoryOpen: false,
      isWardrobeOpen: false,
      isProjectCreatorOpen: false,
      isResumeModalOpen: false,
      ...(idx >= 0 ? { storyChapterIndex: idx } : {}),
    });
  },
  closeProjectModal: () => set({ activeModalProjectId: null }),
  setDirectoryOpen: (open) =>
    set((state) => ({
      isDirectoryOpen: open,
      activeModalProjectId: open ? null : state.activeModalProjectId,
      isWardrobeOpen: open ? false : state.isWardrobeOpen,
      isProjectCreatorOpen: open ? false : state.isProjectCreatorOpen,
      isResumeModalOpen: open ? false : state.isResumeModalOpen,
    })),
  setControlsHelpOpen: (open) => set({ isControlsHelpOpen: open }),

  teleportRequest: null,
  requestTeleport: (position, lookAt) =>
    set({
      drivingVehicleId: null,
      vehicleSpeedKmh: 0,
      isBoosting: false,
      activeModalProjectId: null,
      isDirectoryOpen: false,
      isWardrobeOpen: false,
      isProjectCreatorOpen: false,
      isResumeModalOpen: false,
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

    // Spawn 3.6m directly in front of player (-sin(heading), -cos(heading)), safely inside ±96m bounds
    const spawnX = Math.max(-92, Math.min(92, px - Math.sin(heading) * 3.6));
    let spawnZ = Math.max(-92, Math.min(92, pz - Math.cos(heading) * 3.6));

    const onBridge = WORLD_BRIDGES.some((b) => Math.abs(spawnX - b.x) < b.width * 0.42);
    if (!onBridge && spawnZ > 30.2 && spawnZ < 42.8) {
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

if (import.meta.env?.DEV && typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__WORLD_STORE__ = useWorldStore;
}
