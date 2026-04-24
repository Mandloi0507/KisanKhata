
# IMPLEMENTATION_PLAN.md

## OVERVIEW

**Project Name:** KisanKhata  
**MVP Target Date:** 6–8 Weeks  
**Approach:** Iterative development with continuous testing  

### Build Philosophy
- Code follows documentation (PRD, APP_FLOW, BACKEND_STRUCTURE)  
- No hardcoded data — all API-driven  
- AI-first, rule-based fallback only if APIs fail  
- Test after every step  
- Deploy to staging after each milestone  

---

# PHASE 1: PROJECT SETUP & FOUNDATION

## Step 1.1: Initialize Project Structure

**Duration:** 2 hours  
**Goal:** Setup monorepo with backend + 2 frontends  

### Tasks:

```bash
mkdir kisankhata && cd kisankhata

# Initialize git
git init
git add .
git commit -m "Initial commit"

# Backend
mkdir backend && cd backend
npm init -y
npm install express cors dotenv mongoose jsonwebtoken bcrypt axios

# Frontends
cd ..
npx create-next-app@latest banker-dashboard --typescript --tailwind
npx create-expo-app farmer-app
```

### Success Criteria:
- Backend server runs
- Both frontends compile
- Git initialized

---

## Step 1.2: Environment Setup

**Duration:** 1 hour  

### Tasks:
- Create `.env` in backend

```
PORT=5000
MONGO_URI=
JWT_SECRET=
OPENWEATHER_API_KEY=
NASA_API_KEY=
AGMARKNET_API_KEY=
AI_API_KEY=
MAPBOX_API_KEY=
```

### Success Criteria:
- Env variables accessible
- No secrets in code

---

## Step 1.3: Database Setup

**Duration:** 2 hours  

### Tasks:

- Setup MongoDB Atlas
- Create models:
  - Users
  - Farmers
  - Loans
  - Scores

### Success Criteria:
- DB connected
- Test CRUD works

---

# PHASE 2: DESIGN SYSTEM IMPLEMENTATION

## Step 2.1: Setup Design Tokens

**Duration:** 2 hours  

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: "#2E7D32",
        secondary: "#1565C0"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"]
      }
    }
  }
}
```

### Success Criteria:
- Tailwind working
- Professional font applied

---

## Step 2.2: Build Core Components

**Duration:** 4 hours  

### Components:
- Button
- Input
- Card
- Table
- Navbar
- Sidebar

### Success Criteria:
- Components reusable
- UI consistent

---

# PHASE 3: AUTHENTICATION SYSTEM

## Step 3.1: Backend Auth

**Duration:** 3 hours  

### Endpoints:
- POST /auth/register
- POST /auth/login

### Tasks:
- Hash password (bcrypt)
- JWT authentication

### Success Criteria:
- Registration works
- Login returns token

---

## Step 3.2: Frontend Auth

**Duration:** 3 hours  

### Tasks:
- Login UI
- Register UI
- Store JWT

### Success Criteria:
- End-to-end login flow works

---

# PHASE 4: CORE FEATURES

## Step 4.1: Farmer Data Sync (Fix Hardcoded Issue)

**Duration:** 2 hours  

### Tasks:
- Replace static data with API `/users/me`

### Success Criteria:
- Logged-in farmer data shown correctly

---

## Step 4.2: KisanScore Engine

**Duration:** 6 hours  

### APIs:
- OpenWeather
- NASA POWER
- AGMARKNET

### Endpoint:
POST /kisan-score/calculate

### Success Criteria:
- Score generated dynamically
- No mock values

---

## Step 4.3: AI Explanation

**Duration:** 3 hours  

### Endpoint:
POST /ai/explain-score

### Fallback:
- Rule-based explanation

---

## Step 4.4: Weather Integration

GET /weather/:location  

---

## Step 4.5: Mandi Prices

GET /mandi/prices  

---

## Step 4.6: Loan System

POST /loans/apply  
GET /loans  
PATCH /loans/:id  

---

## Step 4.7: Map View (Frontend Change)

**Duration:** 4 hours  

### Tasks:
- Integrate Mapbox / Leaflet
- Show India map
- Plot farmers

### Backend:
GET /maps/farmers  

### Success Criteria:
- Real India map visible
- Markers load

---

## Step 4.8: Reports (Frontend Change)

**Duration:** 4 hours  

### Tasks:
- Charts using Recharts
- Backend analytics API

GET /reports/overview  

---

## Step 4.9: Language System Fix

**Duration:** 5 hours  

### Tasks:
- Implement i18n
- Languages:
  - English
  - Hindi
  - Kannada

### Success Criteria:
- Full UI translation works

---

# PHASE 5: TESTING & REFINEMENT

## Step 5.1: Unit Tests

**Duration:** 3 hours  

Tools:
- Jest

### Success Criteria:
- Auth + APIs tested

---

## Step 5.2: Integration Tests

**Duration:** 4 hours  

Tools:
- Playwright

### Flows:
- Register → Login → Apply Loan

---

# PHASE 6: DEPLOYMENT

## Step 6.1: Staging

**Duration:** 2 hours  

- Backend: Railway
- Frontend: Vercel

---

## Step 6.2: Production

**Duration:** 2 hours  

### Tasks:
- Final testing
- Monitoring setup

---

# MILESTONES

| Milestone | Target |
|----------|--------|
| Foundation | Week 1 |
| Auth | Week 2 |
| Core Features | Week 3–5 |
| MVP Launch | Week 6–8 |

---

# RISK MITIGATION

## Technical Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| API failure | High | Fallback logic |
| AI downtime | High | Rule fallback |

## Timeline Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Scope creep | High | Stick to PRD |

---

# SUCCESS CRITERIA

- All P0 features working
- No hardcoded data
- APIs functional
- AI integrated
- Map + Reports implemented
- Multi-language working

---

# POST-MVP ROADMAP

- SMS alerts
- Satellite NDVI
- Advanced ML scoring
