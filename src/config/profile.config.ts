export interface DeveloperProfile {
  name: string;
  role: string;
  worldTitle: string;
  tagline: string;
  location: string;
  availability: string;
  githubUrl: string;
  linkedinUrl: string;
  email: string;
  coreSkills: string[];
}

export const DEVELOPER_PROFILE: DeveloperProfile = {
  name: 'Mohammed',
  role: 'Full-Stack & Creative 3D Systems Engineer',
  worldTitle: 'SAKURA VALLEY // RTX PORTFOLIO',
  tagline:
    'Walk or drive across a physically-lit Spring Voxel World to explore production AI systems, distributed platforms, and interactive 3D engineering.',
  location: 'Global / Remote',
  availability: 'Open for High-Impact Engineering & Creative Roles',
  githubUrl: 'https://github.com',
  linkedinUrl: 'https://linkedin.com',
  email: 'mailto:hello@example.com',
  coreSkills: [
    'TypeScript',
    'React & Next.js',
    'Three.js / WebGL / GLSL',
    'Python & PyTorch',
    'Rust & WebAssembly',
    'Distributed Cloud & Kubernetes',
  ],
};
