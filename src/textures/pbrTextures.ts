import * as THREE from 'three';

export interface PBRMaterialMaps {
  map: THREE.DataTexture;
  normalMap: THREE.DataTexture;
  roughnessMap: THREE.DataTexture;
}

export type BlockMaterialKey =
  | 'grass_meadow'
  | 'grass_side'
  | 'cobble_road'
  | 'stone_path'
  | 'mossy_stone'
  | 'chiseled_quartz'
  | 'oak_planks'
  | 'pink_cherry_planks'
  | 'cherry_bark'
  | 'birch_bark'
  | 'sakura_blossom'
  | 'birch_leaves'
  | 'oak_leaves'
  | 'azalea_bush'
  | 'sand_beach'
  | 'river_pebbles'
  | 'sea_lantern'
  | 'dark_slate';

function hash2D(x: number, y: number, seed: number): number {
  const xm = ((x % 32) + 32) % 32;
  const ym = ((y % 32) + 32) % 32;
  let n = xm * 374761393 + ym * 668265263 + seed * 1442695041;
  n = (n ^ (n >> 13)) * 1274126177;
  return ((n ^ (n >> 16)) >>> 0) / 4294967295;
}

function clampByte(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)));
}

function synthesizeBlockMaps(
  key: BlockMaterialKey,
  repeatX = 1,
  repeatY = 1
): PBRMaterialMaps {
  const GRID = 32;
  const SCALE = 4;
  const SIZE = GRID * SCALE;

  const albedoGrid = new Float32Array(GRID * GRID * 3);
  const heightGrid = new Float32Array(GRID * GRID);
  const roughGrid = new Float32Array(GRID * GRID);

  for (let gy = 0; gy < GRID; gy++) {
    for (let gx = 0; gx < GRID; gx++) {
      const idx = gy * GRID + gx;
      const n1 = hash2D(gx, gy, 11);
      const n2 = hash2D(gx >> 1, gy >> 1, 37);
      const n3 = hash2D(gx, gy, 97);

      let r = 128;
      let g = 128;
      let b = 128;
      let h = 0.5;
      let rough = 0.65;

      switch (key) {
        case 'grass_meadow': {
          // Authentic Minecraft "Spring to Life" Flower Forest / Meadow vibrant emerald turf
          const lush = n2 * 0.58 + n1 * 0.42;
          r = 72 + lush * 44;
          g = 172 + lush * 52;
          b = 58 + lush * 28;
          if (n3 > 0.945) {
            r = 252;
            g = 232;
            b = 118;
            h = 0.85;
            rough = 0.42;
          } else if (n3 < 0.032) {
            r = 250;
            g = 182;
            b = 208;
            h = 0.78;
            rough = 0.45;
          } else {
            h = 0.4 + lush * 0.45;
            rough = 0.52 + (1 - lush) * 0.24;
          }
          break;
        }

        case 'grass_side': {
          // Classic Minecraft Grass Block side: lush green turf overhang over warm rich dirt
          // Note: DataTexture y=0 is bottom, y=31 is top
          const overhang = 20 + Math.floor(hash2D(gx, 0, 131) * 6);
          if (gy >= overhang) {
            const lush = n2 * 0.55 + n1 * 0.45;
            r = 72 + lush * 42;
            g = 172 + lush * 50;
            b = 58 + lush * 25;
            h = 0.72 + lush * 0.2;
            rough = 0.54;
          } else {
            const dirt = n2 * 0.5 + n1 * 0.5;
            const isPebble = n3 > 0.91;
            r = isPebble ? 142 : 124 + dirt * 34;
            g = isPebble ? 136 : 86 + dirt * 26;
            b = isPebble ? 128 : 58 + dirt * 18;
            h = isPebble ? 0.66 : 0.32 + dirt * 0.28;
            rough = 0.84;
          }
          break;
        }

        case 'cobble_road': {
          const row = Math.floor(gy / 8);
          const offset = (row % 2) * 8;
          const bx = (gx + offset) % 16;
          const by = gy % 8;
          const isMortar = bx === 0 || by === 0;
          const stoneSeed = hash2D(Math.floor(((gx + offset) % 32) / 16), row, 53);

          if (isMortar) {
            const moss = n2 > 0.68;
            r = moss ? 74 : 96 + n1 * 14;
            g = moss ? 132 + n1 * 22 : 98 + n1 * 14;
            b = moss ? 68 : 102 + n1 * 14;
            h = 0.16;
            rough = 0.9;
          } else {
            const edgeDist = Math.min(bx, 15 - bx, by, 7 - by);
            const bevel = Math.min(1, edgeDist / 2.0);
            const shade = 148 + stoneSeed * 32 + (n1 - 0.5) * 16;
            r = shade * 1.01;
            g = shade * 1.0;
            b = shade * 0.98;
            h = 0.42 + bevel * 0.46 + n1 * 0.08;
            rough = 0.36 + (1 - stoneSeed) * 0.2;
          }
          break;
        }

        case 'stone_path': {
          // Warm sandstone & cream garden flagstones
          const row = Math.floor(gy / 16);
          const bx = (gx + row * 8) % 16;
          const by = gy % 16;
          const seam = bx === 0 || by === 0;
          if (seam) {
            r = 144;
            g = 132;
            b = 112;
            h = 0.18;
            rough = 0.88;
          } else {
            const warm = 204 + n2 * 26 + (n1 - 0.5) * 12;
            r = warm;
            g = warm * 0.95;
            b = warm * 0.84;
            h = 0.65 + n1 * 0.16;
            rough = 0.42;
          }
          break;
        }

        case 'mossy_stone': {
          const brickX = (gx + Math.floor(gy / 8) * 8) % 16;
          const brickY = gy % 8;
          const mortar = brickX === 0 || brickY === 0;
          const mossMask = hash2D(gx >> 1, gy >> 1, 71) + n1 * 0.35 > 0.76;
          if (mossMask) {
            r = 68 + n1 * 28;
            g = 152 + n1 * 42;
            b = 58 + n1 * 20;
            h = 0.7 + n1 * 0.18;
            rough = 0.68;
          } else if (mortar) {
            r = 82;
            g = 86;
            b = 88;
            h = 0.16;
            rough = 0.92;
          } else {
            const v = 146 + (n2 - 0.5) * 26 + (n1 - 0.5) * 14;
            r = v;
            g = v * 1.01;
            b = v * 1.02;
            h = 0.62 + n1 * 0.16;
            rough = 0.4 + n1 * 0.16;
          }
          break;
        }

        case 'chiseled_quartz': {
          const border = gx === 0 || gy === 0 || gx === 31 || gy === 31;
          const innerRing =
            ((gx === 4 || gx === 27) && gy >= 4 && gy <= 27) ||
            ((gy === 4 || gy === 27) && gx >= 4 && gx <= 27);
          const vein = Math.sin((gx + gy * 0.7) * 0.45 + n2 * 2.2) * 0.5 + 0.5;

          if (border) {
            r = 204;
            g = 208;
            b = 216;
            h = 0.28;
            rough = 0.45;
          } else if (innerRing) {
            r = 222;
            g = 206;
            b = 178;
            h = 0.38;
            rough = 0.3;
          } else {
            const base = 238 + vein * 14 + (n1 - 0.5) * 6;
            r = base;
            g = base * 0.99;
            b = base * 0.96;
            h = 0.78 + vein * 0.1;
            rough = 0.2 + (1 - vein) * 0.14;
          }
          break;
        }

        case 'oak_planks': {
          const plankRow = Math.floor(gy / 8);
          const py = gy % 8;
          const seamX = (plankRow * 13 + 7) % 32;
          const isGroove = py === 0 || gx === seamX;
          const grain = Math.sin(gx * 0.38 + plankRow * 2.1 + n1 * 0.9) * 0.5 + 0.5;
          if (isGroove) {
            r = 104;
            g = 72;
            b = 42;
            h = 0.18;
            rough = 0.84;
          } else {
            r = 178 + grain * 30 + (n1 - 0.5) * 10;
            g = 128 + grain * 24 + (n1 - 0.5) * 8;
            b = 76 + grain * 16;
            h = 0.62 + grain * 0.2;
            rough = 0.38 + (1 - grain) * 0.18;
          }
          break;
        }

        case 'pink_cherry_planks': {
          // Authentic Minecraft Cherry Planks — pastel coral-blossom timber
          const plankRow = Math.floor(gy / 8);
          const py = gy % 8;
          const seamX = (plankRow * 11 + 5) % 32;
          const isGroove = py === 0 || gx === seamX;
          const grain = Math.sin(gx * 0.42 + plankRow * 1.7 + n1 * 0.8) * 0.5 + 0.5;
          if (isGroove) {
            r = 168;
            g = 102;
            b = 118;
            h = 0.18;
            rough = 0.82;
          } else {
            r = 226 + grain * 22;
            g = 154 + grain * 22;
            b = 170 + grain * 20;
            h = 0.64 + grain * 0.18;
            rough = 0.36 + (1 - grain) * 0.18;
          }
          break;
        }

        case 'cherry_bark': {
          const streak = Math.sin(gx * 0.9 + n2 * 2.5) * 0.5 + 0.5;
          const lenticel = gy % 7 === 3 && (gx + gy) % 5 < 2;
          if (lenticel) {
            r = 136;
            g = 82;
            b = 94;
            h = 0.78;
            rough = 0.55;
          } else {
            r = 68 + streak * 22 + n1 * 8;
            g = 38 + streak * 14 + n1 * 6;
            b = 48 + streak * 16 + n1 * 8;
            h = 0.36 + streak * 0.44;
            rough = 0.68;
          }
          break;
        }

        case 'birch_bark': {
          // Authentic Minecraft White Birch Log with horizontal dark bark knots
          const knotRow = gy % 9 === 4;
          const knotSpan = knotRow && ((gx + Math.floor(gy / 9) * 11) % 16) < 6;
          if (knotSpan) {
            r = 58 + n1 * 18;
            g = 56 + n1 * 16;
            b = 52 + n1 * 16;
            h = 0.28;
            rough = 0.82;
          } else {
            const paper = 228 + n2 * 18 + (n1 - 0.5) * 10;
            r = paper;
            g = paper * 0.99;
            b = paper * 0.95;
            h = 0.64 + n1 * 0.15;
            rough = 0.52;
          }
          break;
        }

        case 'sakura_blossom': {
          const cluster = n2 * 0.65 + n1 * 0.35;
          if (n3 > 0.82) {
            r = 255;
            g = 236;
            b = 245;
            h = 0.92;
            rough = 0.36;
          } else if (n3 < 0.12) {
            r = 222;
            g = 114;
            b = 158;
            h = 0.28;
            rough = 0.65;
          } else {
            r = 248 + cluster * 7;
            g = 162 + cluster * 54;
            b = 196 + cluster * 40;
            h = 0.5 + cluster * 0.38;
            rough = 0.44;
          }
          break;
        }

        case 'birch_leaves': {
          // Fresh golden-lime spring birch foliage
          const leaf = n2 * 0.55 + n1 * 0.45;
          r = 108 + leaf * 46;
          g = 186 + leaf * 48;
          b = 58 + leaf * 28;
          h = 0.38 + leaf * 0.52;
          rough = 0.48;
          break;
        }

        case 'oak_leaves': {
          const leaf = n2 * 0.55 + n1 * 0.45;
          r = 56 + leaf * 38;
          g = 154 + leaf * 52;
          b = 44 + leaf * 24;
          h = 0.36 + leaf * 0.52;
          rough = 0.5;
          break;
        }

        case 'azalea_bush': {
          // Lush green Minecraft Flowering Azalea studded with bright pink-magenta blossoms
          const leaf = n2 * 0.5 + n1 * 0.5;
          if (n3 > 0.74) {
            r = 244;
            g = 98 + n1 * 48;
            b = 168 + n1 * 38;
            h = 0.88;
            rough = 0.38;
          } else {
            r = 54 + leaf * 34;
            g = 148 + leaf * 48;
            b = 46 + leaf * 22;
            h = 0.44 + leaf * 0.38;
            rough = 0.54;
          }
          break;
        }

        case 'sand_beach': {
          // Warm golden-cream riverside sand
          const ripple = Math.sin(gy * 0.55 + Math.sin(gx * 0.25) * 1.4) * 0.5 + 0.5;
          const warm = 218 + ripple * 20 + (n1 - 0.5) * 12;
          r = warm;
          g = warm * 0.93;
          b = warm * 0.74;
          h = 0.42 + ripple * 0.32 + n1 * 0.08;
          rough = 0.58;
          break;
        }

        case 'river_pebbles': {
          const cellX = Math.floor(gx / 4);
          const cellY = Math.floor(gy / 4);
          const cx = (gx % 4) - 1.5;
          const cy = (gy % 4) - 1.5;
          const dist = Math.sqrt(cx * cx + cy * cy);
          const pebbleTone = hash2D(cellX, cellY, 83);
          if (dist > 1.85) {
            r = 186 + n1 * 20;
            g = 172 + n1 * 18;
            b = 136 + n1 * 16;
            h = 0.22;
            rough = 0.5;
          } else {
            const base = 130 + pebbleTone * 64;
            r = base * (0.98 + n1 * 0.06);
            g = base * (1.0 + n1 * 0.06);
            b = base * (0.96 + (1 - pebbleTone) * 0.1);
            h = 0.46 + (1.85 - dist) * 0.26;
            rough = 0.2;
          }
          break;
        }

        case 'sea_lantern': {
          const frame = gx < 3 || gx > 28 || gy < 3 || gy > 28;
          if (frame) {
            r = 82;
            g = 104;
            b = 114;
            h = 0.85;
            rough = 0.35;
          } else {
            const crystal = 1 - (Math.abs(gx - 15.5) / 16) * 0.25 - (Math.abs(gy - 15.5) / 16) * 0.25;
            r = 222 + crystal * 33;
            g = 250;
            b = 246;
            h = 0.55 + crystal * 0.35;
            rough = 0.14;
          }
          break;
        }

        case 'dark_slate': {
          const tx = (gx + Math.floor(gy / 8) * 8) % 16;
          const ty = gy % 8;
          const seam = tx === 0 || ty === 0;
          const v = seam ? 38 : 58 + n2 * 18 + n1 * 10;
          r = v * 0.96;
          g = v * 1.0;
          b = v * 1.1;
          h = seam ? 0.18 : 0.66 + n1 * 0.15;
          rough = seam ? 0.85 : 0.28 + n1 * 0.16;
          break;
        }
      }

      albedoGrid[idx * 3] = r;
      albedoGrid[idx * 3 + 1] = g;
      albedoGrid[idx * 3 + 2] = b;
      heightGrid[idx] = h;
      roughGrid[idx] = rough;
    }
  }

  const albedoBytes = new Uint8Array(SIZE * SIZE * 4);
  const normalBytes = new Uint8Array(SIZE * SIZE * 4);
  const roughBytes = new Uint8Array(SIZE * SIZE * 4);

  const sampleHeight = (fx: number, fy: number): number => {
    const x0 = ((Math.floor(fx) % GRID) + GRID) % GRID;
    const y0 = ((Math.floor(fy) % GRID) + GRID) % GRID;
    const x1 = (x0 + 1) % GRID;
    const y1 = (y0 + 1) % GRID;
    const tx = fx - Math.floor(fx);
    const ty = fy - Math.floor(fy);
    const h00 = heightGrid[y0 * GRID + x0];
    const h10 = heightGrid[y0 * GRID + x1];
    const h01 = heightGrid[y1 * GRID + x0];
    const h11 = heightGrid[y1 * GRID + x1];
    const hx0 = h00 * (1 - tx) + h10 * tx;
    const hx1 = h01 * (1 - tx) + h11 * tx;
    return hx0 * (1 - ty) + hx1 * ty;
  };

  const normalStrength = 2.4;

  for (let py = 0; py < SIZE; py++) {
    for (let px = 0; px < SIZE; px++) {
      const gx = Math.floor(px / SCALE);
      const gy = Math.floor(py / SCALE);
      const gIdx = gy * GRID + gx;
      const pIdx = (py * SIZE + px) * 4;

      const micro = ((px * 73 + py * 151) & 15) / 15 - 0.5;

      albedoBytes[pIdx] = clampByte(albedoGrid[gIdx * 3] + micro * 4);
      albedoBytes[pIdx + 1] = clampByte(albedoGrid[gIdx * 3 + 1] + micro * 4);
      albedoBytes[pIdx + 2] = clampByte(albedoGrid[gIdx * 3 + 2] + micro * 4);
      albedoBytes[pIdx + 3] = 255;

      const fx = px / SCALE;
      const fy = py / SCALE;
      const step = 0.45;
      const dX = (sampleHeight(fx + step, fy) - sampleHeight(fx - step, fy)) * normalStrength;
      const dY = (sampleHeight(fx, fy + step) - sampleHeight(fx, fy - step)) * normalStrength;

      let nx = -dX;
      let ny = -dY;
      let nz = 1.0;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      nx /= len;
      ny /= len;
      nz /= len;

      normalBytes[pIdx] = clampByte((nx * 0.5 + 0.5) * 255);
      normalBytes[pIdx + 1] = clampByte((ny * 0.5 + 0.5) * 205 + 25);
      normalBytes[pIdx + 2] = clampByte((nz * 0.5 + 0.5) * 255);
      normalBytes[pIdx + 3] = 255;

      const rByte = clampByte(roughGrid[gIdx] * 255);
      roughBytes[pIdx] = rByte;
      roughBytes[pIdx + 1] = rByte;
      roughBytes[pIdx + 2] = rByte;
      roughBytes[pIdx + 3] = 255;
    }
  }

  const configureTex = (tex: THREE.DataTexture, isSRGB: boolean) => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    tex.colorSpace = isSRGB ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    tex.magFilter = isSRGB ? THREE.NearestFilter : THREE.LinearFilter;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.generateMipmaps = true;
    tex.anisotropy = 8;
    tex.needsUpdate = true;
    return tex;
  };

  const map = configureTex(new THREE.DataTexture(albedoBytes, SIZE, SIZE, THREE.RGBAFormat), true);
  const normalMap = configureTex(new THREE.DataTexture(normalBytes, SIZE, SIZE, THREE.RGBAFormat), false);
  const roughnessMap = configureTex(new THREE.DataTexture(roughBytes, SIZE, SIZE, THREE.RGBAFormat), false);

  return { map, normalMap, roughnessMap };
}

const cache = new Map<string, PBRMaterialMaps>();

export function getPBRBlockMaps(key: BlockMaterialKey, repeatX = 1, repeatY = 1): PBRMaterialMaps {
  const cacheKey = `${key}:${repeatX}:${repeatY}`;
  const existing = cache.get(cacheKey);
  if (existing) return existing;

  const generated = synthesizeBlockMaps(key, repeatX, repeatY);
  cache.set(cacheKey, generated);
  return generated;
}
