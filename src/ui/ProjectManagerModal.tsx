import { useEffect, useState } from 'react';
import {
  FolderPlus,
  MapPin,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import type {
  PavilionStyle,
  ProjectCategory,
  ScreenVisualType,
} from '../config/projects.config';
import { useWorldStore } from '../store/useWorldStore';
import { soundEngine } from '../audio/soundEngine';

const CATEGORIES: ProjectCategory[] = [
  'AI & Agents',
  'Cloud & Systems',
  '3D & Creative',
  'FinTech',
  'Spatial IoT',
  'Open Source',
];

const ARCHITECTURE_STYLES: { id: PavilionStyle; label: string }[] = [
  { id: 'conservatory', label: 'Glass Conservatory' },
  { id: 'redstone_tower', label: 'Redstone Spire' },
  { id: 'timber_hall', label: 'Sakura Timber Hall' },
  { id: 'marble_citadel', label: 'Marble Citadel' },
  { id: 'lakeside_deck', label: 'Lakeside Deck' },
  { id: 'sakura_pagoda', label: 'Sakura Pagoda' },
];

const SCREEN_VISUAL_TYPES: { id: ScreenVisualType; label: string }[] = [
  { id: 'neural_graph', label: 'Neural Network DAG' },
  { id: 'telemetry_matrix', label: 'Live Telemetry Bars' },
  { id: 'spatial_map', label: '3D Radar & GIS Sweep' },
  { id: 'orderbook_pulse', label: 'FinTech Risk Pulse' },
  { id: 'shader_canvas', label: 'Orbital Shader Rings' },
  { id: 'voxel_engine', label: 'Voxel Core Scanner' },
];

const ACCENT_PRESETS = [
  '#38bdf8',
  '#fb7185',
  '#10b981',
  '#f59e0b',
  '#a855f7',
  '#ec4899',
  '#06b6d4',
  '#22c55e',
];

export function ProjectManagerModal() {
  const isProjectCreatorOpen = useWorldStore((s) => s.isProjectCreatorOpen);
  const editingProjectId = useWorldStore((s) => s.editingProjectId);
  const closeProjectCreator = useWorldStore((s) => s.closeProjectCreator);
  const openProjectCreator = useWorldStore((s) => s.openProjectCreator);
  const projects = useWorldStore((s) => s.projects);
  const saveManualProject = useWorldStore((s) => s.saveManualProject);
  const deleteProject = useWorldStore((s) => s.deleteProject);
  const resetProjectsToDefault = useWorldStore((s) => s.resetProjectsToDefault);
  const requestTeleport = useWorldStore((s) => s.requestTeleport);

  const editingProject = projects.find((p) => p.id === editingProjectId) ?? null;

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('AI & Agents');
  const [chapterTitle, setChapterTitle] = useState('');
  const [storyNarrative, setStoryNarrative] = useState('');
  const [districtName, setDistrictName] = useState('');
  const [architectureStyle, setArchitectureStyle] = useState<PavilionStyle>('conservatory');
  const [screenVisualType, setScreenVisualType] = useState<ScreenVisualType>('neural_graph');
  const [accentColor, setAccentColor] = useState('#38bdf8');
  const [secondaryColor, setSecondaryColor] = useState('#a855f7');
  const [techStackInput, setTechStackInput] = useState('React.js, Node.js, Python, PostgreSQL, Docker');
  const [summary, setSummary] = useState('');
  const [highlightsInput, setHighlightsInput] = useState('');
  const [liveUrl, setLiveUrl] = useState('https://github.com/MohammedBilalA');
  const [repoUrl, setRepoUrl] = useState('https://github.com/MohammedBilalA');

  const [metric1Label, setMetric1Label] = useState('Architecture');
  const [metric1Val, setMetric1Val] = useState('Full-Stack');
  const [metric2Label, setMetric2Label] = useState('Performance');
  const [metric2Val, setMetric2Val] = useState('Real-Time');
  const [metric3Label, setMetric3Label] = useState('Deployment');
  const [metric3Val, setMetric3Val] = useState('Docker / Cloud');

  const [npcName, setNpcName] = useState('Aiden Roy');
  const [npcRole, setNpcRole] = useState('Project Specialist');
  const [npcDialogue, setNpcDialogue] = useState('');

  useEffect(() => {
    if (editingProject) {
      setTitle(editingProject.title);
      setSubtitle(editingProject.subtitle);
      setCategory(editingProject.category);
      setChapterTitle(editingProject.chapterTitle ?? editingProject.title);
      setStoryNarrative(editingProject.storyNarrative ?? '');
      setDistrictName(editingProject.districtName);
      setArchitectureStyle(editingProject.architectureStyle);
      setScreenVisualType(editingProject.screenVisualType);
      setAccentColor(editingProject.accentColor);
      setSecondaryColor(editingProject.secondaryColor);
      setTechStackInput(editingProject.techStack.join(', '));
      setSummary(editingProject.summary);
      setHighlightsInput(editingProject.highlights.join('\n'));
      setLiveUrl(editingProject.liveUrl);
      setRepoUrl(editingProject.repoUrl);
      setMetric1Label(editingProject.metrics[0]?.label ?? 'Core Tech');
      setMetric1Val(editingProject.metrics[0]?.value ?? 'AI + Web');
      setMetric2Label(editingProject.metrics[1]?.label ?? 'Status');
      setMetric2Val(editingProject.metrics[1]?.value ?? 'Production');
      setMetric3Label(editingProject.metrics[2]?.label ?? 'Scale');
      setMetric3Val(editingProject.metrics[2]?.value ?? 'Cloud Ready');
      setNpcName(editingProject.npcGuide.name);
      setNpcRole(editingProject.npcGuide.role);
      setNpcDialogue(editingProject.npcGuide.dialogue);
    } else {
      setTitle('');
      setSubtitle('');
      setCategory('AI & Agents');
      setChapterTitle('');
      setStoryNarrative('');
      setDistrictName('Blossom Innovation Terrace');
      setArchitectureStyle('sakura_pagoda');
      setScreenVisualType('neural_graph');
      setAccentColor('#38bdf8');
      setSecondaryColor('#ec4899');
      setTechStackInput('React.js, Node.js, Python, FastAPI, PostgreSQL');
      setSummary('');
      setHighlightsInput(
        'Designed and implemented full-stack architecture with responsive UI and REST APIs.\nIntegrated automated data pipelines and database indexing for low-latency queries.\nDeployed containerized services with end-to-end monitoring.'
      );
      setLiveUrl('https://github.com/MohammedBilalA');
      setRepoUrl('https://github.com/MohammedBilalA');
      setMetric1Label('Architecture');
      setMetric1Val('Full-Stack');
      setMetric2Label('Latency');
      setMetric2Val('< 45ms');
      setMetric3Label('Deployment');
      setMetric3Val('Docker');
      setNpcName('Vikram Nair');
      setNpcRole('Systems Guide');
      setNpcDialogue('');
    }
  }, [editingProject, isProjectCreatorOpen]);

  if (!isProjectCreatorOpen) return null;

  const handleSave = (andTeleport: boolean) => {
    const cleanTitle = title.trim() || 'New Custom Engineering Project';
    const cleanSubtitle =
      subtitle.trim() || 'Full-Stack & AI Simulation System in 3D Story World';
    const techStack = techStackInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const highlights = highlightsInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const saved = saveManualProject({
      id: editingProject?.id,
      title: cleanTitle,
      subtitle: cleanSubtitle,
      category,
      chapterNumber: editingProject?.chapterNumber,
      chapterTitle: chapterTitle.trim() || cleanTitle,
      storyNarrative:
        storyNarrative.trim() ||
        `In this chapter of Mohammed Bilal A’s 3D Story World, explore ${cleanTitle}—${cleanSubtitle}.`,
      districtName: districtName.trim() || 'Blossom Innovation District',
      architectureStyle,
      screenVisualType,
      accentColor,
      secondaryColor,
      techStack: techStack.length > 0 ? techStack : ['React.js', 'Python', 'PostgreSQL'],
      metrics: [
        { label: metric1Label.trim() || 'Architecture', value: metric1Val.trim() || 'Full-Stack' },
        { label: metric2Label.trim() || 'Engine', value: metric2Val.trim() || 'AI / Web' },
        { label: metric3Label.trim() || 'Status', value: metric3Val.trim() || 'Live 3D' },
      ],
      summary:
        summary.trim() ||
        `${cleanTitle} (${cleanSubtitle}) built with ${techStack.slice(0, 4).join(', ')}.`,
      highlights:
        highlights.length > 0
          ? highlights
          : ['Engineered full-stack system and interactive 3D story monument.'],
      liveUrl: liveUrl.trim() || 'https://github.com/MohammedBilalA',
      repoUrl: repoUrl.trim() || 'https://github.com/MohammedBilalA',
      npcGuide: {
        name: npcName.trim() || 'Project Specialist',
        role: npcRole.trim() || 'Engineering Guide',
        jacketColor: accentColor,
        pantsColor: '#1e293b',
        hairColor: '#18181b',
        dialogue:
          npcDialogue.trim() ||
          `Welcome to ${cleanTitle}! Step onto the glowing pad to inspect our architecture, metrics, and tech stack!`,
      },
    });

    soundEngine.playChime('teleport');
    if (andTeleport) {
      const padX = saved.position[0] + Math.sin(saved.rotationY) * 8.2;
      const padZ = saved.position[2] + Math.cos(saved.rotationY) * 8.2;
      requestTeleport([padX, 0.25, padZ], saved.position);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-xl sm:p-5">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/20 bg-slate-900/95 shadow-2xl">
        {/* Accent Top Bar */}
        <div
          className="h-1.5 w-full"
          style={{
            background: `linear-gradient(90deg, ${accentColor}, ${secondaryColor})`,
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <div className="flex items-center gap-2 font-mono-code text-xs font-semibold text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>MANUAL PROJECT STUDIO • PERSISTENT 3D PAVILION BUILDER</span>
            </div>
            <h2 className="font-display text-xl font-bold text-white sm:text-2xl">
              {editingProject
                ? `Edit Story Chapter #${editingProject.number}: ${editingProject.title}`
                : 'Add & Store a New Project Pavilion in the 3D World'}
            </h2>
          </div>

          <button
            onClick={closeProjectCreator}
            className="cursor-pointer rounded-xl border border-white/15 bg-white/5 p-2 text-slate-300 transition hover:bg-white/15 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Existing Projects Quick Switcher Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-slate-950/60 px-6 py-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => openProjectCreator(null)}
              className={`flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                !editingProject
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <FolderPlus className="h-3.5 w-3.5" />
              <span>+ New Project</span>
            </button>
            {projects.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => openProjectCreator(p.id)}
                className={`cursor-pointer rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
                  editingProjectId === p.id
                    ? 'border-pink-400 bg-pink-500/25 text-white'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                #{p.number} {p.title.slice(0, 16)}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={resetProjectsToDefault}
            title="Restore Default Resume Projects"
            className="flex cursor-pointer items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Resume Defaults</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="grid gap-5 overflow-y-auto p-6 md:grid-cols-2">
          {/* Left Column: Core Project Info & Story Narrative */}
          <div className="space-y-4">
            <div>
              <label className="block font-mono-code text-[11px] font-bold text-slate-300 uppercase">
                Project Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Smart Campus AI Assistant"
                className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono-code text-[11px] font-bold text-slate-300 uppercase">
                Subtitle / One-Line Pitch
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. RAG-Powered Student Portal with FastAPI & React"
                className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono-code text-[11px] font-bold text-slate-300 uppercase">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono-code text-[11px] font-bold text-slate-300 uppercase">
                  Story Chapter Name
                </label>
                <input
                  type="text"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  placeholder="e.g. The Neural Observatory"
                  className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono-code text-[11px] font-bold text-pink-300 uppercase">
                Storytelling Concept Narrative (Shown in Story Quest)
              </label>
              <textarea
                rows={2}
                value={storyNarrative}
                onChange={(e) => setStoryNarrative(e.target.value)}
                placeholder="How does this project fit into the story world?"
                className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-pink-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono-code text-[11px] font-bold text-slate-300 uppercase">
                Executive System Summary
              </label>
              <textarea
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Describe the core architecture and problem solved..."
                className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono-code text-[11px] font-bold text-slate-300 uppercase">
                Engineering Highlights (One bullet per line)
              </label>
              <textarea
                rows={3}
                value={highlightsInput}
                onChange={(e) => setHighlightsInput(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Right Column: Tech Stack, Metrics, 3D Pavilion Style & NPC Guide */}
          <div className="space-y-4">
            <div>
              <label className="block font-mono-code text-[11px] font-bold text-slate-300 uppercase">
                Tech Stack (Comma-separated)
              </label>
              <input
                type="text"
                value={techStackInput}
                onChange={(e) => setTechStackInput(e.target.value)}
                placeholder="React.js, Node.js, Python, FastAPI, PostgreSQL"
                className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
              />
            </div>

            {/* 3 Metrics */}
            <div>
              <label className="block font-mono-code text-[11px] font-bold text-slate-300 uppercase">
                3 Key Display Metrics (Shown on 3D Pavilion Screen)
              </label>
              <div className="mt-1.5 grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-white/10 bg-slate-950 p-2">
                  <input
                    type="text"
                    value={metric1Val}
                    onChange={(e) => setMetric1Val(e.target.value)}
                    placeholder="Value 1"
                    className="w-full bg-transparent font-display text-xs font-bold text-emerald-400 outline-none"
                  />
                  <input
                    type="text"
                    value={metric1Label}
                    onChange={(e) => setMetric1Label(e.target.value)}
                    placeholder="Label 1"
                    className="mt-0.5 w-full bg-transparent text-[10px] text-slate-400 outline-none"
                  />
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-950 p-2">
                  <input
                    type="text"
                    value={metric2Val}
                    onChange={(e) => setMetric2Val(e.target.value)}
                    placeholder="Value 2"
                    className="w-full bg-transparent font-display text-xs font-bold text-emerald-400 outline-none"
                  />
                  <input
                    type="text"
                    value={metric2Label}
                    onChange={(e) => setMetric2Label(e.target.value)}
                    placeholder="Label 2"
                    className="mt-0.5 w-full bg-transparent text-[10px] text-slate-400 outline-none"
                  />
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-950 p-2">
                  <input
                    type="text"
                    value={metric3Val}
                    onChange={(e) => setMetric3Val(e.target.value)}
                    placeholder="Value 3"
                    className="w-full bg-transparent font-display text-xs font-bold text-emerald-400 outline-none"
                  />
                  <input
                    type="text"
                    value={metric3Label}
                    onChange={(e) => setMetric3Label(e.target.value)}
                    placeholder="Label 3"
                    className="mt-0.5 w-full bg-transparent text-[10px] text-slate-400 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3D Pavilion Architecture & Screen Visual */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono-code text-[11px] font-bold text-slate-300 uppercase">
                  3D Pavilion Architecture
                </label>
                <select
                  value={architectureStyle}
                  onChange={(e) => setArchitectureStyle(e.target.value as PavilionStyle)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
                >
                  {ARCHITECTURE_STYLES.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono-code text-[11px] font-bold text-slate-300 uppercase">
                  3D Screen Simulation
                </label>
                <select
                  value={screenVisualType}
                  onChange={(e) => setScreenVisualType(e.target.value as ScreenVisualType)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
                >
                  {SCREEN_VISUAL_TYPES.map((sv) => (
                    <option key={sv.id} value={sv.id}>
                      {sv.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pavilion Accent Color Swatches */}
            <div>
              <label className="block font-mono-code text-[11px] font-bold text-slate-300 uppercase">
                Pavilion Neon & Beacon Accent Color
              </label>
              <div className="mt-1.5 flex items-center gap-2">
                {ACCENT_PRESETS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setAccentColor(col)}
                    className={`h-6 w-6 cursor-pointer rounded-full border-2 transition ${
                      accentColor === col ? 'scale-115 border-white' : 'border-white/20'
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono-code text-[10px] font-bold text-slate-400 uppercase">
                  Live Demo URL
                </label>
                <input
                  type="text"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-mono-code text-[10px] font-bold text-slate-400 uppercase">
                  GitHub Repo URL
                </label>
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>
            </div>

            {/* NPC Specialist Guide */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-3">
              <div className="font-mono-code text-[10px] font-bold text-sky-300 uppercase">
                Dedicated 3D NPC Specialist Guide
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={npcName}
                  onChange={(e) => setNpcName(e.target.value)}
                  placeholder="NPC Name"
                  className="rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1.5 text-xs text-white outline-none"
                />
                <input
                  type="text"
                  value={npcRole}
                  onChange={(e) => setNpcRole(e.target.value)}
                  placeholder="NPC Role"
                  className="rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1.5 text-xs text-white outline-none"
                />
              </div>
              <input
                type="text"
                value={npcDialogue}
                onChange={(e) => setNpcDialogue(e.target.value)}
                placeholder="NPC Greeting Dialogue when player approaches..."
                className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1.5 text-xs text-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-slate-950/90 px-6 py-4">
          <div>
            {editingProject && projects.length > 1 && (
              <button
                type="button"
                onClick={() => deleteProject(editingProject.id)}
                className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/15 px-3.5 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/25"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Project</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={closeProjectCreator}
              className="cursor-pointer rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSave(false)}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-emerald-400/40 bg-emerald-500/20 px-4 py-2 text-xs font-bold text-emerald-200 transition hover:bg-emerald-500/30"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save Project</span>
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-sky-400 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg transition hover:brightness-110"
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>Save & Teleport to 3D Pavilion</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
