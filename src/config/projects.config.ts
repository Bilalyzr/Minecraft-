export type PavilionStyle =
  | 'conservatory'
  | 'redstone_tower'
  | 'timber_hall'
  | 'marble_citadel'
  | 'lakeside_deck'
  | 'sakura_pagoda';

export interface ProjectMetric {
  label: string;
  value: string;
}

export interface ProjectNPCGuide {
  name: string;
  role: string;
  jacketColor: string;
  pantsColor: string;
  hairColor: string;
  dialogue: string;
}

export interface PortfolioProject {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  category: 'AI & Agents' | 'Cloud & Systems' | '3D & Creative' | 'FinTech' | 'Spatial IoT' | 'Open Source';
  districtName: string;
  position: [number, number, number];
  rotationY: number;
  architectureStyle: PavilionStyle;
  accentColor: string;
  secondaryColor: string;
  techStack: string[];
  metrics: ProjectMetric[];
  summary: string;
  highlights: string[];
  liveUrl: string;
  repoUrl: string;
  imageUrl?: string;
  videoUrl?: string;
  screenVisualType: 'neural_graph' | 'telemetry_matrix' | 'shader_canvas' | 'orderbook_pulse' | 'spatial_map' | 'voxel_engine';
  npcGuide: ProjectNPCGuide;
}

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: 'neural-forge',
    number: '01',
    title: 'NeuralForge AI Studio',
    subtitle: 'Multi-Agent Orchestration & Real-Time RAG Workspace',
    category: 'AI & Agents',
    districtName: 'North-West Glass Conservatory',
    position: [-34, 0, -28],
    rotationY: Math.PI * 0.22,
    architectureStyle: 'conservatory',
    accentColor: '#38bdf8',
    secondaryColor: '#818cf8',
    techStack: ['TypeScript', 'Next.js', 'PyTorch', 'FastAPI', 'pgvector', 'WebSockets'],
    metrics: [
      { label: 'Token Latency', value: '< 38ms' },
      { label: 'Active Workflows', value: '24K+' },
      { label: 'Retrieval Recall', value: '97.4%' },
    ],
    summary:
      'Visual node-based autonomous agent builder combining hybrid dense/sparse vector search, live streaming execution traces, and deterministic sandboxed tool execution.',
    highlights: [
      'Designed zero-copy WebSocket token streaming pipeline supporting 5,000+ concurrent agent sessions.',
      'Built hybrid HNSW + BM25 semantic reranking engine cutting hallucination rates by 62% on enterprise docs.',
      'Interactive DAG debugger allowing live state rewind, prompt branching, and cost telemetry per node.',
    ],
    liveUrl: 'https://example.com/neuralforge',
    repoUrl: 'https://github.com/example/neuralforge',
    screenVisualType: 'neural_graph',
    npcGuide: {
      name: 'Aria Chen',
      role: 'AI Research Architect',
      jacketColor: '#0284c7',
      pantsColor: '#1e293b',
      hairColor: '#18181b',
      dialogue:
        'Welcome to the Glass Conservatory! NeuralForge orchestrates multi-agent DAGs at sub-40ms latency—step onto the glowing pad to inspect it!',
    },
  },
  {
    id: 'cloud-pulse',
    number: '02',
    title: 'CloudPulse Telemetry',
    subtitle: 'eBPF Distributed Tracing & Zero-Overhead Observability',
    category: 'Cloud & Systems',
    districtName: 'North-East Redstone Spire',
    position: [34, 0, -28],
    rotationY: -Math.PI * 0.22,
    architectureStyle: 'redstone_tower',
    accentColor: '#fb7185',
    secondaryColor: '#f97316',
    techStack: ['Rust', 'eBPF', 'ClickHouse', 'gRPC', 'Kubernetes', 'React'],
    metrics: [
      { label: 'Events / Sec', value: '1.4M/s' },
      { label: 'CPU Overhead', value: '0.7%' },
      { label: 'Query P99', value: '85ms' },
    ],
    summary:
      'High-throughput kernel-level observability mesh built with Rust and eBPF, ingesting over 1.4M spans per second into columnar storage with instant flamegraph correlation.',
    highlights: [
      'Authored Linux eBPF socket probes capturing HTTP/2 & gRPC golden signals without SDK code changes.',
      'Engineered lock-free ring-buffer aggregator in Rust reducing memory footprint by 78% vs JVM collectors.',
      'Real-time 3D service-mesh topology visualizer pinpointing cascading microservice bottlenecks automatically.',
    ],
    liveUrl: 'https://example.com/cloudpulse',
    repoUrl: 'https://github.com/example/cloudpulse',
    screenVisualType: 'telemetry_matrix',
    npcGuide: {
      name: 'Marcus Vance',
      role: 'Distributed Systems Lead',
      jacketColor: '#e11d48',
      pantsColor: '#27272a',
      hairColor: '#78350f',
      dialogue:
        'Hear that hum? CloudPulse processes 1.4 million kernel spans a second in Rust with less than 1% CPU overhead!',
    },
  },
  {
    id: 'pixel-craft',
    number: '03',
    title: 'PixelCraft 3D Studio',
    subtitle: 'Multiplayer Browser CAD, Voxel & PBR Material Editor',
    category: '3D & Creative',
    districtName: 'East Sakura Timber Boulevard',
    position: [46, 0, 12],
    rotationY: -Math.PI * 0.48,
    architectureStyle: 'timber_hall',
    accentColor: '#f59e0b',
    secondaryColor: '#ec4899',
    techStack: ['Three.js', 'WebGPU', 'GLSL', 'CRDT / Yjs', 'React 19', 'WASM'],
    metrics: [
      { label: 'Frame Rate', value: '120 FPS' },
      { label: 'Co-Editors', value: '64 Live' },
      { label: 'Export Formats', value: 'glTF / USDZ' },
    ],
    summary:
      'Collaborative browser-based 3D voxel and subdivision modeling studio powered by conflict-free replicated data types (CRDTs) and real-time physically based path-traced previews.',
    highlights: [
      'Implemented GPU-instanced octree meshing capable of sculpting 4M+ voxels interactively at 120 FPS.',
      'Integrated Yjs WebRTC/WebSocket sync with sub-frame cursor presence and lossless undo/redo across peers.',
      'One-click procedural PBR bevel & ambient occlusion baker exporting compressed Meshopt glTF 2.0 assets.',
    ],
    liveUrl: 'https://example.com/pixelcraft',
    repoUrl: 'https://github.com/example/pixelcraft',
    screenVisualType: 'shader_canvas',
    npcGuide: {
      name: 'Sora Takahashi',
      role: 'Graphics & Shader Artist',
      jacketColor: '#d97706',
      pantsColor: '#1f2937',
      hairColor: '#292524',
      dialogue:
        'Up to 64 artists sculpt PBR 3D scenes together in real time inside PixelCraft—no desktop install required!',
    },
  },
  {
    id: 'fin-flow',
    number: '04',
    title: 'FinFlow Quant Engine',
    subtitle: 'Low-Latency Algorithmic Liquidity & Risk Analytics',
    category: 'FinTech',
    districtName: 'West Marble Citadel',
    position: [-46, 0, 12],
    rotationY: Math.PI * 0.48,
    architectureStyle: 'marble_citadel',
    accentColor: '#10b981',
    secondaryColor: '#14b8a6',
    techStack: ['Rust', 'C++20', 'Python', 'TimescaleDB', 'Kafka', 'WebGL'],
    metrics: [
      { label: 'Tick-to-Trade', value: '140 µs' },
      { label: 'Backtest Speed', value: '40x Faster' },
      { label: 'Uptime SLA', value: '99.995%' },
    ],
    summary:
      'Deterministic event-driven market microstructure simulator and real-time portfolio VaR risk dashboard rendering L3 orderbook depth at 60 FPS via WebGL.',
    highlights: [
      'Built SIMD-accelerated limit orderbook replay engine processing 500M historical ticks in under 9 seconds.',
      'Custom WebGL2 instanced depth-heatmap & execution analytics terminal handling 10,000 updates/sec smoothly.',
      'Automated circuit-breaker & Monte Carlo margin stress-testing across 40+ spot and derivatives venues.',
    ],
    liveUrl: 'https://example.com/finflow',
    repoUrl: 'https://github.com/example/finflow',
    screenVisualType: 'orderbook_pulse',
    npcGuide: {
      name: 'Elena Rostova',
      role: 'Quantitative Engineer',
      jacketColor: '#059669',
      pantsColor: '#0f172a',
      hairColor: '#eab308',
      dialogue:
        'FinFlow replays half a billion L3 market ticks in seconds—check out the real-time risk metrics inside the Marble Citadel!',
    },
  },
  {
    id: 'terra-sense',
    number: '05',
    title: 'TerraSense Digital Twin',
    subtitle: 'Geospatial Climate, Renewable Grid & IoT Fleet Platform',
    category: 'Spatial IoT',
    districtName: 'South-East Emerald Lakeside',
    position: [26, 0, 58],
    rotationY: -Math.PI * 0.82,
    architectureStyle: 'lakeside_deck',
    accentColor: '#06b6d4',
    secondaryColor: '#22c55e',
    techStack: ['Deck.gl', 'Three.js', 'Go', 'MQTT', 'PostGIS', 'TensorFlow'],
    metrics: [
      { label: 'IoT Sensors', value: '180K+' },
      { label: 'Forecast Gain', value: '+31%' },
      { label: 'Grid Saved', value: '42 GWh' },
    ],
    summary:
      'Planetary-scale 3D geospatial digital twin fusing live satellite imagery, 180,000+ MQTT micro-weather sensors, and spatio-temporal graph neural networks for solar/wind grid balancing.',
    highlights: [
      'Streamed tiled 3D terrain & animated wind-field particle shaders across metropolitan utility grids.',
      'Go + MQTT broker cluster sustaining 250k concurrent edge telemetry streams with automatic backfill.',
      'Spatio-temporal GNN cloud-cover predictor improving 4-hour solar dispatch accuracy by 31%.',
    ],
    liveUrl: 'https://example.com/terrasense',
    repoUrl: 'https://github.com/example/terrasense',
    screenVisualType: 'spatial_map',
    npcGuide: {
      name: 'Liam O’Connor',
      role: 'Geospatial Systems Engineer',
      jacketColor: '#0891b2',
      pantsColor: '#334155',
      hairColor: '#b45309',
      dialogue:
        'Down here by the spring lake, TerraSense tracks 180,000 live sensors to balance renewable energy grids in 3D!',
    },
  },
  {
    id: 'open-voxel',
    number: '06',
    title: 'OpenVoxel RTX Engine',
    subtitle: 'Open-Source WebGL2/WebGPU PBR Voxel & Physics Toolkit',
    category: 'Open Source',
    districtName: 'South-West Sakura Pagoda',
    position: [-26, 0, 58],
    rotationY: Math.PI * 0.82,
    architectureStyle: 'sakura_pagoda',
    accentColor: '#ec4899',
    secondaryColor: '#a855f7',
    techStack: ['Three.js', 'Rapier WASM', 'GLSL', 'TypeScript', 'Vite', 'GitHub Actions'],
    metrics: [
      { label: 'GitHub Stars', value: '4.8K ★' },
      { label: 'Draw Calls', value: '< 95' },
      { label: 'Bundle Size', value: '48 KB gz' },
    ],
    summary:
      'Modular open-source toolkit for building physically-lit voxel worlds on the web—featuring greedy chunk instancing, procedural Sobel normal-map generation, caustics water, and WASM vehicle physics.',
    highlights: [
      'Zero-asset procedural PBR texture synthesizer generating crisp albedo, Sobel normal, and roughness maps on boot.',
      'Interactive GPU foliage system supporting 60,000+ wind-swaying blades with multi-entity collision parting.',
      'Drop-in Rapier 4-wheel suspension vehicle & articulated character controllers built for 60 FPS browsers.',
    ],
    liveUrl: 'https://example.com/openvoxel',
    repoUrl: 'https://github.com/example/openvoxel',
    screenVisualType: 'voxel_engine',
    npcGuide: {
      name: 'Kenji Sato',
      role: 'Open-Source Maintainer',
      jacketColor: '#db2777',
      pantsColor: '#1e1b4b',
      hairColor: '#09090b',
      dialogue:
        'This entire Sakura Pagoda runs on OpenVoxel principles—procedural PBR normals, GPU wind grass, and WASM physics!',
    },
  },
];
