import type { AgentId, HumanIdentity } from '@/types/office'

// ═══════════════════════════════════════════════════════════════════════════════
// AIRA COMPANY ROSTER — All characters are HUMAN employees.
// The planet names are identity tags only. Each person has their own appearance,
// clothing, hairstyle and personality. Team is a natural mixed-gender mix.
// ═══════════════════════════════════════════════════════════════════════════════

export const ROSTER: Record<AgentId, HumanIdentity> = {
  postman: {
    id: 'postman', name: 'Ravi', agentName: 'POSTMAN', gender: 'male', role: 'Mail & Delivery',
    planet: 'Post', planetColor: '#2F7D32', hairColor: '#3E2723', hairStyle: 'short',
    skinTone: '#C68B59', shirtColor: '#5D4037', pantsColor: '#37474F', accentColor: '#F9A825',
    personality: 'Cheerful and dependable. Delivers every idea on time.',
    dormBed: 'reception', bicycleColor: '#33691E', specialNote: 'Brings every new idea to the company mailbox.',
  },
  aira: {
    id: 'aira', name: 'Aira', agentName: 'AIRA', gender: 'female', role: 'Managing Director / CEO',
    planet: 'AIRA', planetColor: '#C9A227', hairColor: '#1B0E07', hairStyle: 'long',
    skinTone: '#E8B88A', shirtColor: '#8B3A3A', pantsColor: '#2B2B2B', accentColor: '#C9A227',
    personality: 'Calm, decisive, visionary. Orchestrates the whole company from her executive villa.',
    dormBed: 'aira_villa', bicycleColor: '#9E7D15', specialNote: 'Travels by private helicopter from her villa.',
  },
  datta: {
    id: 'datta', name: 'Datta', agentName: 'DATTA', gender: 'male', role: 'Project Manager',
    planet: 'DATTA', planetColor: '#E07B39', hairColor: '#2E2A27', hairStyle: 'short',
    skinTone: '#C68B59', shirtColor: '#26418F', pantsColor: '#263238', accentColor: '#E07B39',
    personality: 'Organized, calm, keeps everything on schedule. Coordinates all ten employees.',
    dormBed: 'datta_mansion', bicycleColor: '#B4561F', specialNote: 'Travels by car from the mansion.',
  },
  mercury: {
    id: 'mercury', name: 'Mira', agentName: 'MERCURY', gender: 'female', role: 'Research Specialist',
    planet: 'Mercury', planetColor: '#9CA3AF', hairColor: '#616161', hairStyle: 'bun',
    skinTone: '#E8B88A', shirtColor: '#607D8B', pantsColor: '#37474F', accentColor: '#9CA3AF',
    personality: 'Curious, thorough, reads everything before anyone starts building.',
    dormBed: 'dormitory', bicycleColor: '#78909C', specialNote: 'Researches markets, competitors and technologies.',
  },
  venus: {
    id: 'venus', name: 'Vanya', agentName: 'VENUS', gender: 'female', role: 'UI/UX Designer',
    planet: 'Venus', planetColor: '#E8A33C', hairColor: '#5D4037', hairStyle: 'long',
    skinTone: '#F0C8A0', shirtColor: '#E8A33C', pantsColor: '#5D4E37', accentColor: '#F06292',
    personality: 'Creative, stylish, perfectionist. Makes products people love to use.',
    dormBed: 'dormitory', bicycleColor: '#D98F2B', specialNote: 'Designs interfaces, personas and design systems.',
  },
  earth: {
    id: 'earth', name: 'Ethan', agentName: 'EARTH', gender: 'male', role: 'Full Stack Developer',
    planet: 'Earth', planetColor: '#42A5F5', hairColor: '#4E342E', hairStyle: 'short',
    skinTone: '#C68B59', shirtColor: '#1E88E5', pantsColor: '#263238', accentColor: '#42A5F5',
    personality: 'Pragmatic, focused, gets things built. Vastly prefers coding to meetings.',
    dormBed: 'dormitory', bicycleColor: '#1976D2', specialNote: 'Builds the actual frontend and backend software.',
  },
  mars: {
    id: 'mars', name: 'Ari', agentName: 'MARS', gender: 'male', role: 'System Architect',
    planet: 'Mars', planetColor: '#EF5350', hairColor: '#3E2723', hairStyle: 'buzz',
    skinTone: '#C68B59', shirtColor: '#C62828', pantsColor: '#263238', accentColor: '#EF5350',
    personality: 'Logical, fast, confident. Designs architecture that survives success.',
    dormBed: 'dormitory', bicycleColor: '#C62828', specialNote: 'Designs system architecture and tech stack.',
  },
  jupiter: {
    id: 'jupiter', name: 'Jaya', agentName: 'JUPITER', gender: 'female', role: 'Database / Data Engineer',
    planet: 'Jupiter', planetColor: '#C8A951', hairColor: '#2E2A27', hairStyle: 'wavy',
    skinTone: '#D9A677', shirtColor: '#9E7D15', pantsColor: '#2B2B2B', accentColor: '#C8A951',
    personality: 'Strategic, detail oriented. Turns data into decisions.',
    dormBed: 'dormitory', bicycleColor: '#8D6E00', specialNote: 'Designs schemas, databases and data pipelines.',
  },
  saturn: {
    id: 'saturn', name: 'Sam', agentName: 'SATURN', gender: 'male', role: 'AI / ML Engineer',
    planet: 'Saturn', planetColor: '#A89070', hairColor: '#3E2723', hairStyle: 'short',
    skinTone: '#C68B59', shirtColor: '#8D6E63', pantsColor: '#4E342E', accentColor: '#A89070',
    personality: 'Patient, methodical. Builds the intelligent core of products.',
    dormBed: 'dormitory', bicycleColor: '#7A5C4E', specialNote: 'Develops AI/ML models and learning components.',
  },
  uranus: {
    id: 'uranus', name: 'Uma', agentName: 'URANUS', gender: 'female', role: 'Security Engineer',
    planet: 'Uranus', planetColor: '#26A69A', hairColor: '#1B0E07', hairStyle: 'ponytail',
    skinTone: '#E8B88A', shirtColor: '#00695C', pantsColor: '#263238', accentColor: '#26A69A',
    personality: 'Vigilant, precise. Trusts nothing without verification.',
    dormBed: 'dormitory', bicycleColor: '#00796B', specialNote: 'Hardens security, reviews vulnerabilities and threats.',
  },
  neptune: {
    id: 'neptune', name: 'Nia', agentName: 'NEPTUNE', gender: 'female', role: 'QA / Testing Engineer',
    planet: 'Neptune', planetColor: '#5C6BC0', hairColor: '#292C3A', hairStyle: 'curly',
    skinTone: '#E8B88A', shirtColor: '#3949AB', pantsColor: '#263238', accentColor: '#5C6BC0',
    personality: 'Trusts nobody, breaks everything, then fixes it. Perfectionist bug hunter.',
    dormBed: 'dormitory', bicycleColor: '#3F51B5', specialNote: 'Runs tests, QA and validation.',
  },
  pluto: {
    id: 'pluto', name: 'Prakash', agentName: 'PLUTO', gender: 'male', role: 'DevOps / Deployment Engineer',
    planet: 'Pluto', planetColor: '#AB47BC', hairColor: '#2E2A27', hairStyle: 'bald',
    skinTone: '#C68B59', shirtColor: '#6A1B9A', pantsColor: '#263238', accentColor: '#AB47BC',
    personality: 'Reliable, protective of production. Makes sure everything ships and stays running.',
    dormBed: 'dormitory', bicycleColor: '#8E24AA', specialNote: 'Configures deployment, Docker and CI/CD.',
  },
  ceres: {
    id: 'ceres', name: 'Celia', agentName: 'CERES', gender: 'female', role: 'Technical Writer / Documentation',
    planet: 'Ceres', planetColor: '#D4A574', hairColor: '#5D4037', hairStyle: 'ponytail',
    skinTone: '#F0C8A0', shirtColor: '#BC8A5F', pantsColor: '#4E342E', accentColor: '#D4A574',
    personality: 'Patient teacher. Writes the manuals so everyone can understand the product.',
    dormBed: 'dormitory', bicycleColor: '#A97443', specialNote: 'Writes documentation, guides and reports.',
  },
}

export const EMPLOYEE_IDS: AgentId[] = [
  'mercury', 'mars', 'venus', 'earth', 'jupiter',
  'saturn', 'neptune', 'uranus', 'pluto', 'ceres',
]

export const ALL_AGENT_IDS: AgentId[] = [
  'postman', 'aira', 'datta', ...EMPLOYEE_IDS,
]

export function getRoster(id: AgentId): HumanIdentity {
  return ROSTER[id]
}
