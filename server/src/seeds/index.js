require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/database');
const World       = require('../models/World');
const Mission     = require('../models/Mission');
const Stock       = require('../models/Stock');
const { Achievement } = require('../models/Achievement');
const { Quest }   = require('../models/Quest');
const UserProfile = require('../models/UserProfile');
const logger      = require('../utils/logger');

async function seed() {
  await connectDB();
  logger.info('🌱 Starting seed…');

  /* ─── Worlds ─────────────────────────────────────────────────────────── */
  const worldsData = [
    {
      slug: 'coin-valley', name: 'Coin Valley', order: 1, emoji: '🪙',
      accentColor: '#06b6d4', gradient: 'linear-gradient(135deg,#1a3a4a 0%,#0f2333 100%)',
      description: 'Learn money fundamentals — needs vs wants, income, expenses, and your first financial goals.',
      topics: ['Money fundamentals','Needs vs wants','Income & expenses','Opportunity cost','Financial goals'],
      xpReward: 500, missionCount: 0,
      npcMentor: { name: 'Coin Elder', emoji: '🧙', greeting: "Welcome, young adventurer! Let's start with the basics of money." },
    },
    {
      slug: 'budget-city', name: 'Budget City', order: 2, emoji: '🏙️',
      accentColor: '#8b5cf6', gradient: 'linear-gradient(135deg,#1a2a3a 0%,#0f1a2a 100%)',
      description: 'Master the art of budgeting in a thriving city. Track cash flow and manage monthly expenses.',
      topics: ['Budgeting','Cash flow','Fixed & variable expenses','Monthly planning','Spending habits'],
      xpReward: 600, missionCount: 0, unlockRequirement: 'coin-valley',
      npcMentor: { name: 'Mayor Budget', emoji: '🏛️', greeting: 'Every great city runs on a budget. Yours should too!' },
    },
    {
      slug: 'savings-forest', name: 'Savings Forest', order: 3, emoji: '🌲',
      accentColor: '#10b981', gradient: 'linear-gradient(135deg,#0a2a1a 0%,#051a10 100%)',
      description: 'Discover the magic of saving and compound interest in an enchanted forest.',
      topics: ['Saving strategies','Emergency funds','Compound interest','Inflation'],
      xpReward: 700, missionCount: 0, unlockRequirement: 'budget-city',
      npcMentor: { name: 'Willow the Saver', emoji: '🌿', greeting: 'Small seeds become mighty trees. Start saving today.' },
    },
    {
      slug: 'credit-canyon', name: 'Credit Canyon', order: 4, emoji: '🏔️',
      accentColor: '#f59e0b', gradient: 'linear-gradient(135deg,#2a1a0a 0%,#1a0f05 100%)',
      description: 'Navigate credit cliffs. Learn about credit scores, loans, EMIs, and debt management.',
      topics: ['Credit scores','Credit cards','Loans & interest','EMI','Debt management'],
      xpReward: 800, missionCount: 0, unlockRequirement: 'savings-forest',
      npcMentor: { name: 'Cliff the Creditor', emoji: '⚖️', greeting: 'Credit is a powerful tool — but it cuts both ways.' },
    },
    {
      slug: 'investor-island', name: 'Investor Island', order: 5, emoji: '🏝️',
      accentColor: '#22d3ee', gradient: 'linear-gradient(135deg,#0a1a3a 0%,#05102a 100%)',
      description: 'Set sail to Investor Island and discover the fundamentals of growing wealth.',
      topics: ['Investment basics','Risk & return','Diversification','Shares','Mutual funds'],
      xpReward: 900, missionCount: 0, unlockRequirement: 'credit-canyon',
      npcMentor: { name: 'Captain Compound', emoji: '⚓', greeting: 'Every great voyage starts with a single step into the market.' },
    },
    {
      slug: 'stock-market-city', name: 'Stock Market City', order: 6, emoji: '📈',
      accentColor: '#a78bfa', gradient: 'linear-gradient(135deg,#1a0a3a 0%,#0f0523 100%)',
      description: 'Enter the gleaming towers of Stock Market City. Learn NSE/BSE and virtual trading.',
      topics: ['NSE & BSE','Demat accounts','Order types','Candlestick charts','Technical analysis'],
      xpReward: 1200, missionCount: 0, unlockRequirement: 'investor-island',
      npcMentor: { name: 'Ticker The Trader', emoji: '📊', greeting: 'Welcome to the beating heart of the economy.' },
    },
    {
      slug: 'salary-kingdom', name: 'Salary Kingdom', order: 7, emoji: '💼',
      accentColor: '#f472b6', gradient: 'linear-gradient(135deg,#2a1a2a 0%,#1a0f1a 100%)',
      description: 'Understand salary slips, deductions, taxes, and plan your first job finances.',
      topics: ['Salary slips','Gross & net salary','Tax deductions','Indian tax basics'],
      xpReward: 700, missionCount: 0,
      npcMentor: { name: 'HR Heera', emoji: '💼', greeting: "Your first payslip is coming. Let's make sure you understand every number." },
    },
    {
      slug: 'protection-peaks', name: 'Protection Peaks', order: 8, emoji: '🛡️',
      accentColor: '#34d399', gradient: 'linear-gradient(135deg,#0a2a2a 0%,#051a1a 100%)',
      description: 'Climb protection peaks and discover insurance and risk management.',
      topics: ['Insurance types','Risk management','Health insurance','Life insurance'],
      xpReward: 700, missionCount: 0,
      npcMentor: { name: 'Shield Master', emoji: '🛡️', greeting: "Wealth isn't just about building — it's about protecting what you build." },
    },
    {
      slug: 'entrepreneur-island', name: 'Entrepreneur Island', order: 9, emoji: '🚀',
      accentColor: '#fb7185', gradient: 'linear-gradient(135deg,#2a0a1a 0%,#1a050f 100%)',
      description: 'Launch your own fictional business and learn revenue, profit, and cash flow.',
      topics: ['Revenue & profit','Cash flow','Pricing strategy','Break-even'],
      xpReward: 900, missionCount: 0,
      npcMentor: { name: 'CEO Nova', emoji: '🚀', greeting: "Every empire started as an idea. Let's build yours!" },
    },
    {
      slug: 'future-galaxy', name: 'Future Galaxy', order: 10, emoji: '🌌',
      accentColor: '#818cf8', gradient: 'linear-gradient(135deg,#0a0a2a 0%,#050515 100%)',
      description: 'Master long-term financial planning, retirement, and wealth-building principles.',
      topics: ['Long-term goals','Retirement planning','Financial independence','Wealth principles'],
      xpReward: 1500, missionCount: 0,
      npcMentor: { name: 'Oracle Omega', emoji: '🌌', greeting: 'The future is not fixed. But your financial plan can shape it.' },
    },
  ];

  for (const wdata of worldsData) {
    await World.findOneAndUpdate({ slug: wdata.slug }, { ...wdata, isPublished: true }, { upsert: true, new: true });
  }
  logger.info('✅ Worlds seeded (10)');

  /* ─── Missions — World 1: Coin Valley ────────────────────────────────── */
  const world1 = await World.findOne({ slug: 'coin-valley' });

  const coinValleyMissions = [
    {
      worldId: world1._id, worldSlug: 'coin-valley', order: 1, isPublished: true,
      title: 'What Is Money?', type: 'lesson',
      description: 'Discover what money is, why it exists, and how it works as a medium of exchange.',
      xpReward: 50, coinReward: 10, timeEstimateMins: 5,
      content: {
        sections: [
          { type: 'text', title: 'Before money existed', body: 'Imagine trying to trade a banana for shoes. This is the barter system — trading goods directly. It worked poorly because of the "double coincidence of wants" problem: both parties had to want exactly what the other had.' },
          { type: 'text', title: 'What money solves', body: 'Money is a universally accepted medium of exchange. It acts as: a store of value (save for later), a unit of account (measure prices), and a medium of exchange (facilitate transactions).' },
          { type: 'text', title: 'Types of money', body: 'Commodity money (gold, silver), fiat money (₹, $), digital money (UPI, cards). Today, over 90% of money exists as digital entries in bank systems.', tip: 'Fun fact: Over 90% of money in modern economies is digital, not physical notes and coins.' },
        ],
        keyTakeaways: ['Money solves the barter problem.', 'Money = medium of exchange + store of value + unit of account.', 'Modern money is mostly digital.'],
      },
      questions: [
        { id: 'q1', type: 'mcq', question: 'Which problem does money solve that the barter system could not?', options: [{ id: 'a', text: 'Inflation' }, { id: 'b', text: 'The double coincidence of wants' }, { id: 'c', text: 'Banking fees' }, { id: 'd', text: 'Credit scores' }], correctAnswer: 'b', explanation: 'The barter system required both parties to want exactly what the other had. Money removes this requirement.', points: 10 },
      ],
      completionConditions: { minScore: 70 },
    },
    {
      worldId: world1._id, worldSlug: 'coin-valley', order: 2, isPublished: true,
      title: 'Needs vs Wants', type: 'quiz',
      description: 'Learn to distinguish between financial needs and wants — the foundation of every budget.',
      xpReward: 60, coinReward: 15, timeEstimateMins: 7,
      content: {
        sections: [
          { type: 'text', title: 'Defining needs', body: 'Needs are essentials for survival and basic functioning: food, shelter, clothing, healthcare, transport to work.' },
          { type: 'text', title: 'Defining wants', body: 'Wants are things that improve quality of life but are not essential: dining out, streaming subscriptions, the latest phone, vacations.' },
          { type: 'text', title: 'The grey zone', body: 'Many expenses are context-dependent. A car might be a need in a city with poor public transport, but a want in a city with excellent metro connectivity.', tip: "This distinction doesn't mean wants are bad. It's about conscious spending choices." },
        ],
        keyTakeaways: ['Needs are essentials; wants improve quality of life.', 'The distinction varies by context.', 'Recognising the difference enables intentional spending.'],
      },
      questions: [
        { id: 'q1', type: 'mcq', question: 'Rahul earns ₹30,000/month. He spends ₹12,000 on rent, ₹4,000 on groceries, ₹3,000 on streaming + gaming, ₹2,000 on transport. Which is a "want"?', options: [{ id: 'a', text: 'Rent ₹12,000' }, { id: 'b', text: 'Groceries ₹4,000' }, { id: 'c', text: 'Streaming bundle ₹3,000' }, { id: 'd', text: 'Transport ₹2,000' }], correctAnswer: 'c', explanation: 'Streaming and gaming are entertainment — wants, not essentials.', points: 20 },
        { id: 'q2', type: 'true-false', question: 'True or False: Wants are always bad and should be eliminated from your budget.', options: [{ id: 't', text: 'True' }, { id: 'f', text: 'False' }], correctAnswer: 'f', explanation: 'Wants can be part of a healthy budget. The goal is conscious, intentional spending.', points: 10 },
      ],
      completionConditions: { minScore: 70 },
    },
    {
      worldId: world1._id, worldSlug: 'coin-valley', order: 3, isPublished: true,
      title: 'Income: How Money Comes In', type: 'lesson',
      description: 'Understand different types of income and why income diversity matters.',
      xpReward: 50, coinReward: 10, timeEstimateMins: 6,
      content: {
        sections: [
          { type: 'text', title: 'Earned income', body: 'Earned income is money you receive for your time and labour: salary, freelance fees, wages. It requires ongoing effort.' },
          { type: 'text', title: 'Passive income', body: 'Passive income requires an upfront investment of time, money, or both, but then generates income with less ongoing effort: rental income, dividends, royalties, interest.' },
          { type: 'text', title: 'Income diversity', body: 'Relying on a single income source is risky. Job loss, medical emergencies, or economic downturns can cut your income suddenly.', tip: 'Most passive income sources require significant upfront capital or effort — they are not "free money."' },
        ],
        keyTakeaways: ['Earned income = money for time.', 'Passive income = money from assets.', 'Diversifying income reduces financial risk.'],
      },
      questions: [
        { id: 'q1', type: 'mcq', question: 'Priya earns a monthly salary, receives ₹2,000 quarterly from savings interest, and earns from freelance design projects. How many income streams does she have?', options: [{ id: 'a', text: '1' }, { id: 'b', text: '2' }, { id: 'c', text: '3' }, { id: 'd', text: '4' }], correctAnswer: 'c', explanation: 'Three income streams: salary, savings interest, and freelance income.', points: 10 },
      ],
      completionConditions: { minScore: 70 },
    },
    {
      worldId: world1._id, worldSlug: 'coin-valley', order: 4, isPublished: true,
      title: 'Opportunity Cost', type: 'simulation',
      description: 'Every financial choice means giving up something else. This is opportunity cost.',
      xpReward: 70, coinReward: 20, timeEstimateMins: 8,
      content: {
        sections: [
          { type: 'text', title: 'What is opportunity cost?', body: 'Opportunity cost is the value of the next best alternative you give up when making a choice. If you spend ₹5,000 on a new phone, the opportunity cost might be three months of SIP contributions.' },
          { type: 'text', title: 'Opportunity cost in daily finance', body: 'Every rupee spent somewhere cannot be spent elsewhere. Keeping ₹1 lakh in a savings account earning 4% has an opportunity cost of the higher return you might have earned elsewhere — though that also comes with more risk.' },
        ],
        keyTakeaways: ['Every choice has a trade-off.', 'Opportunity cost = value of the best alternative not chosen.', 'Good financial decisions consider what you are giving up.'],
      },
      questions: [
        { id: 'q1', type: 'scenario', question: 'Arjun has ₹50,000. He can spend it on a vacation or invest it in a diversified fund. What is the opportunity cost of choosing the vacation?', options: [{ id: 'a', text: 'The ₹50,000 itself' }, { id: 'b', text: 'The potential future growth of the investment he gave up' }, { id: 'c', text: 'Nothing — money spent on experiences has no opportunity cost' }, { id: 'd', text: 'The memories he would have gained' }], correctAnswer: 'b', explanation: 'The opportunity cost of the vacation is the potential investment return he gave up. Both choices have value — the point is to decide consciously.', points: 20 },
      ],
      completionConditions: { minScore: 70 },
    },
    {
      worldId: world1._id, worldSlug: 'coin-valley', order: 5, isPublished: true,
      title: 'Setting SMART Financial Goals', type: 'lesson',
      description: 'Learn how to set financial goals that are Specific, Measurable, Achievable, Relevant, and Time-bound.',
      xpReward: 60, coinReward: 15, timeEstimateMins: 7,
      content: {
        sections: [
          { type: 'text', title: 'Why goals matter', body: 'Without a destination, any road will take you nowhere. Financial goals give your money a purpose and help you make trade-off decisions.' },
          { type: 'text', title: 'The SMART framework', body: 'SMART goals are:\n• Specific: "Save ₹1,00,000 for an emergency fund"\n• Measurable: trackable with a number\n• Achievable: realistic given your income\n• Relevant: aligned with your life priorities\n• Time-bound: has a deadline' },
          { type: 'text', title: 'Short, medium, long-term goals', body: 'Short-term (1 year): emergency fund, trip, laptop. Medium-term (1–5 years): down payment, car. Long-term (5+ years): retirement, child education, financial independence.', tip: 'Break large goals into monthly savings targets. This makes them actionable.' },
        ],
        keyTakeaways: ['Financial goals need a number and a deadline.', 'SMART = Specific, Measurable, Achievable, Relevant, Time-bound.', 'Different goals have different time horizons.'],
      },
      questions: [
        { id: 'q1', type: 'mcq', question: 'Which is a SMART financial goal?', options: [{ id: 'a', text: '"I want to save more money."' }, { id: 'b', text: '"Save ₹60,000 for an emergency fund by December 2025 by setting aside ₹5,000/month."' }, { id: 'c', text: '"Invest in stocks and become rich."' }, { id: 'd', text: '"Buy a house someday."' }], correctAnswer: 'b', explanation: 'Option B is specific (₹60,000), measurable (₹5,000/month), achievable, relevant, and time-bound (December 2025).', points: 20 },
      ],
      completionConditions: { minScore: 70 },
    },
  ];

  let m1Count = 0;
  for (const m of coinValleyMissions) {
    await Mission.findOneAndUpdate({ worldSlug: m.worldSlug, order: m.order }, m, { upsert: true, new: true });
    m1Count++;
  }
  await World.findByIdAndUpdate(world1._id, { missionCount: m1Count });
  logger.info(`✅ ${m1Count} missions seeded for Coin Valley`);

  /* ─── Missions — World 2: Budget City ────────────────────────────────── */
  const world2 = await World.findOne({ slug: 'budget-city' });

  const budgetMissions = [
    {
      worldId: world2._id, worldSlug: 'budget-city', order: 1, isPublished: true,
      title: 'Your First Budget', type: 'calculator',
      description: 'Build your first monthly budget using the 50/30/20 rule.',
      xpReward: 70, coinReward: 20, timeEstimateMins: 10,
      content: {
        sections: [
          { type: 'text', title: 'The 50/30/20 Rule', body: 'A popular budgeting framework: 50% of take-home pay on needs, 30% on wants, 20% on savings and debt repayment. This is a starting point, not a rigid rule.' },
          { type: 'text', title: 'Creating your budget', body: 'List all income → List all fixed expenses (rent, EMI, insurance) → List variable expenses (food, transport, entertainment) → Calculate savings.' },
        ],
        keyTakeaways: ['50% needs, 30% wants, 20% savings is a useful starting framework.', 'Every rupee should have a plan.', 'A budget is only useful if you track it.'],
      },
      questions: [
        { id: 'q1', type: 'mcq', question: "Shreya earns ₹40,000 take-home. Using 50/30/20, how much should go to needs?", options: [{ id: 'a', text: '₹8,000' }, { id: 'b', text: '₹12,000' }, { id: 'c', text: '₹20,000' }, { id: 'd', text: '₹24,000' }], correctAnswer: 'c', explanation: '50% of ₹40,000 = ₹20,000 for needs.', points: 20 },
      ],
      completionConditions: { minScore: 70 },
    },
    {
      worldId: world2._id, worldSlug: 'budget-city', order: 2, isPublished: true,
      title: 'Fixed vs Variable Expenses', type: 'lesson',
      description: 'Understand the difference between constant and fluctuating expenses.',
      xpReward: 60, coinReward: 15, timeEstimateMins: 6,
      content: {
        sections: [
          { type: 'text', title: 'Fixed expenses', body: 'Fixed expenses are the same amount every month: rent/EMI, insurance premium, loan EMIs, subscriptions. They are predictable and easier to plan around.' },
          { type: 'text', title: 'Variable expenses', body: 'Variable expenses change month to month: groceries, dining out, transport, entertainment, utilities. These are typically easier to cut when needed.' },
        ],
        keyTakeaways: ['Fixed expenses are constant and predictable.', 'Variable expenses fluctuate — identify which can be reduced.', 'Tracking both is essential to accurate budgeting.'],
      },
      questions: [
        { id: 'q1', type: 'mcq', question: 'Which expense is FIXED?', options: [{ id: 'a', text: 'Monthly grocery bill' }, { id: 'b', text: 'Electricity bill' }, { id: 'c', text: 'Home loan EMI' }, { id: 'd', text: 'Restaurant spending' }], correctAnswer: 'c', explanation: 'A home loan EMI is a fixed amount every month.', points: 10 },
      ],
      completionConditions: { minScore: 70 },
    },
    {
      worldId: world2._id, worldSlug: 'budget-city', order: 3, isPublished: true,
      title: 'Tracking Cash Flow', type: 'simulation',
      description: 'Track income vs outflow and understand your personal cash flow statement.',
      xpReward: 80, coinReward: 25, timeEstimateMins: 10,
      content: {
        sections: [
          { type: 'text', title: 'Cash flow = income - expenses', body: 'Positive cash flow means more money coming in than going out — you can save or invest. Negative cash flow means you are dipping into savings or going into debt.' },
          { type: 'text', title: 'Where does the money go?', body: 'Many people are surprised to discover where their money actually goes when they track it for the first time. Common leaks: forgotten subscriptions, small daily purchases.', tip: 'Track every expense for 30 days. Awareness alone often reduces spending.' },
        ],
        keyTakeaways: ['Cash flow = income - expenses.', 'Positive cash flow enables saving and investing.', 'Tracking actual spending is different from guessing.'],
      },
      questions: [
        { id: 'q1', type: 'mcq', question: "Vikram earns ₹50,000. His expenses total ₹55,000. What is his cash flow?", options: [{ id: 'a', text: '+₹5,000 (positive)' }, { id: 'b', text: '-₹5,000 (negative)' }, { id: 'c', text: '₹0 (balanced)' }, { id: 'd', text: '₹1,05,000' }], correctAnswer: 'b', explanation: '₹50,000 - ₹55,000 = -₹5,000. He is spending ₹5,000 more than he earns.', points: 20 },
      ],
      completionConditions: { minScore: 70 },
    },
  ];

  let m2Count = 0;
  for (const m of budgetMissions) {
    await Mission.findOneAndUpdate({ worldSlug: m.worldSlug, order: m.order }, m, { upsert: true, new: true });
    m2Count++;
  }
  await World.findByIdAndUpdate(world2._id, { missionCount: m2Count });
  logger.info(`✅ ${m2Count} missions seeded for Budget City`);

  /* ─── Stocks ──────────────────────────────────────────────────────────── */
  const stocksData = [
    { symbol: 'NVT', name: 'NovaTech Industries',  sector: 'Technology',  description: 'A fictional diversified technology company focused on software and cloud services.', currentPrice: 847,  previousClose: 820,  openPrice: 825,  dayHigh: 860,  dayLow: 815,  volume: 2450000, marketCap: 84700000000,  peRatio: 28.5, pbRatio: 4.2, eps: 29.7, dividendYield: 0.5, revenueGrowth: 22, netMargin: 18, debtToEquity: 0.3, roe: 22, foundedYear: 2010, employees: 12000, headquarters: 'Bengaluru', logoEmoji: '💻', volatility: 0.025, beta: 1.2,  trend: 0.0003,   seed: 1001, isFictional: true, dataSource: 'synthetic', isActive: true },
    { symbol: 'GRB', name: 'GrowthBank Ltd',        sector: 'Finance',     description: 'A fictional mid-sized private bank serving retail and SME customers.',               currentPrice: 1234, previousClose: 1250, openPrice: 1245, dayHigh: 1260, dayLow: 1220, volume: 1800000, marketCap: 123400000000, peRatio: 14.2, pbRatio: 1.8, eps: 86.9, dividendYield: 1.2, revenueGrowth: 12, netMargin: 22, debtToEquity: 5.5, roe: 14, foundedYear: 1998, employees: 28000, headquarters: 'Mumbai',    logoEmoji: '🏦', volatility: 0.018, beta: 0.9,  trend: -0.00005, seed: 1002, isFictional: true, dataSource: 'synthetic', isActive: true },
    { symbol: 'ECO', name: 'EcoEnergy Corp',         sector: 'Energy',      description: 'A fictional renewable energy company in solar and wind power.',                       currentPrice: 567,  previousClose: 536,  openPrice: 545,  dayHigh: 580,  dayLow: 538,  volume: 3200000, marketCap: 56700000000,  peRatio: 35.1, pbRatio: 3.6, eps: 16.1, dividendYield: 0.0, revenueGrowth: 38, netMargin: 12, debtToEquity: 0.8, roe: 11, foundedYear: 2015, employees: 6500,  headquarters: 'Pune',      logoEmoji: '☀️', volatility: 0.035, beta: 1.5,  trend: 0.0005,   seed: 1003, isFictional: true, dataSource: 'synthetic', isActive: true },
    { symbol: 'URT', name: 'UrbanRetail Pvt',        sector: 'Consumer',    description: 'A fictional multi-format retail chain across Tier 1 and Tier 2 Indian cities.',      currentPrice: 890,  previousClose: 882,  openPrice: 885,  dayHigh: 905,  dayLow: 878,  volume: 1200000, marketCap: 89000000000,  peRatio: 31.4, pbRatio: 5.1, eps: 28.3, dividendYield: 0.8, revenueGrowth: 15, netMargin: 8,  debtToEquity: 0.4, roe: 18, foundedYear: 2008, employees: 45000, headquarters: 'Delhi',     logoEmoji: '🛒', volatility: 0.022, beta: 0.85, trend: 0.0001,   seed: 1004, isFictional: true, dataSource: 'synthetic', isActive: true },
    { symbol: 'HLF', name: 'HealthFirst Ltd',        sector: 'Healthcare',  description: 'A fictional chain of hospitals and diagnostic centres.',                              currentPrice: 3456, previousClose: 3470, openPrice: 3465, dayHigh: 3490, dayLow: 3440, volume: 560000,  marketCap: 345600000000, peRatio: 42.0, pbRatio: 6.8, eps: 82.3, dividendYield: 0.3, revenueGrowth: 18, netMargin: 14, debtToEquity: 0.2, roe: 16, foundedYear: 2001, employees: 35000, headquarters: 'Chennai',   logoEmoji: '🏥', volatility: 0.015, beta: 0.7,  trend: 0.0002,   seed: 1005, isFictional: true, dataSource: 'synthetic', isActive: true },
    { symbol: 'TVN', name: 'TechVenture Inc',         sector: 'Technology',  description: 'A fictional early-stage tech company developing AI-based business tools.',           currentPrice: 1890, previousClose: 1850, openPrice: 1860, dayHigh: 1930, dayLow: 1840, volume: 890000,  marketCap: 189000000000, peRatio: 85.0, pbRatio: 12.3,eps: 22.2, dividendYield: 0.0, revenueGrowth: 65, netMargin: 8,  debtToEquity: 0.1, roe: 14, foundedYear: 2018, employees: 3500,  headquarters: 'Hyderabad', logoEmoji: '🤖', volatility: 0.045, beta: 1.8,  trend: 0.0006,   seed: 1006, isFictional: true, dataSource: 'synthetic', isActive: true },
    { symbol: 'MTC', name: 'MetalCorp Ltd',           sector: 'Materials',   description: 'A fictional steel and aluminium producer for industrial use.',                       currentPrice: 456,  previousClose: 467,  openPrice: 463,  dayHigh: 470,  dayLow: 448,  volume: 2800000, marketCap: 45600000000,  peRatio: 9.8,  pbRatio: 1.1, eps: 46.5, dividendYield: 2.8, revenueGrowth: 5,  netMargin: 7,  debtToEquity: 1.2, roe: 11, foundedYear: 1975, employees: 22000, headquarters: 'Jamshedpur',logoEmoji: '⚙️', volatility: 0.030, beta: 1.1,  trend: -0.0002,  seed: 1007, isFictional: true, dataSource: 'synthetic', isActive: true },
    { symbol: 'FBK', name: 'FoodBasket FMCG',         sector: 'Consumer',    description: 'A fictional FMCG company manufacturing packaged foods and personal care products.', currentPrice: 234,  previousClose: 230,  openPrice: 231,  dayHigh: 238,  dayLow: 228,  volume: 4100000, marketCap: 23400000000,  peRatio: 52.0, pbRatio: 8.4, eps: 4.5,  dividendYield: 1.5, revenueGrowth: 9,  netMargin: 16, debtToEquity: 0.05,roe: 35, foundedYear: 1965, employees: 18000, headquarters: 'Kolkata',   logoEmoji: '🍱', volatility: 0.012, beta: 0.55, trend: 0.00015,  seed: 1008, isFictional: true, dataSource: 'synthetic', isActive: true },
    { symbol: 'INS', name: 'InsureMax Ltd',            sector: 'Finance',     description: 'A fictional life and general insurance company.',                                    currentPrice: 678,  previousClose: 672,  openPrice: 674,  dayHigh: 685,  dayLow: 669,  volume: 980000,  marketCap: 67800000000,  peRatio: 22.3, pbRatio: 2.9, eps: 30.4, dividendYield: 0.9, revenueGrowth: 16, netMargin: 12, debtToEquity: 0.8, roe: 13, foundedYear: 2005, employees: 15000, headquarters: 'Mumbai',    logoEmoji: '🛡️', volatility: 0.020, beta: 0.8,  trend: 0.0001,   seed: 1009, isFictional: true, dataSource: 'synthetic', isActive: true },
    { symbol: 'RWL', name: 'RealWorld Infra',          sector: 'Real Estate', description: 'A fictional real estate developer of residential and commercial projects.',        currentPrice: 345,  previousClose: 340,  openPrice: 342,  dayHigh: 355,  dayLow: 338,  volume: 1600000, marketCap: 34500000000,  peRatio: 18.5, pbRatio: 2.1, eps: 18.6, dividendYield: 1.8, revenueGrowth: 11, netMargin: 20, debtToEquity: 1.5, roe: 12, foundedYear: 1990, employees: 8000,  headquarters: 'Gurugram',  logoEmoji: '🏗️', volatility: 0.028, beta: 1.0,  trend: 0.0001,   seed: 1010, isFictional: true, dataSource: 'synthetic', isActive: true },
  ];

  for (const s of stocksData) {
    await Stock.findOneAndUpdate({ symbol: s.symbol }, s, { upsert: true, new: true });
  }
  logger.info('✅ Stocks seeded (10)');

  /* ─── Achievements ────────────────────────────────────────────────────── */
  const achievements = [
    { slug: 'first-mission',    title: 'First Steps',        description: 'Complete your first mission',                          emoji: '🎯', category: 'learning', rarity: 'common',    xpReward: 100,  condition: { type: 'missions_completed', threshold: 1 } },
    { slug: 'five-missions',    title: 'Quick Learner',      description: 'Complete 5 missions',                                  emoji: '⚡', category: 'learning', rarity: 'common',    xpReward: 150,  condition: { type: 'missions_completed', threshold: 5 } },
    { slug: 'first-trade',      title: 'Market Debut',       description: 'Place your first simulated trade',                    emoji: '📈', category: 'trading',  rarity: 'common',    xpReward: 100,  condition: { type: 'trades_completed', threshold: 1 } },
    { slug: 'ten-trades',       title: 'Active Trader',      description: 'Complete 10 simulated trades',                        emoji: '🔄', category: 'trading',  rarity: 'rare',      xpReward: 200,  condition: { type: 'trades_completed', threshold: 10 } },
    { slug: 'first-world',      title: 'World Conqueror',    description: 'Complete your first world',                           emoji: '🌍', category: 'learning', rarity: 'rare',      xpReward: 300,  condition: { type: 'worlds_completed', threshold: 1 } },
    { slug: 'streak-7',         title: 'Week Warrior',       description: 'Maintain a 7-day learning streak',                    emoji: '🔥', category: 'streak',   rarity: 'rare',      xpReward: 250,  condition: { type: 'streak', threshold: 7 } },
    { slug: 'streak-30',        title: 'Month Master',       description: 'Maintain a 30-day learning streak',                   emoji: '🌟', category: 'streak',   rarity: 'epic',      xpReward: 500,  condition: { type: 'streak', threshold: 30 } },
    { slug: 'stock-academy-1',  title: 'Market Freshman',    description: 'Complete Stock Market Fundamentals',                  emoji: '🏛️', category: 'learning', rarity: 'common',    xpReward: 200,  condition: { type: 'stock_academy_level', threshold: 1 } },
    { slug: 'stock-academy-5',  title: 'Market Scholar',     description: 'Complete 5 Stock Market Academy levels',              emoji: '📚', category: 'learning', rarity: 'epic',      xpReward: 500,  condition: { type: 'stock_academy_level', threshold: 5 } },
    { slug: 'stock-academy-10', title: 'Market Maestro',     description: 'Complete all 10 Stock Market Academy levels',         emoji: '🎓', category: 'learning', rarity: 'legendary', xpReward: 1000, condition: { type: 'stock_academy_level', threshold: 10 } },
    { slug: 'scam-detector',    title: 'Scam Detector',      description: 'Identify all red flags in the Scam Detective mission', emoji: '🔍', category: 'special',  rarity: 'epic',      xpReward: 300,  condition: { type: 'special', threshold: 1 } },
    { slug: 'diversified',      title: 'Diversifier',        description: 'Hold stocks from 5 different sectors simultaneously', emoji: '🎯', category: 'trading',  rarity: 'epic',      xpReward: 400,  condition: { type: 'sectors_held', threshold: 5 } },
    { slug: 'level-10',         title: 'Veteran Adventurer', description: 'Reach Level 10',                                      emoji: '👑', category: 'special',  rarity: 'legendary', xpReward: 1000, condition: { type: 'level', threshold: 10 } },
    { slug: 'hidden-easter-egg',title: '???',                description: 'Find the hidden easter egg',                          emoji: '🥚', category: 'hidden',   rarity: 'legendary', xpReward: 500,  isHidden: true, condition: { type: 'hidden', threshold: 1 } },
  ];

  for (const a of achievements) {
    await Achievement.findOneAndUpdate({ slug: a.slug }, { ...a, isActive: true }, { upsert: true, new: true });
  }
  logger.info('✅ Achievements seeded (14)');

  /* ─── Quests ──────────────────────────────────────────────────────────── */
  const quests = [
    { slug: 'complete-mission', title: 'Daily Learner',     description: 'Complete any learning mission today',           emoji: '📚', type: 'daily', xpReward: 100, coinReward: 20, condition: { type: 'complete_mission', count: 1 } },
    { slug: 'make-trade',       title: "Trader's Day",       description: 'Place a simulated trade today',                 emoji: '📈', type: 'daily', xpReward: 100, coinReward: 20, condition: { type: 'make_trade', count: 1 } },
    { slug: 'stock-lesson',     title: 'Market Student',    description: 'Complete a Stock Market Academy lesson',         emoji: '🏛️', type: 'daily', xpReward: 120, coinReward: 25, condition: { type: 'stock_lesson', count: 1 } },
    { slug: 'use-calculator',   title: 'Number Cruncher',   description: 'Use any financial calculator',                  emoji: '🔢', type: 'daily', xpReward: 80,  coinReward: 15, condition: { type: 'use_calculator', count: 1 } },
    { slug: 'login-streak',     title: 'Show Up!',          description: 'Log in and complete any activity',              emoji: '⭐', type: 'daily', xpReward: 50,  coinReward: 10, condition: { type: 'login', count: 1 } },
  ];

  for (const q of quests) {
    await Quest.findOneAndUpdate({ slug: q.slug }, { ...q, isActive: true }, { upsert: true, new: true });
  }
  logger.info('✅ Quests seeded (5)');

  /* ─── Admin placeholder ───────────────────────────────────────────────── */
  if (process.env.ADMIN_EMAIL) {
    const existing = await UserProfile.findOne({ email: process.env.ADMIN_EMAIL.toLowerCase() });
    if (!existing) {
      await UserProfile.create({
        firebaseUid: 'admin-placeholder-uid',
        email: process.env.ADMIN_EMAIL.toLowerCase(),
        username: 'admin',
        displayName: 'FinanceQuest Admin',
        role: 'admin',
        onboardingCompleted: true,
        emailVerified: true,
      });
      logger.info('✅ Admin placeholder user created');
    }
  }

  logger.info('🌱 Seed complete! Run "npm run dev" to start the server.');
  await disconnectDB();
}

seed().catch((err) => {
  logger.error('Seed failed:', err);
  process.exit(1);
});
