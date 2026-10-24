import { EventRequirements, GeneratedPlan } from './types';
import { calculatePhaseDueDate } from './timelineEngine';

/**
 * Generates an interactive, structured sample plan when running in Demo Mode.
 * All plans generated here have `isDemoPlan: true` and `modelUsed: 'Demo Mode (Offline Sample Generator)'`.
 */
export function generateSamplePlan(req: EventRequirements): GeneratedPlan {
  const budget = Math.max(5000, req.budget);
  const eventDate = req.eventDate || new Date().toISOString().split('T')[0];

  const contingencyPct = 10;
  const contingencyAmount = Math.round((budget * contingencyPct) / 100);
  const allocatableBudget = budget - contingencyAmount;

  // Proportions that sum to 100% of allocatable budget
  const budgetRatios: { category: string; pct: number; notes: string }[] = [
    {
      category: 'Venue & Infrastructure',
      pct: 0.30,
      notes: `Dedicated indoor/outdoor space in ${req.city} for ${req.guestCount} guests`,
    },
    {
      category: 'Catering & Dining',
      pct: 0.32,
      notes: `Custom menu accommodating ${
        req.dietaryPreferences.length > 0 ? req.dietaryPreferences.join(', ') : 'all dietary preferences'
      }`,
    },
    {
      category: 'Decor & Floral Artistry',
      pct: 0.15,
      notes: `Theme styling aligned with "${req.themePreference || 'Modern Elegant'}" aesthetic`,
    },
    {
      category: 'Photography & Videography',
      pct: 0.10,
      notes: 'Full-day multi-camera coverage with candid photographer',
    },
    {
      category: 'Entertainment & Audio',
      pct: 0.08,
      notes: 'Professional sound system, DJ/live acoustic performer and curated music',
    },
    {
      category: 'Invitations & Favors',
      pct: 0.05,
      notes: `Customized digital cards and bespoke favors for ${req.guestCount} guests`,
    },
  ];

  const budgetItems = budgetRatios.map((item, idx) => ({
    id: `demo-budget-${idx + 1}`,
    category: item.category,
    estimatedAmount: Math.round(allocatableBudget * item.pct),
    actualAmount: 0,
    notes: item.notes,
    isCustom: false,
  }));

  const timeline = [
    {
      id: 'demo-task-1',
      title: 'Finalize venue booking and sign contract',
      category: 'Venue',
      phase: '3-6 months before' as const,
      dueDate: calculatePhaseDueDate(eventDate, '3-6 months before'),
      completed: true,
      priority: 'critical' as const,
      notes: `Secure venue contract with initial deposit in ${req.city}`,
    },
    {
      id: 'demo-task-2',
      title: 'Review menu tastings and dietary options',
      category: 'Catering',
      phase: '1-2 months before' as const,
      dueDate: calculatePhaseDueDate(eventDate, '1-2 months before'),
      completed: false,
      priority: 'high' as const,
      notes: `Confirm items for ${req.guestCount} guests including special dietary requests`,
    },
    {
      id: 'demo-task-3',
      title: 'Approve decor mockups and color palette',
      category: 'Decor',
      phase: '1-2 months before' as const,
      dueDate: calculatePhaseDueDate(eventDate, '1-2 months before'),
      completed: false,
      priority: 'medium' as const,
      notes: 'Finalize entrance arches, stage layout, and tablescape samples',
    },
    {
      id: 'demo-task-4',
      title: 'Send out formal invitations & collect RSVPs',
      category: 'Invitations',
      phase: '2-4 weeks before' as const,
      dueDate: calculatePhaseDueDate(eventDate, '2-4 weeks before'),
      completed: false,
      priority: 'high' as const,
      notes: 'Track headcounts and arrival times',
    },
    {
      id: 'demo-task-5',
      title: 'Finalize run-of-show schedule with emcee and DJ',
      category: 'Entertainment',
      phase: 'Week of event' as const,
      dueDate: calculatePhaseDueDate(eventDate, 'Week of event'),
      completed: false,
      priority: 'critical' as const,
      notes: 'Prepare minute-by-minute timeline for speeches, entries, and meals',
    },
    {
      id: 'demo-task-6',
      title: 'Conduct on-site soundcheck and lighting check',
      category: 'Audio-Visual',
      phase: 'Event day' as const,
      dueDate: calculatePhaseDueDate(eventDate, 'Event day'),
      completed: false,
      priority: 'critical' as const,
      notes: 'Verify microphone batteries, backup audio, and stage lighting',
    },
    {
      id: 'demo-task-7',
      title: 'Distribute final vendor payments and gather feedback',
      category: 'Post-Event',
      phase: 'Post-event' as const,
      dueDate: calculatePhaseDueDate(eventDate, 'Post-event'),
      completed: false,
      priority: 'low' as const,
      notes: 'Settle outstanding dues and request photos/video teaser clips',
    },
  ];

  const vendorCategories = [
    {
      id: 'demo-vendor-1',
      category: 'Venue',
      status: 'shortlisted' as const,
      vendorName: 'Grand Heritage Hall & Lawns',
      contactPerson: 'Mr. Arvind Sharma',
      phone: '+91 98765 43210',
      email: 'events@grandheritagehall.example',
      estimatedBudget: Math.round(allocatableBudget * 0.30),
      actualCost: 0,
      notes: 'Central location, ample parking, in-house generator backup available.',
      questionsToAsk: [
        'What is the maximum noise curfew for outdoor sound?',
        'Does the venue rental include setup and teardown hours?',
        'Is outside catering and decor permitted without surcharge?',
      ],
    },
    {
      id: 'demo-vendor-2',
      category: 'Catering',
      status: 'research' as const,
      vendorName: 'Royal Epicurean Caterers',
      contactPerson: 'Ms. Sunita Roy',
      phone: '+91 98111 22334',
      email: 'info@royalepicurean.example',
      estimatedBudget: Math.round(allocatableBudget * 0.32),
      actualCost: 0,
      notes: 'Renowned for live chaat counters and artisanal dessert spreads.',
      questionsToAsk: [
        'How many service staff are provided per 30 guests?',
        'What is your protocol for handling food allergy cross-contamination?',
        'Do you provide chinaware, cutlery, and linens as part of the package?',
      ],
    },
    {
      id: 'demo-vendor-3',
      category: 'Decor & Floral',
      status: 'research' as const,
      vendorName: 'Aura Floral Designs',
      contactPerson: 'Rohit Verma',
      phone: '+91 99887 76655',
      email: 'designs@auraflowers.example',
      estimatedBudget: Math.round(allocatableBudget * 0.15),
      actualCost: 0,
      notes: 'Specializes in sustainable organic botanicals and warm micro-lighting.',
      questionsToAsk: [
        'Can centerpieces and flowers be repurposed between ceremonies?',
        'Do you offer digital 3D renders before final construction?',
        'What is your rain-backup plan for outdoor decorative setups?',
      ],
    },
    {
      id: 'demo-vendor-4',
      category: 'Photography',
      status: 'contacted' as const,
      vendorName: 'Lumiere Cinematic Studios',
      contactPerson: 'Deepak Nair',
      phone: '+91 97654 32109',
      email: 'deepak@lumierecinematics.example',
      estimatedBudget: Math.round(allocatableBudget * 0.10),
      actualCost: 0,
      notes: 'Includes drone footage and same-day 60-second social media reel.',
      questionsToAsk: [
        'How many raw photos are delivered and what is the turnaround time for the album?',
        'Who will be the lead photographers on the actual day?',
        'What equipment redundancies are brought on-site?',
      ],
    },
  ];

  return {
    eventTitle: req.title || `${req.eventType.toUpperCase()} Celebration in ${req.city}`,
    summary: `Curated ${req.eventType} plan for ${req.guestCount} guests in ${req.city}. Optimized for a budget of ${req.currency} ${budget.toLocaleString()}, blending ${
      req.themePreference || 'refined timeless elegance'
    } with seamless guest comfort.`,
    planningAssumptions: [
      `Guest count estimated at ${req.guestCount} with 85-90% expected RSVP attendance rate.`,
      `Total budget pegged at ${req.currency} ${budget.toLocaleString()} including ${contingencyPct}% contingency buffer.`,
      `Venue selection assumes ${req.venuePreference} setting with weather contingency plan.`,
      `Menu curated for diverse palates with specific considerations for ${
        req.dietaryPreferences.length > 0 ? req.dietaryPreferences.join(', ') : 'standard preferences'
      }.`,
    ],
    recommendedTheme: {
      name: req.themePreference || 'Royal Amethyst & Champagne Gold',
      colorPalette: ['#4C1D95', '#7C3AED', '#F59E0B', '#FDF4FF', '#1F2937'],
      vibeDescription:
        'A sophisticated and celebratory ambiance balancing royal jewel tones with warm ambient illumination.',
      decorConcepts: [
        'Cascading fairy-light canopy with botanical green foliage over dining tables',
        'Custom photo backdrop arch with monogram lighting and velvet seating',
        'Minimalist brass and glass table centerpieces with fresh blooms',
      ],
    },
    budgetItems,
    contingencyReserve: {
      amount: contingencyAmount,
      percentage: contingencyPct,
      rationale:
        'Reserved for unexpected guest additions, last-minute vendor overtime, or weather contingency equipment rentals.',
    },
    timeline,
    vendorCategories,
    personalizedIdeas: {
      entertainment: [
        'Interactive welcome lounge with an acoustic violinist or saxophone performance during cocktails',
        'Customized trivia/quiz game about the hosts via smartphone QR codes',
        'Bespoke signature cocktail/mocktail station named after milestone moments',
      ],
      diningExperience: [
        'Live chef interactive stations for freshly tossed pasta and artisanal kebabs',
        'Dessert bar featuring regional favorites alongside modern bite-sized patisseries',
        'Late-night warm beverage and dessert cart for departing guests',
      ],
      guestExperience: [
        'Personalized handwritten welcome cards placed at each guest seat',
        'Digital guestbook with instant polaroid photo print keepsake',
        'Comfort hospitality kit with mints, heel stoppers, and cooling mist sprays',
      ],
      ecoFriendlyTips: [
        'Use biodegradable leaf platters for cocktail appetizers and seed-paper place cards',
        'Partner with a verified local food charity for zero-waste surplus meal redistribution',
        'Select locally sourced seasonal flowers to reduce carbon transport footprint',
      ],
    },
    riskAndContingencies: [
      {
        risk: 'Inclement weather or unexpected rain showers during outdoor segments',
        mitigation:
          'Ensure venue contract includes on-demand waterproof marquees or indoor hall rollover guarantee.',
        severity: 'high',
      },
      {
        risk: 'Higher guest turnout than confirmed RSVPs',
        mitigation:
          'Maintain 10% buffer with caterer on core staple dishes and reserve contingency budget for extra covers.',
        severity: 'medium',
      },
      {
        risk: 'Sound or power interruption during the main ceremonial moments',
        mitigation:
          'Verify that venue has automatic silent dual-generator switchover with uninterruptible power supply (UPS) for sound desk.',
        severity: 'high',
      },
    ],
    isDemoPlan: true,
    generatedAt: new Date().toISOString(),
    modelUsed: 'Demo Mode (Local Sample Generator)',
  };
}
