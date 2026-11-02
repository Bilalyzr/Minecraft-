import { useEffect, useState } from 'react';
import {
  Check,
  Crown,
  MapPin,
  Palette,
  Shirt,
  Sparkles,
  UserCheck,
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

const VISITOR_ROLES = [
  'Tech Recruiter',
  'Hiring Manager',
  'Founder / Client',
  'Software Engineer',
  'Hackathon Judge',
  'Guest Explorer',
];

function VoxelAvatarPreviewCard({
  appearance,
  visitorName,
  visitorRole,
}: {
  appearance: CharacterAppearance;
  visitorName: string;
  visitorRole: string;
}) {
  const preset = CHARACTER_PRESETS.find((p) => p.id === appearance.presetId);

  return (
    <div className="relative flex flex-col items-center justify-between overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-b from-slate-900 via-slate-950 to-[#090d16] p-4 shadow-inner">
      {/* Ambient Radial Aura */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-2xl"
        style={{ backgroundColor: appearance.jacketColor }}
      />

      {/* Visitor Nameplate Preview */}
      <div className="relative z-10 flex items-center gap-1.5 rounded-full border border-pink-400/40 bg-slate-950/90 px-3 py-1 text-xs font-semibold text-white shadow-md">
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        <span>{visitorName.trim() || 'Your Explorer Name'}</span>
        <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono-code text-[9px] text-pink-300">
          {visitorRole}
        </span>
      </div>

      {/* Crisp Layered SVG Voxel Character Illustration Matching 3D Model */}
      <div className="relative z-10 my-1.5 flex h-40 w-36 items-center justify-center">
        <svg viewBox="0 0 160 200" className="h-full w-full drop-shadow-2xl">
          {/* Back Accessory (Cape / Jetpack / Backpack) */}
          {appearance.accessory === 'cape' && (
            <rect
              x="44"
              y="72"
              width="72"
              height="78"
              rx="8"
              fill={appearance.capeColor}
              opacity="0.9"
            />
          )}
          {appearance.accessory === 'backpack' && (
            <rect
              x="40"
              y="74"
              width="80"
              height="58"
              rx="10"
              fill={appearance.capeColor}
              stroke="#0f172a"
              strokeWidth="2"
            />
          )}
          {appearance.accessory === 'jetpack' && (
            <g>
              <rect x="34" y="72" width="20" height="58" rx="6" fill="#cbd5e1" />
              <rect x="106" y="72" width="20" height="58" rx="6" fill="#cbd5e1" />
              <circle cx="44" cy="132" r="7" fill={appearance.capeColor} />
              <circle cx="116" cy="132" r="7" fill={appearance.capeColor} />
            </g>
          )}

          {/* Left & Right Legs (Pants + Shoes) */}
          <rect x="54" y="130" width="22" height="44" rx="5" fill={appearance.pantsColor} />
          <rect x="84" y="130" width="22" height="44" rx="5" fill={appearance.pantsColor} />
          <rect x="51" y="168" width="26" height="14" rx="5" fill={appearance.shoeColor} />
          <rect x="83" y="168" width="26" height="14" rx="5" fill={appearance.shoeColor} />

          {/* Left & Right Arms (Sleeves + Hands) */}
          <rect x="31" y="74" width="18" height="36" rx="6" fill={appearance.jacketColor} />
          <rect x="32" y="104" width="16" height="22" rx="5" fill={appearance.skinColor} />
          <rect x="111" y="74" width="18" height="36" rx="6" fill={appearance.jacketColor} />
          <rect x="112" y="104" width="16" height="22" rx="5" fill={appearance.skinColor} />

          {/* Torso & Outfit Cut */}
          <rect x="48" y="70" width="64" height="64" rx="8" fill={appearance.jacketColor} />
          {appearance.outfitStyle === 'hoodie' && (
            <rect x="72" y="72" width="16" height="60" rx="3" fill={appearance.shirtColor} />
          )}
          {appearance.outfitStyle === 'blazer' && (
            <g>
              <polygon points="66,70 94,70 80,112" fill={appearance.shirtColor} />
              <rect x="77" y="74" width="6" height="38" rx="2" fill={appearance.capeColor} />
            </g>
          )}
          {appearance.outfitStyle === 'cyber_vest' && (
            <g>
              <rect
                x="68"
                y="84"
                width="24"
                height="24"
                rx="5"
                fill={appearance.capeColor}
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              <rect x="56" y="116" width="48" height="5" rx="2" fill={appearance.capeColor} />
            </g>
          )}
          {appearance.outfitStyle === 'tunic' && (
            <g>
              <rect x="46" y="114" width="68" height="10" rx="3" fill="#78350f" />
              <rect x="73" y="113" width="14" height="12" rx="2" fill="#fbbf24" />
            </g>
          )}

          {/* Head */}
          <rect x="52" y="22" width="56" height="50" rx="10" fill={appearance.skinColor} />

          {/* Base Hair */}
          <rect x="49" y="16" width="62" height="16" rx="7" fill={appearance.hairColor} />
          <rect x="48" y="24" width="9" height="26" rx="4" fill={appearance.hairColor} />
          <rect x="103" y="24" width="9" height="26" rx="4" fill={appearance.hairColor} />

          {/* Hairstyle / Hat Overlays */}
          {appearance.hairStyle === 'spiky' && (
            <g fill={appearance.hairColor}>
              <polygon points="56,18 68,2 76,18" />
              <polygon points="72,18 82,0 92,18" />
              <polygon points="88,18 100,4 106,18" />
            </g>
          )}
          {appearance.hairStyle === 'ponytail' && (
            <g>
              <rect x="108" y="28" width="14" height="34" rx="6" fill={appearance.hairColor} />
              <rect x="105" y="28" width="8" height="8" rx="3" fill={appearance.capeColor} />
            </g>
          )}
          {appearance.hairStyle === 'straw_hat' && (
            <g>
              <ellipse cx="80" cy="20" rx="46" ry="8" fill="#fcd34d" />
              <rect x="56" y="6" width="48" height="14" rx="6" fill="#fde68a" />
              <rect x="56" y="15" width="48" height="4" fill={appearance.capeColor} />
            </g>
          )}
          {appearance.hairStyle === 'crown' && (
            <g>
              <polygon
                points="56,20 56,5 68,13 80,3 92,13 104,5 104,20"
                fill="#fbbf24"
                stroke="#f59e0b"
                strokeWidth="1.5"
              />
              <circle cx="80" cy="14" r="3.5" fill="#38bdf8" />
            </g>
          )}
          {appearance.hairStyle === 'headphones' && (
            <g>
              <path
                d="M 46 38 A 34 28 0 0 1 114 38"
                fill="none"
                stroke="#1e293b"
                strokeWidth="5"
              />
              <rect x="40" y="32" width="11" height="22" rx="4" fill="#0f172a" />
              <rect x="109" y="32" width="11" height="22" rx="4" fill="#0f172a" />
              <rect x="42" y="36" width="4" height="14" rx="2" fill={appearance.capeColor} />
              <rect x="114" y="36" width="4" height="14" rx="2" fill={appearance.capeColor} />
            </g>
          )}

          {/* Eyes or Cyber Visor */}
          {appearance.hairStyle === 'visor' ? (
            <rect
              x="54"
              y="36"
              width="52"
              height="13"
              rx="4"
              fill={appearance.capeColor}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          ) : (
            <g>
              <rect x="63" y="40" width="9" height="9" rx="2" fill="#0f172a" />
              <rect x="88" y="40" width="9" height="9" rx="2" fill="#0f172a" />
              <rect x="64" y="41" width="3.5" height="3.5" fill="#ffffff" />
              <rect x="89" y="41" width="3.5" height="3.5" fill="#ffffff" />
            </g>
          )}
        </svg>
      </div>

      {/* Selected Archetype Pill */}
      <div className="relative z-10 w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-center">
        <div className="font-display text-xs font-bold text-white">
          {preset?.name ?? 'Custom Explorer Style'}
        </div>
        <div className="mt-0.5 text-[10px] text-slate-400">
          {HAIR_STYLE_OPTIONS.find((h) => h.id === appearance.hairStyle)?.label} •{' '}
          {OUTFIT_STYLE_OPTIONS.find((o) => o.id === appearance.outfitStyle)?.label} •{' '}
          {ACCESSORY_OPTIONS.find((a) => a.id === appearance.accessory)?.label}
        </div>
      </div>
    </div>
  );
}

export function VisitorOnboardingModal() {
  const isWorldReady = useWorldStore((s) => s.isWorldReady);
  const hasEnteredWorld = useWorldStore((s) => s.hasEnteredWorld);
  const isWardrobeOpen = useWorldStore((s) => s.isWardrobeOpen);
  const setWardrobeOpen = useWorldStore((s) => s.setWardrobeOpen);

  const storedName = useWorldStore((s) => s.visitorName);
  const storedRole = useWorldStore((s) => s.visitorRole);
  const characterAppearance = useWorldStore((s) => s.characterAppearance);
  const setCharacterAppearance = useWorldStore((s) => s.setCharacterAppearance);
  const selectCharacterPreset = useWorldStore((s) => s.selectCharacterPreset);
  const completeVisitorOnboarding = useWorldStore((s) => s.completeVisitorOnboarding);
  const requestTeleport = useWorldStore((s) => s.requestTeleport);

  const [nameInput, setNameInput] = useState(storedName);
  const [roleInput, setRoleInput] = useState(storedRole || 'Tech Recruiter');
  const [activeTab, setActiveTab] = useState<'presets' | 'style' | 'colors'>('presets');
  const [nameError, setNameError] = useState(false);

  useEffect(() => {
    setNameInput(storedName);
  }, [storedName]);

  if (!isWorldReady) return null;
  const isOpen = !hasEnteredWorld || isWardrobeOpen;
  if (!isOpen) return null;

  const isInitialGate = !hasEnteredWorld;

  const handleConfirm = () => {
    if (!nameInput.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);
    completeVisitorOnboarding(nameInput.trim(), roleInput, characterAppearance);
    soundEngine.playChime('teleport');
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
      pantsColor: pick(PANTS_COLOR_SWATCHES),
      shoeColor: pick(OUTFIT_COLOR_SWATCHES),
      accessory: pick(ACCESSORY_OPTIONS).id,
      capeColor: pick(OUTFIT_COLOR_SWATCHES),
    });
  };

  const teleportToAtelier = () => {
    if (!nameInput.trim()) {
      setNameInput('Guest Explorer');
    }
    completeVisitorOnboarding(
      nameInput.trim() || 'Guest Explorer',
      roleInput,
      characterAppearance
    );
    const padX = WARDROBE_BOUTIQUE_POS[0] + Math.sin(WARDROBE_BOUTIQUE_ROT_Y) * 6.4;
    const padZ = WARDROBE_BOUTIQUE_POS[2] + Math.cos(WARDROBE_BOUTIQUE_ROT_Y) * 6.4;
    requestTeleport([padX, 0.25, padZ], WARDROBE_BOUTIQUE_POS);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/82 p-3 backdrop-blur-xl sm:p-5">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/20 bg-slate-900/95 shadow-2xl">
        {/* Top Gradient Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-pink-500 via-sky-400 to-emerald-400" />

        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-pink-400/40 bg-pink-500/15 px-2.5 py-0.5 font-mono-code text-[10px] font-bold text-pink-300 uppercase">
                <Sparkles className="h-3 w-3" />
                {isInitialGate
                  ? 'VISITOR PORTAL & CHARACTER SELECTION'
                  : 'SAKURA STYLE ATELIER • 3D WARDROBE STUDIO'}
              </span>
              <span className="hidden font-mono-code text-[11px] text-slate-400 sm:inline">
                {DEVELOPER_PROFILE.name} — 3D Storytelling Portfolio
              </span>
            </div>
            <h2 className="mt-1 font-display text-xl font-bold text-white sm:text-2xl">
              {isInitialGate
                ? 'Enter Your Name & Customize Your 3D Explorer'
                : 'Change Character Style, Headgear & Outfit'}
            </h2>
          </div>

          {!isInitialGate && (
            <button
              onClick={() => setWardrobeOpen(false)}
              className="cursor-pointer rounded-xl border border-white/15 bg-white/5 p-2 text-slate-300 transition hover:bg-white/15 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-5 overflow-y-auto p-5 md:grid-cols-12">
          {/* Left Column: Live Avatar Preview & Visitor Identity */}
          <div className="flex flex-col gap-4 md:col-span-5">
            <VoxelAvatarPreviewCard
              appearance={characterAppearance}
              visitorName={nameInput}
              visitorRole={roleInput}
            />

            {/* Visitor Name & Role Inputs */}
            <div className="rounded-2xl border border-white/12 bg-slate-950/75 p-4">
              <label className="block font-mono-code text-[11px] font-bold tracking-wider text-pink-300 uppercase">
                1. Visitor Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => {
                  setNameInput(e.target.value);
                  if (nameError) setNameError(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirm();
                }}
                placeholder="Enter your name to enter the world..."
                className={`mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-sm font-medium text-white placeholder-slate-500 transition outline-none ${
                  nameError
                    ? 'border-rose-500 bg-rose-950/30 ring-2 ring-rose-500/30'
                    : 'border-white/15 bg-slate-900 focus:border-pink-400'
                }`}
              />
              {nameError && (
                <p className="mt-1 text-[11px] font-medium text-rose-400">
                  Please enter your name before entering the 3D portfolio world.
                </p>
              )}

              <label className="mt-3 block font-mono-code text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Visitor Title / Role Badge
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
                    <span>2. Select Character</span>
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
                    <span>3. Outfit & Gear</span>
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
                    <span>4. Colors</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleRandomize}
                  className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/15"
                >
                  <Wand2 className="h-3.5 w-3.5 text-amber-300" />
                  <span>Randomize Look</span>
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

                        {/* Color Swatch Preview Dots */}
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
                      Back Gear & Accessory
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
                <div className="space-y-4 rounded-2xl border border-white/12 bg-slate-950/70 p-4">
                  <div>
                    <label className="block font-mono-code text-[10px] font-bold text-slate-300 uppercase">
                      Outfit / Jacket Primary Color
                    </label>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {OUTFIT_COLOR_SWATCHES.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() =>
                            setCharacterAppearance({ jacketColor: color, presetId: 'custom' })
                          }
                          className={`h-7 w-7 cursor-pointer rounded-full border-2 transition ${
                            characterAppearance.jacketColor === color
                              ? 'scale-115 border-white ring-2 ring-pink-400'
                              : 'border-white/20 hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono-code text-[10px] font-bold text-slate-300 uppercase">
                      Cape, Visor & Sneakers Accent Color
                    </label>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {OUTFIT_COLOR_SWATCHES.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() =>
                            setCharacterAppearance({
                              capeColor: color,
                              shoeColor: color,
                              presetId: 'custom',
                            })
                          }
                          className={`h-7 w-7 cursor-pointer rounded-full border-2 transition ${
                            characterAppearance.capeColor === color
                              ? 'scale-115 border-white ring-2 ring-sky-400'
                              : 'border-white/20 hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono-code text-[10px] font-bold text-slate-300 uppercase">
                        Skin Tone
                      </label>
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        {SKIN_COLOR_SWATCHES.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() =>
                              setCharacterAppearance({ skinColor: color, presetId: 'custom' })
                            }
                            className={`h-6 w-6 cursor-pointer rounded-full border-2 transition ${
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
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        {HAIR_COLOR_SWATCHES.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() =>
                              setCharacterAppearance({ hairColor: color, presetId: 'custom' })
                            }
                            className={`h-6 w-6 cursor-pointer rounded-full border-2 transition ${
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
                      Pants / Trousers Color
                    </label>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {PANTS_COLOR_SWATCHES.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() =>
                            setCharacterAppearance({ pantsColor: color, presetId: 'custom' })
                          }
                          className={`h-6 w-6 cursor-pointer rounded-full border-2 transition ${
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

        {/* Pinned Sticky Footer Callout & Enter World CTA */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-slate-950/90 px-6 py-3.5">
          <button
            type="button"
            onClick={teleportToAtelier}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-pink-400/35 bg-pink-500/15 px-3.5 py-2 text-xs font-semibold text-pink-200 transition hover:bg-pink-500/25"
          >
            <MapPin className="h-3.5 w-3.5 text-pink-400" />
            <span>Visit 3D Style Atelier in World</span>
          </button>

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
