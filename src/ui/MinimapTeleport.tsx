import { useEffect, useRef } from 'react';
import { LocateFixed } from 'lucide-react';
import { PORTFOLIO_PROJECTS } from '../config/projects.config';
import { useWorldStore } from '../store/useWorldStore';

const MAP_WORLD_RANGE = 86; // -86m to +86m mapped to radar (includes Windmill Hill & South Lakeside)

function worldToPercent(coord: number): number {
  return Math.max(6, Math.min(94, ((coord + MAP_WORLD_RANGE) / (MAP_WORLD_RANGE * 2)) * 100));
}

export function MinimapTeleport() {
  const playerDotRef = useRef<HTMLDivElement>(null);
  const roverDotRef = useRef<HTMLDivElement>(null);
  const kartDotRef = useRef<HTMLDivElement>(null);
  const scooterDotRef = useRef<HTMLDivElement>(null);

  const requestTeleport = useWorldStore((s) => s.requestTeleport);
  const nearbyProjectId = useWorldStore((s) => s.nearbyProjectId);

  useEffect(() => {
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
  }, []);

  const teleportToProject = (proj: (typeof PORTFOLIO_PROJECTS)[number]) => {
    const padX = proj.position[0] + Math.sin(proj.rotationY) * 8.4;
    const padZ = proj.position[2] + Math.cos(proj.rotationY) * 8.4;
    requestTeleport([padX, 0.25, padZ], proj.position);
  };

  return (
    <div className="pointer-events-auto fixed right-3.5 bottom-3.5 z-30 hidden flex-col items-end gap-1.5 sm:flex sm:right-5 sm:bottom-5">
      <div className="relative h-44 w-44 overflow-hidden rounded-2xl border border-white/20 bg-slate-950/82 shadow-2xl backdrop-blur-xl">
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

        {/* North Windmill Overlook Hill Landmark Pin (Clickable Fast-Travel!) */}
        <button
          onClick={() => requestTeleport([0, 2.7, -56], [0, 7, -63])}
          title="Teleport to Spring Windmill Hill Overlook"
          style={{ left: `${worldToPercent(0)}%`, top: `${worldToPercent(-60)}%` }}
          className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border border-amber-300/60 bg-amber-400/25 px-1.5 py-0.5 font-mono-code text-[8px] font-bold text-amber-200 transition hover:scale-120 hover:bg-amber-400/45"
        >
          MILL
        </button>

        {/* Central Blossom Plaza Ring */}
        <div
          className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-pink-300/40 bg-pink-400/15"
          style={{ left: `${worldToPercent(0)}%`, top: `${worldToPercent(0)}%` }}
        />

        {/* Clickable Project Pavilion Teleport Pins */}
        {PORTFOLIO_PROJECTS.map((proj) => {
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

        <div className="pointer-events-none absolute bottom-1.5 left-2 font-mono-code text-[8px] font-semibold text-slate-300/90">
          CLICK PIN TO TELEPORT
        </div>
      </div>

      <button
        onClick={() => requestTeleport([0, 0.3, 11], [0, 1.5, -2])}
        className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/15 bg-slate-950/80 px-2.5 py-1 text-[10px] font-semibold text-slate-300 backdrop-blur-md transition hover:border-white/30 hover:text-white"
      >
        <LocateFixed className="h-3 w-3 text-pink-400" />
        <span>Return to Blossom Plaza</span>
      </button>
    </div>
  );
}
