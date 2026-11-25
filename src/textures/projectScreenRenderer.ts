import * as THREE from 'three';
import type { PortfolioProject } from '../config/projects.config';
import { hexWithAlpha, normalizeHexColor } from '../utils/validation';

export interface AnimatedScreenHandle {
  texture: THREE.CanvasTexture;
  update: (elapsed: number) => void;
  dispose: () => void;
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let end = text.length;
  while (end > 1 && ctx.measureText(`${text.slice(0, end)}…`).width > maxWidth) {
    end--;
  }
  return `${text.slice(0, end)}…`;
}

function wrapTitle(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): [string, string | null] {
  if (ctx.measureText(text).width <= maxWidth) return [text, null];
  const words = text.split(' ');
  let line1 = '';
  let idx = 0;
  while (idx < words.length) {
    const test = line1 ? `${line1} ${words[idx]}` : words[idx];
    if (ctx.measureText(test).width > maxWidth && line1) break;
    line1 = test;
    idx++;
  }
  const rest = words.slice(idx).join(' ');
  return [fitText(ctx, line1, maxWidth), rest ? fitText(ctx, rest, maxWidth) : null];
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

  const accentColor = normalizeHexColor(project.accentColor, '#38bdf8');
  const secondaryColor = normalizeHexColor(project.secondaryColor, '#ec4899');

  let lastDraw = -1;

  const update = (elapsed: number) => {
    if (elapsed - lastDraw < 0.05) return;
    lastDraw = elapsed;

    const w = canvas.width;
    const h = canvas.height;

    // Clean deep twilight slate background
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#070b14');
    bg.addColorStop(0.6, '#0f172a');
    bg.addColorStop(1, '#131c31');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Soft ambient radial glow behind visualization
    const aura = ctx.createRadialGradient(w * 0.74, h * 0.48, 20, w * 0.74, h * 0.48, 230);
    aura.addColorStop(0, hexWithAlpha(accentColor, '3d'));
    aura.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = aura;
    ctx.fillRect(0, 0, w, h);

    // Subtle spatial grid
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.06)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx < w; gx += 40) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, h);
      ctx.stroke();
    }
    for (let gy = 0; gy < h; gy += 40) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.stroke();
    }

    // Left Column: Bold Poster Layout (Chapter Pill + 2-Line Title + Subtitle + 3 Metrics)
    ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
    const rawBadge = `${project.chapterNumber || `Project ${project.number}`} · ${project.category}`;
    const badgeLabel = fitText(ctx, rawBadge, 310);
    const badgeWidth = Math.min(336, Math.max(152, ctx.measureText(badgeLabel).width + 28));
    ctx.fillStyle = hexWithAlpha(accentColor, '22');
    ctx.strokeStyle = hexWithAlpha(accentColor, 'aa');
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(30, 30, badgeWidth, 30, 15);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = accentColor;
    ctx.fillText(badgeLabel, 44, 50, 308);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 30px "Space Grotesk", sans-serif';
    const [t1, t2] = wrapTitle(ctx, project.title, 336);
    ctx.fillText(t1, 30, 102, 336);
    if (t2) {
      ctx.fillText(t2, 30, 138, 336);
    }

    const subY = t2 ? 168 : 134;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(fitText(ctx, project.subtitle, 336), 30, subY, 336);

    // 3 Spacious Metric Cards
    const metricY = 216;
    project.metrics.slice(0, 3).forEach((m, idx) => {
      const mx = 30 + idx * 112;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(mx, metricY, 102, 74, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = accentColor;
      ctx.font = '700 18px "Space Grotesk", sans-serif';
      ctx.fillText(fitText(ctx, m.value, 84), mx + 11, metricY + 33, 84);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '500 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(fitText(ctx, m.label, 84), mx + 11, metricY + 56, 84);
    });

    // Subtle Accent Footer Cue (Clean & Uncluttered)
    ctx.fillStyle = hexWithAlpha(accentColor, 'cc');
    ctx.fillRect(30, h - 38, 28, 3);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '500 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Step onto pad or press Enter to inspect', 68, h - 32, 300);

    // Right Column: Live Animated System Visualization Graphic
    const cx = 492;
    const cy = 176;

    if (project.screenVisualType === 'neural_graph') {
      const nodes = [
        [cx - 72, cy - 58],
        [cx - 72, cy + 8],
        [cx - 72, cy + 68],
        [cx, cy - 32],
        [cx, cy + 42],
        [cx + 76, cy + 5],
      ];
      ctx.strokeStyle = hexWithAlpha(accentColor, '88');
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
        ctx.fillStyle = idx === 5 ? secondaryColor : accentColor;
        ctx.beginPath();
        ctx.arc(nx, ny, 12 + Math.sin(elapsed * 3 + idx) * 2, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (
      project.screenVisualType === 'telemetry_matrix' ||
      project.screenVisualType === 'orderbook_pulse'
    ) {
      for (let i = 0; i < 12; i++) {
        const barH = 26 + Math.abs(Math.sin(elapsed * 2.4 + i * 0.55)) * 124;
        const bx = cx - 90 + i * 16;
        const by = cy + 76 - barH;
        ctx.fillStyle = i % 3 === 0 ? secondaryColor : accentColor;
        ctx.beginPath();
        ctx.roundRect(bx, by, 10, barH, 4);
        ctx.fill();
      }
    } else {
      for (let r = 30; r <= 90; r += 30) {
        ctx.strokeStyle = hexWithAlpha(accentColor, r === 90 ? '55' : '99');
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(
          cx,
          cy,
          r,
          elapsed * (r % 2 === 0 ? 1 : -0.8),
          elapsed * (r % 2 === 0 ? 1 : -0.8) + Math.PI * 1.45
        );
        ctx.stroke();
      }
      const ang = elapsed * 1.8;
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(ang) * 88, cy + Math.sin(ang) * 88);
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
