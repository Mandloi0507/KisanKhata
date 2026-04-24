# IMPLEMENTATION_PLAN.md

## OVERVIEW

**Project Name:** KisanKhata  
**MVP Target:** 6–8 weeks  
**Team Size:** 2–4 developers  

**Build Philosophy:**
- Documentation-first approach
- No hardcoded data
- API-first architecture
- AI-first with fallback logic
- Iterative + testable builds

---

## ARCHITECTURE

**2 Frontends + 1 Backend (Modular Monolith)**

Modules:
- auth
- users
- farmers
- bankers
- loans
- kisan-score
- weather
- mandi
- ai
- reports
- maps
- i18n

---

## PHASE 1: PROJECT SETUP

### Step 1.1 Initialize Project

```bash
mkdir kisankhata
cd kisankhata
mkdir backend banker-dashboard farmer-app
cd backend
npm init -y
npm install express cors dotenv mongoose jsonwebtoken bcrypt axios
npm install -D nodemon typescript ts-node
```

**Success Criteria:**
- Backend server runs
- Folder structure ready

---

### Step 1.2 Environment Setup

.env example:

```
PORT=5000
MONGO_URI=
JWT_SECRET=
OPENWEATHER_API_KEY=
NASA_API_KEY=
AGMARKNET_API_KEY=
AI_API_KEY=
```

---

### Step 1.3 Database Setup

Collections:
- Users
- Farmers
- Loans

**Success Criteria:**
- DB connected
- CRUD works

---

## PHASE 2: DESIGN SYSTEM

### Step 2.1 Tailwind Setup

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: "#2E7D32"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"]
      }
    }
  }
}
```

---

## PHASE 3: AUTH SYSTEM

### Backend

Endpoints:
- POST /auth/register
- POST /auth/login

### Frontend
- Login & Register pages
- JWT storage

---

## PHASE 4: CORE FEATURES

### Farmer Data Sync
- Replace hardcoded data with API

### KisanScore API
- POST /kisan-score/calculate

### AI Explanation
- POST /ai/explain-score

### Weather
- GET /weather/:location

### Mandi
- GET /mandi/prices

### Loans
- POST /loans/apply
- GET /loans
- PATCH /loans/:id

---

### Map View (Frontend Change)

- Integrate Mapbox / Leaflet
- Backend: GET /maps/farmers

---

### Reports (Frontend Change)

- Charts using Recharts
- Backend: GET /reports/overview

---

### Language Fix (Critical)

- Add i18n (Hindi, Kannada, English)

---

## PHASE 5: TESTING

- Unit tests (Jest)
- Integration tests (Playwright)

---

## PHASE 6: DEPLOYMENT

- Backend: Render / Railway
- Frontend: Vercel

---

## MILESTONES

- Week 1: Setup
- Week 2: Auth
- Week 3: APIs
- Week 5: Integration
- Week 6–8: Launch

---

## SUCCESS CRITERIA

- No hardcoded data
- APIs working
- AI integrated
- Map & Reports live
- Multi-language working

---

## POST MVP

- Advanced ML scoring
- SMS alerts
- Satellite data
