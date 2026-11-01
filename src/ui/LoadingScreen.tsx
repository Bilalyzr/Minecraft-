import { DEVELOPER_PROFILE } from '../config/profile.config';
import { useWorldStore } from '../store/useWorldStore';

export function LoadingScreen() {
  const isWorldReady = useWorldStore((s) => s.isWorldReady);

  if (isWorldReady) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070f18] px-6 text-center transition-opacity duration-700">
      <div className="mb-5 flex items-center gap-2.5">
        <div className="h-4 w-4 animate-bounce rounded-sm bg-pink-400 [animation-delay:-0.3s]" />
        <div className="h-4 w-4 animate-bounce rounded-sm bg-emerald-400 [animation-delay:-0.15s]" />
        <div className="h-4 w-4 animate-bounce rounded-sm bg-sky-400" />
      </div>
      <div className="font-mono-code text-xs font-semibold tracking-widest text-pink-400 uppercase">
        {DEVELOPER_PROFILE.worldTitle}
      </div>
      <h1 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
        Synthesizing PBR Blocks, Spring Foliage & WASM Physics...
      </h1>
      <p className="mt-2 max-w-md text-xs text-slate-400">{DEVELOPER_PROFILE.tagline}</p>
    </div>
  );
}
