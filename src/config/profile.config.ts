export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  highlights: string[];
}

export interface EducationItem {
  degree: string;
  institution: string;
  score: string;
  period: string;
}

export interface DeveloperProfile {
  name: string;
  shortName: string;
  role: string;
  worldTitle: string;
  tagline: string;
  location: string;
  availability: string;
  phone: string;
  email: string;
  emailAddress: string;
  githubUrl: string;
  linkedinUrl: string;
  summary: string;
  coreSkills: string[];
  skillCategories: SkillCategory[];
  experience: ExperienceItem[];
  education: EducationItem[];
  achievements: string[];
  certifications: string[];
  languages: { language: string; proficiency: string }[];
}

export const DEVELOPER_PROFILE: DeveloperProfile = {
  name: 'Mohammed Bilal A',
  shortName: 'Bilal',
  role: 'Full-Stack Software Developer • AI/ML & Web Systems',
  worldTitle: 'CHRONICLES OF BILAL // 3D STORY WORLD',
  tagline:
    'Customize your explorer avatar and journey through a physically-lit 3D Storytelling World showcasing Mohammed Bilal A’s production AI systems, industrial platforms, e-learning engineering, and hackathon victories.',
  location: 'Tamil Nadu, India • Open to Remote & Relocation',
  availability: 'Web Developer Intern @ Sasha Infinity • MCA ’27 (8.3 CGPA)',
  phone: '+91 96550 86486',
  email: 'mailto:althafbilal1968@gmail.com',
  emailAddress: 'althafbilal1968@gmail.com',
  githubUrl: 'https://github.com/MohammedBilalA',
  linkedinUrl: 'https://www.linkedin.com/in/mohammedbilal-a',
  summary:
    'Software Developer with hands-on experience in full-stack web development, React.js, Node.js, Python, and WordPress. Skilled in API integration, database management, debugging, and deployment, with practical experience in e-learning platforms and AI/ML-based projects.',
  coreSkills: [
    'React.js & Node.js',
    'Python & FastAPI',
    'PostgreSQL, MySQL & MongoDB',
    'XGBoost & Scikit-learn',
    'REST APIs & GraphQL',
    'WordPress & Tutor LMS',
  ],
  skillCategories: [
    {
      category: 'Languages',
      skills: ['Python', 'C', 'SQL', 'JavaScript'],
    },
    {
      category: 'Web Development',
      skills: ['React.js', 'HTML5', 'CSS3', 'Node.js', 'Express.js', 'FastAPI'],
    },
    {
      category: 'Databases',
      skills: ['MySQL', 'PostgreSQL', 'MongoDB', 'Supabase'],
    },
    {
      category: 'APIs & Machine Learning',
      skills: ['REST APIs', 'GraphQL', 'Scikit-learn', 'Pandas', 'NumPy', 'XGBoost'],
    },
    {
      category: 'Tools & DevOps',
      skills: ['Git', 'GitHub', 'VS Code', 'WordPress', 'Tutor LMS', 'Figma', 'Power BI', 'Docker'],
    },
  ],
  experience: [
    {
      role: 'Web Developer Intern',
      company: 'Sasha Infinity',
      period: 'Jun 2025 – Present',
      highlights: [
        'Developed and maintained a Tutor LMS-based e-learning platform supporting online course delivery and content management.',
        'Configured, updated, and troubleshot WordPress websites; supported platform maintenance and performance optimization.',
        'Supported AI-tool integration, frontend/backend development, API integration, debugging, and application improvements.',
      ],
    },
  ],
  education: [
    {
      degree: 'Master of Computer Applications (MCA)',
      institution: 'Sona College of Technology',
      score: 'CGPA: 8.3 / 10',
      period: 'Expected Graduation: 2027',
    },
    {
      degree: 'Bachelor of Computer Applications (BCA)',
      institution: 'Sona College of Arts & Science',
      score: 'CGPA: 7.9 / 10',
      period: 'Graduated May 2025',
    },
  ],
  achievements: [
    'Winner — SIF Pitch Fest 2026',
    'Finalist — SDG Hackathon 2026',
    'Qualifier — Smart India Hackathon (SIH) 2025 Internal Round',
    'Top 500 — Niral Thiruvizha 3.0',
  ],
  certifications: [
    'NPTEL Java — Elite + Gold',
    'Full-Stack Web Development Bootcamp',
    'Cybersecurity & Ethical Hacking',
    'Ignite Bootcamp — Venture Idea Development',
    'UiPath RPA Citizen Developer Foundation',
    'Power BI Workshop',
    'Cloud and Virtualization',
  ],
  languages: [
    { language: 'Urdu', proficiency: 'Native' },
    { language: 'English', proficiency: 'Professional Working Proficiency' },
    { language: 'Tamil', proficiency: 'Fluent' },
    { language: 'Hindi', proficiency: 'Conversational' },
  ],
};
