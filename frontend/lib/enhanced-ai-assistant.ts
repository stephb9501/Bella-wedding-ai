/**
 * Enhanced AI Wedding Assistant
 *
 * Provides intelligent, context-aware responses for wedding planning
 * Uses wedding context (budget, date, location, theme) for personalized advice
 */

export interface WeddingContext {
  weddingDate?: string;
  budget?: number;
  guestCount?: number;
  location?: string;
  theme?: string;
  venue?: string;
}

export interface AIResponse {
  message: string;
  actions?: Array<{
    label: string;
    href: string;
  }>;
  relatedQuestions?: string[];
}

/**
 * Intelligent budget breakdown calculator
 */
export function calculateSmartBudget(totalBudget: number, guestCount: number): {
  category: string;
  percentage: number;
  amount: number;
  perGuest?: number;
  tips: string[];
}[] {
  return [
    {
      category: 'Venue & Catering',
      percentage: 45,
      amount: Math.round(totalBudget * 0.45),
      perGuest: Math.round((totalBudget * 0.45) / guestCount),
      tips: [
        `At $${Math.round((totalBudget * 0.45) / guestCount)} per guest, you can afford upscale catering`,
        'Book 12-18 months in advance for popular venues',
        'Weekend rates are 20-30% higher than weekdays',
      ],
    },
    {
      category: 'Photography & Videography',
      percentage: 12,
      amount: Math.round(totalBudget * 0.12),
      tips: [
        'Top photographers book 12-18 months out',
        'Consider 8-10 hour coverage',
        'Ask for digital files and printing rights',
      ],
    },
    {
      category: 'Flowers & Décor',
      percentage: 9,
      amount: Math.round(totalBudget * 0.09),
      tips: [
        'Choose seasonal flowers to save 30-50%',
        'Repurpose ceremony flowers at reception',
        'Consider non-floral centerpieces for savings',
      ],
    },
    {
      category: 'Music & Entertainment',
      percentage: 9,
      amount: Math.round(totalBudget * 0.09),
      tips: [
        'DJs average $1,200-2,500',
        'Live bands range $3,000-10,000',
        'Book 9-12 months in advance',
      ],
    },
    {
      category: 'Wedding Attire',
      percentage: 9,
      amount: Math.round(totalBudget * 0.09),
      tips: [
        'Dress alterations add $200-600',
        'Groom suit rental: $150-300',
        'Start shopping 9-12 months before',
      ],
    },
    {
      category: 'Rings & Jewelry',
      percentage: 5,
      amount: Math.round(totalBudget * 0.05),
      tips: [
        'Wedding bands: $500-2,000 per ring',
        'Shop during holiday sales',
        'Consider heirloom pieces',
      ],
    },
    {
      category: 'Invitations & Stationery',
      percentage: 3,
      amount: Math.round(totalBudget * 0.03),
      perGuest: Math.round((totalBudget * 0.03) / (guestCount * 0.6)), // Assume couples
      tips: [
        `Budget $${Math.round((totalBudget * 0.03) / (guestCount * 0.6))} per invite`,
        'Digital invites can save 80-90%',
        'Order 10-15% extra for mistakes',
      ],
    },
    {
      category: 'Favors & Gifts',
      percentage: 3,
      amount: Math.round(totalBudget * 0.03),
      perGuest: Math.round((totalBudget * 0.03) / guestCount),
      tips: [
        `Budget $${Math.round((totalBudget * 0.03) / guestCount)} per favor`,
        'Edible favors are popular',
        'Consider charitable donations instead',
      ],
    },
    {
      category: 'Transportation',
      percentage: 2,
      amount: Math.round(totalBudget * 0.02),
      tips: [
        'Limo: $400-800',
        'Vintage car: $300-500',
        'Party bus for guests: $500-1,200',
      ],
    },
    {
      category: 'Miscellaneous',
      percentage: 3,
      amount: Math.round(totalBudget * 0.03),
      tips: [
        'Marriage license: $30-150',
        'Tips for vendors: 15-20%',
        'Emergency fund for last-minute needs',
      ],
    },
  ];
}

/**
 * Vendor recommendations based on budget and category
 */
export function getVendorRecommendations(
  category: string,
  budget: number,
  location?: string
): {
  tier: string;
  priceRange: string;
  description: string;
  searchTips: string[];
} {
  const ranges: Record<string, any> = {
    photographer: [
      {
        tier: 'Budget-Friendly',
        priceRange: '$1,000-2,500',
        description: 'Emerging photographers, limited coverage (4-6 hours)',
        searchTips: [
          'Look for photographers building their portfolio',
          'Check local photography schools for graduates',
          'Consider engagement + wedding packages',
        ],
      },
      {
        tier: 'Mid-Range',
        priceRange: '$2,500-5,000',
        description: 'Experienced pros, full-day coverage (8-10 hours)',
        searchTips: [
          'Expect 500-800 edited photos',
          'Second shooter often included',
          'Engagement session included',
        ],
      },
      {
        tier: 'Luxury',
        priceRange: '$5,000-15,000+',
        description: 'Top-tier artists, full team, albums included',
        searchTips: [
          'Featured in major wedding publications',
          'Custom albums and prints included',
          'Full team (photographer + assistants)',
        ],
      },
    ],
    florist: [
      {
        tier: 'Budget-Friendly',
        priceRange: '$500-1,500',
        description: 'Seasonal flowers, simple arrangements',
        searchTips: [
          'Choose in-season blooms',
          'Consider grocery store flowers (DIY)',
          'Use more greenery, fewer flowers',
        ],
      },
      {
        tier: 'Mid-Range',
        priceRange: '$1,500-3,500',
        description: 'Professional florist, custom designs',
        searchTips: [
          'Full bridal party flowers',
          '8-12 centerpieces',
          'Ceremony arch florals',
        ],
      },
      {
        tier: 'Luxury',
        priceRange: '$3,500-10,000+',
        description: 'Designer florals, rare blooms, full venue transformation',
        searchTips: [
          'Imported flowers',
          'Full venue florals',
          'Suspended installations',
        ],
      },
    ],
    dj: [
      {
        tier: 'Budget-Friendly',
        priceRange: '$500-1,200',
        description: 'Basic sound system, playlist-based',
        searchTips: [
          'Friend/amateur with good equipment',
          'Spotify premium + rented equipment',
          'Check college radio DJs',
        ],
      },
      {
        tier: 'Mid-Range',
        priceRange: '$1,200-2,500',
        description: 'Professional DJ, MC services, premium sound',
        searchTips: [
          'Experienced with weddings',
          'Full MC services included',
          'Professional lighting',
        ],
      },
      {
        tier: 'Luxury',
        priceRange: '$2,500-5,000+',
        description: 'Celebrity DJ, full production, custom lighting',
        searchTips: [
          'Custom light shows',
          'Full production team',
          'Multi-room sound',
        ],
      },
    ],
  };

  const categoryRanges = ranges[category.toLowerCase()] || ranges.photographer;

  // Determine which tier based on budget
  if (budget < 1500) return categoryRanges[0];
  if (budget < 4000) return categoryRanges[1];
  return categoryRanges[2];
}

/**
 * Color palette generator based on theme and season
 */
export function generateColorPalette(theme?: string, season?: string): {
  name: string;
  colors: string[];
  hex: string[];
  description: string;
  pairings: string;
}[] {
  const palettes: Record<string, any> = {
    'Modern Minimalist': [
      {
        name: 'Monochrome Elegance',
        colors: ['Black', 'White', 'Charcoal', 'Silver'],
        hex: ['#000000', '#FFFFFF', '#36454F', '#C0C0C0'],
        description: 'Sophisticated and timeless',
        pairings: 'Pair with white roses and eucalyptus greenery',
      },
      {
        name: 'Soft Neutrals',
        colors: ['Cream', 'Taupe', 'Champagne', 'Gold'],
        hex: ['#FFFDD0', '#483C32', '#F7E7CE', '#FFD700'],
        description: 'Warm and inviting',
        pairings: 'Beautiful with pampas grass and ivory roses',
      },
    ],
    'Rustic Charm': [
      {
        name: 'Autumn Harvest',
        colors: ['Burgundy', 'Burnt Orange', 'Mustard', 'Sage Green'],
        hex: ['#800020', '#CC5500', '#FFDB58', '#9DC183'],
        description: 'Warm and earthy',
        pairings: 'Perfect with sunflowers, dahlias, and wheat stalks',
      },
      {
        name: 'Barn Romance',
        colors: ['Dusty Rose', 'Sage', 'Cream', 'Navy'],
        hex: ['#DCAE96', '#9DC183', '#FFFDD0', '#000080'],
        description: 'Romantic with a rustic edge',
        pairings: 'Pair with cotton stems and baby\'s breath',
      },
    ],
    'Garden Romance': [
      {
        name: 'English Garden',
        colors: ['Blush Pink', 'Lavender', 'Sage Green', 'Ivory'],
        hex: ['#FFC0CB', '#E6E6FA', '#9DC183', '#FFFFF0'],
        description: 'Soft and romantic',
        pairings: 'Beautiful with peonies, roses, and hydrangeas',
      },
      {
        name: 'Sunset Garden',
        colors: ['Coral', 'Peach', 'Gold', 'Mint'],
        hex: ['#FF7F50', '#FFDAB9', '#FFD700', '#98FF98'],
        description: 'Vibrant and cheerful',
        pairings: 'Stunning with ranunculus and garden roses',
      },
    ],
    'Boho Chic': [
      {
        name: 'Desert Sunset',
        colors: ['Terracotta', 'Ochre', 'Dusty Pink', 'Sage'],
        hex: ['#E2725B', '#CC7722', '#DCAE96', '#9DC183'],
        description: 'Earthy and free-spirited',
        pairings: 'Perfect with pampas, protea, and dried florals',
      },
      {
        name: 'Bohemian Jewel',
        colors: ['Emerald', 'Burgundy', 'Mustard', 'Plum'],
        hex: ['#50C878', '#800020', '#FFDB58', '#8E4585'],
        description: 'Rich and eclectic',
        pairings: 'Gorgeous with anemones and mixed wildflowers',
      },
    ],
  };

  const themePalettes = palettes[theme || 'Garden Romance'] || palettes['Garden Romance'];

  // Add season-specific suggestions
  const seasonalNote = season
    ? ` (Perfect for ${season} weddings)`
    : '';

  return themePalettes.map((p: any) => ({
    ...p,
    description: p.description + seasonalNote,
  }));
}

/**
 * Smart timeline generator based on wedding date
 */
export function generateTimeline(weddingDate: string): {
  milestone: string;
  timeframe: string;
  tasks: string[];
  priority: 'high' | 'medium' | 'low';
}[] {
  const wedding = new Date(weddingDate);
  const today = new Date();
  const monthsAway = Math.round((wedding.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30));

  const timeline = [
    {
      milestone: 'RIGHT NOW (Immediate)',
      timeframe: 'This week',
      tasks: [
        'Set your budget and guest count',
        'Create wedding planning email account',
        'Start researching venues',
        'Begin photographer search',
        'Create vendor shortlists',
      ],
      priority: 'high' as const,
    },
    {
      milestone: `${Math.max(12, monthsAway)} Months Before`,
      timeframe: 'ASAP if within 12 months',
      tasks: [
        '✓ Book venue (most important!)',
        '✓ Hire photographer',
        '✓ Hire videographer',
        'Start dress shopping',
        'Create wedding website',
        'Reserve hotel blocks',
      ],
      priority: 'high' as const,
    },
    {
      milestone: `${Math.max(9, monthsAway - 3)} Months Before`,
      timeframe: '9 months out',
      tasks: [
        'Book florist',
        'Book DJ or band',
        'Book caterer (if not included with venue)',
        'Order wedding dress',
        'Finalize guest list',
        'Send save-the-dates',
      ],
      priority: 'high' as const,
    },
    {
      milestone: `${Math.max(6, monthsAway - 6)} Months Before`,
      timeframe: '6 months out',
      tasks: [
        'Order invitations',
        'Book hair & makeup artist',
        'Plan ceremony details',
        'Book transportation',
        'Register for gifts',
        'Book honeymoon',
      ],
      priority: 'medium' as const,
    },
    {
      milestone: `${Math.max(3, monthsAway - 9)} Months Before`,
      timeframe: '3 months out',
      tasks: [
        'Mail invitations (8 weeks before)',
        'Order wedding cake',
        'Purchase wedding rings',
        'Plan rehearsal dinner',
        'Finalize menu with caterer',
        'Order favors',
      ],
      priority: 'medium' as const,
    },
    {
      milestone: '1 Month Before',
      timeframe: 'Final countdown',
      tasks: [
        'Create seating chart',
        'Finalize timeline with vendors',
        'Break in wedding shoes',
        'Final dress fitting',
        'Apply for marriage license',
        'Confirm all vendor details',
        'Prepare vendor tips',
      ],
      priority: 'high' as const,
    },
    {
      milestone: '1 Week Before',
      timeframe: 'Last-minute details',
      tasks: [
        'Pack for honeymoon',
        'Finalize seating chart',
        'Confirm guest count with caterer',
        'Give timeline to wedding party',
        'Rehearsal and rehearsal dinner',
        'Prepare wedding day emergency kit',
      ],
      priority: 'high' as const,
    },
  ];

  // Filter based on how close to the wedding
  return timeline.filter(item => {
    if (item.milestone.includes('RIGHT NOW')) return true;
    if (monthsAway <= 1) return item.milestone.includes('Week');
    if (monthsAway <= 3) return !item.milestone.includes('9 Months') && !item.milestone.includes('12 Months');
    return true;
  });
}

/**
 * Get weather considerations for outdoor weddings
 */
export function getWeatherAdvice(weddingDate: string, location?: string): {
  season: string;
  weatherRisks: string[];
  recommendations: string[];
  backupPlanNeeded: boolean;
} {
  const date = new Date(weddingDate);
  const month = date.getMonth(); // 0-11

  let season = 'Spring';
  if (month >= 5 && month <= 7) season = 'Summer';
  else if (month >= 8 && month <= 10) season = 'Fall';
  else if (month >= 11 || month <= 1) season = 'Winter';

  const advice: Record<string, any> = {
    Spring: {
      weatherRisks: ['Rain showers', 'Unpredictable temperatures', 'Wind'],
      recommendations: [
        'Rent a clear tent for outdoor spaces',
        'Provide pashminas or blankets for guests',
        'Have umbrellas available',
        'Choose hardy flowers that won\'t wilt',
      ],
      backupPlanNeeded: true,
    },
    Summer: {
      weatherRisks: ['Heat', 'Humidity', 'Thunderstorms', 'Sun exposure'],
      recommendations: [
        'Provide shade (tents, umbrellas)',
        'Offer fans or misting stations',
        'Serve cold drinks and water stations',
        'Start ceremony later in the day (after 5pm)',
        'Have sunscreen available',
      ],
      backupPlanNeeded: true,
    },
    Fall: {
      weatherRisks: ['Rain', 'Early darkness', 'Chilly evenings'],
      recommendations: [
        'Rent heaters for evening',
        'Provide blankets for guests',
        'Plan lighting for early sunset',
        'Have tent as backup',
      ],
      backupPlanNeeded: true,
    },
    Winter: {
      weatherRisks: ['Cold', 'Snow', 'Ice', 'Short daylight'],
      recommendations: [
        'Strongly consider indoor venue',
        'Rent heated tent if outdoor',
        'Provide heavy blankets',
        'Hot beverage station',
        'Shuttle service (icy parking)',
        'Send weather update to guests',
      ],
      backupPlanNeeded: true,
    },
  };

  return {
    season,
    ...advice[season],
  };
}

/**
 * Generate personalized task list based on wedding date
 */
export function getNextTasks(weddingDate: string, completedTasks: string[] = []): {
  task: string;
  category: string;
  deadline: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  estimatedTime: string;
}[] {
  const wedding = new Date(weddingDate);
  const today = new Date();
  const daysAway = Math.round((wedding.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const monthsAway = Math.round(daysAway / 30);

  const allTasks = [
    {
      task: 'Book wedding venue',
      category: 'Venue',
      deadline: '12+ months before',
      priority: 'urgent' as const,
      estimatedTime: '3-6 hours research + venue tours',
      minMonths: 12,
    },
    {
      task: 'Hire photographer',
      category: 'Photography',
      deadline: '12 months before',
      priority: 'urgent' as const,
      estimatedTime: '2-4 hours research + consultations',
      minMonths: 12,
    },
    {
      task: 'Start dress shopping',
      category: 'Attire',
      deadline: '9-12 months before',
      priority: 'high' as const,
      estimatedTime: '4-8 hours over multiple appointments',
      minMonths: 9,
    },
    {
      task: 'Send save-the-dates',
      category: 'Invitations',
      deadline: '6-8 months before',
      priority: 'high' as const,
      estimatedTime: '2-3 hours to create and mail',
      minMonths: 6,
    },
    {
      task: 'Mail wedding invitations',
      category: 'Invitations',
      deadline: '6-8 weeks before',
      priority: monthsAway <= 2 ? ('urgent' as const) : ('medium' as const),
      estimatedTime: '2-3 hours to assemble and mail',
      minMonths: 2,
    },
    {
      task: 'Create seating chart',
      category: 'Planning',
      deadline: '2 weeks before',
      priority: monthsAway <= 1 ? ('urgent' as const) : ('low' as const),
      estimatedTime: '3-5 hours (use our Seating Chart tool!)',
      minMonths: 0.5,
    },
    {
      task: 'Finalize vendor details',
      category: 'Vendors',
      deadline: '1 month before',
      priority: monthsAway <= 1 ? ('urgent' as const) : ('medium' as const),
      estimatedTime: '2-3 hours of calls/emails',
      minMonths: 1,
    },
  ];

  // Filter tasks based on timeline and not completed
  return allTasks
    .filter(t => monthsAway <= t.minMonths)
    .filter(t => !completedTasks.includes(t.task))
    .sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 5); // Top 5 tasks
}
