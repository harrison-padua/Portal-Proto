export type GoalCategory =
  | 'Retirement'
  | 'Education'
  | 'Property'
  | 'Travel'
  | 'Business'
  | 'Lifestyle'
  | 'Legacy'
  | 'Emergency Fund'
  | 'Debt Reduction'
  | 'Investment';

export const GOAL_CATEGORIES: GoalCategory[] = [
  'Retirement',
  'Education',
  'Property',
  'Travel',
  'Business',
  'Lifestyle',
  'Legacy',
  'Emergency Fund',
  'Debt Reduction',
  'Investment',
];

export type GoalPriority = 'High' | 'Medium' | 'Low';
export const GOAL_PRIORITIES: GoalPriority[] = ['High', 'Medium', 'Low'];

export type GoalStatus = 'Not Started' | 'In Progress' | 'On Track' | 'Off Track' | 'At Risk';
export const GOAL_STATUSES: GoalStatus[] = ['Not Started', 'In Progress', 'On Track', 'Off Track', 'At Risk'];

export type SpecialDateOption = 'By Retirement' | 'Ongoing' | 'Short Term' | 'Medium Term' | 'Long Term';
export const SPECIAL_DATE_OPTIONS: SpecialDateOption[] = [
  'By Retirement',
  'Ongoing',
  'Short Term',
  'Medium Term',
  'Long Term',
];

export type TimeFrameMode = 'date' | 'special';

export interface Goal {
  id: string;
  clientId: number;
  title: string;
  description: string;
  category: GoalCategory;
  priority: GoalPriority;
  status: GoalStatus;
  targetAmount: number;
  currentAmount: number;
  timeFrameMode: TimeFrameMode;
  targetDate: string | null;
  specialDateOption: SpecialDateOption | null;
  completed: boolean;
  outcomeNotes: string | null;
  completionDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export const GOAL_TEMPLATES: Record<GoalCategory, { title: string; description: string }[]> = {
  Retirement: [
    {
      title: 'Retire comfortably at 65',
      description: 'Build a retirement nest egg sufficient to maintain current lifestyle from age 65 onwards.',
    },
    {
      title: 'Early retirement at 55',
      description: 'Achieve financial independence by age 55 with passive income covering living expenses.',
    },
    {
      title: 'Maximise super contributions',
      description: 'Contribute the concessional cap each year and make catch-up contributions where eligible.',
    },
  ],
  Education: [
    {
      title: 'Fund children\'s university education',
      description: 'Set aside enough capital to pay for tertiary education for each child.',
    },
    {
      title: 'Private school fees',
      description: 'Cover ongoing private school fees through dedicated investment account.',
    },
  ],
  Property: [
    {
      title: 'Buy first home',
      description: 'Save for a 20% deposit on a primary residence within the next five years.',
    },
    {
      title: 'Pay off mortgage',
      description: 'Eliminate home loan principal ahead of schedule by making additional repayments.',
    },
    {
      title: 'Purchase investment property',
      description: 'Acquire a second property as a long-term investment for capital growth and rental income.',
    },
  ],
  Travel: [
    {
      title: 'Family overseas trip',
      description: 'Save for an extended overseas holiday with the whole family.',
    },
    {
      title: 'Annual holiday fund',
      description: 'Establish recurring contributions to fund an annual family holiday.',
    },
  ],
  Business: [
    {
      title: 'Launch new business',
      description: 'Build seed capital to start a new business venture without taking on debt.',
    },
    {
      title: 'Business succession plan',
      description: 'Prepare the business for sale or handover within an agreed time frame.',
    },
  ],
  Lifestyle: [
    {
      title: 'Renovate primary residence',
      description: 'Save for a major home renovation without increasing mortgage debt.',
    },
    {
      title: 'Buy a new vehicle',
      description: 'Replace existing vehicle with a newer model paid for in cash.',
    },
  ],
  Legacy: [
    {
      title: 'Establish family trust',
      description: 'Set up a discretionary trust to hold and distribute family wealth across generations.',
    },
    {
      title: 'Charitable giving plan',
      description: 'Allocate a portion of capital towards a structured charitable giving program.',
    },
  ],
  'Emergency Fund': [
    {
      title: '6 months expenses buffer',
      description: 'Build a cash reserve covering 6 months of living expenses for unforeseen events.',
    },
    {
      title: 'Income protection buffer',
      description: 'Hold liquid funds equal to 3 months net income alongside insurance cover.',
    },
  ],
  'Debt Reduction': [
    {
      title: 'Pay off credit card debt',
      description: 'Clear all high-interest credit card balances within 12 months.',
    },
    {
      title: 'Consolidate personal loans',
      description: 'Refinance and aggressively pay down personal loan balances.',
    },
  ],
  Investment: [
    {
      title: 'Build diversified share portfolio',
      description: 'Establish a globally diversified equity portfolio aligned with risk profile.',
    },
    {
      title: 'Passive income of $50k p.a.',
      description: 'Construct an income-focused portfolio generating $50,000 of passive income annually.',
    },
  ],
};
