import {
  Car,
  Compass,
  ExternalLink,
  FolderGit2,
  Github,
  HelpCircle,
  LayoutGrid,
  Linkedin,
  Mail,
  Moon,
  Sparkles,
  Sun,
  Sunrise,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { DEVELOPER_PROFILE } from '../config/profile.config';
import { PORTFOLIO_PROJECTS } from '../config/projects.config';
import { VEHICLE_SPAWNS } from '../config/world.config';
import { useWorldStore, type QualityTier } from '../store/useWorldStore';

const QUALITY_LABELS: Record<QualityTier, string> = {
  ultra: 'Ultra RTX',
  balanced: 'Balanced',
  performance: 'Fast FPS',
};

export function HUD() {
  const timeOfDay = useWorldStore((s) => s.timeOfDay);
  const cycleTimeOfDay = useWorldStore((s) => s.cycleTimeOfDay);
  const qualityTier = useWorldStore((s) => s.qualityTier);
  const setQualityTier = useWorldStore((s) => s.setQualityTier);
  const soundEnabled = useWorldStore((s) => s.soundEnabled);
  const toggleSound = useWorldStore((s) => s.toggleSound);

  const drivingVehicleId = useWorldStore((s) => s.drivingVehicleId);
  const nearbyVehicleId = useWorldStore((s) => s.nearbyVehicleId);
  const vehicleSpeedKmh = useWorldStore((s) => s.vehicleSpeedKmh);
  const isBoosting = useWorldStore((s) => s.isBoosting);

  const nearbyProjectId = useWorldStore((s) => s.nearbyProjectId);
  const openProjectModal = useWorldStore((s) => s.openProjectModal);
  const setDirectoryOpen = useWorldStore((s) => s.setDirectoryOpen);
  const isControlsHelpOpen = useWorldStore((s) => s.isControlsHelpOpen);
  const setControlsHelpOpen = useWorldStore((s) => s.setControlsHelpOpen);
  const requestSummonVehicle = useWorldStore((s) => s.requestSummonVehicle);
  const triggerInteract = useWorldStore((s) => s.triggerInteract);

  const activeProject = PORTFOLIO_PROJECTS.find((p) => p.id === nearbyProjectId);
  const activeVehicleSpec = VEHICLE_SPAWNS.find((v) => v.id === drivingVehicleId);
  const nearbyVehicleSpec = VEHICLE_SPAWNS.find((v) => v.id === nearbyVehicleId);

  const nextQuality = () => {
    const order: QualityTier[] = ['ultra', 'balanced', 'performance'];
    setQualityTier(order[(order.indexOf(qualityTier) + 1) % order.length]);
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-3.5 sm:p-5">
      {/* Top Bar: Developer Identity + World Atmosphere & Directory Controls */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        {/* Developer Profile Glass Card */}
        <div className="pointer-events-auto flex items-center gap-3.5 rounded-2xl border border-white/15 bg-slate-950/75 px-4 py-2.5 shadow-2xl backdrop-blur-xl">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 via-rose-400 to-emerald-400 font-display text-lg font-bold text-slate-950 shadow-lg">
            {DEVELOPER_PROFILE.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold tracking-tight text-white sm:text-base">
                {DEVELOPER_PROFILE.name}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 font-mono-code text-[10px] font-semibold text-emerald-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                SAKURA RTX
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-300 sm:text-xs">
              {DEVELOPER_PROFILE.role}
            </p>
          </div>

          <div className="ml-1 hidden items-center gap-1.5 border-l border-white/10 pl-3 sm:flex">
            <a
              href={DEVELOPER_PROFILE.githubUrl}
              target="_blank"
              rel="noreferrer"
              title="GitHub Profile"
              className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href={DEVELOPER_PROFILE.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              title="LinkedIn"
              className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href={DEVELOPER_PROFILE.email}
              title="Contact"
              className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Top-Right Action Pills */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          <button
            onClick={() => setDirectoryOpen(true)}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-pink-400/40 bg-gradient-to-r from-pink-500/25 to-violet-500/25 px-3.5 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-xl transition hover:border-pink-300 hover:from-pink-500/40 hover:to-violet-500/40"
          >
            <LayoutGrid className="h-3.5 w-3.5 text-pink-300" />
            <span>All Projects ({PORTFOLIO_PROJECTS.length})</span>
          </button>

          <button
            onClick={cycleTimeOfDay}
            title="Switch Time of Day & Lighting"
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/15 bg-slate-950/75 px-3 py-2 text-xs font-medium text-slate-200 shadow-lg backdrop-blur-xl transition hover:border-white/30 hover:text-white"
          >
            {timeOfDay === 'morning' ? (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-300" />
                <span className="hidden sm:inline">Spring Morning</span>
              </>
            ) : timeOfDay === 'sunset' ? (
              <>
                <Sunrise className="h-3.5 w-3.5 text-orange-400" />
                <span className="hidden sm:inline">Golden Sunset</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-sky-300" />
                <span className="hidden sm:inline">Starlit Night</span>
              </>
            )}
          </button>

          <button
            onClick={nextQuality}
            title="Cycle Graphics Quality Preset"
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/15 bg-slate-950/75 px-3 py-2 text-xs font-medium text-slate-200 shadow-lg backdrop-blur-xl transition hover:border-white/30 hover:text-white"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden md:inline">{QUALITY_LABELS[qualityTier]}</span>
          </button>

          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Spring Soundscape' : 'Enable 3D Spring Soundscape'}
            className="flex cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-slate-950/75 p-2 text-slate-200 shadow-lg backdrop-blur-xl transition hover:border-white/30 hover:text-white"
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <VolumeX className="h-4 w-4 text-slate-400" />
            )}
          </button>

          <button
            onClick={() => setControlsHelpOpen(!isControlsHelpOpen)}
            title="Controls Guide"
            className="flex cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-slate-950/75 p-2 text-slate-200 shadow-lg backdrop-blur-xl transition hover:border-white/30 hover:text-white"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Optional Expandable Controls Cheat-Sheet Card */}
      {isControlsHelpOpen && (
        <div className="pointer-events-auto mx-auto max-w-md rounded-2xl border border-white/20 bg-slate-950/90 p-4 text-xs text-slate-200 shadow-2xl backdrop-blur-xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-display text-sm font-bold text-white">
              World & Vehicle Controls
            </span>
            <button
              onClick={() => setControlsHelpOpen(false)}
              className="cursor-pointer text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <kbd className="rounded bg-white/15 px-1.5 py-0.5 font-mono-code">WASD / Arrows</kbd>{' '}
              Walk or Drive
            </div>
            <div>
              <kbd className="rounded bg-white/15 px-1.5 py-0.5 font-mono-code">Drag Mouse</kbd>{' '}
              360° Orbit Camera
            </div>
            <div>
              <kbd className="rounded bg-white/15 px-1.5 py-0.5 font-mono-code">Shift</kbd> Sprint /
              Turbo Boost
            </div>
            <div>
              <kbd className="rounded bg-white/15 px-1.5 py-0.5 font-mono-code">Space</kbd> Jump /
              Drift Brake
            </div>
            <div>
              <kbd className="rounded bg-white/15 px-1.5 py-0.5 font-mono-code">F</kbd> Enter / Exit
              Vehicle
            </div>
            <div>
              <kbd className="rounded bg-white/15 px-1.5 py-0.5 font-mono-code">1 / 2 / 3</kbd>{' '}
              Summon 4x4 / GT / Scooter
            </div>
            <div>
              <kbd className="rounded bg-white/15 px-1.5 py-0.5 font-mono-code">Enter / E</kbd> Open
              Project Pad
            </div>
            <div>
              <kbd className="rounded bg-white/15 px-1.5 py-0.5 font-mono-code">H / G</kbd> Car Horn
              / Wave Emote
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar: Controls Pill + Center Active Project / Vehicle Telemetry Dock */}
      <div className="flex flex-col items-center justify-between gap-3 md:flex-row md:items-end">
        {/* Bottom-Left Controls & Summon Rover Bar (Hidden on very small mobile to make room for thumbstick) */}
        <div className="pointer-events-auto hidden flex-wrap items-center gap-2 rounded-2xl border border-white/15 bg-slate-950/75 px-3.5 py-2 text-[11px] text-slate-300 shadow-xl backdrop-blur-xl md:flex">
          <span>
            <strong className="font-mono-code text-white">WASD</strong> Move
          </span>
          <span className="text-slate-600">•</span>
          <span>
            <strong className="font-mono-code text-white">Drag</strong> Look
          </span>
          <span className="text-slate-600">•</span>
          <span>
            <strong className="font-mono-code text-white">Shift</strong>{' '}
            {drivingVehicleId ? 'Boost' : 'Sprint'}
          </span>
          <span className="text-slate-600">•</span>
          {!drivingVehicleId ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => requestSummonVehicle('rover')}
                title="Summon Sakura Trail 4x4 Safari [Key 1 or V]"
                className="flex cursor-pointer items-center gap-1 rounded-lg border border-emerald-400/35 bg-emerald-500/15 px-2 py-0.5 font-semibold text-emerald-300 transition hover:bg-emerald-500/30"
              >
                <Car className="h-3 w-3" />
                <span>[1] 4x4</span>
              </button>
              <button
                onClick={() => requestSummonVehicle('kart')}
                title="Summon Blossom GT Roadster [Key 2]"
                className="flex cursor-pointer items-center gap-1 rounded-lg border border-rose-400/35 bg-rose-500/15 px-2 py-0.5 font-semibold text-rose-300 transition hover:bg-rose-500/30"
              >
                <span>[2] GT</span>
              </button>
              <button
                onClick={() => requestSummonVehicle('scooter')}
                title="Summon Meadow Breeze Scooter [Key 3]"
                className="flex cursor-pointer items-center gap-1 rounded-lg border border-teal-400/35 bg-teal-500/15 px-2 py-0.5 font-semibold text-teal-300 transition hover:bg-teal-500/30"
              >
                <span>[3] Scooter</span>
              </button>
            </div>
          ) : (
            <button
              onClick={triggerInteract}
              className="flex cursor-pointer items-center gap-1 rounded-lg border border-rose-400/35 bg-rose-500/15 px-2 py-0.5 font-semibold text-rose-300 transition hover:bg-rose-500/30"
            >
              <span>[F] Exit Vehicle</span>
            </button>
          )}
        </div>

        {/* Center Context Dock: Project Pavilion Proximity Card OR Vehicle Speedometer */}
        <div className="pointer-events-auto flex flex-col items-center gap-2.5 md:mx-auto">
          {activeProject && (
            <div className="flex w-[92vw] max-w-xl flex-col gap-3 rounded-2xl border border-white/20 bg-slate-950/88 p-4 shadow-2xl backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="rounded-md px-2 py-0.5 font-mono-code text-[10px] font-bold uppercase"
                    style={{
                      backgroundColor: `${activeProject.accentColor}26`,
                      color: activeProject.accentColor,
                    }}
                  >
                    #{activeProject.number} • {activeProject.category}
                  </span>
                  <span className="text-[11px] text-slate-400">{activeProject.districtName}</span>
                </div>
                <h3 className="mt-1 font-display text-base font-bold text-white sm:text-lg">
                  {activeProject.title}
                </h3>
                <p className="line-clamp-1 text-xs text-slate-300">{activeProject.subtitle}</p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => openProjectModal(activeProject.id)}
                  className="flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-950 shadow-lg transition hover:brightness-110"
                  style={{ backgroundColor: activeProject.accentColor }}
                >
                  <Compass className="h-3.5 w-3.5" />
                  <span>Case Study [Enter]</span>
                </button>
                <a
                  href={activeProject.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center rounded-xl border border-white/15 bg-white/10 p-2 text-white transition hover:bg-white/20"
                  title="Open Live Demo"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                <a
                  href={activeProject.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center rounded-xl border border-white/15 bg-white/10 p-2 text-white transition hover:bg-white/20"
                  title="GitHub Repository"
                >
                  <FolderGit2 className="h-4 w-4" />
                </a>
              </div>
            </div>
          )}

          {/* Vehicle Digital Speedometer Pill */}
          {drivingVehicleId && activeVehicleSpec && (
            <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-slate-950/85 px-4 py-2.5 shadow-2xl backdrop-blur-xl">
              <div>
                <div className="text-[10px] font-semibold tracking-wider text-emerald-400 uppercase">
                  Driving • [H] Horn • [Space] Drift
                </div>
                <div className="font-display text-xs font-bold text-white">
                  {activeVehicleSpec.name}
                </div>
              </div>
              <div className="flex items-baseline gap-1 border-l border-white/10 pl-4">
                <span className="font-mono-code text-2xl font-bold text-white">
                  {vehicleSpeedKmh}
                </span>
                <span className="font-mono-code text-[10px] text-slate-400">KM/H</span>
              </div>
              {isBoosting && (
                <span className="flex items-center gap-1 rounded-full bg-amber-400/20 px-2.5 py-0.5 font-mono-code text-[10px] font-bold text-amber-300">
                  <Zap className="h-3 w-3" /> TURBO
                </span>
              )}
            </div>
          )}

          {/* Quick Tap Mount Pill When Near Vehicle on Touch/Desktop */}
          {!drivingVehicleId && nearbyVehicleId && !activeProject && (
            <button
              onClick={triggerInteract}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-emerald-400/50 bg-slate-950/85 px-4 py-2 text-xs font-bold text-white shadow-2xl backdrop-blur-xl transition hover:bg-emerald-950/80"
            >
              <Car className="h-4 w-4 text-emerald-400" />
              <span>
                Press [F] or Click to Drive {nearbyVehicleSpec?.name ?? 'Vehicle'}
              </span>
            </button>
          )}
        </div>

        {/* Spacer for Bottom-Right Minimap */}
        <div className="hidden w-44 md:block" />
      </div>
    </div>
  );
}
