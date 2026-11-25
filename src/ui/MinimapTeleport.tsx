import { useEffect, useRef, useState } from 'react';
import { LocateFixed, Map as MapIcon, Shirt, X } from 'lucide-react';
import {
  WARDROBE_BOUTIQUE_POS,
  WARDROBE_BOUTIQUE_ROT_Y,
} from '../config/character.config';
import type { PortfolioProject } from '../config/projects.config';
import { useWorldStore } from '../store/useWorldStore';

const MAP_WORLD_RANGE = 86;

function worldToPercent(coord: number): number {
  return Math.max(6, Math.min(94, ((coord + MAP_WORLD_RANGE) / (MAP_WORLD_RANGE * 2)) * 100));
}

export function MinimapTeleport() {
  const hasEnteredWorld = useWorldStore((s) => s.hasEnteredWorld);
  const playerDotRef = useRef<HTMLDivElement>(null);
  const roverDotRef = useRef<HTMLDivElement>(null);
  const kartDotRef = useRef<HTMLDivElement>(null);
  const scooterDotRef = useRef<HTMLDivElement>(null);

  const projects = useWorldStore((s) => s.projects);
  const requestTeleport = useWorldStore((s) => s.requestTeleport);
  const nearbyProjectId = useWorldStore((s) => s.nearbyProjectId);
  const isNearWardrobe = useWorldStore((s) => s.isNearWardrobe);

  const [mobileMapOpen, setMobileMapOpen] = useState(false);

  useEffect(() => {
    if (!hasEnteredWorld) return;
    let rafId = 0;
    const syncRadar = () => {
      const state = useWorldStore.getState();
      const [px, , pz] = state.playerPosition;
      if (playerDotRef.current) {
        playerDotRef.current.style.left = `${worldToPercent(px)}%`;
        playerDotRef.current.style.top = `${worldToPercent(pz)}%`;
        playerDotRef.current.style.transform = `translate(-50%, -50%) rotate(${-state.playerHeading}rad)`;
      }
      if (roverDotRef.current) {
        const [rx, , rz] = state.vehiclePositions.rover;
        roverDotRef.current.style.left = `${worldToPercent(rx)}%`;
        roverDotRef.current.style.top = `${worldToPercent(rz)}%`;
      }
      if (kartDotRef.current) {
        const [kx, , kz] = state.vehiclePositions.kart;
        kartDotRef.current.style.left = `${worldToPercent(kx)}%`;
        kartDotRef.current.style.top = `${worldToPercent(kz)}%`;
      }
      if (scooterDotRef.current) {
        const [sx, , sz] = state.vehiclePositions.scooter;
        scooterDotRef.current.style.left = `${worldToPercent(sx)}%`;
        scooterDotRef.current.style.top = `${worldToPercent(sz)}%`;
      }
      rafId = requestAnimationFrame(syncRadar);
    };
    rafId = requestAnimationFrame(syncRadar);
    return () => cancelAnimationFrame(rafId);
  }, [hasEnteredWorld]);

  if (!hasEnteredWorld) return null;

  const teleportToProject = (proj: PortfolioProject) => {
    const padX = proj.position[0] + Math.sin(proj.rotationY) * 8.4;
    const padZ = proj.position[2] + Math.cos(proj.rotationY) * 8.4;
    requestTeleport([padX, 0.25, padZ], proj.position);
    setMobileMapOpen(false);
  };

  const teleportToWardrobe = () => {
    const padX = WARDROBE_BOUTIQUE_POS[0] + Math.sin(WARDROBE_BOUTIQUE_ROT_Y) * 6.4;
    const padZ = WARDROBE_BOUTIQUE_POS[2] + Math.cos(WARDROBE_BOUTIQUE_ROT_Y) * 6.4;
    requestTeleport([padX, 0.25, padZ], WARDROBE_BOUTIQUE_POS);
    setMobileMapOpen(false);
  };

  return (
    <>
      {/* Mobile Compact Map Toggle Pill */}
      <div className="pointer-events-auto fixed top-24 right-3.5 z-30 sm:hidden">
        <button
          type="button"
          onClick={() => setMobileMapOpen((open) => !open)}
          className="glass-pill flex cursor-pointer items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-lg"
        >
          {mobileMapOpen ? (
            <>
              <X className="h-3.5 w-3.5 text-pink-300" />
              <span>Close Map</span>
            </>
          ) : (
            <>
              <MapIcon className="h-3.5 w-3.5 text-emerald-300" />
              <span>Map</span>
            </>
          )}
        </button>
      </div>

      {/* Interactive Radar Minimap (Always bottom-right on >=sm, toggleable top-right sheet on mobile) */}
      <div
        className={`pointer-events-auto fixed z-30 flex-col items-end gap-1.5 ${
          mobileMapOpen
            ? 'top-34 right-3.5 flex'
            : 'right-3.5 bottom-3.5 hidden sm:right-5 sm:bottom-5 sm:flex'
        }`}
      >
        <div className="glass-panel relative h-44 w-44 overflow-hidden rounded-2xl">
          {/* Subtle Radar Grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px)',
              backgroundSize: '22px 22px',
            }}
          />
          {/* Compass North Badge */}
          <div className="pointer-events-none absolute top-1.5 right-2 z-10 rounded bg-slate-900/80 px-1 py-0.2 font-mono-code text-[8px] font-bold text-pink-300 ring-1 ring-white/15">
            N ▲
          </div>
          {/* Emerald River Band */}
          <div
            className="absolute inset-x-0 border-y border-teal-300/30 bg-teal-400/25"
            style={{
              top: `${worldToPercent(31.5)}%`,
              height: `${worldToPercent(41.5) - worldToPercent(31.5)}%`,
            }}
          />
          {/* 3 Bridges over River */}
          {[-34, 0, 34].map((bx) => (
            <div
              key={bx}
              className="absolute w-1.5 bg-amber-300/65"
              style={{
                left: `${worldToPercent(bx)}%`,
                top: `${worldToPercent(29)}%`,
                height: `${worldToPercent(44) - worldToPercent(29)}%`,
                transform: 'translateX(-50%)',
              }}
            />
          ))}

          {/* North Windmill Overlook Hill Landmark Pin */}
          <button
            onClick={() => {
              requestTeleport([0, 2.7, -56], [0, 7, -63]);
              setMobileMapOpen(false);
            }}
            title="Teleport to Spring Windmill Hill Overlook"
            style={{ left: `${worldToPercent(0)}%`, top: `${worldToPercent(-60)}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border border-amber-300/60 bg-amber-400/25 px-1.5 py-0.5 font-mono-code text-[8px] font-bold text-amber-200 transition hover:scale-120 hover:bg-amber-400/45"
          >
            MILL
          </button>

          {/* 3D Wardrobe & Style Atelier Pin */}
          <button
            onClick={teleportToWardrobe}
            title="Teleport to 3D Sakura Style & Outfit Atelier"
            style={{
              left: `${worldToPercent(WARDROBE_BOUTIQUE_POS[0])}%`,
              top: `${worldToPercent(WARDROBE_BOUTIQUE_POS[2])}%`,
            }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border border-pink-300/80 bg-pink-500 px-1.5 py-0.5 font-mono-code text-[7px] font-bold text-slate-950 shadow-md transition hover:scale-125 ${
              isNearWardrobe ? 'ring-2 ring-white' : ''
            }`}
          >
            STYLE
          </button>

          {/* Central Blossom Plaza Ring */}
          <div
            className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-pink-300/40 bg-pink-400/15"
            style={{ left: `${worldToPercent(0)}%`, top: `${worldToPercent(0)}%` }}
          />

          {/* Clickable Project Pavilion Teleport Pins */}
          {projects.map((proj) => {
            const isCurrent = nearbyProjectId === proj.id;
            return (
              <button
                key={proj.id}
                onClick={() => teleportToProject(proj)}
                title={`Teleport to #${proj.number} ${proj.title}`}
                style={{
                  left: `${worldToPercent(proj.position[0])}%`,
                  top: `${worldToPercent(proj.position[2])}%`,
                  backgroundColor: proj.accentColor,
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-md px-1 py-0.5 font-mono-code text-[9px] font-bold text-slate-950 shadow-md transition hover:scale-125 ${
                  isCurrent ? 'scale-115 ring-2 ring-white' : ''
                }`}
              >
                {proj.number}
              </button>
            );
          })}

          {/* All 3 Vehicle Dots */}
          <div
            ref={roverDotRef}
            title="Sakura Trail 4x4 Safari"
            className="pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-emerald-400 ring-1 ring-slate-950"
          />
          <div
            ref={kartDotRef}
            title="Blossom GT Roadster"
            className="pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-rose-400 ring-1 ring-slate-950"
          />
          <div
            ref={scooterDotRef}
            title="Meadow Breeze Scooter"
            className="pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-300 ring-1 ring-slate-950"
          />

          {/* Live Player Arrow */}
          <div
            ref={playerDotRef}
            className="pointer-events-none absolute z-10 flex h-3.5 w-3.5 items-center justify-center"
          >
            <div className="h-0 w-0 border-x-[5px] border-b-[10px] border-x-transparent border-b-white drop-shadow" />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={teleportToWardrobe}
            className="glass-pill flex cursor-pointer items-center gap-1 rounded-xl px-2.5 py-1 text-[11px] font-medium text-pink-200 transition hover:border-white/25 hover:text-white"
          >
            <Shirt className="h-3 w-3 text-pink-300" />
            <span>Atelier</span>
          </button>
          <button
            onClick={() => {
              requestTeleport([0, 0.3, 11], [0, 1.5, -2]);
              setMobileMapOpen(false);
            }}
            className="glass-pill flex cursor-pointer items-center gap-1 rounded-xl px-2.5 py-1 text-[11px] font-medium text-slate-200 transition hover:border-white/25 hover:text-white"
          >
            <LocateFixed className="h-3 w-3 text-emerald-400" />
            <span>Plaza</span>
          </button>
        </div>
      </div>
    </>
  );
}
