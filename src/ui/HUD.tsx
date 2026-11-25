import {
  BookOpen,
  Car,
  ChevronRight,
  Compass,
  Edit3,
  ExternalLink,
  FolderGit2,
  FolderPlus,
  Github,
  HelpCircle,
  LayoutGrid,
  Linkedin,
  Mail,
  Moon,
  Shirt,
  Sparkles,
  Sunrise,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { DEVELOPER_PROFILE } from '../config/profile.config';
import { VEHICLE_SPAWNS } from '../config/world.config';
import { useWorldStore, type QualityTier } from '../store/useWorldStore';
import { sanitizeHttpUrl } from '../utils/validation';

const QUALITY_LABELS: Record<QualityTier, string> = {
  ultra: 'Ultra Quality',
  balanced: 'Balanced',
  performance: 'Fast FPS',
};

export function HUD() {
  const projects = useWorldStore((s) => s.projects);
  const visitorName = useWorldStore((s) => s.visitorName);
  const characterAppearance = useWorldStore((s) => s.characterAppearance);

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
  const isNearWardrobe = useWorldStore((s) => s.isNearWardrobe);
  const openProjectModal = useWorldStore((s) => s.openProjectModal);
  const setDirectoryOpen = useWorldStore((s) => s.setDirectoryOpen);
  const setWardrobeOpen = useWorldStore((s) => s.setWardrobeOpen);
  const openProjectCreator = useWorldStore((s) => s.openProjectCreator);
  const setResumeModalOpen = useWorldStore((s) => s.setResumeModalOpen);
  const storyChapterIndex = useWorldStore((s) => s.storyChapterIndex);
  const visitedProjectIds = useWorldStore((s) => s.visitedProjectIds);
  const teleportToStoryChapter = useWorldStore((s) => s.teleportToStoryChapter);

  const isControlsHelpOpen = useWorldStore((s) => s.isControlsHelpOpen);
  const setControlsHelpOpen = useWorldStore((s) => s.setControlsHelpOpen);
  const requestSummonVehicle = useWorldStore((s) => s.requestSummonVehicle);
  const triggerInteract = useWorldStore((s) => s.triggerInteract);

  const activeProject = projects.find((p) => p.id === nearbyProjectId);
  const currentStoryProject = projects[storyChapterIndex % Math.max(1, projects.length)];
  const activeVehicleSpec = VEHICLE_SPAWNS.find((v) => v.id === drivingVehicleId);
  const nearbyVehicleSpec = VEHICLE_SPAWNS.find((v) => v.id === nearbyVehicleId);

  const nextQuality = () => {
    const order: QualityTier[] = ['ultra', 'balanced', 'performance'];
    setQualityTier(order[(order.indexOf(qualityTier) + 1) % order.length]);
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-3.5 sm:p-5">
      {/* Top Bar: Minimal Identity + Compact Story Stepper + Spatial Controls */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Minimal Identity & Resume Pill */}
          <div className="glass-panel pointer-events-auto flex items-center gap-2.5 rounded-2xl px-3 py-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-amber-300 font-display text-sm font-bold text-slate-950">
              {DEVELOPER_PROFILE.name.charAt(0)}
            </div>
            <span className="font-display text-sm font-semibold tracking-tight text-white">
              {DEVELOPER_PROFILE.name}
            </span>
            <button
              onClick={() => setResumeModalOpen(true)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-emerald-300 transition hover:bg-white/18 hover:text-white"
            >
              <BookOpen className="h-3 w-3" />
              <span>Resume</span>
            </button>

            <div className="hidden items-center gap-0.5 border-l border-white/10 pl-1.5 sm:flex">
              <a
                href={DEVELOPER_PROFILE.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub"
                className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <Github className="h-3.5 w-3.5" />
              </a>
              <a
                href={DEVELOPER_PROFILE.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn"
                className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <Linkedin className="h-3.5 w-3.5" />
              </a>
              <a
                href={DEVELOPER_PROFILE.email}
                title={DEVELOPER_PROFILE.emailAddress}
                className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <Mail className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Top-Right Compact Spatial Action Bar */}
          <div className="pointer-events-auto flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setWardrobeOpen(true)}
              title="Customize Avatar & Outfit (C)"
              className="glass-pill flex cursor-pointer items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium text-white transition hover:border-white/25 hover:bg-white/10"
            >
              <span
                className="h-2.5 w-2.5 rounded-full border border-white/40"
                style={{ backgroundColor: characterAppearance.jacketColor }}
              />
              <Shirt className="h-3.5 w-3.5 text-pink-300" />
              <span className="max-w-[96px] truncate">{visitorName || 'Style'}</span>
            </button>

            <button
              onClick={() => openProjectCreator(null)}
              title="Add New Project Pavilion"
              className="glass-pill flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-emerald-300 transition hover:border-white/25 hover:text-white"
            >
              <FolderPlus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Add Project</span>
            </button>

            <button
              onClick={() => setDirectoryOpen(true)}
              title="Story Chapters & Projects"
              className="glass-pill flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-white transition hover:border-white/25 hover:bg-white/10"
            >
              <LayoutGrid className="h-3.5 w-3.5 text-pink-300" />
              <span>Chapters ({projects.length})</span>
            </button>

            <button
              onClick={cycleTimeOfDay}
              title={`Theme: ${timeOfDay === 'evening' ? 'Evening' : 'Night'} — Click to switch`}
              className="glass-pill flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-white transition hover:border-white/25 hover:bg-white/10"
            >
              {timeOfDay === 'evening' ? (
                <>
                  <Sunrise className="h-3.5 w-3.5 text-amber-300" />
                  <span className="hidden md:inline">Evening</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5 text-sky-300" />
                  <span className="hidden md:inline">Night</span>
                </>
              )}
            </button>

            <button
              onClick={nextQuality}
              title={`Graphics: ${QUALITY_LABELS[qualityTier]}`}
              className="glass-pill hidden cursor-pointer items-center justify-center rounded-xl p-2 text-emerald-300 transition hover:border-white/25 hover:text-white sm:flex"
            >
              <Sparkles className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Mute Soundscape' : 'Enable Soundscape'}
              className="glass-pill flex cursor-pointer items-center justify-center rounded-xl p-2 text-slate-200 transition hover:border-white/25 hover:text-white"
            >
              {soundEnabled ? (
                <Volume2 className="h-3.5 w-3.5 text-emerald-300" />
              ) : (
                <VolumeX className="h-3.5 w-3.5 text-slate-400" />
              )}
            </button>

            <button
              onClick={() => setControlsHelpOpen(!isControlsHelpOpen)}
              title="Controls"
              className="glass-pill flex cursor-pointer items-center justify-center rounded-xl p-2 text-slate-200 transition hover:border-white/25 hover:text-white"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Sleek Minimal Story Stepper Pill */}
        {currentStoryProject && (
          <div className="glass-pill pointer-events-auto flex items-center gap-2.5 self-start rounded-xl px-3 py-1 text-xs">
            <span className="font-mono-code text-[11px] font-semibold text-amber-300">
              {String(visitedProjectIds.length).padStart(2, '0')}/
              {String(projects.length).padStart(2, '0')}
            </span>
            <span className="max-w-[200px] truncate font-medium text-white/90 sm:max-w-xs">
              {currentStoryProject.title}
            </span>
            <div className="flex items-center gap-1 border-l border-white/10 pl-2">
              <button
                onClick={() => teleportToStoryChapter(storyChapterIndex)}
                className="cursor-pointer rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-medium text-slate-200 transition hover:bg-white/20 hover:text-white"
              >
                Visit
              </button>
              <button
                onClick={() => teleportToStoryChapter(storyChapterIndex + 1)}
                title="Next Chapter (N)"
                className="flex cursor-pointer items-center gap-0.5 rounded-md bg-pink-500/25 px-2 py-0.5 text-[11px] font-medium text-pink-200 transition hover:bg-pink-500/40"
              >
                <span>Next</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Expandable Controls Cheat-Sheet Card */}
      {isControlsHelpOpen && (
        <div className="glass-panel pointer-events-auto mx-auto max-w-md rounded-2xl p-4 text-xs text-slate-200">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="font-display text-sm font-semibold text-white">Controls</span>
            <button
              onClick={() => setControlsHelpOpen(false)}
              className="cursor-pointer text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <kbd className="rounded bg-white/12 px-1.5 py-0.5 font-mono-code">WASD</kbd> Move /
              Drive
            </div>
            <div>
              <kbd className="rounded bg-white/12 px-1.5 py-0.5 font-mono-code">Drag</kbd> Orbit
              Camera
            </div>
            <div>
              <kbd className="rounded bg-white/12 px-1.5 py-0.5 font-mono-code">C</kbd> Style
              Studio
            </div>
            <div>
              <kbd className="rounded bg-white/12 px-1.5 py-0.5 font-mono-code">N</kbd> Next
              Chapter
            </div>
            <div>
              <kbd className="rounded bg-white/12 px-1.5 py-0.5 font-mono-code">Shift</kbd> Sprint /
              Turbo
            </div>
            <div>
              <kbd className="rounded bg-white/12 px-1.5 py-0.5 font-mono-code">Space</kbd> Jump /
              Drift
            </div>
            <div>
              <kbd className="rounded bg-white/12 px-1.5 py-0.5 font-mono-code">F</kbd> Enter / Exit
              Ride
            </div>
            <div>
              <kbd className="rounded bg-white/12 px-1.5 py-0.5 font-mono-code">1 / 2 / 3</kbd>{' '}
              Summon Ride
            </div>
            <div>
              <kbd className="rounded bg-white/12 px-1.5 py-0.5 font-mono-code">Enter / E</kbd>{' '}
              Inspect Pad
            </div>
            <div>
              <kbd className="rounded bg-white/12 px-1.5 py-0.5 font-mono-code">H / G</kbd> Horn /
              Wave
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar: Compact Vehicle Dock + Active Context Card */}
      <div className="flex flex-col items-center justify-between gap-3 md:flex-row md:items-end">
        {/* Bottom-Left Compact Ride Selector */}
        <div className="glass-pill pointer-events-auto hidden items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs md:flex">
          {!drivingVehicleId ? (
            <>
              <Car className="mr-0.5 h-3.5 w-3.5 text-slate-400" />
              <button
                onClick={() => requestSummonVehicle('rover')}
                title="Summon 4x4 Safari (1)"
                className="cursor-pointer rounded-lg px-2 py-0.5 font-medium text-emerald-300 transition hover:bg-white/10"
              >
                4x4
              </button>
              <button
                onClick={() => requestSummonVehicle('kart')}
                title="Summon GT Roadster (2)"
                className="cursor-pointer rounded-lg px-2 py-0.5 font-medium text-rose-300 transition hover:bg-white/10"
              >
                Roadster
              </button>
              <button
                onClick={() => requestSummonVehicle('scooter')}
                title="Summon Scooter (3)"
                className="cursor-pointer rounded-lg px-2 py-0.5 font-medium text-teal-300 transition hover:bg-white/10"
              >
                Scooter
              </button>
            </>
          ) : (
            <button
              onClick={triggerInteract}
              className="cursor-pointer rounded-lg bg-rose-500/20 px-2.5 py-0.5 font-medium text-rose-200 transition hover:bg-rose-500/35"
            >
              Exit Vehicle (F)
            </button>
          )}
        </div>

        {/* Center Context Dock */}
        <div className="pointer-events-auto flex flex-col items-center gap-2 md:mx-auto">
          {isNearWardrobe && !activeProject && (
            <div className="glass-panel flex items-center gap-4 rounded-2xl px-4 py-3">
              <div>
                <div className="text-[11px] font-medium text-pink-300">Style Atelier</div>
                <h3 className="font-display text-sm font-semibold text-white">
                  Customize Avatar & Outfit
                </h3>
              </div>
              <button
                onClick={() => setWardrobeOpen(true)}
                className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-400 to-violet-400 px-3.5 py-2 text-xs font-semibold text-slate-950 transition hover:brightness-110"
              >
                <Shirt className="h-3.5 w-3.5" />
                <span>Customize</span>
              </button>
            </div>
          )}

          {activeProject && (
            <div className="glass-panel flex w-[92vw] max-w-lg items-center justify-between gap-3 rounded-2xl px-4 py-3">
              <div className="min-w-0">
                <div
                  className="text-[11px] font-medium"
                  style={{ color: activeProject.accentColor }}
                >
                  {activeProject.chapterNumber || `Project ${activeProject.number}`} ·{' '}
                  {activeProject.category}
                </div>
                <h3 className="truncate font-display text-base font-semibold text-white">
                  {activeProject.title}
                </h3>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  onClick={() => openProjectModal(activeProject.id)}
                  className="flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-950 transition hover:brightness-110"
                  style={{ backgroundColor: activeProject.accentColor }}
                >
                  <Compass className="h-3.5 w-3.5" />
                  <span>Explore</span>
                </button>
                <button
                  onClick={() => openProjectCreator(activeProject.id)}
                  className="flex cursor-pointer items-center justify-center rounded-xl border border-white/12 bg-white/8 p-2 text-white transition hover:bg-white/15"
                  title="Edit"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
                {sanitizeHttpUrl(activeProject.liveUrl) && (
                  <a
                    href={sanitizeHttpUrl(activeProject.liveUrl)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center rounded-xl border border-white/12 bg-white/8 p-2 text-white transition hover:bg-white/15"
                    title="Open Link"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                {sanitizeHttpUrl(activeProject.repoUrl) && (
                  <a
                    href={sanitizeHttpUrl(activeProject.repoUrl)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center rounded-xl border border-white/12 bg-white/8 p-2 text-white transition hover:bg-white/15"
                    title="Repository"
                  >
                    <FolderGit2 className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}

          {drivingVehicleId && activeVehicleSpec && (
            <div className="glass-panel flex items-center gap-4 rounded-2xl px-4 py-2">
              <div className="min-w-[120px]">
                <div className="font-display text-xs font-semibold text-white">
                  {activeVehicleSpec.name}
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-150 ${
                      isBoosting
                        ? 'bg-gradient-to-r from-amber-400 to-rose-500'
                        : 'bg-gradient-to-r from-emerald-400 to-sky-400'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.max(6, (vehicleSpeedKmh / 95) * 100))}%`,
                    }}
                  />
                </div>
              </div>
              <div className="flex items-baseline gap-1 border-l border-white/10 pl-3.5">
                <span className="font-mono-code text-xl font-bold text-white">
                  {vehicleSpeedKmh}
                </span>
                <span className="font-mono-code text-[10px] text-slate-400">KM/H</span>
              </div>
              {isBoosting && (
                <span className="flex items-center gap-1 rounded-full bg-amber-400/20 px-2 py-0.5 font-mono-code text-[10px] font-semibold text-amber-300">
                  <Zap className="h-3 w-3" /> Turbo
                </span>
              )}
            </div>
          )}

          {!drivingVehicleId && nearbyVehicleId && !activeProject && !isNearWardrobe && (
            <button
              onClick={triggerInteract}
              className="glass-pill flex cursor-pointer items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-white transition hover:border-white/30"
            >
              <Car className="h-3.5 w-3.5 text-emerald-400" />
              <span>Drive {nearbyVehicleSpec?.name ?? 'Vehicle'} (F)</span>
            </button>
          )}
        </div>

        <div className="hidden w-44 md:block" />
      </div>
    </div>
  );
}
