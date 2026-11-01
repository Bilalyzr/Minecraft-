import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import {
  RIVER_CENTER_Z,
  RIVER_WATER_Y,
  RIVER_Z_MAX,
  RIVER_Z_MIN,
  WORLD_HALF_EXTENT,
} from '../config/world.config';
import { useWorldStore } from '../store/useWorldStore';

const WATER_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);

    float wave1 = sin(worldPosition.x * 0.65 + uTime * 2.1) * 0.032;
    float wave2 = cos(worldPosition.z * 0.95 - uTime * 1.7) * 0.024;
    float wave3 = sin((worldPosition.x + worldPosition.z) * 1.4 + uTime * 2.9) * 0.012;
    worldPosition.y += wave1 + wave2 + wave3;

    float dx = cos(worldPosition.x * 0.65 + uTime * 2.1) * 0.04;
    float dz = -sin(worldPosition.z * 0.95 - uTime * 1.7) * 0.04;
    vNormal = normalize(vec3(-dx, 1.0, -dz));
    vWorldPos = worldPosition.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const WATER_FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform vec3 uSunDir;
  uniform vec3 uSkyColor;
  uniform vec3 uShallowColor;
  uniform vec3 uDeepColor;
  uniform float uIsRiver;

  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying vec3 vNormal;

  vec2 hash2(vec2 p) {
    return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
  }

  float voronoiCaustics(vec2 x, float time) {
    vec2 n = floor(x);
    vec2 f = fract(x);
    float m = 8.0;
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 g = vec2(float(i), float(j));
        vec2 o = hash2(n + g);
        o = 0.5 + 0.5 * sin(time * 1.85 + 6.2831 * o);
        vec2 r = g + o - f;
        float d = dot(r, r);
        m = min(m, d);
      }
    }
    return pow(clamp(m, 0.0, 1.0), 1.45);
  }

  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    vec3 normal = normalize(vNormal);

    vec2 flowUv = vWorldPos.xz * 0.52 + vec2(-uTime * 0.32, uTime * 0.08);
    float c1 = voronoiCaustics(flowUv, uTime);
    float c2 = voronoiCaustics(flowUv * 1.35 + vec2(3.1, -1.7), -uTime * 0.8);
    float caustics = clamp((c1 + c2) * 0.85, 0.0, 1.0);

    float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);

    float bankFoam = 0.0;
    if (uIsRiver > 0.5) {
      float edgeDist = min(abs(vUv.y - 0.0), abs(1.0 - vUv.y));
      float foamWave = 0.065 + 0.02 * sin(vWorldPos.x * 1.3 + uTime * 3.0);
      bankFoam = 1.0 - smoothstep(0.0, foamWave, edgeDist);
    }

    vec3 baseWater = mix(uDeepColor, uShallowColor, 0.48 + caustics * 0.45);
    baseWater += vec3(0.28, 0.62, 0.58) * pow(caustics, 2.1) * 0.62;

    vec3 halfVec = normalize(normalize(uSunDir) + viewDir);
    float spec = pow(max(dot(normal, halfVec), 0.0), 96.0);

    vec3 color = mix(baseWater, uSkyColor, clamp(fresnel * 0.7, 0.0, 0.8));
    color += vec3(1.0, 0.97, 0.88) * spec * 1.35;
    color = mix(color, vec3(0.96, 0.99, 1.0), bankFoam * 0.85);

    float alpha = mix(0.74, 0.92, clamp(fresnel + bankFoam * 0.5, 0.0, 1.0));
    gl_FragColor = vec4(color, alpha);
  }
`;

export function SpringWater() {
  const timeOfDay = useWorldStore((s) => s.timeOfDay);
  const lilyGroupRef = useRef<THREE.Group>(null);

  const riverUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSunDir: { value: new THREE.Vector3(0.6, 0.7, -0.4) },
      uSkyColor: { value: new THREE.Color('#cbeafe') },
      uShallowColor: { value: new THREE.Color('#34d399') },
      uDeepColor: { value: new THREE.Color('#0d9488') },
      uIsRiver: { value: 1.0 },
    }),
    []
  );

  const fountainUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSunDir: { value: new THREE.Vector3(0.6, 0.7, -0.4) },
      uSkyColor: { value: new THREE.Color('#cbeafe') },
      uShallowColor: { value: new THREE.Color('#38bdf8') },
      uDeepColor: { value: new THREE.Color('#0284c7') },
      uIsRiver: { value: 0.0 },
    }),
    []
  );

  // Authentic Minecraft Floating Emerald Lily Pads + Pink Water-Lily Flowers
  const lilyPads = useMemo(() => {
    const coords: { x: number; z: number; rot: number; hasFlower: boolean }[] = [
      { x: -18, z: 33.4, rot: 0.4, hasFlower: true },
      { x: -16.8, z: 34.3, rot: 1.8, hasFlower: false },
      { x: -22, z: 39.6, rot: 2.5, hasFlower: true },
      { x: -10, z: 39.8, rot: 0.9, hasFlower: true },
      { x: 11.5, z: 33.2, rot: 1.2, hasFlower: true },
      { x: 13.0, z: 34.1, rot: 3.1, hasFlower: false },
      { x: 19.5, z: 39.7, rot: 0.6, hasFlower: true },
      { x: 21.0, z: 38.9, rot: 2.1, hasFlower: false },
      { x: 44.5, z: 33.6, rot: 1.5, hasFlower: true },
      { x: 46.2, z: 39.4, rot: 2.7, hasFlower: true },
      { x: -46.0, z: 33.8, rot: 0.3, hasFlower: true },
      { x: -48.2, z: 39.2, rot: 1.9, hasFlower: false },
      { x: 58.0, z: 34.0, rot: 0.8, hasFlower: true },
      { x: -58.0, z: 38.8, rot: 2.4, hasFlower: true },
    ];
    return coords;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    riverUniforms.uTime.value = t;
    fountainUniforms.uTime.value = t;

    if (timeOfDay === 'sunset') {
      riverUniforms.uSkyColor.value.set('#fdba74');
      riverUniforms.uSunDir.value.set(-0.75, 0.25, -0.45);
      fountainUniforms.uSkyColor.value.set('#fdba74');
    } else if (timeOfDay === 'night') {
      riverUniforms.uSkyColor.value.set('#1e3a8a');
      riverUniforms.uShallowColor.value.set('#0e7490');
      riverUniforms.uDeepColor.value.set('#082f49');
      fountainUniforms.uSkyColor.value.set('#1e3a8a');
    } else {
      riverUniforms.uSkyColor.value.set('#cbeafe');
      riverUniforms.uShallowColor.value.set('#2dd4bf');
      riverUniforms.uDeepColor.value.set('#0d9488');
      riverUniforms.uSunDir.value.set(0.6, 0.7, -0.4);
      fountainUniforms.uSkyColor.value.set('#cbeafe');
    }

    if (lilyGroupRef.current) {
      lilyGroupRef.current.children.forEach((pad, idx) => {
        pad.position.y = RIVER_WATER_Y + 0.04 + Math.sin(t * 2.1 + idx * 0.9) * 0.025;
      });
    }
  });

  const riverWidth = RIVER_Z_MAX - RIVER_Z_MIN + 0.8;

  return (
    <group>
      {/* Full-Span Emerald Spring River Channel */}
      <mesh
        position={[0, RIVER_WATER_Y, RIVER_CENTER_Z]}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={2}
      >
        <planeGeometry args={[WORLD_HALF_EXTENT * 2, riverWidth, 150, 20]} />
        <shaderMaterial
          vertexShader={WATER_VERTEX_SHADER}
          fragmentShader={WATER_FRAGMENT_SHADER}
          uniforms={riverUniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Floating Minecraft Lily Pads & Pink Lotus Water-Lilies */}
      <group ref={lilyGroupRef}>
        {lilyPads.map((lp, idx) => (
          <group key={idx} position={[lp.x, RIVER_WATER_Y + 0.04, lp.z]} rotation={[0, lp.rot, 0]}>
            <mesh receiveShadow>
              <boxGeometry args={[0.82, 0.05, 0.82]} />
              <meshStandardMaterial color="#22c55e" roughness={0.45} />
            </mesh>
            {/* V-notch detail via dark teal cutout accent */}
            <mesh position={[0.3, 0.01, 0.3]}>
              <boxGeometry args={[0.24, 0.06, 0.24]} />
              <meshStandardMaterial color="#15803d" roughness={0.5} />
            </mesh>
            {lp.hasFlower && (
              <group position={[0, 0.1, 0]}>
                <mesh>
                  <boxGeometry args={[0.26, 0.16, 0.26]} />
                  <meshStandardMaterial
                    color="#f472b6"
                    emissive="#f472b6"
                    emissiveIntensity={0.22}
                    roughness={0.35}
                  />
                </mesh>
                <mesh position={[0, 0.09, 0]}>
                  <boxGeometry args={[0.1, 0.08, 0.1]} />
                  <meshStandardMaterial color="#fde047" emissive="#facc15" emissiveIntensity={0.35} />
                </mesh>
              </group>
            )}
          </group>
        ))}
      </group>

      {/* Central Blossom Plaza Fountain Basin Surface */}
      <mesh position={[0, 0.62, -2]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
        <circleGeometry args={[3.35, 32]} />
        <shaderMaterial
          vertexShader={WATER_VERTEX_SHADER}
          fragmentShader={WATER_FRAGMENT_SHADER}
          uniforms={fountainUniforms}
          transparent
          depthWrite={false}
        />
      </mesh>

      {/* Tiered Fountain Cascading Crystal Jets */}
      <mesh position={[0, 1.65, -2]}>
        <cylinderGeometry args={[0.26, 0.48, 2.2, 12]} />
        <meshPhysicalMaterial
          color="#7dd3fc"
          emissive="#38bdf8"
          emissiveIntensity={0.45}
          roughness={0.12}
          transmission={0.65}
          transparent
          opacity={0.78}
        />
      </mesh>
      <mesh position={[0, 1.35, -2]}>
        <cylinderGeometry args={[1.45, 1.6, 0.14, 16]} />
        <meshPhysicalMaterial
          color="#bae6fd"
          roughness={0.15}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Eastern Cliffside Spring Waterfall Plunging into River */}
      <mesh position={[96.5, 7.2, RIVER_CENTER_Z]}>
        <boxGeometry args={[1.8, 15.2, 6.4]} />
        <meshPhysicalMaterial
          color="#67e8f9"
          emissive="#22d3ee"
          emissiveIntensity={0.35}
          roughness={0.18}
          transparent
          opacity={0.78}
        />
      </mesh>
      <mesh position={[94.8, RIVER_WATER_Y + 0.22, RIVER_CENTER_Z]}>
        <boxGeometry args={[3.8, 0.5, 7.6]} />
        <meshStandardMaterial
          color="#f0f9ff"
          emissive="#bae6fd"
          emissiveIntensity={0.32}
          roughness={0.55}
          transparent
          opacity={0.85}
        />
      </mesh>
    </group>
  );
}
