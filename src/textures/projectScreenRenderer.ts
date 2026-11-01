import * as THREE from 'three';
import type { PortfolioProject } from '../config/projects.config';

export interface AnimatedScreenHandle {
  texture: THREE.CanvasTexture;
  update: (elapsed: number) => void;
  dispose: () => void;
}

export function createProjectScreenHandle(project: PortfolioProject): AnimatedScreenHandle {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext('2d')!;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  let lastDraw = -1;

  const update = (elapsed: number) => {
    // Update at ~20 FPS so screens look vividly animated with negligible CPU cost
    if (elapsed - lastDraw < 0.05) return;
    lastDraw = elapsed;

    const w = canvas.width;
    const h = canvas.height;

    // Deep glassmorphic dark-slate background gradient
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#070d19');
    bg.addColorStop(0.55, '#0f172a');
    bg.addColorStop(1, '#111827');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Subtle glowing accent radial aura
    const aura = ctx.createRadialGradient(w * 0.72, h * 0.46, 15, w * 0.72, h * 0.46, 220);
    aura.addColorStop(0, `${project.accentColor}44`);
    aura.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = aura;
    ctx.fillRect(0, 0, w, h);

    // Subtle tech grid lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx < w; gx += 32) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, h);
      ctx.stroke();
    }
    for (let gy = 0; gy < h; gy += 32) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.stroke();
    }

    // Left Column: Project Identity, Category Pill & Live Metrics
    ctx.fillStyle = `${project.accentColor}26`;
    ctx.strokeStyle = project.accentColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(26, 24, 158, 28, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = project.accentColor;
    ctx.font = '700 12px "JetBrains Mono", monospace';
    ctx.fillText(`#${project.number} • ${project.category.toUpperCase()}`, 38, 42);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 28px "Space Grotesk", sans-serif';
    ctx.fillText(project.title, 26, 88);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(project.subtitle.slice(0, 46), 26, 114);

    // Metrics Cards
    project.metrics.forEach((m, idx) => {
      const mx = 26 + idx * 112;
      const my = 142;
      ctx.fillStyle = 'rgba(30, 41, 59, 0.78)';
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
      ctx.beginPath();
      ctx.roundRect(mx, my, 102, 62, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = project.accentColor;
      ctx.font = '700 18px "Space Grotesk", sans-serif';
      ctx.fillText(m.value, mx + 11, my + 28);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '500 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(m.label, mx + 11, my + 48);
    });

    // Tech Stack Chips
    project.techStack.slice(0, 5).forEach((tech, idx) => {
      const tx = 26 + (idx % 3) * 112;
      const ty = 224 + Math.floor(idx / 3) * 34;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = `${project.secondaryColor}88`;
      ctx.beginPath();
      ctx.roundRect(tx, ty, 102, 26, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillText(tech.slice(0, 11), tx + 10, ty + 17);
    });

    // Bottom Callout Bar
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.fillRect(0, h - 42, w, 42);
    ctx.fillStyle = project.accentColor;
    ctx.fillRect(0, h - 42, w, 2);
    ctx.fillStyle = '#f1f5f9';
    ctx.font = '600 13px "JetBrains Mono", monospace';
    ctx.fillText('▶ STEP OR DRIVE ONTO GLOWING PAD TO LAUNCH INTERACTIVE CASE STUDY', 26, h - 16);

    // Right Column: Live Animated System Visualization Graphic
    const cx = 485;
    const cy = 162;

    if (project.screenVisualType === 'neural_graph') {
      const nodes = [
        [cx - 75, cy - 55],
        [cx - 75, cy + 10],
        [cx - 75, cy + 65],
        [cx, cy - 30],
        [cx, cy + 40],
        [cx + 78, cy + 5],
      ];
      ctx.strokeStyle = `${project.accentColor}88`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        for (let j = 3; j < 5; j++) {
          ctx.beginPath();
          ctx.moveTo(nodes[i][0], nodes[i][1]);
          ctx.lineTo(nodes[j][0], nodes[j][1]);
          ctx.stroke();
        }
      }
      for (let j = 3; j < 5; j++) {
        ctx.beginPath();
        ctx.moveTo(nodes[j][0], nodes[j][1]);
        ctx.lineTo(nodes[5][0], nodes[5][1]);
        ctx.stroke();
      }
      // Animated pulse packet along edges
      const t = (elapsed * 0.9) % 1;
      const pNode = nodes[Math.floor(elapsed * 2) % 3];
      const mNode = nodes[3 + (Math.floor(elapsed) % 2)];
      const px = pNode[0] + (mNode[0] - pNode[0]) * t;
      const py = pNode[1] + (mNode[1] - pNode[1]) * t;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();

      nodes.forEach(([nx, ny], idx) => {
        ctx.fillStyle = idx === 5 ? project.secondaryColor : project.accentColor;
        ctx.beginPath();
        ctx.arc(nx, ny, 12 + Math.sin(elapsed * 3 + idx) * 2, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (project.screenVisualType === 'telemetry_matrix' || project.screenVisualType === 'orderbook_pulse') {
      for (let i = 0; i < 14; i++) {
        const barH = 24 + Math.abs(Math.sin(elapsed * 2.4 + i * 0.55)) * 115;
        const bx = cx - 98 + i * 15;
        const by = cy + 75 - barH;
        ctx.fillStyle = i % 3 === 0 ? project.secondaryColor : project.accentColor;
        ctx.beginPath();
        ctx.roundRect(bx, by, 10, barH, 3);
        ctx.fill();
      }
    } else {
      // Rotating 3D wireframe / radar rings
      for (let r = 28; r <= 88; r += 28) {
        ctx.strokeStyle = `${project.accentColor}${r === 88 ? '55' : '99'}`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy + 8, r, elapsed * (r % 2 === 0 ? 1 : -0.8), elapsed * (r % 2 === 0 ? 1 : -0.8) + Math.PI * 1.45);
        ctx.stroke();
      }
      // Sweep line
      const ang = elapsed * 1.8;
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(cx, cy + 8);
      ctx.lineTo(cx + Math.cos(ang) * 86, cy + 8 + Math.sin(ang) * 86);
      ctx.stroke();
    }

    texture.needsUpdate = true;
  };

  update(0);

  return {
    texture,
    update,
    dispose: () => texture.dispose(),
  };
}
