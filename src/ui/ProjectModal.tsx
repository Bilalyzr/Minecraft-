import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Edit3,
  ExternalLink,
  FolderGit2,
  FolderPlus,
  MapPin,
  Sparkles,
  X,
} from 'lucide-react';
import type { PortfolioProject } from '../config/projects.config';
import { useWorldStore } from '../store/useWorldStore';

export function ProjectModal() {
  const projects = useWorldStore((s) => s.projects);
  const activeModalProjectId = useWorldStore((s) => s.activeModalProjectId);
  const closeProjectModal = useWorldStore((s) => s.closeProjectModal);
  const openProjectModal = useWorldStore((s) => s.openProjectModal);
  const isDirectoryOpen = useWorldStore((s) => s.isDirectoryOpen);
  const setDirectoryOpen = useWorldStore((s) => s.setDirectoryOpen);
  const openProjectCreator = useWorldStore((s) => s.openProjectCreator);
  const requestTeleport = useWorldStore((s) => s.requestTeleport);
  const visitedProjectIds = useWorldStore((s) => s.visitedProjectIds);

  const projectIndex = projects.findIndex((p) => p.id === activeModalProjectId);
  const project = projectIndex >= 0 ? projects[projectIndex] : null;

  const teleportToPavilion = (proj: PortfolioProject) => {
    const padX = proj.position[0] + Math.sin(proj.rotationY) * 8.2;
    const padZ = proj.position[2] + Math.cos(proj.rotationY) * 8.2;
    requestTeleport([padX, 0.2, padZ], proj.position);
  };

  // 1. All-Projects Quick Directory & Story Chapter Index
  if (isDirectoryOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-lg">
        <div className="relative flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/20 bg-slate-900/95 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-4">
            <div>
              <div className="font-mono-code text-xs font-semibold text-pink-400">
                CHRONICLES OF BILAL // STORY CHAPTERS & 3D PAVILION DIRECTORY
              </div>
              <h2 className="font-display text-xl font-bold text-white">
                All Story Chapters & Projects ({visitedProjectIds.length}/{projects.length} Explored)
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openProjectCreator(null)}
                className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-emerald-400/40 bg-emerald-500/20 px-3.5 py-2 text-xs font-bold text-emerald-200 transition hover:bg-emerald-500/35"
              >
                <FolderPlus className="h-4 w-4 text-emerald-300" />
                <span>+ Add / Store Project</span>
              </button>
              <button
                onClick={() => setDirectoryOpen(false)}
                className="cursor-pointer rounded-xl border border-white/15 bg-white/5 p-2 text-slate-300 transition hover:bg-white/15 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid gap-4 overflow-y-auto p-6 sm:grid-cols-2">
            {projects.map((proj) => {
              const isVisited = visitedProjectIds.includes(proj.id);
              return (
                <div
                  key={proj.id}
                  className="flex flex-col justify-between rounded-2xl border border-white/12 bg-slate-950/70 p-4 transition hover:border-white/30"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="rounded-md px-2 py-0.5 font-mono-code text-[10px] font-bold uppercase"
                        style={{
                          backgroundColor: `${proj.accentColor}24`,
                          color: proj.accentColor,
                        }}
                      >
                        {proj.chapterNumber || `#${proj.number}`} • {proj.category}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isVisited && (
                          <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 font-mono-code text-[9px] font-bold text-emerald-300">
                            ✓ Visited
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">{proj.districtName}</span>
                      </div>
                    </div>

                    <h3 className="mt-2 font-display text-lg font-bold text-white">{proj.title}</h3>
                    {proj.storyNarrative && (
                      <p className="mt-1 text-[11px] italic text-pink-200/90">
                        “{proj.storyNarrative}”
                      </p>
                    )}
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-300">{proj.summary}</p>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {proj.techStack.map((t) => (
                        <span
                          key={t}
                          className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono-code text-[10px] text-slate-200"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3">
                    <button
                      onClick={() => openProjectModal(proj.id)}
                      className="flex-1 cursor-pointer rounded-xl py-2 text-xs font-bold text-slate-950 transition hover:brightness-110"
                      style={{ backgroundColor: proj.accentColor }}
                    >
                      Read Story & Case Study
                    </button>
                    <button
                      onClick={() => teleportToPavilion(proj)}
                      className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
                    >
                      <MapPin className="h-3.5 w-3.5 text-pink-300" />
                      <span>Teleport 3D</span>
                    </button>
                    <button
                      onClick={() => openProjectCreator(proj.id)}
                      title="Edit Project Info"
                      className="cursor-pointer rounded-xl border border-white/15 bg-white/5 p-2 text-slate-300 transition hover:bg-white/15 hover:text-white"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 2. Detailed Single Project Story Chapter & Case Study Modal
  if (!project) return null;

  const prevProj = projects[(projectIndex - 1 + projects.length) % projects.length];
  const nextProj = projects[(projectIndex + 1) % projects.length];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-lg">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/20 bg-slate-900/95 shadow-2xl">
        {/* Top Accent Banner */}
        <div
          className="h-1.5 w-full"
          style={{
            background: `linear-gradient(90deg, ${project.accentColor}, ${project.secondaryColor})`,
          }}
        />

        <div className="flex items-start justify-between border-b border-white/10 px-6 py-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-md px-2.5 py-0.5 font-mono-code text-xs font-bold uppercase"
                style={{
                  backgroundColor: `${project.accentColor}26`,
                  color: project.accentColor,
                }}
              >
                {project.chapterNumber || `PROJECT #${project.number}`} • {project.category}
              </span>
              <span className="text-xs text-slate-400">📍 {project.districtName}</span>
            </div>
            <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
              {project.title}
            </h2>
            <p className="mt-0.5 text-sm text-slate-300">{project.subtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openProjectCreator(project.id)}
              title="Edit / Update Stored Project Information"
              className="flex cursor-pointer items-center gap-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/15 hover:text-white"
            >
              <Edit3 className="h-3.5 w-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Edit Info</span>
            </button>
            <button
              onClick={closeProjectModal}
              className="cursor-pointer rounded-xl border border-white/15 bg-white/5 p-2 text-slate-300 transition hover:bg-white/15 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Story & Case Study Content */}
        <div className="space-y-6 overflow-y-auto p-6">
          {/* Story Chapter Narrative Banner */}
          {project.storyNarrative && (
            <div className="rounded-2xl border border-pink-400/30 bg-gradient-to-r from-pink-500/15 via-violet-500/10 to-sky-500/15 p-4">
              <div className="flex items-center gap-1.5 font-mono-code text-[10px] font-bold tracking-wider text-pink-300 uppercase">
                <BookOpen className="h-3.5 w-3.5" />
                <span>
                  {project.chapterNumber || 'Story Chapter'} —{' '}
                  {project.chapterTitle || project.title}
                </span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-100 sm:text-sm">
                {project.storyNarrative}
              </p>
            </div>
          )}

          {/* Metrics Row */}
          <div className="grid grid-cols-3 gap-3">
            {project.metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-2xl border border-white/10 bg-slate-950/75 p-3.5 text-center"
              >
                <div
                  className="font-display text-xl font-bold sm:text-2xl"
                  style={{ color: project.accentColor }}
                >
                  {m.value}
                </div>
                <div className="mt-0.5 text-xs text-slate-400">{m.label}</div>
              </div>
            ))}
          </div>

          {/* Executive Summary */}
          <div>
            <h4 className="font-mono-code text-xs font-bold tracking-wider text-slate-400 uppercase">
              System Overview
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">{project.summary}</p>
          </div>

          {/* Engineering Highlights */}
          <div>
            <h4 className="font-mono-code text-xs font-bold tracking-wider text-slate-400 uppercase">
              Key Engineering & Architecture Highlights
            </h4>
            <ul className="mt-2.5 space-y-2.5">
              {project.highlights.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-200">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ color: project.accentColor }}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 className="font-mono-code text-xs font-bold tracking-wider text-slate-400 uppercase">
              Production Tech Stack
            </h4>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-xl border border-white/15 bg-slate-950/80 px-3 py-1.5 font-mono-code text-xs font-medium text-white"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Pavilion Specialist Quote */}
          <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-pink-400" />
            <div>
              <div className="text-xs font-bold text-white">
                {project.npcGuide.name}{' '}
                <span className="font-normal text-slate-400">— {project.npcGuide.role}</span>
              </div>
              <p className="mt-1 text-xs italic text-slate-300">“{project.npcGuide.dialogue}”</p>
            </div>
          </div>
        </div>

        {/* Footer Actions & Prev/Next Chapter Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-slate-950/80 px-6 py-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => openProjectModal(prevProj.id)}
              className="flex cursor-pointer items-center gap-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/15"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>#{prevProj.number}</span>
            </button>
            <button
              onClick={() => openProjectModal(nextProj.id)}
              className="flex cursor-pointer items-center gap-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/15"
            >
              <span>#{nextProj.number}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => teleportToPavilion(project)}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              <MapPin className="h-3.5 w-3.5 text-pink-300" />
              <span>View 3D Pavilion</span>
            </button>
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              <FolderGit2 className="h-3.5 w-3.5" />
              <span>Source Code</span>
            </a>
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-slate-950 shadow-lg transition hover:brightness-110"
              style={{ backgroundColor: project.accentColor }}
            >
              <span>Launch Link</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
