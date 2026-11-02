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

export type ProjectCategory =
  | 'AI & Agents'
  | 'Cloud & Systems'
  | '3D & Creative'
  | 'FinTech'
  | 'Spatial IoT'
  | 'Open Source';

export type ScreenVisualType =
  | 'neural_graph'
  | 'telemetry_matrix'
  | 'shader_canvas'
  | 'orderbook_pulse'
  | 'spatial_map'
  | 'voxel_engine';

export interface PortfolioProject {
  id: string;
  number: string;
  chapterNumber?: string;
  chapterTitle?: string;
  storyNarrative?: string;
  title: string;
  subtitle: string;
  category: ProjectCategory;
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
  screenVisualType: ScreenVisualType;
  npcGuide: ProjectNPCGuide;
  isCustom?: boolean;
}

export const CUSTOM_PAVILION_SLOTS: {
  position: [number, number, number];
  rotationY: number;
  districtName: string;
}[] = [
  {
    position: [-52, 0, -24],
    rotationY: Math.PI * 0.35,
    districtName: 'North-West Blossom Terrace',
  },
  {
    position: [52, 0, -24],
    rotationY: -Math.PI * 0.35,
    districtName: 'North-East Birch Meadow',
  },
  {
    position: [0, 0, 68],
    rotationY: Math.PI,
    districtName: 'South Lakeside Grand Promenade',
  },
  {
    position: [-52, 0, 48],
    rotationY: Math.PI * 0.68,
    districtName: 'South-West Emerald Grove',
  },
  {
    position: [52, 0, 48],
    rotationY: -Math.PI * 0.68,
    districtName: 'South-East Waterfall Overlook',
  },
  {
    position: [-24, 0, -46],
    rotationY: Math.PI * 0.15,
    districtName: 'Northern Windmill Foothills West',
  },
  {
    position: [24, 0, -46],
    rotationY: -Math.PI * 0.15,
    districtName: 'Northern Windmill Foothills East',
  },
];

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: 'thozhirporul',
    number: '01',
    chapterNumber: 'Chapter I',
    chapterTitle: 'The Industrial Frontier',
    storyNarrative:
      'Our story begins at the North-West Glass Conservatory, where Mohammed Bilal A engineered THOZHIRPORUL—a full-stack Smart Industrial Monitoring System uniting GIS park mapping, automated compliance workflows, and AI-assisted governance.',
    title: 'THOZHIRPORUL Industrial System',
    subtitle: 'Smart Industrial Monitoring, GIS Park Mapping & AI Governance',
    category: 'Spatial IoT',
    districtName: 'North-West Glass Conservatory',
    position: [-34, 0, -28],
    rotationY: Math.PI * 0.22,
    architectureStyle: 'conservatory',
    accentColor: '#38bdf8',
    secondaryColor: '#22c55e',
    techStack: ['React.js', 'Node.js', 'Express.js', 'PostgreSQL', 'Docker', 'GIS Mapping'],
    metrics: [
      { label: 'Core Modules', value: 'GIS + AI' },
      { label: 'Architecture', value: 'Full-Stack' },
      { label: 'Deployment', value: 'Dockerized' },
    ],
    summary:
      'Developed a full-stack industrial governance platform featuring real-time interactive dashboards, GIS-based industrial park mapping, compliance tracking, workflow automation, and AI-assisted decision support.',
    highlights: [
      'Engineered interactive React.js & Node.js/Express.js governance dashboards for real-time industrial park monitoring.',
      'Integrated spatial GIS park mapping with PostgreSQL to track zone compliance and infrastructure telemetry.',
      'Built automated compliance workflows and AI-assisted decision support packaged in Docker containers.',
    ],
    liveUrl: 'https://github.com/MohammedBilalA',
    repoUrl: 'https://github.com/MohammedBilalA',
    screenVisualType: 'spatial_map',
    npcGuide: {
      name: 'Arjun Verma',
      role: 'Industrial GIS Architect',
      jacketColor: '#0284c7',
      pantsColor: '#1e293b',
      hairColor: '#18181b',
      dialogue:
        'Welcome to Chapter I! Here Mohammed Bilal built THOZHIRPORUL—combining GIS industrial park mapping, React/Node dashboards, and AI decision support!',
    },
  },
  {
    id: 'ai-firewall',
    number: '02',
    chapterNumber: 'Chapter II',
    chapterTitle: 'The AI Security Bastion',
    storyNarrative:
      'As Large Language Models grew powerful, new adversarial threats emerged. At the North-East Redstone Spire, Bilal forged a Dual-Layer AI Firewall combining XGBoost classification and behavioral analysis to intercept prompt-injection attacks in real time.',
    title: 'Dual-Layer LLM AI Firewall',
    subtitle: 'Prompt-Injection Detection via XGBoost & Behavioral Analysis',
    category: 'AI & Agents',
    districtName: 'North-East Redstone Spire',
    position: [34, 0, -28],
    rotationY: -Math.PI * 0.22,
    architectureStyle: 'redstone_tower',
    accentColor: '#fb7185',
    secondaryColor: '#a855f7',
    techStack: ['Python', 'FastAPI', 'XGBoost', 'PostgreSQL', 'Docker', 'REST APIs'],
    metrics: [
      { label: 'Defense Layers', value: 'Dual-Layer' },
      { label: 'ML Classifier', value: 'XGBoost' },
      { label: 'API Engine', value: 'FastAPI' },
    ],
    summary:
      'Developed a Dual-Layer AI Firewall for securing LLM applications against prompt-injection and adversarial exploits using machine-learning classification and behavioral analysis, served via FastAPI microservices and Dockerized deployment.',
    highlights: [
      'Designed a dual-layer security pipeline combining XGBoost ML classification with runtime behavioral analysis to block prompt injections.',
      'Built low-latency asynchronous FastAPI security gateway endpoints backed by PostgreSQL audit logging.',
      'Containerized the entire inference and inspection stack with Docker for reproducible cloud deployment.',
    ],
    liveUrl: 'https://github.com/MohammedBilalA',
    repoUrl: 'https://github.com/MohammedBilalA',
    screenVisualType: 'neural_graph',
    npcGuide: {
      name: 'Dr. Elena Vance',
      role: 'AI Security Lead',
      jacketColor: '#e11d48',
      pantsColor: '#27272a',
      hairColor: '#78350f',
      dialogue:
        'Chapter II guards the valley! Bilal’s Dual-Layer AI Firewall uses XGBoost and FastAPI behavioral analysis to stop LLM prompt-injection attacks cold!',
    },
  },
  {
    id: 'fraud-detection',
    number: '03',
    chapterNumber: 'Chapter III',
    chapterTitle: 'The FinTech ML Vault',
    storyNarrative:
      'Across the West Marble Citadel lies the FinTech ML Vault. Here, Bilal applied data science and pattern recognition to safeguard digital finance—training classification models on transaction behavior patterns to catch credit card fraud.',
    title: 'Credit Card Fraud Detection ML',
    subtitle: 'Behavioral Transaction Classification with Scikit-Learn & Pandas',
    category: 'FinTech',
    districtName: 'West Marble Citadel',
    position: [-46, 0, 12],
    rotationY: Math.PI * 0.48,
    architectureStyle: 'marble_citadel',
    accentColor: '#10b981',
    secondaryColor: '#14b8a6',
    techStack: ['Python', 'Scikit-learn', 'Pandas', 'NumPy', 'Feature Engineering'],
    metrics: [
      { label: 'ML Pipeline', value: 'Scikit-learn' },
      { label: 'Data Engine', value: 'Pandas/NumPy' },
      { label: 'Detection Mode', value: 'Behavioral' },
    ],
    summary:
      'Built a machine-learning classification model for fraudulent credit card transaction detection using structured data preprocessing, anomaly feature engineering, and transaction behavior pattern analysis.',
    highlights: [
      'Engineered structured data preprocessing and feature scaling pipelines using Python, Pandas, and NumPy on skewed transaction datasets.',
      'Trained and evaluated Scikit-learn classification models capturing subtle anomalous transaction behavior patterns.',
      'Optimized precision-recall tradeoffs to minimize false positives while flagging high-risk fraudulent activity.',
    ],
    liveUrl: 'https://github.com/MohammedBilalA',
    repoUrl: 'https://github.com/MohammedBilalA',
    screenVisualType: 'orderbook_pulse',
    npcGuide: {
      name: 'Riya Sharma',
      role: 'Data Science Specialist',
      jacketColor: '#059669',
      pantsColor: '#0f172a',
      hairColor: '#eab308',
      dialogue:
        'Welcome to Chapter III in the Marble Citadel! Bilal’s Scikit-learn & Pandas pipeline analyzes transaction behavior patterns to detect credit card fraud!',
    },
  },
  {
    id: 'sasha-infinity',
    number: '04',
    chapterNumber: 'Chapter IV',
    chapterTitle: 'The E-Learning Guild (Sasha Infinity)',
    storyNarrative:
      'On the East Sakura Timber Boulevard stands the Sasha Infinity Guild, representing Mohammed Bilal A’s real-world industry role as Web Developer Intern (Jun 2025 – Present), scaling e-learning delivery, WordPress systems, and AI-tool integrations.',
    title: 'Sasha Infinity E-Learning Hub',
    subtitle: 'Web Developer Intern (Jun 2025 – Present) • Tutor LMS & AI Integration',
    category: 'Cloud & Systems',
    districtName: 'East Sakura Timber Boulevard',
    position: [46, 0, 12],
    rotationY: -Math.PI * 0.48,
    architectureStyle: 'timber_hall',
    accentColor: '#f59e0b',
    secondaryColor: '#ec4899',
    techStack: ['WordPress', 'Tutor LMS', 'React.js', 'REST APIs', 'AI Integration', 'SQL'],
    metrics: [
      { label: 'Tenure', value: 'Jun 2025–Now' },
      { label: 'LMS Core', value: 'Tutor LMS' },
      { label: 'Focus', value: 'Full-Stack + AI' },
    ],
    summary:
      'Professional experience as Web Developer Intern at Sasha Infinity (Jun 2025 – Present), developing and maintaining a Tutor LMS-based e-learning platform, optimizing WordPress sites, and integrating AI tools and full-stack APIs.',
    highlights: [
      'Developed and maintained a Tutor LMS-based e-learning platform supporting seamless online course delivery and content management.',
      'Configured, updated, and troubleshot production WordPress websites with continuous platform maintenance and performance optimization.',
      'Supported AI-tool integration, frontend/backend development, REST API integration, debugging, and application improvements.',
    ],
    liveUrl: 'https://www.linkedin.com/in/mohammedbilal-a',
    repoUrl: 'https://github.com/MohammedBilalA',
    screenVisualType: 'telemetry_matrix',
    npcGuide: {
      name: 'Karthik Rajan',
      role: 'Platform Engineering Lead',
      jacketColor: '#d97706',
      pantsColor: '#1f2937',
      hairColor: '#292524',
      dialogue:
        'In Chapter IV at Sasha Infinity, Bilal builds and optimizes Tutor LMS e-learning platforms, WordPress architectures, and live AI-tool integrations!',
    },
  },
  {
    id: 'sona-academics',
    number: '05',
    chapterNumber: 'Chapter V',
    chapterTitle: 'The Academic Citadel (MCA & BCA)',
    storyNarrative:
      'Crossing the Emerald River to the South-East Lakeside Deck reveals the Sona Academic Citadel—chronicling Bilal’s BCA degree (7.9 CGPA, May 2025) and Master of Computer Applications at Sona College of Technology (8.3 CGPA, Expected 2027).',
    title: 'Sona Tech Academic Citadel',
    subtitle: 'MCA @ Sona College of Technology (8.3 CGPA) & BCA (7.9 CGPA)',
    category: '3D & Creative',
    districtName: 'South-East Emerald Lakeside',
    position: [26, 0, 58],
    rotationY: -Math.PI * 0.82,
    architectureStyle: 'lakeside_deck',
    accentColor: '#06b6d4',
    secondaryColor: '#3b82f6',
    techStack: ['Python', 'C', 'SQL', 'JavaScript', 'React.js', 'MongoDB', 'Supabase', 'Power BI'],
    metrics: [
      { label: 'MCA CGPA', value: '8.3 / 10' },
      { label: 'BCA CGPA', value: '7.9 / 10' },
      { label: 'Languages', value: '4 Spoken' },
    ],
    summary:
      'Academic excellence across Master of Computer Applications (MCA, Expected 2027, 8.3 CGPA) at Sona College of Technology and Bachelor of Computer Applications (BCA, Graduated May 2025, 7.9 CGPA) at Sona College of Arts & Science.',
    highlights: [
      'Master of Computer Applications (MCA) — Sona College of Technology | CGPA: 8.3/10 (Expected Graduation: 2027).',
      'Bachelor of Computer Applications (BCA) — Sona College of Arts & Science | CGPA: 7.9/10 (Graduated May 2025).',
      'Multilingual communicator: Urdu (Native), English (Professional Working Proficiency), Tamil (Fluent), and Hindi (Conversational).',
    ],
    liveUrl: 'https://www.linkedin.com/in/mohammedbilal-a',
    repoUrl: 'https://github.com/MohammedBilalA',
    screenVisualType: 'shader_canvas',
    npcGuide: {
      name: 'Prof. Sundaravel',
      role: 'Academic Mentor',
      jacketColor: '#0891b2',
      pantsColor: '#334155',
      hairColor: '#b45309',
      dialogue:
        'Chapter V celebrates Sona College of Technology! Bilal earned a 7.9 CGPA in BCA and maintains an 8.3 CGPA in MCA while mastering Full-Stack & AI!',
    },
  },
  {
    id: 'achievements-hall',
    number: '06',
    chapterNumber: 'Chapter VI',
    chapterTitle: 'Hall of Champions & Certifications',
    storyNarrative:
      'The culmination of the valley tour stands at the South-West Sakura Pagoda: the Hall of Champions, honoring Mohammed Bilal A’s victory at SIF Pitch Fest 2026, SDG Hackathon Finalist honors, SIH 2025 qualification, Top 500 Niral Thiruvizha 3.0, and 7 industry certifications.',
    title: 'Hackathon Arena & Honors Vault',
    subtitle: 'Winner SIF Pitch Fest 2026 • SDG Finalist • SIH 2025 • 7 Certifications',
    category: 'Open Source',
    districtName: 'South-West Sakura Pagoda',
    position: [-26, 0, 58],
    rotationY: Math.PI * 0.82,
    architectureStyle: 'sakura_pagoda',
    accentColor: '#ec4899',
    secondaryColor: '#f59e0b',
    techStack: [
      'NPTEL Java Elite+Gold',
      'Cybersecurity',
      'UiPath RPA',
      'Cloud & Virtualization',
      'Power BI',
      'Venture Ideation',
    ],
    metrics: [
      { label: 'SIF Pitch Fest', value: 'Winner ’26' },
      { label: 'SDG Hackathon', value: 'Finalist ’26' },
      { label: 'Certifications', value: '7 Earned' },
    ],
    summary:
      'Proven competitive innovator and certified technologist: Winner of SIF Pitch Fest 2026, Finalist in SDG Hackathon 2026, Smart India Hackathon 2025 Qualifier, Top 500 in Niral Thiruvizha 3.0, and holder of NPTEL Java Elite + Gold.',
    highlights: [
      'Winner — SIF Pitch Fest 2026 & Finalist — SDG Hackathon 2026.',
      'Smart India Hackathon (SIH) 2025 Internal Round Qualifier & Top 500 in Niral Thiruvizha 3.0.',
      'Certified in NPTEL Java (Elite + Gold), Full-Stack Web Dev Bootcamp, Cybersecurity & Ethical Hacking, Ignite Venture Bootcamp, UiPath RPA, Power BI, and Cloud & Virtualization.',
    ],
    liveUrl: 'https://www.linkedin.com/in/mohammedbilal-a',
    repoUrl: 'https://github.com/MohammedBilalA',
    screenVisualType: 'voxel_engine',
    npcGuide: {
      name: 'Meera Krishnan',
      role: 'Hackathon Curator',
      jacketColor: '#db2777',
      pantsColor: '#1e1b4b',
      hairColor: '#09090b',
      dialogue:
        'Welcome to Chapter VI! Winner of SIF Pitch Fest 2026, SDG Hackathon Finalist, SIH 2025 Qualifier, Top 500 Niral Thiruvizha, and NPTEL Java Elite+Gold!',
    },
  },
];
