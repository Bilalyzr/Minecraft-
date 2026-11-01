import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CylinderCollider, RigidBody } from '@react-three/rapier';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { getPBRBlockMaps } from '../textures/pbrTextures';
import { PORTFOLIO_PROJECTS } from '../config/projects.config';
import { RIVER_Z_MAX, RIVER_Z_MIN } from '../config/world.config';
import { useWorldStore } from '../store/useWorldStore';

const GRASS_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform vec3 uPlayerPos;
  uniform vec3 uRoverPos;
  uniform vec3 uKartPos;
  uniform vec3 uScooterPos;

  varying float vHeightFrac;
  varying float vShade;

  void main() {
    vHeightFrac = clamp(position.y / 0.76, 0.0, 1.0);

    vec4 instWorld = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    vec3 localPos = position;

    // Gentle rolling spring meadow wind waves
    float gust = sin(instWorld.x * 0.14 + uTime * 2.0) * cos(instWorld.z * 0.13 + uTime * 1.5);
    float microSway = sin(instWorld.x * 1.6 + instWorld.z * 1.2 + uTime * 3.1) * 0.05;
    float bendFactor = vHeightFrac * vHeightFrac;

    localPos.x += (gust * 0.24 + microSway) * bendFactor;
    localPos.z += (gust * 0.15) * bendFactor;

    // Dynamic physical parting underneath player footsteps & all 3 vehicles!
    vec3 worldBase = instWorld.xyz;
    vec3 interactors[4];
    interactors[0] = uPlayerPos;
    interactors[1] = uRoverPos;
    interactors[2] = uKartPos;
    interactors[3] = uScooterPos;

    for (int i = 0; i < 4; i++) {
      float radius = (i == 0 || i == 3) ? 1.6 : 2.6;
      vec2 diff = worldBase.xz - interactors[i].xz;
      float dist = length(diff);
      if (dist < radius && dist > 0.001) {
        float push = (1.0 - dist / radius) * bendFactor;
        vec2 dir = diff / dist;
        localPos.x += dir.x * push * 0.72;
        localPos.z += dir.y * push * 0.72;
        localPos.y -= push * 0.36;
      }
    }

    vShade = 0.5 + 0.5 * gust;
    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(localPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const GRASS_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uRootColor;
  uniform vec3 uTipColor;
  uniform float uLightScale;

  varying float vHeightFrac;
  varying float vShade;

  void main() {
    vec3 col = mix(uRootColor, uTipColor, pow(vHeightFrac, 0.8));
    col *= (0.88 + vShade * 0.22) * uLightScale;
    gl_FragColor = vec4(col, 1.0);
  }
`;

function isOnRoadOrPlaza(x: number, z: number): boolean {
  // Central Blossom Courtyard
  if (Math.abs(x) < 15.0 && z > -11.5 && z < 15.5) return true;
  // River + sandy beaches
  if (z > RIVER_Z_MIN - 2.3 && z < RIVER_Z_MAX + 2.3) return true;
  // Windmill Hill footprint
  if (Math.abs(x) < 15.5 && z < -46 && z > -73) return true;
  // Walkable Knolls footprints
  const knolls: [number, number, number][] = [
    [-70, -14, 12],
    [70, -14, 12],
    [-66, 66, 12],
    [66, 66, 12],
    [-56, -56, 13],
    [56, -56, 13],
  ];
  for (const [kx, kz, kr] of knolls) {
    if (Math.abs(x - kx) < kr && Math.abs(z - kz) < kr) return true;
  }
  // North-South & Cross Boulevards
  if (Math.abs(x) < 5.0 && z > -48 && z < 54) return true;
  if ((Math.abs(x + 34) < 4.5 || Math.abs(x - 34) < 4.5) && z > -26 && z < 54) return true;
  if (Math.abs(z + 18) < 4.4 && Math.abs(x) < 39) return true;
  if (Math.abs(z - 13.5) < 4.5 && Math.abs(x) < 48) return true;
  if (Math.abs(z - 50) < 4.5 && Math.abs(x) < 43) return true;
  // Project Pavilion footprints
  for (const p of PORTFOLIO_PROJECTS) {
    const dx = x - p.position[0];
    const dz = z - p.position[2];
    if (dx * dx + dz * dz < 13.5 * 13.5) return true;
  }
  return false;
}

interface TreePlacement {
  x: number;
  y: number;
  z: number;
  scale: number;
  rotY: number;
  species: 'sakura' | 'birch' | 'oak';
  hasDecor: boolean;
}

export function SpringFoliage() {
  const qualityTier = useWorldStore((s) => s.qualityTier);
  const timeOfDay = useWorldStore((s) => s.timeOfDay);

  const grassCount = qualityTier === 'ultra' ? 54000 : qualityTier === 'balanced' ? 30000 : 14000;
  const flowerCount = qualityTier === 'ultra' ? 4200 : 2200;

  const cherryBarkMaps = useMemo(() => getPBRBlockMaps('cherry_bark', 1, 2), []);
  const birchBarkMaps = useMemo(() => getPBRBlockMaps('birch_bark', 1, 3), []);
  const oakPlankMaps = useMemo(() => getPBRBlockMaps('oak_planks', 2, 2), []);
  const blossomMaps = useMemo(() => getPBRBlockMaps('sakura_blossom', 2, 2), []);
  const birchLeafMaps = useMemo(() => getPBRBlockMaps('birch_leaves', 2, 2), []);
  const oakLeafMaps = useMemo(() => getPBRBlockMaps('oak_leaves', 2, 2), []);
  const azaleaMaps = useMemo(() => getPBRBlockMaps('azalea_bush', 2, 2), []);

  const grassRef = useRef<THREE.InstancedMesh>(null);
  const flowerStemRef = useRef<THREE.InstancedMesh>(null);
  const flowerHeadRef = useRef<THREE.InstancedMesh>(null);
  const petalCarpetRef = useRef<THREE.InstancedMesh>(null);
  const azaleaRef = useRef<THREE.InstancedMesh>(null);
  const reedRef = useRef<THREE.InstancedMesh>(null);

  const sakuraTrunkRef = useRef<THREE.InstancedMesh>(null);
  const sakuraCanopyRef = useRef<THREE.InstancedMesh>(null);
  const birchTrunkRef = useRef<THREE.InstancedMesh>(null);
  const birchCanopyRef = useRef<THREE.InstancedMesh>(null);
  const oakTrunkRef = useRef<THREE.InstancedMesh>(null);
  const oakCanopyRef = useRef<THREE.InstancedMesh>(null);
  const beesGroupRef = useRef<THREE.Group>(null);

  const grassUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPlayerPos: { value: new THREE.Vector3(0, 0, 11.5) },
      uRoverPos: { value: new THREE.Vector3(10.8, 0, 8.8) },
      uKartPos: { value: new THREE.Vector3(-10.8, 0, 8.8) },
      uScooterPos: { value: new THREE.Vector3(6.8, 0, 13.8) },
      uRootColor: { value: new THREE.Color('#2d9d2a') },
      uTipColor: { value: new THREE.Color('#8ee344') },
      uLightScale: { value: 1.0 },
    }),
    []
  );

  const bladeGeo = useMemo(() => {
    const geo = new THREE.ConeGeometry(0.1, 0.76, 3, 1);
    geo.translate(0, 0.38, 0);
    return geo;
  }, []);

  const voxelGeo = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 2, 0.07), []);

  // Comprehensive Multi-Species Forest Distribution Across the Entire 200m x 200m Valley!
  const { sakuraTrees, birchTrees, oakTrees } = useMemo(() => {
    const sakuraCoords: [number, number, number][] = [
      // Framing Central Blossom Plaza & Fountain
      [-16.5, 0, -9.5],
      [16.5, 0, -9.5],
      [-17.0, 0, 7.5],
      [17.0, 0, 7.5],
      // River Promenade & Bridge Entrances
      [-12.5, 0, 27.5],
      [12.5, 0, 27.5],
      [-24.5, 0, 28.0],
      [24.5, 0, 28.0],
      [-45.0, 0, 27.8],
      [45.0, 0, 27.8],
      [-13.5, 0, 45.2],
      [15.5, 0, 45.2],
      [-44.5, 0, 45.5],
      [44.5, 0, 45.5],
      // Around Project Pavilions
      [-48, 0, -28],
      [-21, 0, -36],
      [21, 0, -36],
      [48, 0, -28],
      [-60, 0, 12],
      [60, 0, 12],
      [-41, 0, 62],
      [41, 0, 62],
      [0, 0, 65],
      [-14, 0, 68],
      [14, 0, 68],
      // Outer Valley & Atop Walkable Terraced Knolls!
      [-70, 2.2, -14],
      [70, 2.2, -14],
      [-66, 2.1, 66],
      [66, 2.1, 66],
      [-56, 2.5, -56],
      [56, 2.5, -56],
      [-82, 0, -40],
      [82, 0, -40],
      [-80, 0, 24],
      [80, 0, 24],
      [-76, 0, 82],
      [76, 0, 82],
      [0, 0, 84],
    ];

    const birchCoords: [number, number, number][] = [
      [-25, 0, -5],
      [25, 0, -5],
      [-26, 0, 22],
      [26, 0, 22],
      [-54, 0, -12],
      [54, 0, -12],
      [-54, 0, 26],
      [54, 0, 26],
      [-18, 0, -44],
      [18, 0, -44],
      [-38, 0, -48],
      [38, 0, -48],
      [-52, 0, 56],
      [52, 0, 56],
      [-28, 0, 76],
      [28, 0, 76],
      [-78, 0, -68],
      [78, 0, -68],
      [-84, 0, 50],
      [84, 0, 50],
    ];

    const oakCoords: [number, number, number][] = [
      [-19, 0, -27],
      [19, 0, -27],
      [-42, 0, -6],
      [42, 0, -6],
      [-62, 0, -34],
      [62, 0, -34],
      [-62, 0, 46],
      [62, 0, 46],
      [-20, 0, 58],
      [20, 0, 58],
      [-46, 0, 78],
      [46, 0, 78],
      [-84, 0, -4],
      [84, 0, -4],
      [-32, 0, -68],
      [32, 0, -68],
    ];

    const mapSpecies = (
      arr: [number, number, number][],
      species: 'sakura' | 'birch' | 'oak'
    ): TreePlacement[] =>
      arr.map(([x, y, z], i) => ({
        x,
        y,
        z,
        scale: 0.92 + ((i * 37) % 9) * 0.045,
        rotY: ((i * 73) % 360) * (Math.PI / 180),
        species,
        hasDecor: i % 2 === 0,
      }));

    return {
      sakuraTrees: mapSpecies(sakuraCoords, 'sakura'),
      birchTrees: mapSpecies(birchCoords, 'birch'),
      oakTrees: mapSpecies(oakCoords, 'oak'),
    };
  }, []);

  // Flowering Azalea Shrubs & Hedgerows
  const azaleaBushes = useMemo<[number, number, number][]>(
    () => [
      [-13.5, 0, -5],
      [13.5, 0, -5],
      [-13.5, 0, 4],
      [13.5, 0, 4],
      [-7, 0, -11.5],
      [7, 0, -11.5],
      [-19, 0, -14],
      [19, 0, -14],
      [-25, 0, -14],
      [25, 0, -14],
      [-19, 0, 17.8],
      [19, 0, 17.8],
      [-26, 0, 17.8],
      [26, 0, 17.8],
      [-9, 0, 28.5],
      [9, 0, 28.5],
      [-21, 0, 28.8],
      [21, 0, 28.8],
      [-16, 0, 45.5],
      [16, 0, 45.5],
      [-30, 0, 46.5],
      [30, 0, 46.5],
      [-8, 1.2, -52],
      [8, 1.2, -52],
      [-40, 0, -22],
      [40, 0, -22],
      [-52, 0, 6],
      [52, 0, 6],
      [-34, 0, 63],
      [34, 0, 63],
    ],
    []
  );

  // Cute Buzzing Minecraft Bees Orbiting Beehives & Flower Meadows
  const beeHomes = useMemo<[number, number, number][]>(
    () => [
      [-19, 2.2, -27],
      [19, 2.2, -27],
      [-16.5, 2.0, -9.5],
      [16.5, 2.0, -9.5],
      [-42, 2.2, -6],
      [42, 2.2, -6],
      [-20, 2.1, 58],
      [20, 2.1, 58],
      [-12, 1.8, 28],
      [12, 1.8, 28],
      [0, 3.6, -54],
      [-28, 1.9, 16],
    ],
    []
  );

  // Populate Grass, Multi-Species 3D Flowers, Pink Petal Carpets, Azaleas & River Reeds
  useEffect(() => {
    const dummy = new THREE.Object3D();

    if (grassRef.current) {
      let placed = 0;
      let seed = 1337;
      const rand = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };
      let attempts = 0;
      while (placed < grassCount && attempts < grassCount * 2.5) {
        attempts++;
        const x = (rand() - 0.5) * 184;
        const z = (rand() - 0.5) * 184;
        if (isOnRoadOrPlaza(x, z)) continue;

        const scaleH = 0.65 + rand() * 0.8;
        dummy.position.set(x, 0, z);
        dummy.rotation.set(0, rand() * Math.PI * 2, 0);
        dummy.scale.set(0.9 + rand() * 0.45, scaleH, 0.9 + rand() * 0.45);
        dummy.updateMatrix();
        grassRef.current.setMatrixAt(placed, dummy.matrix);
        placed++;
      }
      grassRef.current.count = placed;
      grassRef.current.instanceMatrix.needsUpdate = true;
    }

    if (flowerStemRef.current && flowerHeadRef.current) {
      const palette = [
        new THREE.Color('#f472b6'), // Pink Tulip
        new THREE.Color('#facc15'), // Golden Dandelion
        new THREE.Color('#ef4444'), // Minecraft Red Poppy
        new THREE.Color('#fef9c3'), // Oxeye Daisy
        new THREE.Color('#3b82f6'), // Cornflower Blue
        new THREE.Color('#c084fc'), // Allium Violet
        new THREE.Color('#fb923c'), // Orange Tulip
      ];
      let placed = 0;
      let seed = 9001;
      const rand = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };
      let attempts = 0;
      while (placed < flowerCount && attempts < flowerCount * 3) {
        attempts++;
        const x = (rand() - 0.5) * 176;
        const z = (rand() - 0.5) * 176;
        if (isOnRoadOrPlaza(x, z)) continue;

        const h = 0.28 + rand() * 0.2;
        // Green Stem
        dummy.position.set(x, h * 0.5, z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(0.05, h, 0.05);
        dummy.updateMatrix();
        flowerStemRef.current.setMatrixAt(placed, dummy.matrix);

        // Colorful 3D Blossom Head
        const s = 0.16 + rand() * 0.11;
        dummy.position.set(x, h + s * 0.45, z);
        dummy.rotation.set(0, rand() * Math.PI, 0);
        dummy.scale.set(s, s * 0.95, s);
        dummy.updateMatrix();
        flowerHeadRef.current.setMatrixAt(placed, dummy.matrix);
        flowerHeadRef.current.setColorAt(placed, palette[placed % palette.length]);
        placed++;
      }
      flowerStemRef.current.count = placed;
      flowerStemRef.current.instanceMatrix.needsUpdate = true;
      flowerHeadRef.current.count = placed;
      flowerHeadRef.current.instanceMatrix.needsUpdate = true;
      if (flowerHeadRef.current.instanceColor) flowerHeadRef.current.instanceColor.needsUpdate = true;
    }

    // Authentic Minecraft Pink Petal Carpets Under Every Cherry Blossom Tree!
    if (petalCarpetRef.current) {
      let pIdx = 0;
      sakuraTrees.forEach((t, ti) => {
        for (let k = 0; k < 14; k++) {
          const ang = (k / 14) * Math.PI * 2 + ti;
          const rad = 1.1 + ((k * 19 + ti * 7) % 10) * 0.28;
          dummy.position.set(t.x + Math.cos(ang) * rad, t.y + 0.03, t.z + Math.sin(ang) * rad);
          dummy.rotation.set(0, ang, 0);
          dummy.scale.set(0.34, 0.04, 0.34);
          dummy.updateMatrix();
          petalCarpetRef.current!.setMatrixAt(pIdx++, dummy.matrix);
        }
      });
      petalCarpetRef.current.count = pIdx;
      petalCarpetRef.current.instanceMatrix.needsUpdate = true;
    }

    // Flowering Azalea Bushes
    if (azaleaRef.current) {
      azaleaBushes.forEach(([ax, ay, az], idx) => {
        dummy.position.set(ax, ay + 0.52, az);
        dummy.rotation.set(0, idx * 0.7, 0);
        dummy.scale.set(1.25, 1.05, 1.25);
        dummy.updateMatrix();
        azaleaRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      azaleaRef.current.count = azaleaBushes.length;
      azaleaRef.current.instanceMatrix.needsUpdate = true;
    }

    // Riverside Sugar Cane / Emerald Reeds Along Both Sandy Riverbanks
    if (reedRef.current) {
      let rIdx = 0;
      for (let i = 0; i < 45; i++) {
        const rx = -82 + i * 3.7;
        // Skip bridge crossings
        if (Math.abs(rx) < 6 || Math.abs(rx + 34) < 5 || Math.abs(rx - 34) < 5) continue;
        const bankZ = i % 2 === 0 ? RIVER_Z_MIN - 0.55 : RIVER_Z_MAX + 0.55;
        dummy.position.set(rx, 0.65, bankZ);
        dummy.rotation.set(0, i * 0.5, 0);
        dummy.scale.set(0.14, 1.5 + (i % 3) * 0.35, 0.14);
        dummy.updateMatrix();
        reedRef.current.setMatrixAt(rIdx++, dummy.matrix);
      }
      reedRef.current.count = rIdx;
      reedRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [grassCount, flowerCount, sakuraTrees, azaleaBushes]);

  // Populate All 3 Tree Species (Sakura, White Birch, Spring Oak)
  useEffect(() => {
    const dummy = new THREE.Object3D();

    // 1. Sakura Cherry Blossom Groves
    if (sakuraTrunkRef.current && sakuraCanopyRef.current) {
      let tIdx = 0;
      let cIdx = 0;
      const canopyOffsets: [number, number, number, number, number, number][] = [
        [0, 5.1, 0, 4.4, 2.2, 4.4],
        [-1.8, 4.4, 0.9, 2.9, 1.8, 2.9],
        [1.9, 4.5, -0.8, 3.0, 1.8, 2.8],
        [0.4, 6.2, 0.3, 2.9, 1.6, 2.9],
        [-0.8, 3.9, -1.5, 2.6, 1.5, 2.6],
      ];

      sakuraTrees.forEach((tree) => {
        const cos = Math.cos(tree.rotY);
        const sin = Math.sin(tree.rotY);

        dummy.position.set(tree.x, tree.y + 2.1 * tree.scale, tree.z);
        dummy.rotation.set(0, tree.rotY, 0);
        dummy.scale.set(0.78 * tree.scale, 4.2 * tree.scale, 0.78 * tree.scale);
        dummy.updateMatrix();
        sakuraTrunkRef.current!.setMatrixAt(tIdx++, dummy.matrix);

        dummy.position.set(
          tree.x - cos * 0.85 * tree.scale,
          tree.y + 3.65 * tree.scale,
          tree.z - sin * 0.85 * tree.scale
        );
        dummy.rotation.set(0.25, tree.rotY, 0.42);
        dummy.scale.set(0.48 * tree.scale, 2.1 * tree.scale, 0.48 * tree.scale);
        dummy.updateMatrix();
        sakuraTrunkRef.current!.setMatrixAt(tIdx++, dummy.matrix);

        dummy.position.set(
          tree.x + cos * 0.85 * tree.scale,
          tree.y + 3.75 * tree.scale,
          tree.z + sin * 0.85 * tree.scale
        );
        dummy.rotation.set(-0.2, tree.rotY, -0.4);
        dummy.scale.set(0.48 * tree.scale, 2.1 * tree.scale, 0.48 * tree.scale);
        dummy.updateMatrix();
        sakuraTrunkRef.current!.setMatrixAt(tIdx++, dummy.matrix);

        canopyOffsets.forEach(([ox, oy, oz, sx, sy, sz]) => {
          const rx = ox * cos - oz * sin;
          const rz = ox * sin + oz * cos;
          dummy.position.set(
            tree.x + rx * tree.scale,
            tree.y + oy * tree.scale,
            tree.z + rz * tree.scale
          );
          dummy.rotation.set(0, tree.rotY, 0);
          dummy.scale.set(sx * tree.scale, sy * tree.scale, sz * tree.scale);
          dummy.updateMatrix();
          sakuraCanopyRef.current!.setMatrixAt(cIdx++, dummy.matrix);
        });
      });

      sakuraTrunkRef.current.count = tIdx;
      sakuraTrunkRef.current.instanceMatrix.needsUpdate = true;
      sakuraCanopyRef.current.count = cIdx;
      sakuraCanopyRef.current.instanceMatrix.needsUpdate = true;
    }

    // 2. White Birch Trees
    if (birchTrunkRef.current && birchCanopyRef.current) {
      let cIdx = 0;
      birchTrees.forEach((tree, i) => {
        dummy.position.set(tree.x, tree.y + 2.7 * tree.scale, tree.z);
        dummy.rotation.set(0, tree.rotY, 0);
        dummy.scale.set(0.62 * tree.scale, 5.4 * tree.scale, 0.62 * tree.scale);
        dummy.updateMatrix();
        birchTrunkRef.current!.setMatrixAt(i, dummy.matrix);

        // Tall airy layered birch crown
        [
          [0, 5.0, 0, 3.2, 2.2, 3.2],
          [0, 6.6, 0, 2.2, 1.8, 2.2],
        ].forEach(([ox, oy, oz, sx, sy, sz]) => {
          dummy.position.set(tree.x + ox, tree.y + oy * tree.scale, tree.z + oz);
          dummy.rotation.set(0, tree.rotY, 0);
          dummy.scale.set(sx * tree.scale, sy * tree.scale, sz * tree.scale);
          dummy.updateMatrix();
          birchCanopyRef.current!.setMatrixAt(cIdx++, dummy.matrix);
        });
      });
      birchTrunkRef.current.count = birchTrees.length;
      birchTrunkRef.current.instanceMatrix.needsUpdate = true;
      birchCanopyRef.current.count = cIdx;
      birchCanopyRef.current.instanceMatrix.needsUpdate = true;
    }

    // 3. Lush Spring Oak Trees
    if (oakTrunkRef.current && oakCanopyRef.current) {
      let cIdx = 0;
      oakTrees.forEach((tree, i) => {
        dummy.position.set(tree.x, tree.y + 2.2 * tree.scale, tree.z);
        dummy.rotation.set(0, tree.rotY, 0);
        dummy.scale.set(0.82 * tree.scale, 4.4 * tree.scale, 0.82 * tree.scale);
        dummy.updateMatrix();
        oakTrunkRef.current!.setMatrixAt(i, dummy.matrix);

        [
          [0, 4.8, 0, 4.2, 2.3, 4.2],
          [0.3, 6.2, -0.2, 2.8, 1.6, 2.8],
        ].forEach(([ox, oy, oz, sx, sy, sz]) => {
          dummy.position.set(tree.x + ox, tree.y + oy * tree.scale, tree.z + oz);
          dummy.rotation.set(0, tree.rotY, 0);
          dummy.scale.set(sx * tree.scale, sy * tree.scale, sz * tree.scale);
          dummy.updateMatrix();
          oakCanopyRef.current!.setMatrixAt(cIdx++, dummy.matrix);
        });
      });
      oakTrunkRef.current.count = oakTrees.length;
      oakTrunkRef.current.instanceMatrix.needsUpdate = true;
      oakCanopyRef.current.count = cIdx;
      oakCanopyRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [sakuraTrees, birchTrees, oakTrees]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const state = useWorldStore.getState();
    grassUniforms.uTime.value = t;
    grassUniforms.uPlayerPos.value.set(...state.playerPosition);
    grassUniforms.uRoverPos.value.set(...state.vehiclePositions.rover);
    grassUniforms.uKartPos.value.set(...state.vehiclePositions.kart);
    grassUniforms.uScooterPos.value.set(...state.vehiclePositions.scooter);

    grassUniforms.uLightScale.value =
      timeOfDay === 'night' ? 0.36 : timeOfDay === 'sunset' ? 0.92 : 1.06;

    // Animate Buzzing Minecraft Bees in gentle figure-8 orbits
    if (beesGroupRef.current) {
      beesGroupRef.current.children.forEach((bee, idx) => {
        const home = beeHomes[idx];
        if (!home) return;
        const angle = t * (1.2 + (idx % 3) * 0.25) + idx * 1.7;
        const nx = home[0] + Math.cos(angle) * 2.4;
        const nz = home[2] + Math.sin(angle * 1.5) * 2.1;
        const ny = home[1] + Math.sin(t * 3.8 + idx) * 0.35;
        const dx = nx - bee.position.x;
        const dz = nz - bee.position.z;
        bee.position.set(nx, ny, nz);
        if (Math.hypot(dx, dz) > 0.001) {
          bee.rotation.y = Math.atan2(-dx, -dz);
        }
      });
    }
  });

  const lanternEmissive = timeOfDay === 'night' ? 3.2 : timeOfDay === 'sunset' ? 2.2 : 0.95;
  const allColliderTrees = useMemo(
    () => [...sakuraTrees, ...birchTrees, ...oakTrees],
    [sakuraTrees, birchTrees, oakTrees]
  );

  return (
    <group>
      {/* 54,000+ Interactive Wind-Swaying & Entity-Parting Spring Grass Blades */}
      <instancedMesh ref={grassRef} args={[bladeGeo, undefined, grassCount]} frustumCulled={false}>
        <shaderMaterial
          vertexShader={GRASS_VERTEX_SHADER}
          fragmentShader={GRASS_FRAGMENT_SHADER}
          uniforms={grassUniforms}
          side={THREE.DoubleSide}
        />
      </instancedMesh>

      {/* Multi-Species 3D Spring Flowers (Green Stems + Colorful Blossom Heads) */}
      <instancedMesh ref={flowerStemRef} args={[voxelGeo, undefined, flowerCount]}>
        <meshStandardMaterial color="#22c55e" roughness={0.6} />
      </instancedMesh>
      <instancedMesh ref={flowerHeadRef} args={[voxelGeo, undefined, flowerCount]} castShadow>
        <meshStandardMaterial roughness={0.4} />
      </instancedMesh>

      {/* Pink Petal Ground Carpets Beneath Cherry Trees */}
      <instancedMesh
        ref={petalCarpetRef}
        args={[voxelGeo, undefined, sakuraTrees.length * 14]}
        receiveShadow
      >
        <meshStandardMaterial color="#f9a8d4" roughness={0.48} />
      </instancedMesh>

      {/* Flowering Azalea Bushes */}
      <instancedMesh
        ref={azaleaRef}
        args={[voxelGeo, undefined, azaleaBushes.length]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial {...azaleaMaps} />
      </instancedMesh>

      {/* Riverside Sugar Cane / Reeds */}
      <instancedMesh ref={reedRef} args={[voxelGeo, undefined, 45]} castShadow>
        <meshStandardMaterial color="#4ade80" roughness={0.5} />
      </instancedMesh>

      {/* 1. Sakura Cherry Blossom Groves */}
      <instancedMesh
        ref={sakuraTrunkRef}
        args={[voxelGeo, undefined, sakuraTrees.length * 3]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial {...cherryBarkMaps} />
      </instancedMesh>
      <instancedMesh
        ref={sakuraCanopyRef}
        args={[voxelGeo, undefined, sakuraTrees.length * 5]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          {...blossomMaps}
          emissive="#f472b6"
          emissiveIntensity={timeOfDay === 'sunset' ? 0.22 : 0.1}
        />
      </instancedMesh>

      {/* 2. White Birch Trees */}
      <instancedMesh
        ref={birchTrunkRef}
        args={[voxelGeo, undefined, birchTrees.length]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial {...birchBarkMaps} />
      </instancedMesh>
      <instancedMesh
        ref={birchCanopyRef}
        args={[voxelGeo, undefined, birchTrees.length * 2]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial {...birchLeafMaps} />
      </instancedMesh>

      {/* 3. Lush Spring Oak Trees */}
      <instancedMesh
        ref={oakTrunkRef}
        args={[voxelGeo, undefined, oakTrees.length]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial {...oakPlankMaps} />
      </instancedMesh>
      <instancedMesh
        ref={oakCanopyRef}
        args={[voxelGeo, undefined, oakTrees.length * 2]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial {...oakLeafMaps} />
      </instancedMesh>

      {/* Tree Trunk Colliders, Hanging Sakura Lanterns & Oak Beehives */}
      {allColliderTrees.map((tree, idx) => (
        <group key={idx} position={[tree.x, tree.y, tree.z]}>
          <RigidBody type="fixed">
            <CylinderCollider args={[1.8, 0.38 * tree.scale]} position={[0, 1.8, 0]} />
          </RigidBody>
          {tree.species === 'sakura' && tree.hasDecor && (
            <mesh position={[1.45 * tree.scale, 3.15 * tree.scale, 0]}>
              <boxGeometry args={[0.36, 0.46, 0.36]} />
              <meshStandardMaterial
                color="#fef3c7"
                emissive="#fb923c"
                emissiveIntensity={lanternEmissive}
              />
            </mesh>
          )}
          {tree.species === 'oak' && tree.hasDecor && (
            /* Golden Minecraft Oak Beehive Hanging Under Oak Canopy! */
            <mesh position={[1.15 * tree.scale, 3.25 * tree.scale, 0]} castShadow>
              <boxGeometry args={[0.62, 0.62, 0.62]} />
              <meshStandardMaterial color="#d97706" roughness={0.62} />
            </mesh>
          )}
        </group>
      ))}

      {/* Cute Articulated Buzzing Minecraft Voxel Bees */}
      <group ref={beesGroupRef}>
        {beeHomes.map((pos, idx) => (
          <group key={idx} position={pos}>
            {/* Golden Bee Body */}
            <mesh castShadow>
              <boxGeometry args={[0.26, 0.24, 0.36]} />
              <meshStandardMaterial color="#facc15" roughness={0.45} />
            </mesh>
            {/* Dark Brown Bee Stripes */}
            <mesh position={[0, 0, 0.04]}>
              <boxGeometry args={[0.27, 0.25, 0.08]} />
              <meshStandardMaterial color="#451a03" roughness={0.6} />
            </mesh>
            <mesh position={[0, 0, 0.14]}>
              <boxGeometry args={[0.27, 0.25, 0.07]} />
              <meshStandardMaterial color="#451a03" roughness={0.6} />
            </mesh>
            {/* Translucent White Bee Wings */}
            <mesh position={[-0.16, 0.14, -0.02]} rotation={[0, 0, 0.35]}>
              <boxGeometry args={[0.22, 0.03, 0.16]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.78} />
            </mesh>
            <mesh position={[0.16, 0.14, -0.02]} rotation={[0, 0, -0.35]}>
              <boxGeometry args={[0.22, 0.03, 0.16]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.78} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
