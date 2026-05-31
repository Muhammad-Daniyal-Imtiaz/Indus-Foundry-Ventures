export interface Startup {
  id: string;
  name: string;
  tagline: string;
  primaryIndustry: string;
  secondaryIndustries: string[];
  stage: 'Idea' | 'Pre-seed' | 'Seed' | 'Series A' | 'Scale';
  location: string;
  fundingStage: 'Unfunded' | 'Grant Match' | 'Equity Raised' | 'Fully Funded';
  skillsNeeded: string[];
  rolesAvailable: string[];
  companyType: string;
  techStack: string[];
  logo: string;
  description: string;
}

export interface FreelanceProject {
  id: string;
  title: string;
  client: string;
  budget: string;
  budgetType: 'Fixed' | 'Hourly';
  duration: string;
  primaryIndustry: string;
  secondaryIndustries: string[];
  skills: string[];
  description: string;
  postedDate: string;
}

export interface IndividualInvestor {
  id: string;
  name: string;
  title: string;
  diasporaLocation?: string;
  chequeRange: string;
  primaryFocus: string;
  secondaryFocus: string[];
  skillsOffered: string[];
  portfolioCount: number;
  bio: string;
  avatar: string;
}

export interface CompanyInvestor {
  id: string;
  name: string;
  companyType: 'Venture Capital' | 'Corporate Venture' | 'Family Office' | 'Government Fund';
  chequeRange: string;
  primaryFocus: string;
  secondaryFocus: string[];
  portfolioCount: number;
  description: string;
  logo: string;
  website: string;
  leadPartners: string[];
}

export interface Builder {
  id: string;
  name: string;
  role: string;
  field: string;
  city: string;
  bio: string;
  experience: string;
  skills: string[];
  matchScore: number;
  avatar: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  skills: string[];
  category: string;
}

export interface Challenge {
  id: string;
  title: string;
  category: string;
  description: string;
  problemStatement: string;
  prizePool: string;
  rewardType: string;
  postedBy: string;
  daysLeft: number;
  participantsCount: number;
}

export interface GovProgram {
  id: string;
  title: string;
  agency: string;
  fundingCap: string;
  eligibility: string;
  deadline: string;
  type: string;
}

export interface Partnership {
  id: string;
  name: string;
  entity: string;
  benefit: string;
  type: string;
  activeOpportunities: number;
  icon: string;
}

// All major startup categories as provided by the user
export const startupCategories = {
  Software: [
    'SaaS', 'B2B software', 'B2C apps', 'Developer tools', 'APIs and infrastructure',
    'Cloud software', 'Automation tools', 'No-code / low-code', 'Cybersecurity',
    'Data tools', 'Fintech software', 'Healthtech software', 'Edtech software',
    'HR tech', 'CRM / ERP software', 'Marketplace software'
  ],
  AI: [
    'AI SaaS', 'AI agents', 'LLM apps', 'AI infrastructure', 'AI tools',
    'AI copilots', 'AI automation', 'AI analytics', 'AI workflow tools',
    'AI search', 'AI content tools', 'AI support tools', 'AI for business',
    'AI for developers'
  ],
  Talent: [
    'Software jobs', 'Remote jobs', 'Startup hiring', 'Tech recruitment',
    'Freelance talent', 'Internships', 'Cofounder matching', 'Technical hiring',
    'Design hiring', 'Sales hiring', 'Product hiring', 'AI talent', 'Engineering talent'
  ],
  Hardware: [
    'Consumer hardware', 'Enterprise hardware', 'IoT', 'Wearables', 'Smart devices',
    'Electronics', 'Embedded systems', 'Robotics hardware', 'Semiconductor hardware',
    'Drones', 'Sensors', 'Industrial hardware'
  ],
  Robotics: [
    'Industrial robotics', 'Service robotics', 'AI robotics', 'Medical robotics',
    'Agricultural robotics', 'Delivery robots', 'Automation robotics', 'Humanoid robotics',
    'Robotic arms', 'Warehouse robotics', 'Defense robotics', 'Robotics software'
  ],
  Semiconductor: [
    'Chip design', 'Fabless semiconductor', 'EDA tools', 'Chip manufacturing',
    'Power semiconductors', 'RF chips', 'AI chips', 'Edge chips', 'Memory chips',
    'SoC startups', 'Semiconductor equipment', 'Semiconductor materials'
  ],
  XR: [
    'AR startups', 'VR startups', 'XR startups', 'MR startups', 'Spatial computing',
    'Mixed reality', 'Immersive learning', 'Virtual training', 'Metaverse tools',
    '3D platforms', 'Game engine tools', 'Vision hardware'
  ],
  DeepTech: [
    'Quantum computing', 'Nanotech', 'Aerospace', 'Defense tech', 'Biotech',
    'Medtech', 'Clean tech', 'Climate tech', 'Energy tech', 'Advanced manufacturing',
    'Materials science', 'Research tools'
  ],
  BusinessModels: [
    'Marketplace', 'Subscription', 'Usage-based SaaS', 'Licensing', 'Services + software',
    'Freemium', 'Enterprise sales', 'Consumer app', 'Community platform',
    'Agency-to-product', 'Productized service', 'Platform-as-a-service'
  ]
};

// Flatten all categories for quick tag verification
export const allFlatCategories = Object.values(startupCategories).flat();

// Builders Data for Teams Page
export const buildersData: Builder[] = [
  {
    id: "1",
    name: "Zainab Chaudhry",
    role: "AI Research Lead (Ex-NUST)",
    field: "AI SaaS",
    city: "Islamabad",
    bio: "Building custom visual architectures for Pakistan's agricultural yield forecast mappings.",
    experience: "3+ years PyTorch, OpenCV, Edge deployments",
    skills: ["PyTorch", "Python", "Computer Vision", "FastAPI"],
    matchScore: 98,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "2",
    name: "Taimoor Khan",
    role: "VLSI Layout Lead",
    field: "Semiconductors",
    city: "Peshawar",
    bio: "ASIC custom tape-out coordinator specializing in power optimization layers.",
    experience: "5+ years SystemVerilog, FPGA verification",
    skills: ["SystemVerilog", "Verilog", "FPGA", "C++"],
    matchScore: 95,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "3",
    name: "Zarrar Ahmed",
    role: "Robotics Firmware Architect",
    field: "Robotics",
    city: "Karachi",
    bio: "Developing custom ROS2 guide frameworks for autonomous warehouse loaders.",
    experience: "4+ years ROS2, C++, Real-Time Linux kernel tuning",
    skills: ["ROS2", "C++", "Embedded Systems", "Linux"],
    matchScore: 92,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
  }
];

// Jobs Data for Placements Page
export const jobsData: Job[] = [
  {
    id: "j1",
    title: "Edge Compiler Engineer",
    company: "Markhor Edge Labs",
    location: "Lahore (Remote)",
    salary: "$1,800 - $3,200 / mo",
    type: "Full-Time",
    skills: ["LLVM", "C++", "RISC-V"],
    category: "Semiconductors"
  },
  {
    id: "j2",
    title: "Urdu LLM Finetune Specialist",
    company: "PakNLP Consortium",
    location: "Islamabad (Hybrid)",
    salary: "PKR 180k - 260k / mo",
    type: "Full-Time",
    skills: ["PyTorch", "HuggingFace", "LangChain"],
    category: "AI"
  },
  {
    id: "j3",
    title: "Autonomous Path-Planning Developer",
    company: "Textile Foundries Ltd",
    location: "Karachi (On-site)",
    salary: "PKR 140k - 190k / mo",
    type: "Contract",
    skills: ["ROS2", "Navigation2", "C++"],
    category: "Robotics"
  }
];

// Challenges Data
export const challengesData: Challenge[] = [
  {
    id: "c1",
    title: "RISC-V Vector Assembly Optimization",
    category: "Semiconductors",
    description: "Write assembly instruction vectors resolving standard float overheads for physical ASIC boards.",
    problemStatement: "Optimize a float matrix dot product in SystemVerilog minimizing clock cycle layouts.",
    prizePool: "PKR 1,500,000",
    rewardType: "Gov Grant co-equity matching",
    postedBy: "HEC & Ignite",
    daysLeft: 12,
    participantsCount: 48
  },
  {
    id: "c2",
    title: "Urdu Voice RAG Interface Design",
    category: "AI",
    description: "Implement low-latency offline Urdu speech parsing on micro-controllers.",
    problemStatement: "Compress standard audio streams to match HuggingFace weights under 150ms delay boundaries.",
    prizePool: "PKR 800,000",
    rewardType: "Startup Procurement Pilot",
    postedBy: "Ignite Pakistan",
    daysLeft: 8,
    participantsCount: 32
  }
];

// Sovereign Investors (used in funding calculator page)
export const investorsData = [
  {
    id: "ivc",
    logo: "IVC",
    type: "Venture Capital",
    name: "Indus Valley Capital",
    chequeSize: "$500,000 - $2,000,000",
    description: "Regional lead pre-seed and seed assets empowering tech startups in Pakistan.",
    focus: ["SaaS", "Fintech", "Marketplaces"],
    portfolioCount: 28
  },
  {
    id: "smc",
    logo: "SMC",
    type: "Venture Capital",
    name: "Sarmayacar",
    chequeSize: "$250,000 - $1,500,000",
    description: "VISIONARY seed funds supporting deep technology, B2B SaaS, and local micro-chips.",
    focus: ["AI", "SaaS", "Clean Tech"],
    portfolioCount: 22
  }
];

// Government Access Grants
export const govProgramsData: GovProgram[] = [
  {
    id: "g1",
    title: "National Semiconductor Sandbox",
    agency: "HEC & PITB",
    fundingCap: "PKR 45,000,000",
    eligibility: "Must hold local university collaboration and complete compiler simulation tests.",
    deadline: "June 30, 2026",
    type: "FABLESS GRANT"
  },
  {
    id: "g2",
    title: "Ignite Deep Tech Accelerator",
    agency: "Ministry of IT & Ignite",
    fundingCap: "PKR 15,000,000",
    eligibility: "Seed setups building custom hardware layout microprocessors or LLM model pipelines.",
    deadline: "July 15, 2026",
    type: "MATCHING GRANT"
  }
];

// Partnerships Data
export const partnershipsData: Partnership[] = [
  {
    id: "p1",
    name: "Silicon Valley Diaspora Network",
    entity: "Overseas Pakistani Technical Alliance (US)",
    benefit: "Weekly direct layout feedback with engineers from AMD, NVIDIA, and Intel.",
    type: "Mentorship",
    activeOpportunities: 14,
    icon: "Globe"
  },
  {
    id: "p2",
    name: "Systems Ltd Sandbox Alliance",
    entity: "Systems Limited Pakistan",
    benefit: "Pre-vetted cofounders unlock SaaS developer licenses and PITB server clusters.",
    type: "Corporate Alliance",
    activeOpportunities: 8,
    icon: "Building"
  }
];

// Initial Startups Data
export const startupsData: Startup[] = [
  {
    id: 's1',
    name: 'Markhor Edge Labs',
    tagline: 'RISC-V chip acceleration for local device edge inference.',
    primaryIndustry: 'Semiconductor hardware',
    secondaryIndustries: ['AI chips', 'Deep Tech', 'IoT'],
    stage: 'Seed',
    location: 'Lahore, Pakistan',
    fundingStage: 'Equity Raised',
    skillsNeeded: ['SystemVerilog', 'LLVM compiler', 'Hardware verification'],
    rolesAvailable: ['Senior VLSI Engineer', 'Compiler Developer'],
    companyType: 'Fabless semiconductor',
    techStack: ['Verilog', 'C++', 'Python', 'FPGA'],
    logo: 'MEL',
    description: 'We are designing energy-efficient RISC-V co-processors designed for localized deep learning tasks on remote sensors without network relays.'
  },
  {
    id: 's2',
    name: 'AgriSense IoT',
    tagline: 'Urdu-first smart crop rot prediction using computer vision drones.',
    primaryIndustry: 'Agricultural robotics',
    secondaryIndustries: ['AI SaaS', 'Robotics hardware', 'Drones', 'Sensors'],
    stage: 'Pre-seed',
    location: 'Islamabad, Pakistan',
    fundingStage: 'Grant Match',
    skillsNeeded: ['Edge AI', 'Next.js', 'B2B Sales'],
    rolesAvailable: ['Cofounder (Growth & Business Dev)', 'Fullstack Engineer'],
    companyType: 'AI + hardware',
    techStack: ['PyTorch', 'ROS2', 'Next.js', 'FastAPI'],
    logo: 'AGS',
    description: 'AgriSense deploys smart agricultural sensors and automated drone sweeps to predict post-harvest silo wastage, providing offline Urdu audio notifications to local farmers.'
  }
];

// Initial Freelance Projects Data
export const freelanceProjectsData: FreelanceProject[] = [
  {
    id: 'f1',
    title: 'RISC-V LLVM Compiler Optimization',
    client: 'Markhor Edge Labs',
    budget: '$3,500',
    budgetType: 'Fixed',
    duration: '2 Months',
    primaryIndustry: 'EDA tools',
    secondaryIndustries: ['AI chips', 'Developer tools'],
    skills: ['LLVM', 'C++', 'RISC-V Assembly'],
    description: 'Looking for a specialized compiler engineer to optimize customized vector instruction translations on a TSMC tape-out chip blueprint.',
    postedDate: '2 Days ago'
  },
  {
    id: 'f2',
    title: 'Urdu RAG LangChain System Setup',
    client: 'National NLP Consortium',
    budget: 'PKR 250,000',
    budgetType: 'Fixed',
    duration: '3 Weeks',
    primaryIndustry: 'LLM apps',
    secondaryIndustries: ['AI agents', 'AI search'],
    skills: ['LangChain', 'LlamaIndex', 'UrduNLP', 'FastAPI'],
    description: 'Implement a highly-optimized vector database pipeline supporting custom Urdu vocabulary embeddings and multi-intent parsing filters.',
    postedDate: '1 Day ago'
  }
];

// Individual Investors
export const individualInvestorsData: IndividualInvestor[] = [
  {
    id: 'angel1',
    name: 'Dr. Kamran Malik',
    title: 'VP of Hardware Engineering at major Silicon Valley Chipmaker',
    diasporaLocation: 'San Jose, California',
    chequeRange: '$25,000 - $75,000',
    primaryFocus: 'Chip design',
    secondaryFocus: ['Fabless semiconductor', 'AI chips', 'Deep Tech'],
    skillsOffered: ['VLSI tape-out reviews', 'US market introduction', 'Core semiconductor manufacturing relationships'],
    portfolioCount: 8,
    bio: 'Ex-Intel Principal Fellow with 20+ years in ASIC fabrication. Passionate about establishing Pakistans local fabless semiconductor ecosystem.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'angel2',
    name: 'Sobia Haris',
    title: 'Director of Product at London Fintech Unicorn',
    diasporaLocation: 'London, UK',
    chequeRange: '£15,000 - £40,000',
    primaryFocus: 'Fintech software',
    secondaryFocus: ['SaaS', 'B2B software', 'Marketplace software'],
    skillsOffered: ['Product roadmap scaling', 'UK sandboxes integration', 'VC seed introductions'],
    portfolioCount: 6,
    bio: 'Helping deep tech and fintech builders design highly optimized commercial user flows. Active advisor to PITB incubation cohorts.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'
  }
];

// Company Investors
export const companyInvestorsData: CompanyInvestor[] = [
  {
    id: 'vc1',
    name: 'Indus Valley Capital',
    companyType: 'Venture Capital',
    chequeRange: '$500k - $2M',
    primaryFocus: 'B2B SaaS',
    secondaryFocus: ['Fintech software', 'Logistics', 'Deep Tech', 'AI SaaS'],
    portfolioCount: 28,
    description: 'Empowering early stage Pakistani founders to build epoch-defining technology companies.',
    logo: 'IVC',
    website: 'https://indusvalley.vc',
    leadPartners: ['Aatif Awan', 'Rabeel Warraich']
  },
  {
    id: 'vc2',
    name: 'Sarmayacar',
    companyType: 'Venture Capital',
    chequeRange: '$250k - $1.5M',
    primaryFocus: 'AI',
    secondaryFocus: ['Fintech software', 'SaaS', 'Semiconductor hardware', 'Clean tech'],
    portfolioCount: 22,
    description: 'Supporting visionary entrepreneurs with early-stage venture assets and active board alignment operations.',
    logo: 'SMC',
    website: 'https://sarmayacar.com',
    leadPartners: ['Bernhard Klemen', 'Faisal Aftab']
  },
  {
    id: 'vc3',
    name: 'Pakistan Startup Fund (PSF)',
    companyType: 'Government Fund',
    chequeRange: 'PKR 10M - 50M',
    primaryFocus: 'Deep Tech',
    secondaryFocus: ['Climate tech', 'AgriTech', 'SaaS', 'AI infrastructure'],
    portfolioCount: 45,
    description: 'Federal fund sponsored by MoITT matching global venture investments to eliminate early-stage deep-tech startup risks.',
    logo: 'PSF',
    website: 'https://moitt.gov.pk',
    leadPartners: ['Minister of IT & Telecom', 'CEO Ignite']
  }
];
