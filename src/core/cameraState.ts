import * as THREE from 'three';

// Shared mutable 60Hz camera & input state (avoids React re-renders inside useFrame)
export const cameraState = {
  azimuth: 0, // Horizontal orbit angle in radians (0 = looking toward -Z from +Z)
  polar: 0.36, // Vertical elevation angle in radians
  distance: 8.2,
  currentLookAt: new THREE.Vector3(0, 1.4, 9),
};

export const keyInputState: Record<string, boolean> = {};

export function isTypingInInput(e?: KeyboardEvent): boolean {
  const target = (e?.target ?? document.activeElement) as HTMLElement | null;
  if (!target) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (isTypingInInput(e)) return;
    keyInputState[e.code] = true;
  });
  window.addEventListener('keyup', (e) => {
    keyInputState[e.code] = false;
  });
  window.addEventListener('blur', () => {
    for (const k of Object.keys(keyInputState)) {
      keyInputState[k] = false;
    }
  });
}

if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__CAMERA_STATE__ = cameraState;
}
