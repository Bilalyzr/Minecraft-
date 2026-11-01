import { useRef, useState } from 'react';
import { Car, Zap } from 'lucide-react';
import { useWorldStore } from '../store/useWorldStore';

export function MobileControls() {
  const setMobileMove = useWorldStore((s) => s.setMobileMove);
  const setMobileButton = useWorldStore((s) => s.setMobileButton);
  const triggerInteract = useWorldStore((s) => s.triggerInteract);
  const requestSummonVehicle = useWorldStore((s) => s.requestSummonVehicle);
  const drivingVehicleId = useWorldStore((s) => s.drivingVehicleId);

  const padRef = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const activeTouchRef = useRef(false);

  const updateStick = (clientX: number, clientY: number) => {
    if (!padRef.current) return;
    const rect = padRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const maxR = rect.width * 0.38;

    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > maxR) {
      dx = (dx / dist) * maxR;
      dy = (dy / dist) * maxR;
    }

    setKnob({ x: dx, y: dy });
    setMobileMove(dx / maxR, -dy / maxR);
  };

  const resetStick = () => {
    activeTouchRef.current = false;
    setKnob({ x: 0, y: 0 });
    setMobileMove(0, 0);
  };

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-30 flex items-end justify-between md:hidden">
      {/* Virtual Thumbstick */}
      <div
        ref={padRef}
        onPointerDown={(e) => {
          activeTouchRef.current = true;
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          updateStick(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (activeTouchRef.current) updateStick(e.clientX, e.clientY);
        }}
        onPointerUp={resetStick}
        onPointerCancel={resetStick}
        className="pointer-events-auto relative flex h-28 w-28 touch-none items-center justify-center rounded-full border border-white/20 bg-slate-950/65 backdrop-blur-md"
      >
        <div
          style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
          className="h-11 w-11 rounded-full bg-gradient-to-br from-pink-400 to-emerald-400 shadow-lg"
        />
      </div>

      {/* Action Buttons */}
      <div className="pointer-events-auto flex flex-col items-end gap-2">
        <div className="flex gap-1.5">
          {!drivingVehicleId && (
            <>
              <button
                onClick={() => requestSummonVehicle('rover')}
                className="flex h-10 items-center gap-1 rounded-full border border-emerald-400/40 bg-slate-950/80 px-2.5 text-[11px] font-bold text-emerald-300 backdrop-blur-md"
              >
                <Car className="h-3.5 w-3.5" />
                <span>4x4</span>
              </button>
              <button
                onClick={() => requestSummonVehicle('scooter')}
                className="flex h-10 items-center rounded-full border border-teal-400/40 bg-slate-950/80 px-2.5 text-[11px] font-bold text-teal-300 backdrop-blur-md"
              >
                <span>Scooter</span>
              </button>
            </>
          )}
          <button
            onClick={triggerInteract}
            className="flex h-10 items-center rounded-full border border-pink-400/50 bg-pink-500/30 px-3.5 text-xs font-bold text-white backdrop-blur-md"
          >
            {drivingVehicleId ? 'Exit' : 'Action'}
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onPointerDown={() => setMobileButton('sprint', true)}
            onPointerUp={() => setMobileButton('sprint', false)}
            onPointerCancel={() => setMobileButton('sprint', false)}
            className="flex h-12 w-14 touch-none items-center justify-center rounded-2xl border border-amber-400/40 bg-slate-950/80 text-xs font-bold text-amber-300 backdrop-blur-md"
          >
            <Zap className="h-4 w-4" />
          </button>
          <button
            onPointerDown={() => setMobileButton(drivingVehicleId ? 'brake' : 'jump', true)}
            onPointerUp={() => setMobileButton(drivingVehicleId ? 'brake' : 'jump', false)}
            onPointerCancel={() => setMobileButton(drivingVehicleId ? 'brake' : 'jump', false)}
            className="flex h-12 w-16 touch-none items-center justify-center rounded-2xl border border-white/25 bg-slate-950/80 text-xs font-bold text-white backdrop-blur-md"
          >
            {drivingVehicleId ? 'Drift' : 'Jump'}
          </button>
        </div>
      </div>
    </div>
  );
}
