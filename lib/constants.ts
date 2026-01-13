export const SERVICE_TYPES = {
  rapid: {
    name: 'Rapid Prototype',
    priceRange: '$5,000 - $8,000',
    timeline: '3-5 days',
    description: 'Perfect for validating ideas fast, investor demos, and market testing',
  },
  full: {
    name: 'Full Product Build',
    priceRange: '$12,000 - $25,000',
    timeline: '7-14 days',
    description: 'Perfect for launching your MVP, going to market, and funded startups',
  },
  'ai-integration': {
    name: 'AI Integration',
    priceRange: '$8,000 - $15,000',
    timeline: '5-7 days',
    description: 'Perfect for adding AI features, upgrading existing apps, and Claude/GPT integration',
  },
  design: {
    name: 'Design Sprint',
    priceRange: '$3,000 - $5,000',
    timeline: '2-3 days',
    description: 'Perfect for UI/UX design only, design systems, and dev teams needing design',
  },
} as const;

export const PROJECT_STATUSES = {
  inquiry: { label: 'Inquiry', color: 'gray' },
  active: { label: 'Active', color: 'green' },
  review: { label: 'In Review', color: 'yellow' },
  completed: { label: 'Completed', color: 'blue' },
  cancelled: { label: 'Cancelled', color: 'red' },
} as const;

export const TASK_STATUSES = {
  todo: { label: 'To Do', color: 'gray' },
  'in-progress': { label: 'In Progress', color: 'blue' },
  review: { label: 'In Review', color: 'yellow' },
  done: { label: 'Done', color: 'green' },
} as const;
