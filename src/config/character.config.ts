export type HairStyleType =
  | 'classic'
  | 'spiky'
  | 'ponytail'
  | 'visor'
  | 'straw_hat'
  | 'crown'
  | 'headphones';

export type OutfitStyleType = 'hoodie' | 'blazer' | 'cyber_vest' | 'tunic';

export type BackAccessoryType = 'cape' | 'backpack' | 'jetpack' | 'none';

export interface CharacterAppearance {
  presetId: string;
  skinColor: string;
  hairColor: string;
  hairStyle: HairStyleType;
  outfitStyle: OutfitStyleType;
  jacketColor: string;
  shirtColor: string;
  pantsColor: string;
  shoeColor: string;
  accessory: BackAccessoryType;
  capeColor: string;
}

export interface CharacterPreset {
  id: string;
  name: string;
  title: string;
  description: string;
  badgeColor: string;
  appearance: CharacterAppearance;
}

export const WARDROBE_BOUTIQUE_POS: [number, number, number] = [-19.5, 0, 1.5];
export const WARDROBE_BOUTIQUE_ROT_Y = Math.PI * 0.42;

export const CHARACTER_PRESETS: CharacterPreset[] = [
  {
    id: 'sakura-storyteller',
    name: 'Sakura Storyteller',
    title: 'Valley Explorer & Chronicler',
    description: 'Sky-blue spring hoodie with a billowing rose explorer cape and classic locks.',
    badgeColor: '#38bdf8',
    appearance: {
      presetId: 'sakura-storyteller',
      skinColor: '#f2c6a0',
      hairColor: '#18181b',
      hairStyle: 'classic',
      outfitStyle: 'hoodie',
      jacketColor: '#0ea5e9',
      shirtColor: '#f8fafc',
      pantsColor: '#1e293b',
      shoeColor: '#f43f5e',
      accessory: 'cape',
      capeColor: '#f43f5e',
    },
  },
  {
    id: 'ai-sentinel',
    name: 'AI Cyber Sentinel',
    title: 'LLM Firewall Specialist',
    description: 'Neon cyber-vest with glowing holographic visor and twin-thruster jetpack.',
    badgeColor: '#a855f7',
    appearance: {
      presetId: 'ai-sentinel',
      skinColor: '#e0ac69',
      hairColor: '#312e81',
      hairStyle: 'visor',
      outfitStyle: 'cyber_vest',
      jacketColor: '#7c3aed',
      shirtColor: '#0f172a',
      pantsColor: '#09090b',
      shoeColor: '#38bdf8',
      accessory: 'jetpack',
      capeColor: '#38bdf8',
    },
  },
  {
    id: 'industrial-architect',
    name: 'Industrial Architect',
    title: 'THOZHIRPORUL Systems Lead',
    description: 'Smart tailored blazer with studio headphones and field engineering pack.',
    badgeColor: '#f59e0b',
    appearance: {
      presetId: 'industrial-architect',
      skinColor: '#d2996c',
      hairColor: '#27272a',
      hairStyle: 'headphones',
      outfitStyle: 'blazer',
      jacketColor: '#d97706',
      shirtColor: '#fef3c7',
      pantsColor: '#1e293b',
      shoeColor: '#f59e0b',
      accessory: 'backpack',
      capeColor: '#b45309',
    },
  },
  {
    id: 'executive-recruiter',
    name: 'Executive Talent Scout',
    title: 'VIP Portfolio Guest',
    description: 'Emerald tailored blazer, golden crown emblem, and royal cape.',
    badgeColor: '#10b981',
    appearance: {
      presetId: 'executive-recruiter',
      skinColor: '#f3cfb3',
      hairColor: '#451a03',
      hairStyle: 'crown',
      outfitStyle: 'blazer',
      jacketColor: '#059669',
      shirtColor: '#ffffff',
      pantsColor: '#0f172a',
      shoeColor: '#10b981',
      accessory: 'cape',
      capeColor: '#fbbf24',
    },
  },
  {
    id: 'blossom-wanderer',
    name: 'Blossom Botanist',
    title: 'Meadow & Lakeside Guide',
    description: 'Sakura tunic with a woven straw sun-hat and field explorer backpack.',
    badgeColor: '#ec4899',
    appearance: {
      presetId: 'blossom-wanderer',
      skinColor: '#ffdbac',
      hairColor: '#78350f',
      hairStyle: 'straw_hat',
      outfitStyle: 'tunic',
      jacketColor: '#ec4899',
      shirtColor: '#fdf2f8',
      pantsColor: '#334155',
      shoeColor: '#f472b6',
      accessory: 'backpack',
      capeColor: '#db2777',
    },
  },
  {
    id: 'fullstack-champion',
    name: 'Hackathon Champion',
    title: 'SIF Pitch Fest Winner',
    description: 'Crimson streetwear hoodie, spiky anime hair, and turbo jetpack.',
    badgeColor: '#f43f5e',
    appearance: {
      presetId: 'fullstack-champion',
      skinColor: '#c68642',
      hairColor: '#09090b',
      hairStyle: 'spiky',
      outfitStyle: 'hoodie',
      jacketColor: '#e11d48',
      shirtColor: '#f8fafc',
      pantsColor: '#18181b',
      shoeColor: '#fbbf24',
      accessory: 'jetpack',
      capeColor: '#fbbf24',
    },
  },
];

export const HAIR_STYLE_OPTIONS: { id: HairStyleType; label: string }[] = [
  { id: 'classic', label: 'Classic Locks' },
  { id: 'spiky', label: 'Spiky Hero' },
  { id: 'ponytail', label: 'Long Ponytail' },
  { id: 'headphones', label: 'Studio Headphones' },
  { id: 'visor', label: 'Cyber Neon Visor' },
  { id: 'straw_hat', label: 'Spring Sun Hat' },
  { id: 'crown', label: 'Champion Crown' },
];

export const OUTFIT_STYLE_OPTIONS: { id: OutfitStyleType; label: string }[] = [
  { id: 'hoodie', label: 'Street Hoodie' },
  { id: 'blazer', label: 'Executive Blazer' },
  { id: 'cyber_vest', label: 'Cyber Tech Vest' },
  { id: 'tunic', label: 'Explorer Tunic' },
];

export const ACCESSORY_OPTIONS: { id: BackAccessoryType; label: string }[] = [
  { id: 'cape', label: 'Explorer Cape' },
  { id: 'jetpack', label: 'Twin Jetpack' },
  { id: 'backpack', label: 'Field Backpack' },
  { id: 'none', label: 'No Back Gear' },
];

export const SKIN_COLOR_SWATCHES = [
  '#ffdbac',
  '#f2c6a0',
  '#e0ac69',
  '#d2996c',
  '#c68642',
  '#8d5524',
];

export const OUTFIT_COLOR_SWATCHES = [
  '#0ea5e9',
  '#7c3aed',
  '#e11d48',
  '#059669',
  '#d97706',
  '#ec4899',
  '#2563eb',
  '#14b8a6',
  '#f97316',
  '#1e293b',
];

export const HAIR_COLOR_SWATCHES = [
  '#09090b',
  '#27272a',
  '#451a03',
  '#78350f',
  '#b45309',
  '#eab308',
  '#e11d48',
  '#38bdf8',
  '#a855f7',
  '#f8fafc',
];

export const PANTS_COLOR_SWATCHES = [
  '#09090b',
  '#1e293b',
  '#334155',
  '#1e1b4b',
  '#3f2a1d',
  '#064e3b',
  '#4c1d95',
  '#e2e8f0',
];
