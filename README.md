# FinanceQuest 🚀

**Play Your Way to Financial Freedom.**

FinanceQuest is a complete gamified financial education platform that combines adventure gameplay with real financial learning. It brings together a Mario-style 2D platformer, a 10-level Stock Market Academy, a virtual trading terminal, budget simulations, and working financial calculators — all in one beautifully designed web application.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗺️ Adventure World Map | 10 financial worlds, 100+ missions across every finance topic |
| 🎮 2D Platformer | 5 levels where financial decisions change game outcomes (Phaser 3) |
| 📊 Stock Market Academy | 10 complete learning levels from fundamentals to market psychology |
| 💹 Virtual Trading Terminal | Paper trading with ₹1,00,000 virtual cash, candlestick charts, order book |
| 🏦 Budget Simulator | 12-month fictional salary simulation with random events |
| 🔍 Scam Detective | Investigate 4 fictional financial scam scenarios |
| 🚀 Entrepreneur Tycoon | Run a fictional tiffin business for 12 months |
| 🔢 Financial Calculators | EMI, compound interest, inflation, investment returns |
| 🏆 Gamification | XP, levels, streaks, daily quests, achievements |
| 🛡️ Admin Dashboard | Content management, user management, audit logs |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite 5**
- **Tailwind CSS 3** (custom design tokens, dark theme)
- **Framer Motion** (page transitions, animations)
- **Phaser 3** (2D platformer game engine)
- **Recharts** (financial charts)
- **Lightweight Charts** (candlestick charts)
- **Lucide React** (icons)
- **Zustand** (client state)

### Backend
- **Node.js 20+** + **Express 4**
- **MongoDB** + **Mongoose 8**
- **Firebase Admin SDK** (token verification)
- **Zod** (request validation)
- **Socket.IO** (optional live features)
- **Winston** (structured logging)
- **Jest + Supertest** (tests)

### Authentication
- **Firebase Authentication**
- Email/password, Google sign-in, password reset, email verification

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Firebase project (for authentication)

### 1. Clone and install

```bash
git clone <repo-url>
cd financequest

# Install root dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..

# Install server dependencies  
cd server && npm install && cd ..
```

### 2. Configure environment variables

```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your values:
# - MONGODB_URI
# - FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
# - PORT (default: 5000)
```

Create `client/.env` for the frontend:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=000000000000
VITE_FIREBASE_APP_ID=1:000000000000:web:000000
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### 3. Seed the database

```bash
npm run seed --workspace=server
```

This creates:
- 10 financial worlds
- 8 missions (Coin Valley + Budget City)
- 10 fictional stocks
- 14 achievements
- 5 daily quests
- Admin placeholder user (if ADMIN_EMAIL is set)

### 4. Run in development

```bash
# Start both frontend and backend
npm run dev

# Or individually:
cd server && npm run dev   # Backend on http://localhost:5000
cd client && npm run dev   # Frontend on http://localhost:5173
```

### 5. Build for production

```bash
npm run build
```

---

## 🧪 Running Tests

```bash
# Run all backend tests
npm run test --workspace=server

# Run specific test suites
cd server && npx jest --testPathPattern="calculators" --forceExit
cd server && npx jest --testPathPattern="marketData" --forceExit
cd server && npx jest --testPathPattern="api" --forceExit
```

Current test coverage: **53 tests** across calculators, market data service, and API routes.

---

## 📁 Project Structure

```
financequest/
├── client/                     # React + Vite frontend
│   └── src/
│       ├── assets/             # Images, sounds, sprites
│       ├── components/
│       │   ├── layout/         # AppLayout, Navbar, ProtectedRoute
│       │   └── ui/             # LoadingScreen, StarField
│       ├── context/            # AuthContext, GameContext
│       ├── data/               # worlds.js (static world data)
│       ├── pages/              # All page components
│       │   ├── auth/           # Login, Register, ForgotPassword
│       │   ├── DashboardPage
│       │   ├── WorldMapPage
│       │   ├── StockAcademyPage
│       │   ├── StockLessonPage
│       │   ├── TradingTerminalPage
│       │   ├── FinancialToolsPage
│       │   ├── PlatformerPage
│       │   ├── BudgetSimulatorPage
│       │   ├── ScamDetectivePage
│       │   ├── EntrepreneurPage
│       │   └── ...
│       ├── services/           # firebase.js, api.js
│       ├── store/              # useAppStore (Zustand)
│       └── styles/             # globals.css (Tailwind + custom)
│
├── server/                     # Express + MongoDB backend
│   └── src/
│       ├── config/             # database.js, firebase.js, socket.js
│       ├── controllers/        # authController
│       ├── middleware/         # auth.js (Firebase verification)
│       ├── models/             # All Mongoose schemas
│       ├── routes/v1/          # All API routes
│       ├── seeds/              # index.js, stockAcademyData.js
│       ├── services/           # marketDataService.js
│       ├── tests/              # Jest test files
│       └── utils/              # logger.js
│
├── .env.example                # Environment variable template
├── package.json                # Monorepo root
└── README.md
```

---

## 🔑 API Endpoints

### Authentication
```
GET    /api/v1/auth/me
POST   /api/v1/auth/onboarding
DELETE /api/v1/auth/account
POST   /api/v1/auth/export
```

### Worlds & Missions
```
GET  /api/v1/worlds
GET  /api/v1/worlds/:worldId
GET  /api/v1/missions/:missionId
POST /api/v1/missions/:missionId/start
POST /api/v1/missions/:missionId/complete
```

### Stock Market Academy
```
GET  /api/v1/stock-academy/modules
GET  /api/v1/stock-academy/lessons/:lessonId
POST /api/v1/stock-academy/lessons/:lessonId/complete
GET  /api/v1/stock-academy/progress
```

### Paper Trading
```
GET    /api/v1/market/stocks
GET    /api/v1/market/stocks/:stockId
GET    /api/v1/market/stocks/:stockId/history
GET    /api/v1/paper-trading/portfolio
POST   /api/v1/paper-trading/orders
GET    /api/v1/paper-trading/orders
GET    /api/v1/paper-trading/transactions
GET    /api/v1/paper-trading/performance
GET    /api/v1/paper-trading/watchlist
POST   /api/v1/paper-trading/watchlist
DELETE /api/v1/paper-trading/watchlist/:stockId
POST   /api/v1/paper-trading/reset
```

### Calculators (no auth required)
```
POST /api/v1/calculators/emi
POST /api/v1/calculators/compound-interest
POST /api/v1/calculators/inflation
POST /api/v1/calculators/investment-returns
```

### Admin (admin role required)
```
GET   /api/v1/admin/analytics
GET   /api/v1/admin/worlds
POST  /api/v1/admin/worlds
PATCH /api/v1/admin/worlds/:id
GET   /api/v1/admin/missions
POST  /api/v1/admin/missions
GET   /api/v1/admin/users
GET   /api/v1/admin/audit-logs
```

---

## 🔒 Security

- Firebase ID token verification on every protected endpoint (server-side)
- Resource-level authorization — hiding a button in React is not sufficient
- Rate limiting on all `/api` routes (configurable via env)
- Zod validation on all request bodies
- Helmet security headers
- CORS restricted to configured client URL
- Audit log for all significant actions
- Server-side XP calculation and reward validation — client cannot manipulate XP
- Server-side portfolio accounting — all trade math is server-side
- Idempotency keys on order submissions prevent duplicate trades

---

## 📊 Simulation Mode

All market data is **synthetic simulation data** by default:

- All stock prices are generated deterministically from a seed
- All companies (NovaTech, GrowthBank, EcoEnergy, etc.) are entirely fictional
- The `simulationMode: true` flag is included in every market data response
- A visible "SIMULATION MODE" badge appears in the trading terminal

To connect real market data, implement a provider adapter in `server/src/services/marketDataService.js` and set `MARKET_DATA_PROVIDER` in `.env`. The platform will function fully without it.

---

## 📝 Important Disclaimers

- All virtual money, paper-trading balances, and in-game coins are fictional with no real-world cash value
- This platform does not provide financial, investment, or tax advice
- All financial examples use fictional companies and hypothetical scenarios
- Past performance of any simulation does not predict future real-world results
- All illustrated returns are hypothetical and not guaranteed

---

## 📦 Asset Notes

- All character concepts, world themes, and game scenarios are original
- Google Fonts (Syne, Inter, JetBrains Mono, Orbitron) via CDN — subject to their open font licenses
- No copyrighted game assets, music, or sounds are included
- SVG icons from Lucide React — MIT licensed

---

## 🚢 Production Checklist

- [ ] Set all environment variables in production
- [ ] Configure Firebase with production credentials
- [ ] Point `MONGODB_URI` to a production Atlas cluster
- [ ] Run `npm run seed --workspace=server` on first deploy
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS `CLIENT_URL` to your production domain
- [ ] Set up SSL/TLS termination in your hosting provider
- [ ] Review rate limits (`RATE_LIMIT_MAX`) for production traffic
- [ ] Set up MongoDB backup schedule
- [ ] Configure log aggregation (Winston outputs JSON)
- [ ] Run `npm run build` and serve the `client/dist` folder
- [ ] Test authentication flow with production Firebase config
- [ ] Verify admin endpoint protection with a non-admin user

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a pull request

---

*FinanceQuest — Play Your Way to Financial Freedom.*
