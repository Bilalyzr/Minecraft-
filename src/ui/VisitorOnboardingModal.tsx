import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Check,
  Crown,
  FileText,
  Hand,
  MapPin,
  Palette,
  RotateCw,
  Shirt,
  Sparkles,
  UserCheck,
  Volume2,
  VolumeX,
  Wand2,
  X,
} from 'lucide-react';
import {
  ACCESSORY_OPTIONS,
  CHARACTER_PRESETS,
  HAIR_COLOR_SWATCHES,
  HAIR_STYLE_OPTIONS,
  OUTFIT_COLOR_SWATCHES,
  OUTFIT_STYLE_OPTIONS,
  PANTS_COLOR_SWATCHES,
  SKIN_COLOR_SWATCHES,
  WARDROBE_BOUTIQUE_POS,
  WARDROBE_BOUTIQUE_ROT_Y,
  type CharacterAppearance,
} from '../config/character.config';
import { DEVELOPER_PROFILE } from '../config/profile.config';
import { useWorldStore } from '../store/useWorldStore';
import { soundEngine } from '../audio/soundEngine';
import { VoxelCharacterModel } from '../entities/shared/VoxelCharacterModel';

const VISITOR_ROLES = [
  'Tech Recruiter',
  'Hiring Manager',
  'Founder / Client',
  'Software Engineer',
  'Hackathon Judge',
  'Guest Explorer',
];

const ROLE_HINTS: Record<string, { label: string; chapterIdx: number }> = {
  'Tech Recruiter': { label: 'Recommended start: Sasha Infinity Hub & Resume Codex', chapterIdx: 3 },
  'Hiring Manager': { label: 'Recommended start: Industrial Twin & Production AI', chapterIdx: 0 },
  'Founder / Client': { label: 'Recommended start: Full-Stack Delivery & AI Firewall', chapterIdx: 1 },
  'Software Engineer': { label: 'Recommended start: Dual-Layer LLM Firewall & Architecture', chapterIdx: 1 },
  'Hackathon Judge': { label: 'Recommended start: SIF Pitch Fest ’26 Winner Arena', chapterIdx: 5 },
  'Guest Explorer': { label: 'Recommended start: Blossom Plaza Free-Roam & Vehicles', chapterIdx: 0 },
};

class PreviewCanvasFallbackBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function TurntableCharacter({
  appearance,
  yawRef,
  autoSpin,
  isWaving,
  isNight,
}: {
  appearance: CharacterAppearance;
  yawRef: { current: number };
  autoSpin: boolean;
  isWaving: boolean;
  isNight: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (autoSpin) {
      yawRef.current += delta * 0.65;
    }
    if (groupRef.current) {
      groupRef.current.rotation.y = yawRef.current;
    }
  });

  return (
    <>
      <ambientLight intensity={isNight ? 0.85 : 1.05} />
      <directionalLight
        position={[3, 5, 4]}
        intensity={isNight ? 1.5 : 2.1}
        color={isNight ? '#e0f2fe' : '#fde68a'}
      />
      <directionalLight
        position={[-3, 3, -3]}
        intensity={isNight ? 1.25 : 0.9}
        color="#f472b6"
      />
      <pointLight position={[0, 1.5, 2.5]} intensity={1.1} color="#ffffff" />

      {/* Ground Turntable Pedestal */}
      <mesh position={[0, -0.92, 0]}>
        <cylinderGeometry args={[0.72, 0.84, 0.14, 24]} />
        <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.5} />
      </mesh>
      <mesh position={[0, -0.84, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.58, 0.7, 28]} />
        <meshStandardMaterial
          color={appearance.jacketColor}
          emissive={appearance.jacketColor}
          emissiveIntensity={2.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Voxel Character Facing Camera (+Z -> rotate PI relative to model -Z forward) */}
      <group ref={groupRef} position={[0, -0.83, 0]}>
        <group rotation={[0, Math.PI, 0]}>
          <VoxelCharacterModel
            skinColor={appearance.skinColor}
            jacketColor={appearance.jacketColor}
            shirtColor={appearance.shirtColor}
            pantsColor={appearance.pantsColor}
            hairColor={appearance.hairColor}
            shoeColor={appearance.shoeColor}
            hairStyle={appearance.hairStyle}
            outfitStyle={appearance.outfitStyle}
            accessory={appearance.accessory}
            capeColor={appearance.capeColor}
            isWaving={isWaving}
          />
        </group>
      </group>
    </>
  );
}

function VoxelAvatarPreviewCard({
  appearance,
  visitorName,
  visitorRole,
  timeOfDay,
}: {
  appearance: CharacterAppearance;
  visitorName: string;
  visitorRole: string;
  timeOfDay: 'evening' | 'night';
}) {
  const preset = CHARACTER_PRESETS.find((p) => p.id === appearance.presetId);
  const yawRef = useRef(0.32);
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);
  const [autoSpin, setAutoSpin] = useState(true);
  const [isWaving, setIsWaving] = useState(true);

  const staticFallback = (
    <div className="flex h-44 w-full flex-col items-center justify-center gap-2 text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/25 font-display text-2xl font-bold text-slate-950 shadow-lg"
        style={{ backgroundColor: appearance.jacketColor }}
      >
        {(visitorName.trim() || 'G').charAt(0).toUpperCase()}
      </div>
      <span className="text-[11px] text-slate-400">3D Avatar Configured</span>
    </div>
  );

  return (
    <div className="relative flex flex-col items-center justify-between overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-[#090d16] p-3.5 shadow-inner">
      {/* Ambient Radial Aura */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-2xl"
        style={{ backgroundColor: appearance.jacketColor }}
      />

      {/* Visitor Nameplate Preview */}
      <div className="relative z-10 flex max-w-full items-center gap-1.5 rounded-full border border-pink-400/35 bg-slate-950/90 px-3 py-1 text-xs font-semibold text-white shadow-md">
        <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
        <span className="truncate">{visitorName.trim() || 'Guest Explorer'}</span>
        <span className="shrink-0 rounded bg-white/10 px-1.5 py-0.5 font-mono-code text-[9px] text-pink-300">
          {visitorRole}
        </span>
      </div>

      {/* Live 360-Degree Draggable 3D Turntable */}
      <div
        onPointerDown={(e) => {
          draggingRef.current = true;
          lastXRef.current = e.clientX;
          setAutoSpin(false);
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!draggingRef.current) return;
          const dx = e.clientX - lastXRef.current;
          lastXRef.current = e.clientX;
          yawRef.current += dx * 0.015;
        }}
        onPointerUp={() => {
          draggingRef.current = false;
        }}
        onPointerCancel={() => {
          draggingRef.current = false;
        }}
        className="relative z-10 my-1 h-48 w-full cursor-grab touch-none active:cursor-grabbing sm:h-52"
      >
        <PreviewCanvasFallbackBoundary fallback={staticFallback}>
          <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0, 0.35, 3.05], fov: 35 }}
            gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
          >
            <Suspense fallback={null}>
              <TurntableCharacter
                appearance={appearance}
                yawRef={yawRef}
                autoSpin={autoSpin}
                isWaving={isWaving}
                isNight={timeOfDay === 'night'}
              />
            </Suspense>
          </Canvas>
        </PreviewCanvasFallbackBoundary>

        {/* Turntable Quick Controls */}
        <div className="pointer-events-none absolute inset-x-1 bottom-1 flex items-center justify-between">
          <span className="rounded-md bg-slate-950/75 px-2 py-0.5 text-[10px] text-slate-400 backdrop-blur">
            Drag to rotate 360°
          </span>
          <div className="pointer-events-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsWaving((w) => !w)}
              title="Toggle Wave Pose"
              className={`cursor-pointer rounded-lg border px-1.5 py-1 text-[10px] transition ${
                isWaving
                  ? 'border-pink-400/50 bg-pink-500/20 text-pink-200'
                  : 'border-white/10 bg-slate-950/75 text-slate-400 hover:text-white'
              }`}
            >
              <Hand className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => setAutoSpin((s) => !s)}
              title="Toggle Auto-Spin"
              className={`cursor-pointer rounded-lg border px-1.5 py-1 text-[10px] transition ${
                autoSpin
                  ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-200'
                  : 'border-white/10 bg-slate-950/75 text-slate-400 hover:text-white'
              }`}
            >
              <RotateCw className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Selected Archetype Pill */}
      <div className="relative z-10 w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-center">
        <div className="font-display text-xs font-bold text-white">
          {preset?.name ?? 'Custom Explorer Style'}
        </div>
        <div className="mt-0.5 truncate text-[10px] text-slate-400">
          {HAIR_STYLE_OPTIONS.find((h) => h.id === appearance.hairStyle)?.label} ·{' '}
          {OUTFIT_STYLE_OPTIONS.find((o) => o.id === appearance.outfitStyle)?.label} ·{' '}
          {ACCESSORY_OPTIONS.find((a) => a.id === appearance.accessory)?.label}
        </div>
      </div>
    </div>
  );
}

export function VisitorOnboardingModal() {
  const isWorldReady = useWorldStore((s) => s.isWorldReady);
  const hasEnteredWorld = useWorldStore((s) => s.hasEnteredWorld);
  const isReturningVisitor = useWorldStore((s) => s.isReturningVisitor);
  const isWardrobeOpen = useWorldStore((s) => s.isWardrobeOpen);
  const setWardrobeOpen = useWorldStore((s) => s.setWardrobeOpen);

  const storedName = useWorldStore((s) => s.visitorName);
  const storedRole = useWorldStore((s) => s.visitorRole);
  const characterAppearance = useWorldStore((s) => s.characterAppearance);
  const timeOfDay = useWorldStore((s) => s.timeOfDay);
  const soundEnabled = useWorldStore((s) => s.soundEnabled);
  const setCharacterAppearance = useWorldStore((s) => s.setCharacterAppearance);
  const selectCharacterPreset = useWorldStore((s) => s.selectCharacterPreset);
  const completeVisitorOnboarding = useWorldStore((s) => s.completeVisitorOnboarding);
  const requestTeleport = useWorldStore((s) => s.requestTeleport);
  const setResumeModalOpen = useWorldStore((s) => s.setResumeModalOpen);

  const [nameInput, setNameInput] = useState(storedName);
  const [roleInput, setRoleInput] = useState(storedRole || 'Tech Recruiter');
  const [activeTab, setActiveTab] = useState<'presets' | 'style' | 'colors'>('presets');
  const [enterWithSound, setEnterWithSound] = useState(true);

  useEffect(() => {
    setNameInput(storedName);
    setRoleInput(storedRole || 'Tech Recruiter');
  }, [storedName, storedRole, isWardrobeOpen]);

  if (!isWorldReady) return null;
  const isOpen = !hasEnteredWorld || isWardrobeOpen;
  if (!isOpen) return null;

  const isInitialGate = !hasEnteredWorld;
  const roleHint = ROLE_HINTS[roleInput] ?? ROLE_HINTS['Guest Explorer'];

  const handleConfirm = () => {
    const resolvedName = nameInput.trim() || 'Guest Explorer';
    const nextSound = isInitialGate ? enterWithSound : soundEnabled;
    if (nextSound) {
      soundEngine.setEnabled(true);
    }
    completeVisitorOnboarding(resolvedName, roleInput, characterAppearance, nextSound);
    if (nextSound) {
      soundEngine.playChime('teleport');
    }
  };

  const handleQuickEnterGuest = () => {
    const fallbackName = isReturningVisitor && storedName ? storedName : 'Guest Explorer';
    if (enterWithSound) {
      soundEngine.setEnabled(true);
    }
    completeVisitorOnboarding(fallbackName, roleInput, characterAppearance, enterWithSound);
    if (enterWithSound) {
      soundEngine.playChime('teleport');
    }
  };

  const handleRandomize = () => {
    const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    setCharacterAppearance({
      presetId: 'custom',
      skinColor: pick(SKIN_COLOR_SWATCHES),
      hairColor: pick(HAIR_COLOR_SWATCHES),
      hairStyle: pick(HAIR_STYLE_OPTIONS).id,
      outfitStyle: pick(OUTFIT_STYLE_OPTIONS).id,
      jacketColor: pick(OUTFIT_COLOR_SWATCHES),
      shirtColor: pick(['#ffffff', '#f8fafc', '#0f172a', '#fef3c7', '#fdf2f8', '#e2e8f0']),
      pantsColor: pick(PANTS_COLOR_SWATCHES),
      shoeColor: pick(OUTFIT_COLOR_SWATCHES),
      accessory: pick(ACCESSORY_OPTIONS).id,
      capeColor: pick(OUTFIT_COLOR_SWATCHES),
    });
  };

  const teleportToAtelier = () => {
    completeVisitorOnboarding(
      nameInput.trim() || 'Guest Explorer',
      roleInput,
      characterAppearance
    );
    const padX = WARDROBE_BOUTIQUE_POS[0] + Math.sin(WARDROBE_BOUTIQUE_ROT_Y) * 6.4;
    const padZ = WARDROBE_BOUTIQUE_POS[2] + Math.cos(WARDROBE_BOUTIQUE_ROT_Y) * 6.4;
    requestTeleport([padX, 0.25, padZ], WARDROBE_BOUTIQUE_POS);
  };

  const handleOpenResumeDirect = () => {
    completeVisitorOnboarding(
      nameInput.trim() || storedName || 'Guest Explorer',
      roleInput,
      characterAppearance,
      false
    );
    setResumeModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/58 p-3 backdrop-blur-md sm:p-5">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/20 bg-slate-900/92 shadow-2xl">
        {/* Top Gradient Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-pink-500 via-sky-400 to-emerald-400" />

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-5 py-3.5 sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-pink-300">
                <Sparkles className="h-3.5 w-3.5" />
                {isInitialGate ? 'Welcome to the 3D Story World' : 'Style Atelier'}
              </span>
              <span className="hidden text-xs text-slate-400 sm:inline">
                · {DEVELOPER_PROFILE.name}
              </span>
            </div>
            <h2 className="mt-0.5 font-display text-xl font-bold text-white sm:text-2xl">
              {isInitialGate ? 'Select Your Explorer Avatar' : 'Customize Character & Outfit'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {isInitialGate && (
              <button
                type="button"
                onClick={handleQuickEnterGuest}
                className="cursor-pointer rounded-xl border border-emerald-400/35 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/25"
              >
                {isReturningVisitor && storedName
                  ? `Continue as ${storedName} →`
                  : 'Quick Enter as Guest →'}
              </button>
            )}

            {!isInitialGate && (
              <button
                onClick={() => setWardrobeOpen(false)}
                className="cursor-pointer rounded-xl border border-white/15 bg-white/5 p-2 text-slate-300 transition hover:bg-white/15 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-5 overflow-y-auto p-5 md:grid-cols-12">
          {/* Left Column: Live 3D Avatar Preview & Optional Visitor Identity */}
          <div className="flex flex-col gap-3.5 md:col-span-5">
            <VoxelAvatarPreviewCard
              appearance={characterAppearance}
              visitorName={nameInput}
              visitorRole={roleInput}
              timeOfDay={timeOfDay}
            />

            {/* Optional Visitor Name & Role Badge */}
            <div className="rounded-2xl border border-white/12 bg-slate-950/75 p-3.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-pink-300">
                  Explorer Name
                </label>
                <span className="text-[10px] text-slate-500">Optional</span>
              </div>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirm();
                }}
                placeholder="Guest Explorer (press Enter to start)"
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-slate-900 px-3.5 py-2 text-sm font-medium text-white placeholder-slate-500 transition outline-none focus:border-pink-400"
              />

              <label className="mt-3 block text-xs font-medium text-slate-400">
                Visiting As
              </label>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {VISITOR_ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setRoleInput(role)}
                    className={`cursor-pointer rounded-lg border px-2 py-1 text-[10px] font-semibold transition ${
                      roleInput === role
                        ? 'border-pink-400 bg-pink-500/25 text-white'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-emerald-300/90">{roleHint.label}</p>
            </div>
          </div>

          {/* Right Column: Character Archetypes + Outfit & Style Customizer */}
          <div className="flex flex-col justify-between gap-4 md:col-span-7">
            <div>
              {/* Customizer Sub-Navigation Tabs */}
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex rounded-xl border border-white/12 bg-slate-950/80 p-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('presets')}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      activeTab === 'presets'
                        ? 'bg-pink-500 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Crown className="h-3.5 w-3.5" />
                    <span>Archetype</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('style')}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      activeTab === 'style'
                        ? 'bg-sky-400 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Shirt className="h-3.5 w-3.5" />
                    <span>Outfit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('colors')}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      activeTab === 'colors'
                        ? 'bg-emerald-400 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Palette className="h-3.5 w-3.5" />
                    <span>Palette</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleRandomize}
                  className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/15"
                >
                  <Wand2 className="h-3.5 w-3.5 text-amber-300" />
                  <span>Randomize</span>
                </button>
              </div>

              {/* TAB 1: CHARACTER ARCHETYPE PRESETS */}
              {activeTab === 'presets' && (
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {CHARACTER_PRESETS.map((preset) => {
                    const isSelected = characterAppearance.presetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => selectCharacterPreset(preset.id)}
                        className={`flex cursor-pointer flex-col justify-between rounded-2xl border p-3.5 text-left transition ${
                          isSelected
                            ? 'border-pink-400 bg-pink-500/15 shadow-lg'
                            : 'border-white/12 bg-slate-950/65 hover:border-white/30'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className="rounded-md px-2 py-0.5 font-mono-code text-[10px] font-bold uppercase"
                              style={{
                                backgroundColor: `${preset.badgeColor}26`,
                                color: preset.badgeColor,
                              }}
                            >
                              {preset.title}
                            </span>
                            {isSelected && (
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-slate-950">
                                <Check className="h-3 w-3" />
                              </span>
                            )}
                          </div>
                          <div className="mt-1.5 font-display text-sm font-bold text-white">
                            {preset.name}
                          </div>
                          <p className="mt-0.5 text-[11px] leading-snug text-slate-300">
                            {preset.description}
                          </p>
                        </div>

                        <div className="mt-3 flex items-center gap-1.5">
                          {[
                            preset.appearance.jacketColor,
                            preset.appearance.pantsColor,
                            preset.appearance.capeColor,
                            preset.appearance.hairColor,
                          ].map((col, idx) => (
                            <span
                              key={idx}
                              className="h-3.5 w-3.5 rounded-full border border-white/25"
                              style={{ backgroundColor: col }}
                            />
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* TAB 2: HAIRSTYLE / HEADGEAR, OUTFIT CUT & BACK ACCESSORY */}
              {activeTab === 'style' && (
                <div className="space-y-4 rounded-2xl border border-white/12 bg-slate-950/70 p-4">
                  <div>
                    <label className="block font-mono-code text-[11px] font-bold text-sky-300 uppercase">
                      Hairstyle & Headgear
                    </label>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {HAIR_STYLE_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            setCharacterAppearance({ hairStyle: opt.id, presetId: 'custom' })
                          }
                          className={`cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                            characterAppearance.hairStyle === opt.id
                              ? 'border-sky-400 bg-sky-500/20 text-white'
                              : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono-code text-[11px] font-bold text-pink-300 uppercase">
                      Outfit / Jacket Style
                    </label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {OUTFIT_STYLE_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            setCharacterAppearance({ outfitStyle: opt.id, presetId: 'custom' })
                          }
                          className={`cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                            characterAppearance.outfitStyle === opt.id
                              ? 'border-pink-400 bg-pink-500/20 text-white'
                              : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono-code text-[11px] font-bold text-emerald-300 uppercase">
                      Back Gear & Accessory (Drag preview to view!)
                    </label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {ACCESSORY_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            setCharacterAppearance({ accessory: opt.id, presetId: 'custom' })
                          }
                          className={`cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                            characterAppearance.accessory === opt.id
                              ? 'border-emerald-400 bg-emerald-500/20 text-white'
                              : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: COLOR PALETTE SWATCHES */}
              {activeTab === 'colors' && (
                <div className="space-y-3.5 rounded-2xl border border-white/12 bg-slate-950/70 p-4">
                  <div>
                    <label className="block font-mono-code text-[10px] font-bold text-slate-300 uppercase">
                      Jacket / Outer Color
                    </label>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {OUTFIT_COLOR_SWATCHES.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() =>
                            setCharacterAppearance({ jacketColor: color, presetId: 'custom' })
                          }
                          className={`h-6.5 w-6.5 cursor-pointer rounded-full border-2 transition ${
                            characterAppearance.jacketColor === color
                              ? 'scale-115 border-white ring-2 ring-pink-400'
                              : 'border-white/20 hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block font-mono-code text-[10px] font-bold text-slate-300 uppercase">
                        Cape / Visor / Tie Accent
                      </label>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {OUTFIT_COLOR_SWATCHES.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() =>
                              setCharacterAppearance({ capeColor: color, presetId: 'custom' })
                            }
                            className={`h-5.5 w-5.5 cursor-pointer rounded-full border-2 transition ${
                              characterAppearance.capeColor === color
                                ? 'scale-115 border-white ring-2 ring-sky-400'
                                : 'border-white/20 hover:scale-105'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono-code text-[10px] font-bold text-slate-300 uppercase">
                        Inner Shirt / Sneakers
                      </label>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {['#ffffff', '#f8fafc', '#0f172a', '#fef3c7', '#f43f5e', '#38bdf8', '#fbbf24'].map(
                          (color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() =>
                                setCharacterAppearance({
                                  shirtColor: color,
                                  shoeColor: color,
                                  presetId: 'custom',
                                })
                              }
                              className={`h-5.5 w-5.5 cursor-pointer rounded-full border-2 transition ${
                                characterAppearance.shoeColor === color
                                  ? 'scale-115 border-white ring-2 ring-emerald-400'
                                  : 'border-white/20 hover:scale-105'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono-code text-[10px] font-bold text-slate-300 uppercase">
                        Skin Tone
                      </label>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {SKIN_COLOR_SWATCHES.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() =>
                              setCharacterAppearance({ skinColor: color, presetId: 'custom' })
                            }
                            className={`h-5.5 w-5.5 cursor-pointer rounded-full border-2 transition ${
                              characterAppearance.skinColor === color
                                ? 'scale-115 border-white'
                                : 'border-white/20'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono-code text-[10px] font-bold text-slate-300 uppercase">
                        Hair Color
                      </label>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {HAIR_COLOR_SWATCHES.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() =>
                              setCharacterAppearance({ hairColor: color, presetId: 'custom' })
                            }
                            className={`h-5.5 w-5.5 cursor-pointer rounded-full border-2 transition ${
                              characterAppearance.hairColor === color
                                ? 'scale-115 border-white'
                                : 'border-white/20'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono-code text-[10px] font-bold text-slate-300 uppercase">
                      Trousers Color
                    </label>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {PANTS_COLOR_SWATCHES.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() =>
                            setCharacterAppearance({ pantsColor: color, presetId: 'custom' })
                          }
                          className={`h-5.5 w-5.5 cursor-pointer rounded-full border-2 transition ${
                            characterAppearance.pantsColor === color
                              ? 'scale-115 border-white'
                              : 'border-white/20'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pinned Sticky Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-white/10 bg-slate-950/90 px-5 py-3.5 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            {isInitialGate ? (
              <>
                <button
                  type="button"
                  onClick={() => setEnterWithSound((s) => !s)}
                  className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/10"
                >
                  {enterWithSound ? (
                    <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <VolumeX className="h-3.5 w-3.5 text-slate-400" />
                  )}
                  <span>{enterWithSound ? 'Audio On' : 'Muted'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenResumeDirect}
                  className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
                >
                  <FileText className="h-3.5 w-3.5 text-pink-300" />
                  <span>Skip to Resume</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={teleportToAtelier}
                className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-pink-400/35 bg-pink-500/15 px-3.5 py-2 text-xs font-semibold text-pink-200 transition hover:bg-pink-500/25"
              >
                <MapPin className="h-3.5 w-3.5 text-pink-400" />
                <span>Visit 3D Style Atelier</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 px-6 py-2.5 text-sm font-bold text-slate-950 shadow-xl transition hover:brightness-110 sm:flex-none"
          >
            <UserCheck className="h-4 w-4" />
            <span>
              {isInitialGate ? 'Enter 3D Story World →' : 'Save Character & Outfit'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
