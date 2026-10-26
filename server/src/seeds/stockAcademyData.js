'use strict';
/**
 * Stock Market Academy curriculum data.
 * All companies, prices, and scenarios are entirely fictional.
 * For educational purposes only. Not financial advice.
 */

const STOCK_ACADEMY_MODULES = [
  {
    level: 1,
    title: 'Stock Market Fundamentals',
    subtitle: 'From zero to your first share',
    emoji: '🏛️',
    isFree: true,
    xpReward: 200,
    lessons: [
      {
        id: 'sm-1-1',
        title: 'What Is a Share?',
        xpReward: 50,
        type: 'lesson',
        content: {
          intro: 'A share represents a tiny slice of ownership in a company.',
          sections: [
            {
              title: 'Ownership in a box',
              body: 'Imagine a fictional pizza restaurant called "SlicePerfect." The owner needs ₹10 lakh to expand. Instead of borrowing, she splits the business into 1,000 equal pieces called shares. Each share = 0.1% ownership. If you buy 10 shares, you own 1% of SlicePerfect.',
              tip: 'Owning a share means you own a fraction of everything the company owns — its equipment, brand, and future profits.',
            },
            {
              title: 'What do shareholders receive?',
              body: 'As a shareholder you may receive dividends (a share of profits) and benefit from capital gains (if the share price rises). You also get voting rights on major company decisions.',
            },
            {
              title: 'Why do prices change?',
              body: 'Share prices change because buyers and sellers constantly revise their estimates of a company\'s future value. Good news often pushes prices up. Bad news pushes them down. No one can predict these changes with certainty.',
            },
          ],
          keyTakeaways: [
            'A share = fractional ownership of a company.',
            'Shareholders may earn dividends and capital gains.',
            'Share prices reflect collective expectations about future value.',
            'Prices can go up or down — past performance does not predict future results.',
          ],
        },
        quiz: [
          {
            id: 'q1',
            type: 'mcq',
            question: 'You own 50 shares in NovaTech Industries, which has 1,000 shares total. What percentage of the company do you own?',
            options: [
              { id: 'a', text: '0.5%' },
              { id: 'b', text: '5%' },
              { id: 'c', text: '50%' },
              { id: 'd', text: '0.05%' },
            ],
            correctAnswer: 'b',
            explanation: '50 ÷ 1,000 = 0.05 = 5%. Ownership % = (your shares ÷ total shares) × 100.',
          },
          {
            id: 'q2',
            type: 'mcq',
            question: 'NovaTech declares a dividend of ₹5 per share. You own 100 shares. How much do you receive?',
            options: [
              { id: 'a', text: '₹50' },
              { id: 'b', text: '₹5' },
              { id: 'c', text: '₹500' },
              { id: 'd', text: '₹5,000' },
            ],
            correctAnswer: 'c',
            explanation: '100 shares × ₹5 = ₹500.',
          },
        ],
      },
      {
        id: 'sm-1-2',
        title: 'Stock Exchanges: NSE & BSE',
        xpReward: 50,
        type: 'lesson',
        content: {
          intro: 'Stock exchanges are organised marketplaces where buyers and sellers trade shares.',
          sections: [
            {
              title: 'What is a stock exchange?',
              body: 'A stock exchange provides the infrastructure for buyers and sellers to meet. In India, the two main exchanges are the National Stock Exchange (NSE) and the Bombay Stock Exchange (BSE). They maintain rules, enforce transparency, and ensure settlements.',
            },
            {
              title: 'Listed vs unlisted companies',
              body: 'A listed company has gone through the process of listing its shares on an exchange after meeting regulatory requirements. Unlisted companies are private — their shares are not freely traded on exchanges.',
            },
            {
              title: 'Market capitalisation',
              body: 'Market cap = share price × total shares outstanding. A fictional NovaTech with 1 crore shares at ₹500 each has a market cap of ₹500 crore. Market cap changes every second as prices change.',
              tip: "Market cap is not the same as a company's total assets or revenue.",
            },
          ],
          keyTakeaways: [
            'NSE and BSE are India\'s two main stock exchanges.',
            'Only listed companies can have their shares traded on exchanges.',
            'Market cap = price × total shares — it changes constantly.',
          ],
        },
        quiz: [
          {
            id: 'q1',
            type: 'mcq',
            question: 'NovaTech has 2 crore shares and its current share price is ₹250. What is its market capitalisation?',
            options: [
              { id: 'a', text: '₹250 crore' },
              { id: 'b', text: '₹500 crore' },
              { id: 'c', text: '₹2,500 crore' },
              { id: 'd', text: '₹50 crore' },
            ],
            correctAnswer: 'b',
            explanation: '2,00,00,000 × ₹250 = ₹500 crore.',
          },
        ],
      },
      {
        id: 'sm-1-3',
        title: 'IPOs: When Companies Go Public',
        xpReward: 60,
        type: 'interactive',
        content: {
          intro: 'An IPO (Initial Public Offering) is how a private company sells its first shares to the public.',
          sections: [
            {
              title: 'The IPO journey',
              body: 'Before an IPO, only founders, employees, and private investors own shares. During an IPO, the company offers new shares to the public for the first time. The money raised goes to the company for expansion — or to early investors selling their stakes.',
            },
            {
              title: 'Why IPOs are tricky',
              body: 'IPO pricing is set by bankers based on estimated demand. The share price after listing can be higher or lower than the IPO price. Short-term IPO performance is unpredictable. Many IPOs underperform their issue price over the first year.',
              tip: "Never invest in an IPO based solely on hype or a strong brand. Analyse the company's financials and the offering price.",
            },
          ],
          keyTakeaways: [
            'IPOs let private companies raise capital from public investors.',
            'IPO prices are set by investment banks — may not reflect long-term fair value.',
            'Post-listing price movements are unpredictable.',
            'Applying for an IPO does not guarantee you will receive shares.',
          ],
        },
        quiz: [
          {
            id: 'q1',
            type: 'mcq',
            question: 'NovaTech sets its IPO price at ₹100. On listing day, the price jumps to ₹150. What does this NOT necessarily mean?',
            options: [
              { id: 'a', text: 'Strong demand from investors on listing day' },
              { id: 'b', text: "The company's fundamental value increased by 50%" },
              { id: 'c', text: 'The IPO may have been underpriced by bankers' },
              { id: 'd', text: 'The share price is higher than the IPO price' },
            ],
            correctAnswer: 'b',
            explanation: 'A one-day listing gain is driven by sentiment and demand, not a change in underlying business value.',
          },
        ],
      },
    ],
  },
  {
    level: 2,
    title: 'How Trading Works',
    subtitle: 'Demat accounts, orders, and settlement',
    emoji: '⚖️',
    isFree: true,
    xpReward: 250,
    lessons: [
      {
        id: 'sm-2-1',
        title: 'Demat and Trading Accounts',
        xpReward: 60,
        type: 'lesson',
        content: {
          intro: 'To trade shares in India you need two accounts: a Demat account and a Trading account.',
          sections: [
            {
              title: 'Demat account',
              body: 'A Demat (dematerialised) account holds your shares electronically — like a bank account for securities. In India, NSDL and CDSL are the two depositories. Your broker connects to one or both.',
            },
            {
              title: 'Trading account',
              body: 'A Trading account is the interface through which you place buy/sell orders on the exchange. It links to your Demat account and your bank account.',
            },
            {
              title: 'Settlement',
              body: 'When you buy shares, the exchange settles the transaction in T+1 days (trade day + 1 business day in India as of 2023). Shares move from the seller\'s Demat to yours, and cash moves the other way.',
            },
          ],
          keyTakeaways: [
            'Demat account = holds your shares electronically.',
            'Trading account = interface to place orders.',
            'NSDL and CDSL are India\'s two depositories.',
            'Settlement in India is T+1 (trade day + 1 business day).',
          ],
        },
        quiz: [
          {
            id: 'q1',
            type: 'mcq',
            question: 'Where are your purchased shares actually stored?',
            options: [
              { id: 'a', text: "In your broker's vault" },
              { id: 'b', text: 'In your Demat account at NSDL/CDSL' },
              { id: 'c', text: 'In your bank account' },
              { id: 'd', text: 'In the NSE/BSE database' },
            ],
            correctAnswer: 'b',
            explanation: 'Shares are held electronically in your Demat account, maintained by NSDL or CDSL.',
          },
        ],
      },
      {
        id: 'sm-2-2',
        title: 'Order Types Explained',
        xpReward: 70,
        type: 'interactive',
        content: {
          intro: 'Different order types give you control over price and execution timing.',
          sections: [
            {
              title: 'Market order',
              body: 'A market order executes immediately at the best available price. You are certain to trade, but you don\'t control the exact price. During high volatility, the executed price can differ significantly from what you saw (called slippage).',
            },
            {
              title: 'Limit order',
              body: 'A limit order specifies the maximum price you will pay (buy) or minimum price you will accept (sell). The order only executes if the market reaches your price. If it never does, the order stays unfilled.',
            },
            {
              title: 'Stop-loss order',
              body: "A stop-loss triggers a sell once the price crosses a specified level. For example, you own a share at ₹200 and set a stop-loss at ₹180. If the price drops to ₹180, a sell order is triggered. Stop-losses protect against large losses but can trigger during temporary price dips.",
              tip: 'Stop-losses are not a guarantee of selling at exactly the stop price, especially in fast-moving markets.',
            },
          ],
          keyTakeaways: [
            'Market order: guaranteed execution, uncontrolled price.',
            'Limit order: controlled price, no execution guarantee.',
            'Stop-loss: protects against large losses, but imperfect.',
            'All orders have transaction costs (brokerage + STT).',
          ],
        },
        quiz: [
          {
            id: 'q1',
            type: 'scenario',
            question: 'You want to buy NovaTech shares only if they drop to ₹180 or below. Current price is ₹200. Which order type?',
            options: [
              { id: 'a', text: 'Market order at ₹200' },
              { id: 'b', text: 'Limit buy order at ₹180' },
              { id: 'c', text: 'Stop-loss sell at ₹180' },
              { id: 'd', text: 'Market sell order' },
            ],
            correctAnswer: 'b',
            explanation: 'A limit buy order at ₹180 will only execute if the price reaches ₹180 or below.',
          },
        ],
      },
      {
        id: 'sm-2-3',
        title: 'Transaction Costs & Bid-Ask Spread',
        xpReward: 70,
        type: 'interactive',
        content: {
          intro: 'Every trade has a cost. Understanding these costs is essential to realistic profit calculations.',
          sections: [
            {
              title: 'Bid and ask prices',
              body: 'The bid price is the highest price a buyer will pay. The ask price is the lowest price a seller will accept. The difference is the spread. A narrow spread indicates high liquidity.',
            },
            {
              title: 'Transaction costs in India (educational illustration)',
              body: 'When you trade shares, typical costs include:\n• Brokerage\n• Securities Transaction Tax (STT)\n• Exchange transaction charges\n• SEBI turnover fee\n• GST on brokerage\n• Stamp duty\nThese add up — especially for frequent traders.',
              tip: 'A trade that looks profitable before costs can be loss-making after costs on small positions. Always calculate net profit.',
            },
          ],
          keyTakeaways: [
            'Bid-ask spread is an implicit cost of trading.',
            'Brokerage, STT, exchange fees, GST, and stamp duty all reduce returns.',
            'Frequent trading dramatically increases total costs.',
            'Always calculate profit after all transaction costs.',
          ],
        },
        quiz: [
          {
            id: 'q1',
            type: 'mcq',
            question: 'NovaTech has a bid of ₹299 and an ask of ₹301. If you buy at ask and immediately sell at bid, what is your loss per share (spread only)?',
            options: [
              { id: 'a', text: '₹1' },
              { id: 'b', text: '₹2' },
              { id: 'c', text: '₹0' },
              { id: 'd', text: '₹301' },
            ],
            correctAnswer: 'b',
            explanation: 'Buy at ₹301, sell at ₹299. Loss from spread = ₹2 per share, before any other charges.',
          },
        ],
      },
    ],
  },
  {
    level: 3,
    title: 'Candlestick Chart Masterclass',
    subtitle: 'Read price action like a pro',
    emoji: '📊',
    isFree: true,
    xpReward: 300,
    lessons: [
      {
        id: 'sm-3-1',
        title: 'Reading Candlestick Charts',
        xpReward: 80,
        type: 'chart-lab',
        content: {
          intro: 'Candlestick charts pack four data points into one visual: Open, High, Low, and Close (OHLC).',
          sections: [
            {
              title: 'Anatomy of a candle',
              body: 'Each candle represents one time period.\n• The body spans from Open to Close.\n• Green/hollow body = price closed higher (bullish).\n• Red/filled body = price closed lower (bearish).\n• Upper wick = highest price reached.\n• Lower wick = lowest price reached.',
            },
            {
              title: 'What timeframes tell you',
              body: 'On a daily chart, each candle = one trading day. Longer timeframes filter out short-term noise. Most long-term investors use weekly or monthly charts.',
            },
            {
              title: 'Common patterns and their limitations',
              body: 'Patterns like doji, hammer, and engulfing are widely discussed. They describe historical price behaviour — they do NOT guarantee future movement. Studies show chart patterns have modest predictive value at best.',
              tip: 'Chart patterns are observations, not laws. Use them alongside other information.',
            },
          ],
          keyTakeaways: [
            'OHLC = Open, High, Low, Close — four data points per candle.',
            'Green candle: close > open. Red: close < open.',
            'Wicks show the range beyond open/close.',
            'Chart patterns are probabilistic observations, not predictions.',
          ],
        },
        quiz: [
          {
            id: 'q1',
            type: 'mcq',
            question: 'NovaTech opens at ₹200, reaches ₹215, drops to ₹190, closes at ₹205. What colour is the candle body?',
            options: [
              { id: 'a', text: 'Red — because the price dropped to ₹190' },
              { id: 'b', text: 'Green — because close ₹205 > open ₹200' },
              { id: 'c', text: 'Neither — no body since wicks are equal' },
              { id: 'd', text: 'Red — because high of ₹215 was not maintained' },
            ],
            correctAnswer: 'b',
            explanation: 'Candle colour is determined by close vs open. Close (₹205) > Open (₹200) = green/bullish candle.',
          },
        ],
      },
      {
        id: 'sm-3-2',
        title: 'Support, Resistance & Moving Averages',
        xpReward: 90,
        type: 'chart-lab',
        content: {
          intro: 'Support, resistance, and moving averages are widely used in technical analysis.',
          sections: [
            {
              title: 'Support and resistance',
              body: 'Support is a price level where buying tends to outweigh selling — the price has historically bounced upward. Resistance is where selling tends to outweigh buying. These are zones, not precise walls.',
              tip: 'Support and resistance can break suddenly on high-impact news.',
            },
            {
              title: 'Moving averages',
              body: 'A Simple Moving Average (SMA) averages closing prices over N periods. A 20-day SMA adds the last 20 closes and divides by 20. It smooths price data to show trend direction. The EMA weights recent prices more heavily.',
            },
          ],
          keyTakeaways: [
            'Support and resistance are zones, not exact prices.',
            'They can break — always consider the possibility.',
            '20-day SMA = average of last 20 closes.',
            'Moving averages are lagging indicators — they confirm trends, not predict them.',
          ],
        },
        quiz: [
          {
            id: 'q1',
            type: 'mcq',
            question: 'Which statement about a support level is MOST accurate?',
            options: [
              { id: 'a', text: 'The price will always bounce up from a support level' },
              { id: 'b', text: 'Support levels can break, especially on high-impact news' },
              { id: 'c', text: 'Support is an exact price where the price must stop falling' },
              { id: 'd', text: 'Support only applies to large-cap stocks' },
            ],
            correctAnswer: 'b',
            explanation: 'Support levels are approximate zones based on historical price behaviour. They can and do break.',
          },
        ],
      },
    ],
  },
  {
    level: 4,
    title: 'Fundamental Analysis',
    subtitle: 'Understand what a company is worth',
    emoji: '🔍',
    isFree: false,
    xpReward: 400,
    lessons: [
      {
        id: 'sm-4-1',
        title: 'Reading Financial Statements',
        xpReward: 100,
        type: 'interactive',
        content: {
          intro: 'Three financial statements tell the story of a business: Income Statement, Balance Sheet, and Cash Flow Statement.',
          sections: [
            {
              title: 'Income Statement (P&L)',
              body: 'Revenue → Gross Profit → Operating Profit → Net Profit.\n\nFictional NovaTech (FY2024):\n• Revenue: ₹500 cr\n• COGS: ₹200 cr → Gross Profit: ₹300 cr (60%)\n• Operating Expenses: ₹150 cr → EBIT: ₹150 cr (30%)\n• Interest & Tax: ₹50 cr → Net Profit: ₹100 cr (20%)',
            },
            {
              title: 'Balance Sheet',
              body: 'Assets = Liabilities + Equity at a point in time.\n\nNovaTech (fictional):\n• Total Assets: ₹800 cr\n• Total Liabilities: ₹300 cr\n• Equity: ₹500 cr\n• D/E = 300/500 = 0.6x',
            },
            {
              title: 'Cash Flow Statement',
              body: 'Net profit is an accounting figure. Cash flow shows real cash movement. A company can show profit but have negative cash flow. Free Cash Flow = Operating Cash Flow - Capital Expenditure.',
              tip: 'A company consistently generating positive free cash flow is on stronger footing than one with paper profits but cash burn.',
            },
          ],
          keyTakeaways: [
            'Revenue ≠ Profit. Understand each layer of the P&L.',
            'Balance sheet: Assets = Liabilities + Equity.',
            'Cash flow ≠ net profit. Both matter.',
            'Negative free cash flow for years is a warning sign.',
          ],
        },
        quiz: [
          {
            id: 'q1',
            type: 'mcq',
            question: 'NovaTech earns ₹100 cr net profit but Operating Cash Flow is -₹20 cr. What does this suggest?',
            options: [
              { id: 'a', text: 'The company is very profitable and healthy' },
              { id: 'b', text: 'Accounting profits may not be converting to real cash — warrants investigation' },
              { id: 'c', text: 'The company has paid too many dividends' },
              { id: 'd', text: 'The stock price will fall tomorrow' },
            ],
            correctAnswer: 'b',
            explanation: 'When net profit is positive but operating cash flow is negative, it may indicate aggressive revenue recognition or high receivables.',
          },
        ],
      },
      {
        id: 'sm-4-2',
        title: 'Valuation Ratios: P/E, P/B, and More',
        xpReward: 100,
        type: 'interactive',
        content: {
          intro: 'Valuation ratios help compare a stock\'s price to its financial performance — but they are estimates, not answers.',
          sections: [
            {
              title: 'Price-to-Earnings (P/E) ratio',
              body: 'P/E = Share Price ÷ EPS.\n\nNovaTech: Price ₹500, EPS ₹25, P/E = 20x.\nInvestors pay ₹20 for every ₹1 of earnings. Higher P/E can mean high growth expectations — or overvaluation. Lower P/E can mean undervaluation — or declining prospects.',
            },
            {
              title: 'Price-to-Book (P/B) ratio',
              body: 'P/B = Share Price ÷ Book Value Per Share. A P/B below 1 could mean undervaluation — or permanent impairment. Asset-heavy industries tend to trade at lower P/B than capital-light ones.',
            },
            {
              title: 'Return on Equity (ROE)',
              body: 'ROE = Net Profit ÷ Equity × 100. Higher ROE means efficient use of shareholder capital. But high ROE from excessive debt is risky — always check D/E alongside ROE.',
              tip: 'A single ratio never tells the full story. Always compare: vs history, vs peers, vs sector.',
            },
          ],
          keyTakeaways: [
            'P/E compares price to earnings — context and sector matter.',
            'Low P/E is not automatically cheap.',
            'P/B is most useful for asset-heavy businesses.',
            "High ROE is attractive but verify it's not from leverage.",
          ],
        },
        quiz: [
          {
            id: 'q1',
            type: 'mcq',
            question: 'NovaTech trades at P/E of 10x. GrowthBank at P/E of 30x. Which is MOST accurate?',
            options: [
              { id: 'a', text: 'NovaTech is definitely the better investment' },
              { id: 'b', text: 'GrowthBank is definitely better' },
              { id: 'c', text: 'The difference reflects growth expectations and business types — deeper analysis needed' },
              { id: 'd', text: 'P/E alone determines which stock to buy' },
            ],
            correctAnswer: 'c',
            explanation: 'P/E ratios vary by sector and growth rate. A bank is valued differently from a tech company.',
          },
        ],
      },
    ],
  },
  {
    level: 5,
    title: 'Investing vs Trading',
    subtitle: 'Understanding the key differences and risks',
    emoji: '⚡',
    isFree: false,
    xpReward: 350,
    lessons: [
      {
        id: 'sm-5-1',
        title: 'Long-Term Investing vs Active Trading',
        xpReward: 90,
        type: 'lesson',
        content: {
          intro: 'Investing and trading are fundamentally different approaches with very different risk profiles.',
          sections: [
            {
              title: 'Long-term investing',
              body: "Long-term investors buy shares intending to hold for years or decades. They focus on fundamentals and are willing to ride out short-term volatility. Transaction costs are lower. Compounding works in their favour over time.",
            },
            {
              title: 'Short-term trading',
              body: 'Traders aim to profit from short-term price movements. Intraday traders close all positions before market close. Transaction costs compound rapidly. Emotional discipline is extremely difficult.',
            },
            {
              title: 'Why short-term trading is difficult',
              body: 'Studies consistently show the vast majority of active retail traders underperform a simple index fund over time, primarily due to: frequent transaction costs, taxes on short-term gains, emotional decision-making, and information asymmetry vs institutional traders.',
              tip: 'This is educational information, not financial advice. Each person\'s situation is different.',
            },
          ],
          keyTakeaways: [
            'Long-term investing generally has lower costs and benefits from compounding.',
            'Short-term trading requires significant skill, discipline, and risk management.',
            'Most retail traders underperform simple index funds over time.',
            'Leverage in trading can amplify both gains and losses rapidly.',
          ],
        },
        quiz: [
          {
            id: 'q1',
            type: 'mcq',
            question: 'An intraday trader makes 20 trades/day at ₹20 brokerage each. Annual brokerage cost (250 trading days)?',
            options: [
              { id: 'a', text: '₹5,000' },
              { id: 'b', text: '₹50,000' },
              { id: 'c', text: '₹1,00,000' },
              { id: 'd', text: '₹4,00,000' },
            ],
            correctAnswer: 'c',
            explanation: '20 × ₹20 × 250 = ₹1,00,000 in brokerage alone. This must be overcome before any net profit.',
          },
        ],
      },
    ],
  },
  {
    level: 6,
    title: 'Fundamental Investing & Valuation',
    subtitle: 'Finding quality businesses at reasonable prices',
    emoji: '🎯',
    isFree: false,
    xpReward: 400,
    lessons: [
      {
        id: 'sm-6-1',
        title: 'What Makes a Quality Business?',
        xpReward: 100,
        type: 'lesson',
        content: {
          intro: 'Quality businesses share certain characteristics — but identifying them in advance is harder than it looks.',
          sections: [
            {
              title: 'Business quality markers',
              body: 'Investors often look for: consistent revenue growth, high and stable margins, strong return on capital, low debt, positive free cash flow, competitive advantages (pricing power, network effects), and quality management.',
            },
            {
              title: 'Intrinsic value is an estimate',
              body: 'Intrinsic value attempts to measure what a business is worth based on expected future cash flows, discounted to today. It is not a precise number — it depends on assumptions about growth, margins, and discount rate.',
            },
            {
              title: 'Margin of safety',
              body: "The concept of margin of safety (associated with Benjamin Graham) means buying a stock significantly below your estimated intrinsic value — to allow for estimation errors. A 30–40% margin of safety means if your estimate is wrong, you still have a cushion.",
              tip: 'Even with a margin of safety, investments can lose value. No valuation method eliminates risk.',
            },
          ],
          keyTakeaways: [
            'Business quality involves multiple factors — no single metric defines it.',
            'Intrinsic value is an estimate based on assumptions, not a fact.',
            'Margin of safety builds in a cushion for estimation error.',
            'Even "obvious" quality businesses can be overpriced.',
          ],
        },
        quiz: [
          {
            id: 'q1',
            type: 'mcq',
            question: "You estimate NovaTech's intrinsic value at ₹500. Applying a 40% margin of safety, at what price would you consider buying?",
            options: [
              { id: 'a', text: '₹500' },
              { id: 'b', text: '₹300' },
              { id: 'c', text: '₹700' },
              { id: 'd', text: '₹200' },
            ],
            correctAnswer: 'b',
            explanation: '₹500 × (1 - 0.40) = ₹300. A 40% margin of safety means buying at ₹300 or below.',
          },
        ],
      },
    ],
  },
  {
    level: 7,
    title: 'Technical Analysis',
    subtitle: 'Studying price charts and patterns',
    emoji: '📈',
    isFree: false,
    xpReward: 400,
    lessons: [
      {
        id: 'sm-7-1',
        title: 'RSI and MACD Explained',
        xpReward: 100,
        type: 'chart-lab',
        content: {
          intro: 'RSI and MACD are popular momentum indicators. They describe what has happened — not what will happen next.',
          sections: [
            {
              title: 'Relative Strength Index (RSI)',
              body: 'RSI measures the speed and magnitude of recent price changes, on a scale of 0–100.\n• Above 70: often labelled "overbought".\n• Below 30: often labelled "oversold".\n\nBut RSI can stay overbought for months in a strong uptrend. It is not a timing tool on its own.',
            },
            {
              title: 'MACD',
              body: 'MACD shows the relationship between two EMAs (typically 12-period and 26-period). When MACD crosses above the signal line, some traders view this as bullish. These crossovers generate many false signals.',
              tip: 'No indicator works in all market conditions. Backtesting on past data does not guarantee future performance.',
            },
          ],
          keyTakeaways: [
            'RSI above 70 = overbought zone (not a guaranteed sell signal).',
            'RSI below 30 = oversold zone (not a guaranteed buy signal).',
            'MACD crossovers generate many false signals.',
            'Indicators are tools for analysis, not crystal balls.',
          ],
        },
        quiz: [
          {
            id: 'q1',
            type: 'mcq',
            question: "NovaTech's RSI has been above 80 for 6 weeks. What does this definitively tell you?",
            options: [
              { id: 'a', text: 'The stock will fall imminently' },
              { id: 'b', text: 'The stock is in an extended uptrend — RSI reflects recent strength, not a guaranteed reversal' },
              { id: 'c', text: 'The stock is guaranteed to drop to RSI 30 soon' },
              { id: 'd', text: 'You should sell immediately' },
            ],
            correctAnswer: 'b',
            explanation: 'Strong uptrends can maintain high RSI for extended periods. RSI does not predict when or if a reversal will occur.',
          },
        ],
      },
    ],
  },
  {
    level: 8,
    title: 'Mutual Funds & Index Investing',
    subtitle: 'Diversification and passive investing',
    emoji: '🏦',
    isFree: false,
    xpReward: 350,
    lessons: [
      {
        id: 'sm-8-1',
        title: 'Understanding Mutual Funds and ETFs',
        xpReward: 90,
        type: 'lesson',
        content: {
          intro: 'Mutual funds pool money from many investors to buy a diversified portfolio of securities.',
          sections: [
            {
              title: 'How mutual funds work',
              body: "A fund manager selects securities based on the fund's mandate. The NAV (Net Asset Value) is the per-unit price, calculated daily based on the portfolio's market value. You can invest via SIP (monthly) or lump sum.",
            },
            {
              title: 'Index funds vs active funds',
              body: 'An index fund replicates a market index (like Nifty 50) without trying to beat it. Very low costs (expense ratio often 0.1–0.2%). An active fund tries to outperform the index but charges higher fees (1–2%). Research shows most active funds underperform their benchmark index after fees over 10+ year periods.',
            },
            {
              title: 'Expense ratio matters',
              body: 'An expense ratio of 1% vs 0.1% sounds small but compounds significantly. On ₹1 lakh for 30 years at 12% gross: at 0.1% cost ≈ ₹29L, at 1% cost ≈ ₹22L. A 0.9% difference costs you ₹7 lakh.',
              tip: 'Hypothetical illustration. Actual mutual fund returns vary and past performance does not guarantee future results.',
            },
          ],
          keyTakeaways: [
            'NAV = Net Asset Value per unit, calculated daily.',
            'Index funds passively track an index with low costs.',
            'Most active funds underperform their benchmark after fees.',
            'Expense ratio compounding has a large impact over decades.',
          ],
        },
        quiz: [
          {
            id: 'q1',
            type: 'mcq',
            question: 'An index fund charges 0.1% expense ratio. An active fund charges 1.5%. Gross returns are identical. Which gives you more money?',
            options: [
              { id: 'a', text: 'The active fund — professional managers add value' },
              { id: 'b', text: 'The index fund — lower fees mean more money stays with you' },
              { id: 'c', text: 'Both are the same' },
              { id: 'd', text: 'Depends only on the fund size' },
            ],
            correctAnswer: 'b',
            explanation: 'If gross returns are identical, the fund with lower fees gives higher net returns. 1.5% - 0.1% = 1.4% more per year stays in the index fund.',
          },
        ],
      },
    ],
  },
  {
    level: 9,
    title: 'Derivatives & Advanced Concepts',
    subtitle: 'Futures, options, and leverage',
    emoji: '🔮',
    isFree: false,
    xpReward: 500,
    lessons: [
      {
        id: 'sm-9-1',
        title: 'Introduction to Futures and Options',
        xpReward: 120,
        type: 'lesson',
        content: {
          intro: 'Derivatives are financial contracts whose value is derived from an underlying asset. They involve significant risk and are educational concepts only in this module.',
          sections: [
            {
              title: 'Futures contracts',
              body: "A futures contract obligates the buyer to purchase (and the seller to sell) an asset at a predetermined price on a future date. Because futures use margin (a fraction of the contract value as collateral), losses can exceed your initial investment.",
            },
            {
              title: 'Options contracts',
              body: "A Call option gives the buyer the right (not obligation) to buy the underlying asset at the strike price before expiry.\nA Put option gives the right to sell.\n\nThe buyer pays a premium. Options pricing involves time value, intrinsic value, volatility, and interest rates.",
            },
            {
              title: 'Important warnings',
              body: 'Derivatives can cause losses that exceed your initial capital. SEBI data shows ~90% of individual F&O traders in India make losses in a typical year.\n\nThis module is educational only. Do not trade derivatives without deep understanding and proper risk management.',
              tip: 'Understanding derivatives conceptually is valuable. Trading them without experience is very risky.',
            },
          ],
          keyTakeaways: [
            'Futures: obligation to buy/sell at a fixed future price.',
            'Options: right (not obligation) to buy/sell at strike price.',
            'Leverage amplifies both gains and losses.',
            'Most retail F&O traders lose money according to regulator data.',
          ],
        },
        quiz: [
          {
            id: 'q1',
            type: 'mcq',
            question: 'You buy a Call option on NovaTech, strike ₹500, premium ₹20. At expiry, NovaTech is at ₹480. What happens?',
            options: [
              { id: 'a', text: 'It expires worthless — you lose the ₹20 premium' },
              { id: 'b', text: 'You make a profit of ₹20' },
              { id: 'c', text: 'You are obligated to buy at ₹480' },
              { id: 'd', text: 'The option is worth ₹500' },
            ],
            correctAnswer: 'a',
            explanation: 'Stock price (₹480) < strike price (₹500) = out of the money. The call expires worthless. You lose the ₹20 premium.',
          },
        ],
      },
    ],
  },
  {
    level: 10,
    title: 'Market Psychology & Risk Management',
    subtitle: 'The human side of investing',
    emoji: '🧠',
    isFree: false,
    xpReward: 500,
    lessons: [
      {
        id: 'sm-10-1',
        title: 'Behavioural Biases Every Investor Should Know',
        xpReward: 100,
        type: 'lesson',
        content: {
          intro: 'Our brains are wired in ways that often work against good investment decisions.',
          sections: [
            {
              title: 'Loss aversion',
              body: 'Humans feel the pain of a loss about twice as intensely as the pleasure of an equivalent gain. This leads to: holding losing positions too long (hoping to break even), selling winners too early, and panic-selling during corrections.',
            },
            {
              title: 'Confirmation bias and FOMO',
              body: 'Confirmation bias makes us seek information that confirms what we already believe, ignoring contradicting evidence. FOMO (fear of missing out) causes investors to chase assets that have already risen sharply — often at the worst time.',
            },
            {
              title: 'Herd behaviour',
              body: "Herd behaviour is the tendency to follow what everyone else appears to be doing — buying during euphoria and selling during panic. Markets often reach extremes precisely because of herd behaviour.",
              tip: 'Building systems (like regular automatic investments and written investment plans) helps override emotional decisions.',
            },
          ],
          keyTakeaways: [
            'Loss aversion causes irrational holding of losers and premature selling of winners.',
            'Confirmation bias filters out contradicting evidence.',
            'FOMO often leads to buying at peaks.',
            'Systematic investing reduces the impact of emotional decisions.',
          ],
        },
        quiz: [
          {
            id: 'q1',
            type: 'scenario',
            question: 'You bought NovaTech at ₹400. It falls to ₹300. You hold on because "it will get back to ₹400." Which bias describes this?',
            options: [
              { id: 'a', text: 'FOMO' },
              { id: 'b', text: 'Loss aversion — refusing to realise a loss' },
              { id: 'c', text: 'Confirmation bias' },
              { id: 'd', text: 'Herd behaviour' },
            ],
            correctAnswer: 'b',
            explanation: 'Holding to break even is a classic manifestation of loss aversion (also related to the sunk cost fallacy). The original purchase price is irrelevant to future prospects.',
          },
        ],
      },
      {
        id: 'sm-10-2',
        title: 'Recognising Financial Fraud and Scams',
        xpReward: 100,
        type: 'lesson',
        content: {
          intro: 'Financial fraud is widespread. Learning to recognise it protects your hard-earned money.',
          sections: [
            {
              title: 'Pump and dump schemes',
              body: 'Fraudsters accumulate a cheap, illiquid stock, then spread false positive news (on social media, messaging groups) to create buying demand. As the price rises, they sell their holdings. The price collapses, and latecomers suffer losses.',
            },
            {
              title: 'Guaranteed returns',
              body: 'No legitimate investment guarantees fixed high returns. Anyone promising "30% guaranteed monthly returns" or "zero-risk investment" is either lying or running a fraud. Ponzi schemes pay earlier investors with later investors\' money until they collapse.',
            },
            {
              title: 'SEBI registration',
              body: 'In India, SEBI regulates securities markets. Legitimate investment advisors must be SEBI-registered. Check SEBI\'s website to verify. Never transfer money to a personal bank account for "investment."',
              tip: 'If an opportunity creates urgency, promises guaranteed returns, or came unsolicited — these are red flags.',
            },
          ],
          keyTakeaways: [
            'Guaranteed high returns do not exist in legitimate investing.',
            'Pump and dump schemes use hype to manipulate illiquid stocks.',
            'Always verify investment advisors are SEBI-registered.',
            'If it sounds too good to be true, it almost certainly is.',
          ],
        },
        quiz: [
          {
            id: 'q1',
            type: 'mcq',
            question: 'A WhatsApp message claims a small-cap stock will "3x in 3 days" and urges you to "buy before 12pm today." What should you do?',
            options: [
              { id: 'a', text: 'Buy immediately before the opportunity closes' },
              { id: 'b', text: 'Recognise this as a classic pump-and-dump warning sign and ignore it' },
              { id: 'c', text: 'Research the stock and buy if the chart looks good' },
              { id: 'd', text: 'Buy a small amount to test it' },
            ],
            correctAnswer: 'b',
            explanation: 'Artificial urgency, guaranteed outsized returns, and unsolicited tips are hallmarks of pump-and-dump schemes. Ignore completely.',
          },
        ],
      },
    ],
  },
];

module.exports = { STOCK_ACADEMY_MODULES };
