import { DEVELOPER_PROFILE } from '../config/profile.config';
import { useWorldStore } from '../store/useWorldStore';

export function LoadingScreen() {
  const isWorldReady = useWorldStore((s) => s.isWorldReady);

  if (isWorldReady) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#060c18] px-6 text-center transition-opacity duration-700">
      <div className="mb-4 flex items-center gap-2">
        <div className="h-3.5 w-3.5 animate-bounce rounded-sm bg-pink-400 [animation-delay:-0.3s]" />
        <div className="h-3.5 w-3.5 animate-bounce rounded-sm bg-amber-300 [animation-delay:-0.15s]" />
        <div className="h-3.5 w-3.5 animate-bounce rounded-sm bg-sky-400" />
      </div>
      <div className="text-xs font-medium tracking-wide text-pink-300">
        {DEVELOPER_PROFILE.name}
      </div>
      <h1 className="mt-1.5 font-display text-2xl font-bold text-white">
        Preparing 3D Story World...
      </h1>
    </div>
  );
}
