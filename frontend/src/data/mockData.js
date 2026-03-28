// AI response engine — varied, context-aware, non-repetitive
// Replace getMockResponse() body with fetch('/analyze') when backend is ready

export const STAGES = [
  { id: 'saver',    label: 'Saver',         emoji: '💰' },
  { id: 'investor', label: 'Investor',       emoji: '📈' },
  { id: 'builder',  label: 'Wealth Builder', emoji: '🏆' },
]

// ─── Response pools ────────────────────────────────────────────────────────────
// Each topic has multiple "turns". The engine picks the next unused turn so
// the user never sees the same response twice in a row.

const RESPONSE_POOLS = {
  saving: [
    {
      text: "Saving is the foundation of every great financial journey! Let me give you a quick health check:",
      cards: [
        { type: 'problem', title: '⚠️ Savings Gap',      content: 'Most Indians save only 5–8% of income. The ideal target is 20%. That gap compounds into a massive shortfall over time.' },
        { type: 'plan',    title: '📊 50-30-20 Rule',    content: 'Split your take-home: 50% on needs, 30% on wants, 20% straight into savings — automatically.' },
        { type: 'action',  title: '🎯 Do This Today',    content: 'Set up an auto-transfer of ₹5,000 on salary day to a separate savings account so you pay yourself first.' },
        { type: 'projection', title: '📈 10-Year Outlook', content: '₹5,000/month in a high-yield RD (6%) → ₹8.2 Lakh in 10 years without any effort.' },
      ],
    },
    {
      text: "Great, let's dig deeper into your savings strategy. Here's the next level:",
      cards: [
        { type: 'problem', title: '⚠️ Lifestyle Inflation', content: 'Every time your salary rises, expenses tend to rise equally — leaving savings flat. This is the #1 savings killer.' },
        { type: 'plan',    title: '📊 Savings Rate Ladder', content: 'Increase your savings rate by 1% every quarter. In a year, you\'ll go from 5% to 9% — almost double, painlessly.' },
        { type: 'action',  title: '🎯 Quick Win',           content: 'Cancel one subscription you haven\'t used this month. Redirect that amount to savings today.' },
        { type: 'projection', title: '📈 Compounding Power', content: 'Saving ₹1,000 more per month from age 25 vs 35 leads to ₹40L more at retirement (at 12% CAGR).' },
      ],
    },
    {
      text: "You're building great saving habits! Here's an advanced technique:",
      cards: [
        { type: 'plan',   title: '📊 Bucket Strategy',  content: 'Divide savings into 3 buckets: Emergency (6 months expenses), Short-term goals (1–3 yrs), Long-term wealth (5+ yrs).' },
        { type: 'action', title: '🎯 Action',            content: 'Open a separate zero-balance savings account just for your emergency fund. Target ₹50,000 first.' },
        { type: 'projection', title: '📈 Peace of Mind', content: 'A 6-month emergency fund means zero credit card debt in a crisis — saving you ₹30,000+ in interest.' },
      ],
    },
  ],

  investing: [
    {
      text: "Smart move — investing beats inflation and builds real wealth. Here's where to begin:",
      cards: [
        { type: 'problem',    title: '⚠️ Inflation Risk',   content: 'Keeping money in a savings account (3.5% interest) against 6% inflation means you\'re losing 2.5% per year in real terms.' },
        { type: 'plan',       title: '📊 SIP in Index Fund', content: 'Start a ₹5,000/month SIP in a Nifty 50 Index Fund. Low cost (0.1% expense ratio), no fund manager risk, proven returns.' },
        { type: 'action',     title: '🎯 Start Today',       content: 'Open a Groww or Zerodha Coin account (free, 10 mins) and start your first SIP. Minimum is just ₹500/month.' },
        { type: 'projection', title: '📈 Wealth Projection',  content: '₹5,000/month at 12% CAGR → ₹18 Lakh in 10 yrs → ₹1.76 Crore in 25 years.' },
      ],
    },
    {
      text: "Great foundation! Let's build on that with a diversified approach:",
      cards: [
        { type: 'plan',       title: '📊 Core-Satellite Portfolio', content: '70% in a Nifty 50 Index Fund (core), 20% in a mid-cap fund (growth), 10% in gold ETF (hedge).' },
        { type: 'problem',    title: '⚠️ Common Mistake',           content: 'Timing the market never works. Even professional fund managers fail 80% of the time. Stay invested, always.' },
        { type: 'action',     title: '🎯 Step-Up SIP',              content: 'Increase your SIP by 10% every year when salary hikes come. This alone can 3x your final corpus.' },
        { type: 'projection', title: '📈 Step-Up Impact',           content: 'Starting with ₹5,000 and increasing 10%/yr → ₹1.2 Crore in 20 years vs ₹50 Lakh without step-up.' },
      ],
    },
    {
      text: "You're thinking like an investor now! Here's the next level — tax-efficient investing:",
      cards: [
        { type: 'plan',    title: '📊 Tax-Saving Investments', content: 'ELSS (Equity Linked Savings Scheme) gives market returns + ₹1.5L deduction under 80C. Best of both worlds.' },
        { type: 'action',  title: '🎯 Action',                 content: 'Invest ₹12,500/month in an ELSS fund to fully use your ₹1.5L 80C limit and save up to ₹45,000 in taxes.' },
        { type: 'projection', title: '📈 After-Tax Returns',   content: 'ELSS with tax savings effectively gives you a 30%+ boost on the first year\'s investment.' },
      ],
    },
  ],

  debt: [
    {
      text: "Getting debt-free is the best guaranteed return you can get. Let's build your plan:",
      cards: [
        { type: 'problem',    title: '⚠️ True Cost of Debt',    content: 'A ₹1 Lakh credit card balance at 42% p.a. costs you ₹42,000/year in interest alone — that\'s ₹3,500/month burned.' },
        { type: 'plan',       title: '📊 Avalanche Method',     content: 'List all debts by interest rate. Pay minimums on all, then throw every extra rupee at the highest rate first.' },
        { type: 'action',     title: '🎯 First Step',           content: 'Find your highest-interest debt right now and add even ₹500 extra to this month\'s payment.' },
        { type: 'projection', title: '📈 Freedom Timeline',     content: 'Adding ₹3,000/month extra can cut a 5-year debt timeline down to under 3 years.' },
      ],
    },
    {
      text: "You're on the right track. Here's how to accelerate your debt pay-off:",
      cards: [
        { type: 'plan',    title: '📊 Debt Snowball (Motivation Hack)', content: 'If you have many small debts, pay off the smallest first. Each closure gives a psychological win that keeps you going.' },
        { type: 'problem', title: '⚠️ EMI Trap',                       content: 'Never take a new EMI while you\'re in debt. Every new EMI extends your debt timeline and adds hidden interest.' },
        { type: 'action',  title: '🎯 Negotiate Interest Rate',        content: 'Call your bank and ask for a lower interest rate or a balance transfer to a 0% introductory card. Works 40% of the time.' },
        { type: 'projection', title: '📈 After Debt',                  content: 'Once your highest-interest debt is cleared, redirect those EMIs into SIPs — you\'ll build wealth at the same monthly cost.' },
      ],
    },
    {
      text: "Great progress! Now let's make sure you never fall back into debt:",
      cards: [
        { type: 'plan',    title: '📊 NO-debt Rules',           content: '1) Never revolve credit card balance. 2) No personal loans for lifestyle. 3) Home/education loans only if unavoidable.' },
        { type: 'action',  title: '🎯 Emergency Fund First',    content: 'Build a ₹30K emergency fund WHILE paying debt. This stops you from using credit cards in a crisis.' },
        { type: 'projection', title: '📈 Debt-Free Milestone', content: 'Being debt-free (except home loan) typically means ₹15,000–₹30,000/month freed up to invest.' },
      ],
    },
  ],

  budget: [
    {
      text: "Budgeting is the map that leads to financial freedom. Let's set yours up:",
      cards: [
        { type: 'plan',    title: '📊 Zero-Based Budget',  content: 'Every rupee gets a job. Income - Savings - Expenses = 0. No idle money, no impulse spending.' },
        { type: 'action',  title: '🎯 Track This Week',    content: 'For the next 7 days, write down every expense — even tea and autorickshaws. Awareness is the first step.' },
        { type: 'projection', title: '📈 Budget Effect',   content: 'People who budget consistently save 18% more than those who don\'t, on the same income.' },
      ],
    },
    {
      text: "Smart budgeting goes beyond just tracking. Here's how to automate it:",
      cards: [
        { type: 'plan',    title: '📊 Pay-Yourself-First', content: 'On salary day: auto-transfer savings first, then bills, then spend what\'s left. Never spend first, save last.' },
        { type: 'action',  title: '🎯 Set 3 Alerts',       content: 'Set a bank SMS alert for every transaction, a weekly spending limit alert, and a monthly savings target reminder.' },
        { type: 'problem', title: '⚠️ Food & Shopping',    content: 'Food delivery and impulse shopping are the #1 budget leaks in India. Meal-prep 3 days/week saves ₹2,000–₹4,000/month.' },
      ],
    },
  ],

  emergency: [
    {
      text: "An emergency fund is your financial seatbelt. Here's how to build one fast:",
      cards: [
        { type: 'plan',    title: '📊 3–6 Month Target',    content: 'Your emergency fund should cover 3 months of essential expenses (rent, food, EMIs). 6 months if your income is variable.' },
        { type: 'action',  title: '🎯 Start Small',         content: 'Open a separate savings account and deposit ₹5,000 today. Automate ₹3,000–₹5,000/month until you hit your target.' },
        { type: 'projection', title: '📈 Break-Even Point', content: 'One car breakdown or medical bill without an emergency fund typically causes ₹50,000–₹2 Lakh in credit card debt.' },
      ],
    },
  ],

  tax: [
    {
      text: "Tax planning is free money — most people leave it on the table. Let's fix that:",
      cards: [
        { type: 'plan',    title: '📊 80C — ₹1.5L Deduction',  content: 'PPF, ELSS, EPF, home loan principal, and life insurance premiums all count. Max this out first.' },
        { type: 'plan',    title: '📊 80D — Health Insurance',  content: 'Pay your own health insurance premium: ₹25,000 deduction. Pay parents\' premium: ₹50,000 more.' },
        { type: 'action',  title: '🎯 Check Your Form 16',      content: 'Upload your Form 16 here and I\'ll show you exactly which deductions you\'re missing.' },
        { type: 'projection', title: '📈 Tax Saved',            content: 'A 30% bracket taxpayer who maxes 80C + 80D saves up to ₹90,000/year in taxes legally.' },
      ],
    },
  ],

  general: [
    {
      text: "Good question! Here's a solid foundation to start from:",
      cards: [
        { type: 'plan',   title: '📊 Financial Priority Stack', content: '1️⃣ Emergency fund (3 months) → 2️⃣ Clear high-interest debt → 3️⃣ Start SIP → 4️⃣ Tax saving → 5️⃣ Grow wealth.' },
        { type: 'action', title: '🎯 Where Are You Now?',       content: 'Tell me more — are you working on savings, debt, investments, or something else? I\'ll give you a precise plan.' },
      ],
    },
    {
      text: "That's a great area to explore. Here's what I'd recommend:",
      cards: [
        { type: 'plan',    title: '📊 Start with Clarity',   content: 'Most financial problems come from not knowing the numbers. Try writing down: income, monthly expenses, savings, and debts.' },
        { type: 'action',  title: '🎯 The 1% Rule',          content: 'Improve your finances by 1% every week. That\'s a new habit, one cancelled subscription, or ₹500 extra saved.' },
        { type: 'projection', title: '📈 Small Steps Win',   content: 'Consistent small actions beat big plans done once. ₹500/week invested = ₹26,000/year + compounding.' },
      ],
    },
    {
      text: "I love your curiosity! Let me offer a broader financial perspective:",
      cards: [
        { type: 'plan',    title: '📊 3 Pillars of Wealth',  content: 'Pillar 1: Earn more (skill up). Pillar 2: Spend less (budget). Pillar 3: Invest the difference (SIP, PPF, real estate).' },
        { type: 'action',  title: '🎯 This Week\'s Goal',    content: 'Pick ONE financial goal for this week — even if it\'s just tracking your spending. Focus beats perfection.' },
        { type: 'projection', title: '📈 Over a Decade',     content: 'Someone who masters all 3 pillars can accumulate 10x more wealth than their peers on the same salary.' },
      ],
    },
  ],
}

// ─── Topic detection ───────────────────────────────────────────────────────────
function detectTopic(text) {
  const l = text.toLowerCase()
  if (/\b(save|saving|savings|save money|savings goal)\b/.test(l))        return 'saving'
  if (/\b(invest|sip|mutual fund|stock|equity|nifty|elss|mf|portfolio)\b/.test(l)) return 'investing'
  if (/\b(debt|loan|emi|credit card|borrow|repay|pay off)\b/.test(l))     return 'debt'
  if (/\b(budget|budgeting|expense|spend|spending|track)\b/.test(l))      return 'budget'
  if (/\b(emergency|emergency fund|rainy day|safety net)\b/.test(l))      return 'emergency'
  if (/\b(tax|80c|80d|itr|form 16|income tax|tds|deduction)\b/.test(l))   return 'tax'
  return 'general'
}

// ─── Public API ────────────────────────────────────────────────────────────────
// turnCounts tracks how many times each topic has been answered so we rotate pools
const turnCounts = {}

export function getMockResponse(userMessage) {
  const topic = detectTopic(userMessage)
  const pool  = RESPONSE_POOLS[topic] || RESPONSE_POOLS.general

  // Rotate through pool entries; wrap around with variety
  turnCounts[topic] = (turnCounts[topic] ?? 0)
  const idx = turnCounts[topic] % pool.length
  turnCounts[topic]++

  return pool[idx]
}
