import { BudgetItem, BudgetSummary } from './types';

/**
 * Budget Calculation Engine
 * Uses integer minor units (paise/cents: scale by 100) to avoid floating-point math issues.
 */

// Scale factor for minor units calculation
const MINOR_SCALE = 100;

export function toMinorUnits(amount: number): number {
  if (isNaN(amount) || !isFinite(amount)) return 0;
  return Math.round(amount * MINOR_SCALE);
}

export function fromMinorUnits(minorAmount: number): number {
  return minorAmount / MINOR_SCALE;
}

/**
 * Calculates total budget summary given a list of budget items, contingency, and overall budget.
 */
export function calculateBudgetSummary(
  totalBudget: number,
  items: BudgetItem[],
  contingencyPercent: number = 10
): BudgetSummary {
  const safeTotalBudget = Math.max(0, totalBudget);
  const totalBudgetMinor = toMinorUnits(safeTotalBudget);

  let totalEstimatedMinor = 0;
  let totalActualMinor = 0;

  for (const item of items) {
    const est = Math.max(0, item.estimatedAmount || 0);
    const act = Math.max(0, item.actualAmount || 0);
    totalEstimatedMinor += toMinorUnits(est);
    totalActualMinor += toMinorUnits(act);
  }

  // Calculate contingency amount based on total budget
  const safeContingencyPercent = Math.min(Math.max(0, contingencyPercent), 50);
  const contingencyMinor = Math.round((totalBudgetMinor * safeContingencyPercent) / 100);

  // Spent/committed: if user entered actual amounts, prioritize actual for those items,
  // or use estimated if actual is 0
  let effectiveCommittedMinor = 0;
  for (const item of items) {
    const estMinor = toMinorUnits(Math.max(0, item.estimatedAmount || 0));
    const actMinor = toMinorUnits(Math.max(0, item.actualAmount || 0));
    effectiveCommittedMinor += actMinor > 0 ? actMinor : estMinor;
  }

  const remainingMinor = totalBudgetMinor - effectiveCommittedMinor;
  const isOverBudget = remainingMinor < 0;
  const overspendMinor = isOverBudget ? Math.abs(remainingMinor) : 0;

  const utilizationPercent =
    totalBudgetMinor > 0
      ? Math.min(999, Math.round((effectiveCommittedMinor / totalBudgetMinor) * 1000) / 10)
      : 0;

  return {
    totalBudget: fromMinorUnits(totalBudgetMinor),
    totalEstimated: fromMinorUnits(totalEstimatedMinor),
    totalActual: fromMinorUnits(totalActualMinor),
    remainingBudget: fromMinorUnits(remainingMinor),
    contingencyAmount: fromMinorUnits(contingencyMinor),
    contingencyPercent: safeContingencyPercent,
    isOverBudget,
    overspendAmount: fromMinorUnits(overspendMinor),
    utilizationPercent,
  };
}

/**
 * Formats a currency amount nicely according to the currency code.
 * Defaults to INR with proper Indian numbering system (Lakhs / Crores) or standard international.
 */
export function formatCurrency(amount: number, currency: string = 'INR'): string {
  const safeAmount = isNaN(amount) ? 0 : amount;
  const locale = currency.toUpperCase() === 'INR' ? 'en-IN' : 'en-US';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase(),
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(safeAmount);
  } catch {
    return `${currency} ${safeAmount.toLocaleString()}`;
  }
}

/**
 * Generates initial budget breakdown percentages tailored to event type.
 */
export function getRecommendedCategoryAllocations(
  eventType: string,
  totalBudget: number
): { category: string; percentage: number; estimatedAmount: number; notes: string }[] {
  const safeBudget = Math.max(0, totalBudget);

  const allocationsByEvent: Record<
    string,
    { category: string; percentage: number; notes: string }[]
  > = {
    wedding: [
      { category: 'Venue & Infrastructure', percentage: 25, notes: 'Hall rental, lighting, setup' },
      { category: 'Catering & Beverages', percentage: 30, notes: 'Welcome drinks, main buffet, desserts' },
      { category: 'Decor & Floral Styling', percentage: 15, notes: 'Mandap/stage, centerpieces, entrance' },
      { category: 'Photography & Cinematography', percentage: 10, notes: 'Pre-wedding & full event coverage' },
      { category: 'Attire & Makeup', percentage: 8, notes: 'Bridal, groom, styling team' },
      { category: 'Entertainment & Sound', percentage: 5, notes: 'DJ, sound system, MC' },
      { category: 'Invitations & Favors', percentage: 3, notes: 'Digital & physical invites, guest gifts' },
      { category: 'Logistics & Transport', percentage: 4, notes: 'Guest coordination, vintage car' },
    ],
    birthday: [
      { category: 'Venue & Play Area', percentage: 25, notes: 'Party hall or cafe booking' },
      { category: 'Catering & Snacks', percentage: 35, notes: 'Kid-friendly & adult menu' },
      { category: 'Cake & Custom Desserts', percentage: 8, notes: 'Themed custom designer cake' },
      { category: 'Theme Decor & Balloons', percentage: 15, notes: 'Balloon arch, photo booth, backdrop' },
      { category: 'Entertainment & Games', percentage: 10, notes: 'Magician, host, game activities' },
      { category: 'Return Gifts & Favors', percentage: 7, notes: 'Customized gift bags for guests' },
    ],
    anniversary: [
      { category: 'Venue & Ambience', percentage: 30, notes: 'Boutique garden or rooftop restaurant' },
      { category: 'Gourmet Dining & Wine', percentage: 35, notes: 'Multi-course dinner experience' },
      { category: 'Floral & Ambient Decor', percentage: 15, notes: 'Fairy lights, floral arrangements' },
      { category: 'Photography', percentage: 10, notes: 'Portraits and candid moments' },
      { category: 'Music & Audio', percentage: 6, notes: 'Acoustic band or curated playlist system' },
      { category: 'Cake & Keepsakes', percentage: 4, notes: 'Special anniversary cake' },
    ],
    community: [
      { category: 'Venue & Permits', percentage: 25, notes: 'Public park, hall, council permissions' },
      { category: 'Community Food & Refreshments', percentage: 35, notes: 'Buffet or boxed meals' },
      { category: 'Audio-Visual & Staging', percentage: 20, notes: 'Stage, mics, speakers, projector' },
      { category: 'Banners & Signage', percentage: 10, notes: 'Wayfinding, welcome posters, programs' },
      { category: 'Safety & Sanitation', percentage: 10, notes: 'First aid, bins, water stations' },
    ],
    engagement: [
      { category: 'Venue & Lawns', percentage: 25, notes: 'Banquet hall or outdoor lawn' },
      { category: 'Catering & Cocktails', percentage: 35, notes: 'Appetizers, main dinner, specialty drinks' },
      { category: 'Ring Backdrop & Floral Decor', percentage: 15, notes: 'Stage backdrop, floral ring arch' },
      { category: 'Cinematography & Portraits', percentage: 12, notes: 'Candid photo & couple teaser video' },
      { category: 'DJ, Sound & Lights', percentage: 8, notes: 'Sound system, moving head lights, DJ' },
      { category: 'Invitations & Favors', percentage: 5, notes: 'Digital video invites and guest favors' },
    ],
    baby_shower: [
      { category: 'Venue & High Tea Lounge', percentage: 25, notes: 'Intimate banquet or cafe lounge' },
      { category: 'Buffet & Mocktail Bar', percentage: 30, notes: 'Gourmet high tea, finger foods, mocktails' },
      { category: 'Pastel Decor & Balloon Art', percentage: 20, notes: 'Organic balloon garland, baby photo arch' },
      { category: 'Photography', percentage: 10, notes: 'Mom-to-be portraits and family candids' },
      { category: 'Games, Emcee & Activities', percentage: 8, notes: 'Trivia, games host, prize props' },
      { category: 'Custom Favors & Cake', percentage: 7, notes: 'Designer cake and personalized gift hampers' },
    ],
    corporate_gala: [
      { category: 'Grand Ballroom Venue', percentage: 30, notes: 'Luxury hotel ballroom rental with staging' },
      { category: 'Executive Banquet & Beverages', percentage: 35, notes: 'Multi-course plated or luxury buffet' },
      { category: 'AV, LED Wall & Audio Engineering', percentage: 15, notes: 'High-res LED screens, wireless mics, PA' },
      { category: 'Keynote Emcee & Live Act', percentage: 10, notes: 'Professional emcee and corporate entertainer' },
      { category: 'Event Branding & Mementos', percentage: 6, notes: 'Bespoke awards, badges, gift bags' },
      { category: 'Photography & Livestreaming', percentage: 4, notes: 'Multi-camera stream and PR photos' },
    ],
    other: [
      { category: 'Venue & Space Booking', percentage: 30, notes: 'Primary event space rental' },
      { category: 'Food & Beverage Catering', percentage: 35, notes: 'Buffet service and refreshments' },
      { category: 'Decor & Ambiance', percentage: 15, notes: 'Lighting, florals, and seating arrangement' },
      { category: 'Music, Sound & Photography', percentage: 12, notes: 'Audio setup, music curation, and photos' },
      { category: 'Logistics & Supplies', percentage: 8, notes: 'Registration, signage, and misc supplies' },
    ],
  };

  const selectedAllocations =
    allocationsByEvent[eventType.toLowerCase()] || allocationsByEvent['wedding'];

  return selectedAllocations.map((item) => ({
    category: item.category,
    percentage: item.percentage,
    estimatedAmount: Math.round((safeBudget * item.percentage) / 100),
    notes: item.notes,
  }));
}
