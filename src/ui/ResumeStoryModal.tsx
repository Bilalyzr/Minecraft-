import {
  Award,
  BookOpen,
  Briefcase,
  Code2,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';
import { DEVELOPER_PROFILE } from '../config/profile.config';
import { useWorldStore } from '../store/useWorldStore';

export function ResumeStoryModal() {
  const isResumeModalOpen = useWorldStore((s) => s.isResumeModalOpen);
  const setResumeModalOpen = useWorldStore((s) => s.setResumeModalOpen);
  const projects = useWorldStore((s) => s.projects);
  const visitedProjectIds = useWorldStore((s) => s.visitedProjectIds);
  const teleportToStoryChapter = useWorldStore((s) => s.teleportToStoryChapter);
  const openProjectModal = useWorldStore((s) => s.openProjectModal);

  if (!isResumeModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-xl sm:p-5">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/20 bg-slate-900/95 shadow-2xl">
        {/* Top Accent Banner */}
        <div className="h-1.5 w-full bg-gradient-to-r from-pink-500 via-amber-400 to-emerald-400" />

        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 px-6 py-4">
          <div>
            <div className="flex items-center gap-2 font-mono-code text-xs font-bold text-pink-400">
              <BookOpen className="h-3.5 w-3.5" />
              <span>OFFICIAL RESUME & STORYTELLING WORLD CODEX</span>
            </div>
            <h2 className="mt-1 font-display text-2xl font-bold text-white">
              {DEVELOPER_PROFILE.name}
            </h2>
            <p className="text-xs font-medium text-slate-300">{DEVELOPER_PROFILE.role}</p>
          </div>

          <button
            onClick={() => setResumeModalOpen(false)}
            className="cursor-pointer rounded-xl border border-white/15 bg-white/5 p-2 text-slate-300 transition hover:bg-white/15 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="space-y-6 overflow-y-auto p-6">
          {/* Contact & Summary Card */}
          <div className="rounded-2xl border border-white/12 bg-slate-950/75 p-4">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <a
                href={DEVELOPER_PROFILE.email}
                className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1 hover:bg-white/10 hover:text-white"
              >
                <Mail className="h-3.5 w-3.5 text-pink-400" />
                <span>{DEVELOPER_PROFILE.emailAddress}</span>
              </a>
              <span className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1">
                <Phone className="h-3.5 w-3.5 text-emerald-400" />
                <span>{DEVELOPER_PROFILE.phone}</span>
              </span>
              <a
                href={DEVELOPER_PROFILE.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-sky-500/15 px-2.5 py-1 font-semibold text-sky-300 hover:bg-sky-500/25"
              >
                LinkedIn: MohammedBilal A
              </a>
              <a
                href={DEVELOPER_PROFILE.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-white/10 px-2.5 py-1 font-semibold text-white hover:bg-white/20"
              >
                GitHub Profile
              </a>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-200 sm:text-sm">
              {DEVELOPER_PROFILE.summary}
            </p>
          </div>

          {/* Interactive 3D World Story Chapters Map */}
          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-mono-code text-xs font-bold tracking-wider text-amber-300 uppercase">
                <Sparkles className="h-4 w-4" />
                <span>Interactive 3D Story World Chapters ({visitedProjectIds.length}/{projects.length} Visited)</span>
              </h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {projects.map((proj, idx) => {
                const isVisited = visitedProjectIds.includes(proj.id);
                return (
                  <div
                    key={proj.id}
                    className="flex flex-col justify-between rounded-2xl border border-white/12 bg-slate-950/75 p-3.5"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="rounded-md px-2 py-0.5 font-mono-code text-[10px] font-bold uppercase"
                          style={{
                            backgroundColor: `${proj.accentColor}26`,
                            color: proj.accentColor,
                          }}
                        >
                          {proj.chapterNumber || `Chapter ${idx + 1}`}
                        </span>
                        {isVisited && (
                          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 font-mono-code text-[9px] font-bold text-emerald-300">
                            ✓ Explored
                          </span>
                        )}
                      </div>
                      <h4 className="mt-1.5 font-display text-sm font-bold text-white">
                        {proj.title}
                      </h4>
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-300">
                        {proj.storyNarrative || proj.summary}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center gap-2 pt-2">
                      <button
                        onClick={() => openProjectModal(proj.id)}
                        className="flex-1 cursor-pointer rounded-lg border border-white/15 bg-white/5 py-1.5 text-[11px] font-semibold text-white hover:bg-white/15"
                      >
                        Read Chapter
                      </button>
                      <button
                        onClick={() => teleportToStoryChapter(idx)}
                        className="flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-950 transition hover:brightness-110"
                        style={{ backgroundColor: proj.accentColor }}
                      >
                        <MapPin className="h-3 w-3" />
                        <span>Teleport 3D</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Professional Experience & Education Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Professional Experience */}
            <div className="rounded-2xl border border-white/12 bg-slate-950/75 p-4">
              <h3 className="flex items-center gap-2 font-mono-code text-xs font-bold text-sky-300 uppercase">
                <Briefcase className="h-4 w-4" />
                <span>Professional Experience</span>
              </h3>
              {DEVELOPER_PROFILE.experience.map((exp, idx) => (
                <div key={idx} className="mt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm font-bold text-white">{exp.role}</span>
                    <span className="font-mono-code text-[10px] text-emerald-400">
                      {exp.period}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-pink-300">{exp.company}</div>
                  <ul className="mt-2 space-y-1.5 text-xs text-slate-300">
                    {exp.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Education */}
            <div className="rounded-2xl border border-white/12 bg-slate-950/75 p-4">
              <h3 className="flex items-center gap-2 font-mono-code text-xs font-bold text-emerald-300 uppercase">
                <GraduationCap className="h-4 w-4" />
                <span>Education</span>
              </h3>
              <div className="mt-3 space-y-3">
                {DEVELOPER_PROFILE.education.map((edu, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/10 bg-slate-900/80 p-3"
                  >
                    <div className="font-display text-xs font-bold text-white sm:text-sm">
                      {edu.degree}
                    </div>
                    <div className="text-xs text-slate-300">{edu.institution}</div>
                    <div className="mt-1 flex items-center justify-between font-mono-code text-[11px]">
                      <span className="font-bold text-emerald-400">{edu.score}</span>
                      <span className="text-slate-400">{edu.period}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Technical Skills Matrix */}
          <div className="rounded-2xl border border-white/12 bg-slate-950/75 p-4">
            <h3 className="flex items-center gap-2 font-mono-code text-xs font-bold text-pink-300 uppercase">
              <Code2 className="h-4 w-4" />
              <span>Technical Skills</span>
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {DEVELOPER_PROFILE.skillCategories.map((cat) => (
                <div
                  key={cat.category}
                  className="rounded-xl border border-white/10 bg-slate-900/70 p-3"
                >
                  <div className="font-mono-code text-[10px] font-bold text-slate-400 uppercase">
                    {cat.category}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {cat.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono-code text-[11px] text-white"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements, Certifications & Languages */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/12 bg-slate-950/75 p-4">
              <h3 className="flex items-center gap-2 font-mono-code text-xs font-bold text-amber-300 uppercase">
                <Trophy className="h-4 w-4" />
                <span>Achievements & Hackathons</span>
              </h3>
              <ul className="mt-2.5 space-y-2 text-xs text-slate-200">
                {DEVELOPER_PROFILE.achievements.map((ach, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <span className="font-medium">{ach}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/12 bg-slate-950/75 p-4">
              <h3 className="flex items-center gap-2 font-mono-code text-xs font-bold text-violet-300 uppercase">
                <Award className="h-4 w-4" />
                <span>Certifications & Spoken Languages</span>
              </h3>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {DEVELOPER_PROFILE.certifications.map((cert) => (
                  <span
                    key={cert}
                    className="rounded-lg border border-violet-400/30 bg-violet-500/15 px-2 py-1 text-[11px] font-medium text-violet-200"
                  >
                    {cert}
                  </span>
                ))}
              </div>
              <div className="mt-3 border-t border-white/10 pt-2.5 text-[11px] text-slate-300">
                <strong className="text-white">Languages: </strong>
                {DEVELOPER_PROFILE.languages
                  .map((l) => `${l.language} (${l.proficiency})`)
                  .join(' • ')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
