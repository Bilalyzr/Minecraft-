import { useEffect, useState } from 'react';
import { DEVELOPER_PROFILE } from '../config/profile.config';
import { useWorldStore } from '../store/useWorldStore';

export function LoadingScreen() {
  const isWorldReady = useWorldStore((s) => s.isWorldReady);
  const loadProgress = useWorldStore((s) => s.loadProgress);
  const loadStage = useWorldStore((s) => s.loadStage);
  const setWorldReady = useWorldStore((s) => s.setWorldReady);
  const [shouldRender, setShouldRender] = useState(!isWorldReady);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    if (!isWorldReady) return;
    setFadingOut(true);
    const timer = window.setTimeout(() => {
      setShouldRender(false);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [isWorldReady]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#060c18] px-6 text-center transition-opacity duration-600 ${
        fadingOut ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="h-3.5 w-3.5 animate-bounce rounded-sm bg-pink-400 [animation-delay:-0.3s]" />
        <div className="h-3.5 w-3.5 animate-bounce rounded-sm bg-amber-300 [animation-delay:-0.15s]" />
        <div className="h-3.5 w-3.5 animate-bounce rounded-sm bg-sky-400" />
      </div>

      <div className="text-xs font-medium tracking-wide text-pink-300">
        {DEVELOPER_PROFILE.name}
      </div>
      <h1 className="mt-1.5 font-display text-2xl font-bold text-white sm:text-3xl">
        Preparing 3D Story World
      </h1>
      <p className="mt-1 text-xs text-slate-400">{DEVELOPER_PROFILE.role}</p>

      {/* Progress Meter */}
      <div className="mt-6 w-full max-w-xs">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-pink-400 via-amber-300 to-emerald-400 transition-all duration-300"
            style={{ width: `${Math.max(8, loadProgress)}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between font-mono-code text-[11px] text-slate-400">
          <span>{loadStage}</span>
          <span className="text-slate-200">{loadProgress}%</span>
        </div>
      </div>

      {loadProgress < 100 && (
        <button
          type="button"
          onClick={() => setWorldReady(true)}
          className="mt-6 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-slate-400 transition hover:border-white/25 hover:text-white"
        >
          Continue immediately
        </button>
      )}
    </div>
  );
}
