import {
  ACCESSORY_OPTIONS,
  CHARACTER_PRESETS,
  HAIR_STYLE_OPTIONS,
  OUTFIT_STYLE_OPTIONS,
  type BackAccessoryType,
  type CharacterAppearance,
  type HairStyleType,
  type OutfitStyleType,
} from '../config/character.config';
import {
  PORTFOLIO_PROJECTS,
  type PavilionStyle,
  type PortfolioProject,
  type ProjectCategory,
  type ProjectMetric,
  type ScreenVisualType,
} from '../config/projects.config';

const VALID_HAIR_STYLES = new Set<HairStyleType>(HAIR_STYLE_OPTIONS.map((o) => o.id));
const VALID_OUTFIT_STYLES = new Set<OutfitStyleType>(OUTFIT_STYLE_OPTIONS.map((o) => o.id));
const VALID_ACCESSORIES = new Set<BackAccessoryType>(ACCESSORY_OPTIONS.map((o) => o.id));
const VALID_CATEGORIES = new Set<ProjectCategory>([
  'AI & Agents',
  'Cloud & Systems',
  '3D & Creative',
  'FinTech',
  'Spatial IoT',
  'Open Source',
]);
const VALID_PAVILION_STYLES = new Set<PavilionStyle>([
  'conservatory',
  'redstone_tower',
  'timber_hall',
  'marble_citadel',
  'lakeside_deck',
  'sakura_pagoda',
]);
const VALID_SCREEN_TYPES = new Set<ScreenVisualType>([
  'neural_graph',
  'telemetry_matrix',
  'shader_canvas',
  'orderbook_pulse',
  'spatial_map',
  'voxel_engine',
]);

/**
 * Validates and normalizes an external HTTP/HTTPS URL.
 * Rejects dangerous URI schemes such as javascript:, data:, vbscript:, file:, etc.
 */
export function sanitizeHttpUrl(rawUrl: unknown, fallback: string | null = null): string | null {
  if (typeof rawUrl !== 'string') return fallback;
  const trimmed = rawUrl.trim();
  if (!trimmed) return fallback;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    // Reject relative or unparseable URLs
  }
  return fallback;
}

/**
 * Normalizes a CSS hex color string to strict 6-digit #rrggbb format.
 * Ensures Canvas2D gradient alpha suffixing (`#rrggbbaa`) never throws SyntaxError.
 */
export function normalizeHexColor(rawColor: unknown, fallback = '#38bdf8'): string {
  if (typeof rawColor !== 'string') return fallback;
  const trimmed = rawColor.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const r = trimmed[1];
    const g = trimmed[2];
    const b = trimmed[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return fallback;
}

/**
 * Returns an 8-digit hex color with alpha suffix after validating the base color.
 */
export function hexWithAlpha(rawColor: unknown, alphaHex: string, fallback = '#38bdf8'): string {
  const safeHex = normalizeHexColor(rawColor, fallback);
  const safeAlpha = /^[0-9a-fA-F]{2}$/.test(alphaHex) ? alphaHex : 'ff';
  return `${safeHex}${safeAlpha}`;
}

function safeString(val: unknown, fallback: string, maxLen = 200): string {
  if (typeof val !== 'string') return fallback;
  const trimmed = val.trim();
  return trimmed ? trimmed.slice(0, maxLen) : fallback;
}

export function sanitizeAppearance(raw: unknown): CharacterAppearance {
  const base = CHARACTER_PRESETS[0].appearance;
  if (!raw || typeof raw !== 'object') return { ...base };
  const obj = raw as Record<string, unknown>;

  return {
    presetId: safeString(obj.presetId, base.presetId, 64),
    skinColor: normalizeHexColor(obj.skinColor, base.skinColor),
    hairColor: normalizeHexColor(obj.hairColor, base.hairColor),
    hairStyle: VALID_HAIR_STYLES.has(obj.hairStyle as HairStyleType)
      ? (obj.hairStyle as HairStyleType)
      : base.hairStyle,
    outfitStyle: VALID_OUTFIT_STYLES.has(obj.outfitStyle as OutfitStyleType)
      ? (obj.outfitStyle as OutfitStyleType)
      : base.outfitStyle,
    jacketColor: normalizeHexColor(obj.jacketColor, base.jacketColor),
    shirtColor: normalizeHexColor(obj.shirtColor, base.shirtColor),
    pantsColor: normalizeHexColor(obj.pantsColor, base.pantsColor),
    shoeColor: normalizeHexColor(obj.shoeColor, base.shoeColor),
    accessory: VALID_ACCESSORIES.has(obj.accessory as BackAccessoryType)
      ? (obj.accessory as BackAccessoryType)
      : base.accessory,
    capeColor: normalizeHexColor(obj.capeColor, base.capeColor),
  };
}

function isValidPositionTuple(pos: unknown): pos is [number, number, number] {
  return (
    Array.isArray(pos) &&
    pos.length === 3 &&
    pos.every((n) => typeof n === 'number' && Number.isFinite(n) && Math.abs(n) <= 120)
  );
}

function sanitizeMetrics(raw: unknown): ProjectMetric[] {
  if (!Array.isArray(raw)) {
    return [
      { label: 'Architecture', value: 'Full-Stack' },
      { label: 'Engine', value: 'AI / Web' },
      { label: 'Status', value: 'Live 3D' },
    ];
  }
  const cleaned = raw
    .slice(0, 3)
    .filter((m): m is Record<string, unknown> => Boolean(m && typeof m === 'object'))
    .map((m) => ({
      label: safeString(m.label, 'Metric', 32),
      value: safeString(m.value, 'N/A', 24),
    }));
  return cleaned.length > 0
    ? cleaned
    : [{ label: 'Status', value: 'Active' }];
}

export function sanitizeProject(raw: unknown, index: number): PortfolioProject | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;

  const id = safeString(obj.id, '', 80);
  const title = safeString(obj.title, '', 100);
  if (!id || !title || !isValidPositionTuple(obj.position)) {
    return null;
  }

  const fallbackProj = PORTFOLIO_PROJECTS[0];
  const npcRaw =
    obj.npcGuide && typeof obj.npcGuide === 'object'
      ? (obj.npcGuide as Record<string, unknown>)
      : {};

  const techStack = Array.isArray(obj.techStack)
    ? obj.techStack
        .filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
        .map((t) => t.trim().slice(0, 32))
        .slice(0, 12)
    : ['React.js', 'TypeScript'];

  const highlights = Array.isArray(obj.highlights)
    ? obj.highlights
        .filter((h): h is string => typeof h === 'string' && h.trim().length > 0)
        .map((h) => h.trim().slice(0, 280))
        .slice(0, 8)
    : ['Engineered full-stack system and interactive 3D story pavilion.'];

  const accentColor = normalizeHexColor(obj.accentColor, '#38bdf8');
  const secondaryColor = normalizeHexColor(obj.secondaryColor, '#ec4899');
  const rotationY =
    typeof obj.rotationY === 'number' && Number.isFinite(obj.rotationY) ? obj.rotationY : 0;

  return {
    id,
    number: String(index + 1).padStart(2, '0'),
    chapterNumber:
      typeof obj.chapterNumber === 'string' && obj.chapterNumber.trim()
        ? obj.chapterNumber.trim().slice(0, 32)
        : undefined,
    chapterTitle:
      typeof obj.chapterTitle === 'string' && obj.chapterTitle.trim()
        ? obj.chapterTitle.trim().slice(0, 100)
        : undefined,
    storyNarrative:
      typeof obj.storyNarrative === 'string' && obj.storyNarrative.trim()
        ? obj.storyNarrative.trim().slice(0, 600)
        : undefined,
    title,
    subtitle: safeString(obj.subtitle, 'Interactive 3D Portfolio Showcase', 140),
    category: VALID_CATEGORIES.has(obj.category as ProjectCategory)
      ? (obj.category as ProjectCategory)
      : 'AI & Agents',
    districtName: safeString(obj.districtName, 'Blossom Innovation District', 80),
    position: [obj.position[0], obj.position[1], obj.position[2]],
    rotationY,
    architectureStyle: VALID_PAVILION_STYLES.has(obj.architectureStyle as PavilionStyle)
      ? (obj.architectureStyle as PavilionStyle)
      : 'sakura_pagoda',
    accentColor,
    secondaryColor,
    techStack: techStack.length > 0 ? techStack : ['React.js'],
    metrics: sanitizeMetrics(obj.metrics),
    summary: safeString(obj.summary, fallbackProj.summary, 800),
    highlights: highlights.length > 0 ? highlights : fallbackProj.highlights,
    liveUrl: sanitizeHttpUrl(obj.liveUrl, 'https://github.com/MohammedBilalA')!,
    repoUrl: sanitizeHttpUrl(obj.repoUrl, 'https://github.com/MohammedBilalA')!,
    screenVisualType: VALID_SCREEN_TYPES.has(obj.screenVisualType as ScreenVisualType)
      ? (obj.screenVisualType as ScreenVisualType)
      : 'neural_graph',
    npcGuide: {
      name: safeString(npcRaw.name, 'Project Guide', 60),
      role: safeString(npcRaw.role, 'Systems Specialist', 60),
      jacketColor: normalizeHexColor(npcRaw.jacketColor, accentColor),
      pantsColor: normalizeHexColor(npcRaw.pantsColor, '#1e293b'),
      hairColor: normalizeHexColor(npcRaw.hairColor, '#18181b'),
      dialogue: safeString(
        npcRaw.dialogue,
        `Welcome to ${title}! Step onto the glowing pad to inspect the architecture.`,
        360
      ),
    },
    isCustom: Boolean(obj.isCustom),
  };
}

export function sanitizeProjectList(raw: unknown): PortfolioProject[] {
  if (!Array.isArray(raw)) return PORTFOLIO_PROJECTS;
  const seenIds = new Set<string>();
  const valid: PortfolioProject[] = [];

  for (const item of raw.slice(0, 24)) {
    const cleaned = sanitizeProject(item, valid.length);
    if (cleaned && !seenIds.has(cleaned.id)) {
      seenIds.add(cleaned.id);
      valid.push(cleaned);
    }
  }
  return valid.length > 0 ? valid : PORTFOLIO_PROJECTS;
}

export function sanitizeVisitedIds(raw: unknown, validProjects: PortfolioProject[]): string[] {
  if (!Array.isArray(raw)) return [];
  const validSet = new Set(validProjects.map((p) => p.id));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of raw) {
    if (typeof id === 'string' && validSet.has(id) && !seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  }
  return out;
}
