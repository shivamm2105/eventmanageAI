export type EventType =
  | 'wedding'
  | 'birthday'
  | 'anniversary'
  | 'community'
  | 'engagement'
  | 'baby_shower'
  | 'corporate_gala'
  | 'other';

export type VenuePreference =
  | 'indoor'
  | 'outdoor'
  | 'beach'
  | 'banquet'
  | 'home'
  | 'flexible';

export interface EventRequirements {
  id?: string;
  title: string;
  eventType: EventType;
  eventDate: string; // YYYY-MM-DD
  city: string;
  guestCount: number;
  budget: number; // in integer currency units
  currency: string; // 'INR', 'USD', 'EUR', 'GBP', etc.
  themePreference?: string;
  venuePreference: VenuePreference;
  dietaryPreferences: string[];
  additionalInstructions?: string;
}

export interface BudgetItem {
  id: string;
  category: string;
  estimatedAmount: number;
  actualAmount: number;
  notes?: string;
  isCustom?: boolean;
}

export interface BudgetSummary {
  totalBudget: number;
  totalEstimated: number;
  totalActual: number;
  remainingBudget: number;
  contingencyAmount: number;
  contingencyPercent: number;
  isOverBudget: boolean;
  overspendAmount: number;
  utilizationPercent: number;
}

export type TaskPhase =
  | '3-6 months before'
  | '1-2 months before'
  | '2-4 weeks before'
  | 'Week of event'
  | 'Event day'
  | 'Post-event';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface TaskItem {
  id: string;
  title: string;
  category: string;
  phase: TaskPhase;
  dueDate: string; // YYYY-MM-DD
  completed: boolean;
  priority: TaskPriority;
  notes?: string;
}

export interface TimelineSummary {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  upcomingTasks: number;
  completionPercentage: number;
}

export type VendorStatus = 'research' | 'shortlisted' | 'contacted' | 'booked';

export interface VendorCategoryPlanning {
  id: string;
  category: string;
  status: VendorStatus;
  vendorName: string;
  contactPerson: string;
  phone: string;
  email: string;
  estimatedBudget: number;
  actualCost: number;
  notes?: string;
  questionsToAsk: string[];
}

export interface RecommendedTheme {
  name: string;
  colorPalette: string[];
  vibeDescription: string;
  decorConcepts: string[];
}

export interface PersonalizedIdeas {
  entertainment: string[];
  diningExperience: string[];
  guestExperience: string[];
  ecoFriendlyTips: string[];
}

export interface RiskAndContingency {
  risk: string;
  mitigation: string;
  severity: 'low' | 'medium' | 'high';
}

export interface GeneratedPlan {
  eventTitle: string;
  summary: string;
  planningAssumptions: string[];
  recommendedTheme: RecommendedTheme;
  budgetItems: BudgetItem[];
  contingencyReserve: {
    amount: number;
    percentage: number;
    rationale: string;
  };
  timeline: TaskItem[];
  vendorCategories: VendorCategoryPlanning[];
  personalizedIdeas: PersonalizedIdeas;
  riskAndContingencies: RiskAndContingency[];
  isDemoPlan: boolean;
  generatedAt: string;
  modelUsed: string;
}

export interface EventRecord {
  id: string;
  requirements: EventRequirements;
  plan: GeneratedPlan;
  createdAt: string;
  updatedAt: string;
}
