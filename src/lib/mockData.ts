import { User, GolfScore, Charity, Draw, Winner, DirectDonation, PlatformAnalytics } from '@/types';

export const INITIAL_CHARITIES: Charity[] = [
  {
    id: 'charity-1',
    name: 'Fairway for Kids',
    tagline: 'Transforming young lives through sport, mentorship, and education.',
    category: 'Youth & Children',
    description:
      'Fairway for Kids provides sports access, academic tutoring, and emotional mentorship to underprivileged children from high-density urban areas. We believe every child deserves the confidence, discipline, and opportunities that guided athletics provide.',
    impactStory:
      'Over 2,400 children have completed our year-round mentorship program, achieving a 98% high-school graduation rate and gaining collegiate scholarship pathways.',
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    websiteUrl: 'https://example.org/fairway-kids',
    isSpotlight: true,
    totalRaised: 52400,
    supporterCount: 438,
    upcomingEvents: [
      {
        id: 'evt-1',
        title: 'Junior Hope Invitational & Pro Charity Day',
        date: '2026-04-18',
        location: 'Royal Pines Championship Course',
        description: '18-hole scramble tournament pairing amateur golfers with junior athletes, followed by an evening charity auction dinner.',
        ticketPrice: 150,
        spotsLeft: 14,
      },
      {
        id: 'evt-2',
        title: 'Youth Golf Academy Summer Kickoff',
        date: '2026-05-30',
        location: 'Melbourne Sports Park',
        description: 'Hands-on clinic and equipment donation drive for 120 local youth.',
        ticketPrice: 25,
        spotsLeft: 40,
      }
    ],
  },
  {
    id: 'charity-2',
    name: 'Valor & Heroes Foundation',
    tagline: 'Restoring dignity, healing, and adaptive sports to military veterans.',
    category: 'Veterans & Heroes',
    description:
      'Valor & Heroes supports wounded combat veterans, emergency medical first responders, and their families. Through adaptive sports, PTSD therapy retreats, and community service days, we help heroes find purpose after service.',
    impactStory:
      'Funded over 600 specialized physical therapy sessions and provided 85 adaptive golf wheelchairs and sporting prosthetics for disabled service members.',
    imageUrl: 'https://images.unsplash.com/photo-1579208575657-c595a05383b7?auto=format&fit=crop&w=1200&q=80',
    websiteUrl: 'https://example.org/valor-heroes',
    isSpotlight: true,
    totalRaised: 68900,
    supporterCount: 612,
    upcomingEvents: [
      {
        id: 'evt-3',
        title: 'Valor Scramble & Military Tribute Gala',
        date: '2026-05-12',
        location: 'The National Golf Club',
        description: 'Honoring fallen heroes with an annual medal-play charity tournament and keynote dinner with decorated veterans.',
        ticketPrice: 220,
        spotsLeft: 8,
      }
    ],
  },
  {
    id: 'charity-3',
    name: 'Green Horizon Corridor',
    tagline: 'Reforesting native habitats and safeguarding fragile ecosystems.',
    category: 'Environment',
    description:
      'Green Horizon coordinates native tree-planting initiatives, water filtration wetland sanctuaries, and ecological regeneration projects along degraded coastal landscapes.',
    impactStory:
      'Over 180,000 native trees planted and 450 hectares of critical wildlife corridor restored across three state regions.',
    imageUrl: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80',
    websiteUrl: 'https://example.org/green-horizon',
    isSpotlight: true,
    totalRaised: 41250,
    supporterCount: 345,
    upcomingEvents: [
      {
        id: 'evt-4',
        title: 'EcoLinks Open: Plant a Tree per Birdie',
        date: '2026-06-05',
        location: 'Kingston Dunes Reserve',
        description: 'Every registered golfer plants 10 native trees automatically, with bonus matching from corporate sponsors for each birdie scored.',
        ticketPrice: 120,
        spotsLeft: 26,
      }
    ],
  },
  {
    id: 'charity-4',
    name: 'Oncology Hope Initiative',
    tagline: 'Pioneering pediatric clinical trials and compassionate patient housing.',
    category: 'Health & Medical',
    description:
      'Accelerating pediatric cancer research, targeted immunological therapies, and providing comfortable, fully subsidized family lodgings near tertiary treatment centers.',
    impactStory:
      'Supported 340 families with zero-cost housing during intensive treatments and contributed funding to 4 clinical breakthrough trials.',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
    websiteUrl: 'https://example.org/oncology-hope',
    isSpotlight: false,
    totalRaised: 81300,
    supporterCount: 780,
    upcomingEvents: [
      {
        id: 'evt-5',
        title: 'Swing for a Cure Pro-Am Tournament',
        date: '2026-05-29',
        location: 'St. Andrews Old Course Links',
        description: 'Elite pro-am invitational bringing together golf champions and generous patrons for children oncology research.',
        ticketPrice: 350,
        spotsLeft: 4,
      }
    ],
  },
  {
    id: 'charity-5',
    name: 'Community Table Project',
    tagline: 'Rescuing surplus food to nourish families facing extreme hardship.',
    category: 'Community Impact',
    description:
      'Collecting farm-fresh surplus produce and culinary staples from partner growers and delivering chef-prepared, balanced family hampers to communities experiencing severe cost-of-living distress.',
    impactStory:
      'Distributed over 520,000 freshly cooked meals and diverted 320 tons of organic produce from regional landfill.',
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
    websiteUrl: 'https://example.org/community-table',
    isSpotlight: false,
    totalRaised: 33700,
    supporterCount: 290,
    upcomingEvents: [
      {
        id: 'evt-6',
        title: 'Harvest Charity Challenge',
        date: '2026-07-14',
        location: 'Yarra Valley Country Club',
        description: 'A 9-hole twilight competition paired with a regional wine and artisanal produce dinner in support of food relief.',
        ticketPrice: 95,
        spotsLeft: 30,
      }
    ],
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Sarah Jenkins',
    email: 'sarah@digitalheroes.com',
    password: 'password1',
    role: 'subscriber',
    subscriptionStatus: 'active',
    billingCycle: 'monthly',
    subscriptionStartDate: '2025-11-01T00:00:00Z',
    subscriptionRenewalDate: '2026-04-01T00:00:00Z',
    charityId: 'charity-1',
    charityContributionPct: 15,
    handicap: 12.4,
    homeClub: 'Kingston Heath Golf Club',
    createdAt: '2025-11-01T00:00:00Z',
  },
  {
    id: 'user-2',
    name: 'David Miller',
    email: 'david@digitalheroes.com',
    password: 'password1',
    role: 'subscriber',
    subscriptionStatus: 'active',
    billingCycle: 'yearly',
    subscriptionStartDate: '2025-08-15T00:00:00Z',
    subscriptionRenewalDate: '2026-08-15T00:00:00Z',
    charityId: 'charity-2',
    charityContributionPct: 20,
    handicap: 8.2,
    homeClub: 'Royal Melbourne',
    createdAt: '2025-08-15T00:00:00Z',
  },
  {
    id: 'user-3',
    name: 'Priya Sharma',
    email: 'priya@digitalheroes.com',
    password: 'password1',
    role: 'subscriber',
    subscriptionStatus: 'active',
    billingCycle: 'monthly',
    subscriptionStartDate: '2026-01-10T00:00:00Z',
    subscriptionRenewalDate: '2026-04-10T00:00:00Z',
    charityId: 'charity-3',
    charityContributionPct: 10,
    handicap: 18.0,
    homeClub: 'Metropolitan Golf Club',
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'user-4',
    name: 'Marcus Vance',
    email: 'marcus@digitalheroes.com',
    password: 'password1',
    role: 'subscriber',
    subscriptionStatus: 'lapsed',
    billingCycle: 'monthly',
    subscriptionStartDate: '2025-09-01T00:00:00Z',
    subscriptionRenewalDate: '2026-02-01T00:00:00Z',
    charityId: 'charity-4',
    charityContributionPct: 10,
    handicap: 15.5,
    homeClub: 'Victoria Golf Club',
    createdAt: '2025-09-01T00:00:00Z',
  },
  {
    id: 'user-5',
    name: 'Elena Rostova',
    email: 'elena@digitalheroes.com',
    password: 'password1',
    role: 'subscriber',
    subscriptionStatus: 'active',
    billingCycle: 'yearly',
    subscriptionStartDate: '2025-12-01T00:00:00Z',
    subscriptionRenewalDate: '2026-12-01T00:00:00Z',
    charityId: 'charity-1',
    charityContributionPct: 25,
    handicap: 11.0,
    homeClub: 'Commonwealth Golf Club',
    createdAt: '2025-12-01T00:00:00Z',
  },
  {
    id: 'admin-1',
    name: 'Alex Rivera',
    email: 'admin@digitalheroes.com',
    password: 'admin2026',
    role: 'admin',
    subscriptionStatus: 'active',
    billingCycle: 'yearly',
    subscriptionStartDate: '2025-01-01T00:00:00Z',
    subscriptionRenewalDate: '2027-01-01T00:00:00Z',
    charityId: 'charity-2',
    charityContributionPct: 30,
    handicap: 6.4,
    homeClub: 'St. Andrews Old Course',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'admin-2',
    name: 'Mokshith P1642',
    email: 'mokshith@digitalheroes.com',
    password: '1642 1642',
    role: 'admin',
    subscriptionStatus: 'active',
    billingCycle: 'yearly',
    subscriptionStartDate: '2025-01-01T00:00:00Z',
    subscriptionRenewalDate: '2027-01-01T00:00:00Z',
    charityId: 'charity-1',
    charityContributionPct: 25,
    handicap: 4.2,
    homeClub: 'Royal Pines Club',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'admin-3',
    name: 'MOHITH P1234',
    email: 'mohith@digitalheroes.com',
    password: 'MOHITH 3344',
    role: 'admin',
    subscriptionStatus: 'active',
    billingCycle: 'yearly',
    subscriptionStartDate: '2025-01-01T00:00:00Z',
    subscriptionRenewalDate: '2027-01-01T00:00:00Z',
    charityId: 'charity-3',
    charityContributionPct: 20,
    handicap: 5.0,
    homeClub: 'National Golf Club',
    createdAt: '2025-01-01T00:00:00Z',
  },
];

// Rolling 5 golf scores per user (Stableford format 1-45, reverse chronological)
export const INITIAL_GOLF_SCORES: GolfScore[] = [
  // Sarah Jenkins (5 scores)
  { id: 'sc-1', userId: 'user-1', score: 38, date: '2026-03-20', courseName: 'Kingston Heath GC', notes: 'Great back 9 with 3 birdies', createdAt: '2026-03-20T17:00:00Z' },
  { id: 'sc-2', userId: 'user-1', score: 34, date: '2026-03-15', courseName: 'Huntingdale GC', notes: 'Windy conditions', createdAt: '2026-03-15T16:30:00Z' },
  { id: 'sc-3', userId: 'user-1', score: 41, date: '2026-03-10', courseName: 'Victoria GC', notes: 'Career best round', createdAt: '2026-03-10T18:00:00Z' },
  { id: 'sc-4', userId: 'user-1', score: 29, date: '2026-03-02', courseName: 'Metropolitan GC', notes: 'Tough greens', createdAt: '2026-03-02T15:00:00Z' },
  { id: 'sc-5', userId: 'user-1', score: 36, date: '2026-02-24', courseName: 'Royal Melbourne', notes: 'Solid iron play', createdAt: '2026-02-24T17:30:00Z' },

  // David Miller (5 scores)
  { id: 'sc-6', userId: 'user-2', score: 42, date: '2026-03-18', courseName: 'Peninsula Kingswood', notes: 'Near perfect putting', createdAt: '2026-03-18T16:00:00Z' },
  { id: 'sc-7', userId: 'user-2', score: 37, date: '2026-03-12', courseName: 'The National', notes: 'Coastal winds', createdAt: '2026-03-12T17:00:00Z' },
  { id: 'sc-8', userId: 'user-2', score: 35, date: '2026-03-05', courseName: 'St. Andrews Beach', notes: 'Even par on front 9', createdAt: '2026-03-05T15:30:00Z' },
  { id: 'sc-9', userId: 'user-2', score: 31, date: '2026-02-27', courseName: 'Royal Melbourne', notes: 'Fast greens', createdAt: '2026-02-27T16:00:00Z' },
  { id: 'sc-10', userId: 'user-2', score: 28, date: '2026-02-19', courseName: 'Woodlands GC', notes: 'Rain delay', createdAt: '2026-02-19T14:30:00Z' },

  // Priya Sharma (5 scores)
  { id: 'sc-11', userId: 'user-3', score: 33, date: '2026-03-19', courseName: 'Spring Valley GC', notes: 'Consistent drives', createdAt: '2026-03-19T17:00:00Z' },
  { id: 'sc-12', userId: 'user-3', score: 27, date: '2026-03-11', courseName: 'Southern GC', notes: 'Bunker troubles', createdAt: '2026-03-11T16:30:00Z' },
  { id: 'sc-13', userId: 'user-3', score: 40, date: '2026-03-04', courseName: 'Commonwealth GC', notes: 'Clutch par saves', createdAt: '2026-03-04T18:00:00Z' },
  { id: 'sc-14', userId: 'user-3', score: 32, date: '2026-02-25', courseName: 'Yarra Yarra GC', notes: 'Good approach shots', createdAt: '2026-02-25T15:30:00Z' },
  { id: 'sc-15', userId: 'user-3', score: 30, date: '2026-02-17', courseName: 'Keynes Reserve', notes: 'Fun weekend scramble', createdAt: '2026-02-17T17:00:00Z' },

  // Elena Rostova (5 scores)
  { id: 'sc-16', userId: 'user-5', score: 39, date: '2026-03-21', courseName: 'The Dunes Links', notes: 'Smooth rhythm', createdAt: '2026-03-21T18:00:00Z' },
  { id: 'sc-17', userId: 'user-5', score: 36, date: '2026-03-14', courseName: 'Sorrento GC', notes: 'Fairways hit: 12/14', createdAt: '2026-03-14T17:00:00Z' },
  { id: 'sc-18', userId: 'user-5', score: 41, date: '2026-03-07', courseName: 'Moonah Links', notes: 'Great recovery shots', createdAt: '2026-03-07T16:30:00Z' },
  { id: 'sc-19', userId: 'user-5', score: 34, date: '2026-02-28', courseName: 'Flinders GC', notes: 'High wind challenge', createdAt: '2026-02-28T15:00:00Z' },
  { id: 'sc-20', userId: 'user-5', score: 38, date: '2026-02-20', courseName: 'Portsea GC', notes: 'Putter on fire', createdAt: '2026-02-20T17:00:00Z' },
];

export const INITIAL_DRAWS: Draw[] = [
  {
    id: 'draw-feb-2026',
    name: 'February 2026 Championship Draw',
    drawDate: '2026-02-28T20:00:00Z',
    monthYear: '2026-02',
    status: 'published',
    drawLogic: 'random',
    winningNumbers: [14, 29, 34, 38, 41],
    totalPrizePool: 32000,
    jackpotPool: 12800, // 40%
    tier4Pool: 11200,   // 35%
    tier3Pool: 8000,    // 25%
    rolloverFromPrevious: 8500,
    rolloverToNext: 21300, // 12,800 + 8,500 rollover carried forward since 0 5-match winners!
    totalSubscribersEntered: 1600,
    publishedAt: '2026-02-28T20:30:00Z',
  },
  {
    id: 'draw-mar-2026',
    name: 'March 2026 Autumn Grand Draw',
    drawDate: '2026-03-31T20:00:00Z',
    monthYear: '2026-03',
    status: 'scheduled',
    drawLogic: 'algorithmic',
    winningNumbers: [9, 17, 28, 36, 42],
    totalPrizePool: 48500,
    jackpotPool: 40700, // (40% of 48,500 = 19,400) + 21,300 rollover = 40,700!
    tier4Pool: 16975,   // 35%
    tier3Pool: 12125,   // 25%
    rolloverFromPrevious: 21300,
    rolloverToNext: 0,
    totalSubscribersEntered: 2425,
  }
];

export const INITIAL_WINNERS: Winner[] = [
  {
    id: 'win-1',
    drawId: 'draw-feb-2026',
    drawName: 'February 2026 Championship Draw',
    drawDate: '2026-02-28',
    userId: 'user-1',
    userName: 'Sarah Jenkins',
    userEmail: 'sarah@digitalheroes.test',
    matchType: '4_match',
    matchedNumbers: [29, 34, 38, 41],
    userScoresAtDraw: [38, 34, 41, 29, 36],
    prizeAmount: 5600,
    verificationStatus: 'pending',
    proofImageUrl: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?auto=format&fit=crop&w=800&q=80',
    proofUploadedAt: '2026-03-01T10:14:00Z',
    paymentStatus: 'pending',
    adminNotes: 'Submitted official golf handicapping app screenshot. Awaiting committee confirmation.',
    createdAt: '2026-02-28T20:30:00Z',
  },
  {
    id: 'win-2',
    drawId: 'draw-feb-2026',
    drawName: 'February 2026 Championship Draw',
    drawDate: '2026-02-28',
    userId: 'user-2',
    userName: 'David Miller',
    userEmail: 'david@digitalheroes.test',
    matchType: '3_match',
    matchedNumbers: [34, 38, 41],
    userScoresAtDraw: [42, 37, 35, 31, 28],
    prizeAmount: 2000,
    verificationStatus: 'approved',
    proofImageUrl: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?auto=format&fit=crop&w=800&q=80',
    proofUploadedAt: '2026-03-01T12:00:00Z',
    paymentStatus: 'paid',
    paidAt: '2026-03-03T14:20:00Z',
    adminNotes: 'Verified with Golf Australia handicap database. Payout completed via direct bank transfer.',
    createdAt: '2026-02-28T20:30:00Z',
  }
];

export const INITIAL_DONATIONS: DirectDonation[] = [
  {
    id: 'don-1',
    userId: 'user-1',
    donorName: 'Sarah Jenkins',
    donorEmail: 'sarah@digitalheroes.test',
    charityId: 'charity-1',
    charityName: 'Fairway for Kids',
    amount: 150,
    isIndependent: true,
    message: 'Keep providing the wonderful junior coaching clinics!',
    createdAt: '2026-03-12T11:20:00Z',
  },
  {
    id: 'don-2',
    donorName: 'Arthur Pendelton',
    donorEmail: 'arthur.p@example.com',
    charityId: 'charity-2',
    charityName: 'Valor & Heroes Foundation',
    amount: 500,
    isIndependent: true,
    message: 'In honour of our veterans.',
    createdAt: '2026-03-17T09:15:00Z',
  }
];

export const INITIAL_ANALYTICS: PlatformAnalytics = {
  totalUsers: 2425,
  activeSubscribers: 2380,
  totalPrizePool: 80500,
  activeJackpot: 40700,
  totalCharityContributions: 124800,
  totalDrawsCompleted: 14,
  totalWinnersPaid: 42,
};
