export type VehicleId = 'rover' | 'kart' | 'scooter';

export interface BridgeSpec {
  id: string;
  x: number;
  width: number;
  zStart: number;
  zEnd: number;
  deckHeight: number;
}

export interface VehicleSpawnSpec {
  id: VehicleId;
  name: string;
  subtitle: string;
  position: [number, number, number];
  rotationY: number;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  interiorColor: string;
  maxSpeed: number;
  acceleration: number;
  boostMultiplier: number;
}

export interface AmbientNPCSpec {
  id: string;
  name: string;
  role: string;
  jacketColor: string;
  pantsColor: string;
  hairColor: string;
  skinColor: string;
  speed: number;
  dialogue: string;
  waypoints: [number, number][];
}

export const RIVER_Z_MIN = 31.5;
export const RIVER_Z_MAX = 41.5;
export const RIVER_CENTER_Z = 36.5;
export const RIVER_WATER_Y = -0.18;
export const RIVER_BED_Y = -0.68;
export const WORLD_HALF_EXTENT = 132;

export const WORLD_BRIDGES: BridgeSpec[] = [
  {
    id: 'central-blossom-bridge',
    x: 0,
    width: 9.6,
    zStart: 27.0,
    zEnd: 46.0,
    deckHeight: 0.68,
  },
  {
    id: 'west-citadel-bridge',
    x: -34,
    width: 7.6,
    zStart: 27.0,
    zEnd: 46.0,
    deckHeight: 0.65,
  },
  {
    id: 'east-timber-bridge',
    x: 34,
    width: 7.6,
    zStart: 27.0,
    zEnd: 46.0,
    deckHeight: 0.65,
  },
];

export const VEHICLE_SPAWNS: VehicleSpawnSpec[] = [
  {
    id: 'rover',
    name: 'Sakura Trail 4x4 Safari',
    subtitle: 'Open-Top Spring Field Cruiser • All-Terrain Suspension',
    position: [10.8, 0.9, 8.8],
    rotationY: -Math.PI * 0.22,
    primaryColor: '#4d8b63',
    secondaryColor: '#f4f7f0',
    accentColor: '#d97706',
    interiorColor: '#7c4a2d',
    maxSpeed: 24,
    acceleration: 28,
    boostMultiplier: 1.48,
  },
  {
    id: 'kart',
    name: 'Blossom GT Roadster',
    subtitle: 'Spring Convertible Sports Tourer • Twin Thrusters',
    position: [-10.8, 0.85, 8.8],
    rotationY: Math.PI * 0.22,
    primaryColor: '#e11d48',
    secondaryColor: '#fff1f2',
    accentColor: '#fbbf24',
    interiorColor: '#3f2a1d',
    maxSpeed: 31,
    acceleration: 35,
    boostMultiplier: 1.55,
  },
  {
    id: 'scooter',
    name: 'Meadow Breeze Scooter',
    subtitle: 'Nimble Spring Electric Moped • Flower Basket',
    position: [6.8, 0.78, 13.8],
    rotationY: -Math.PI * 0.12,
    primaryColor: '#2dd4bf',
    secondaryColor: '#fefce8',
    accentColor: '#f472b6',
    interiorColor: '#854d27',
    maxSpeed: 20,
    acceleration: 32,
    boostMultiplier: 1.4,
  },
];

export const AMBIENT_STROLL_NPCS: AmbientNPCSpec[] = [
  {
    id: 'visitor-1',
    name: 'Maya Lin',
    role: 'Story Chronicler',
    jacketColor: '#ec4899',
    pantsColor: '#1e293b',
    hairColor: '#18181b',
    skinColor: '#f3cfb3',
    speed: 2.2,
    dialogue:
      'Welcome to Mohammed Bilal A’s 3D Story World! Visit the Style Atelier just west of the plaza or press [C] anytime to change your outfit & character!',
    waypoints: [
      [-12, 2],
      [-24, -14],
      [-12, -20],
      [12, -20],
      [24, -14],
      [12, 2],
    ],
  },
  {
    id: 'visitor-2',
    name: 'Devon Brooks',
    role: 'Tech Recruiter',
    jacketColor: '#6366f1',
    pantsColor: '#0f172a',
    hairColor: '#451a03',
    skinColor: '#c68642',
    speed: 2.35,
    dialogue:
      'You can follow all 6 Story Chapters of Bilal’s resume—or click "+ Add Project" in the top bar to manually store and spawn new 3D project pavilions!',
    waypoints: [
      [16, 15],
      [34, 15],
      [34, 25],
      [2, 25],
      [2, 16],
    ],
  },
  {
    id: 'visitor-3',
    name: 'Hana Mori',
    role: 'Wardrobe Stylist',
    jacketColor: '#22c55e',
    pantsColor: '#334155',
    hairColor: '#27272a',
    skinColor: '#f5d0b5',
    speed: 2.1,
    dialogue:
      'Step onto the glowing pad at the Sakura Style Atelier on the west courtyard to try on Cyber Visors, Blazers, Crowns, and Jetpacks!',
    waypoints: [
      [-14, 15],
      [-34, 15],
      [-34, 25],
      [-2, 25],
      [-2, 16],
    ],
  },
  {
    id: 'visitor-4',
    name: 'Lucas Weber',
    role: 'AI Systems Peer',
    jacketColor: '#f97316',
    pantsColor: '#1f2937',
    hairColor: '#d97706',
    skinColor: '#f1c27d',
    speed: 2.45,
    dialogue:
      'Have you seen Bilal’s Dual-Layer AI Firewall and THOZHIRPORUL Industrial Twin? Press [F] near any vehicle to drive between chapters!',
    waypoints: [
      [2, 24],
      [2, 48],
      [18, 49],
      [-18, 49],
      [-2, 48],
      [-2, 24],
    ],
  },
  {
    id: 'visitor-5',
    name: 'Zara Patel',
    role: 'Hackathon Judge',
    jacketColor: '#14b8a6',
    pantsColor: '#1e1b4b',
    hairColor: '#09090b',
    skinColor: '#d2996c',
    speed: 2.3,
    dialogue:
      'Cross the southern bridge to visit Sona Tech Academic Citadel (8.3 MCA CGPA) and the SIF Pitch Fest 2026 Winner Pagoda!',
    waypoints: [
      [-34, 47],
      [-16, 51],
      [16, 51],
      [34, 47],
      [34, 26],
      [-34, 26],
    ],
  },
  {
    id: 'visitor-6',
    name: 'Noah Lindqvist',
    role: 'Full-Stack Mentor',
    jacketColor: '#8b5cf6',
    pantsColor: '#27272a',
    hairColor: '#fde047',
    skinColor: '#ffdbac',
    speed: 2.35,
    dialogue:
      'Press [N] or click the Story Quest bar to fast-travel through every chapter of Mohammed Bilal A’s engineering journey!',
    waypoints: [
      [-26, -18],
      [0, -25],
      [26, -18],
      [36, 2],
      [16, -2],
      [-14, -2],
      [-36, 2],
    ],
  },
];
