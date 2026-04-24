# KisanKhata — Backend Structure Documentation

> **Project**: KisanKhata — AI-Powered Farmer Credit Intelligence System  
> **Version**: 1.0 (Hackathon MVP)  
> **Last Updated**: April 24, 2026  
> **Stack**: Python 3.12 · FastAPI · SQLAlchemy · SQLite (MVP) / PostgreSQL (Prod) · Uvicorn  
> **Owner**: Team Utkarsh

---

## 1. Architecture Overview

### System Architecture Pattern

```
Pattern:   RESTful API (Modular Monolith)
Strategy:  API-First — all business logic is exposed via versioned endpoints
Auth:      JWT Bearer tokens (HTTP Authorization header)
Data Flow: Client → FastAPI Router → Service Layer → Repository → SQLAlchemy ORM → SQLite/PostgreSQL
Async:     Celery + Redis Queue for score generation jobs (heavy ML inference)
Caching:   District-level response caching via in-memory dict (MVP) → Redis TTL (Prod)
```

### High-Level Data Flow

```
[Farmer Mobile App / Bank Web Dashboard]
         │
         ▼
[FastAPI API Gateway — /api/v1/...]
    ├── Auth Middleware (JWT validation)
    ├── Rate Limiter (SlowAPI)
    └── Request Validator (Pydantic v2)
         │
         ▼
[Service Layer]
    ├── FarmerService       → Onboarding, profile CRUD
    ├── ScoringService      → KisanScore orchestration (XGBoost + RF ensemble)
    ├── WeatherService      → NASA POWER + OpenWeatherMap API calls
    ├── MandiService        → AGMARKNET price fetch
    ├── XAIService          → SHAP breakdown + Claude API summary
    ├── LoanService         → Score-to-loan-band mapping
    ├── DistressService     → Nightly distress detection job
    └── BankOfficerService  → Application review, approve/reject, analytics
         │
         ▼
[Repository / ORM Layer — SQLAlchemy]
         │
         ▼
[Database — SQLite (MVP) / PostgreSQL 16 (Prod)]
         │
         ├── External APIs (OpenWeatherMap, NASA POWER, AGMARKNET, Anthropic Claude)
         └── Job Queue (Celery + Redis) for async score generation
```

### Deployment (Hackathon MVP)

| Component | Platform |
|-----------|----------|
| Backend API | Render / Railway (free tier) |
| Database | SQLite file (MVP) → Supabase PostgreSQL (Prod) |
| Frontend | Vercel |
| ML Inference | Inline FastAPI process (single CPU) |
| Queue | In-process background task (FastAPI BackgroundTasks for MVP) |

---

## 2. Project Folder Structure

```
kisankhata-backend/
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI app entry point
│   ├── config.py                   # Settings via pydantic-settings
│   ├── database.py                 # SQLAlchemy engine + session
│   │
│   ├── models/                     # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── farmer.py
│   │   ├── bank_officer.py
│   │   ├── kisan_score.py
│   │   ├── loan_application.py
│   │   ├── distress_flag.py
│   │   ├── audit_log.py
│   │   └── scheme_enrollment.py
│   │
│   ├── schemas/                    # Pydantic request/response schemas
│   │   ├── __init__.py
│   │   ├── farmer.py
│   │   ├── bank_officer.py
│   │   ├── score.py
│   │   ├── loan.py
│   │   └── common.py
│   │
│   ├── routers/                    # FastAPI route handlers
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── farmers.py
│   │   ├── scores.py
│   │   ├── loans.py
│   │   ├── bank_dashboard.py
│   │   ├── distress.py
│   │   └── analytics.py
│   │
│   ├── services/                   # Business logic layer
│   │   ├── __init__.py
│   │   ├── farmer_service.py
│   │   ├── scoring_service.py
│   │   ├── weather_service.py
│   │   ├── mandi_service.py
│   │   ├── xai_service.py
│   │   ├── loan_service.py
│   │   ├── distress_service.py
│   │   └── bank_service.py
│   │
│   ├── ml/                         # ML model + inference
│   │   ├── __init__.py
│   │   ├── model.py                # XGBoost + RandomForest ensemble
│   │   ├── features.py             # Feature engineering
│   │   ├── shap_explainer.py       # SHAP value computation
│   │   └── score_bands.py          # Score → loan band mapping config
│   │
│   ├── external/                   # Third-party API clients
│   │   ├── __init__.py
│   │   ├── nasa_power.py
│   │   ├── openweathermap.py
│   │   ├── agmarknet.py
│   │   └── claude_api.py
│   │
│   ├── middleware/
│   │   ├── auth_middleware.py
│   │   └── rate_limiter.py
│   │
│   └── utils/
│       ├── encryption.py           # AES-256 Aadhaar field encryption
│       ├── jwt_utils.py
│       ├── validators.py
│       └── cache.py                # District-level API response cache
│
├── migrations/                     # Alembic migration files
├── tests/
├── .env.example
├── requirements.txt
└── README.md
```

---

## 3. Database Schema

**Database**: SQLite (MVP) / PostgreSQL 16 (Production)  
**ORM**: SQLAlchemy 2.x with Alembic migrations  
**Naming Convention**: `snake_case` for all tables and columns  
**Timestamps**: All tables include `created_at`, `updated_at`  
**Encryption**: `aadhaar_number` is AES-256 encrypted at rest; all UI/API responses show masked value (first 8 digits → `XXXXXXXX`)

---

### Table: `farmers`

**Purpose**: Stores farmer registration profiles — the core identity record for the KisanKhata system.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid4 | Unique farmer identifier |
| `farmer_id` | VARCHAR(20) | UNIQUE, NOT NULL | Human-readable ID (e.g., KK-2026-00001) |
| `aadhaar_encrypted` | TEXT | NOT NULL | AES-256 encrypted Aadhaar number |
| `aadhaar_hash` | VARCHAR(64) | UNIQUE, NOT NULL | SHA-256 hash for duplicate detection (no PII) |
| `full_name` | VARCHAR(255) | NOT NULL | Farmer's full name |
| `mobile_number` | VARCHAR(15) | NOT NULL | Registered mobile (for SMS delivery) |
| `state` | VARCHAR(100) | NOT NULL | State (e.g., Madhya Pradesh) |
| `district` | VARCHAR(100) | NOT NULL | District (e.g., Vidisha) |
| `district_lat` | FLOAT | NOT NULL | District centroid latitude (for API calls) |
| `district_lng` | FLOAT | NOT NULL | District centroid longitude (for API calls) |
| `primary_crop` | VARCHAR(100) | NOT NULL | Primary crop (e.g., Wheat) |
| `secondary_crop` | VARCHAR(100) | NULL | Secondary crop (optional) |
| `land_area_acres` | FLOAT | NOT NULL | Total land holding in acres |
| `preferred_language` | VARCHAR(10) | DEFAULT 'hi' | 'hi' (Hindi) or 'en' (English) |
| `is_active` | BOOLEAN | DEFAULT TRUE | Soft delete flag |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Registration timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes**:
- `PRIMARY KEY` on `id`
- `idx_farmers_aadhaar_hash` ON (`aadhaar_hash`) — UNIQUE, for duplicate registration check
- `idx_farmers_farmer_id` ON (`farmer_id`) — UNIQUE
- `idx_farmers_district` ON (`district`) — for district-level analytics
- `idx_farmers_state_district` ON (`state`, `district`) — composite for regional queries

**Relationships**:
- One farmer → many `kisan_scores`
- One farmer → many `loan_applications`
- One farmer → one or zero `distress_flags`
- One farmer → one or zero `scheme_enrollments`

---

### Table: `kisan_scores`

**Purpose**: Stores every KisanScore generation event — one record per scoring run per farmer. Supports score history timeline (Feature 12).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid4 | Unique score record ID |
| `farmer_id` | UUID | FOREIGN KEY → farmers(id) ON DELETE CASCADE, NOT NULL | Owning farmer |
| `score` | INTEGER | NOT NULL, CHECK(score >= 0 AND score <= 1000) | Final KisanScore (0–1000) |
| `score_category` | VARCHAR(20) | NOT NULL | 'Poor', 'Fair', 'Good', 'Excellent' |
| `is_estimated` | BOOLEAN | DEFAULT FALSE | True if computed from fallback district averages |
| `crop_season` | VARCHAR(20) | NOT NULL | 'Kharif_2025', 'Rabi_2025', etc. |
| `ndvi_subscore` | INTEGER | NULL | Crop health sub-score (0–200) |
| `weather_subscore` | INTEGER | NULL | Rainfall risk sub-score (0–200) |
| `income_subscore` | INTEGER | NULL | Income potential sub-score (0–200) |
| `land_subscore` | INTEGER | NULL | Land area sub-score (0–200) |
| `scheme_subscore` | INTEGER | NULL | Govt scheme enrollment sub-score (0–200) |
| `ndvi_value` | FLOAT | NULL | Raw NDVI value from satellite data |
| `rainfall_mm` | FLOAT | NULL | Seasonal rainfall in mm |
| `estimated_revenue_inr` | FLOAT | NULL | Computed seasonal revenue estimate (₹) |
| `mandi_price_inr` | FLOAT | NULL | Mandi price per quintal used in calculation |
| `shap_json` | TEXT | NULL | JSON blob of SHAP feature importances |
| `xai_summary_hi` | TEXT | NULL | Claude-generated Hindi XAI summary |
| `xai_summary_en` | TEXT | NULL | Claude-generated English XAI summary |
| `data_sources` | TEXT | NULL | JSON metadata of APIs used + fallback flags |
| `generated_at` | TIMESTAMP | DEFAULT NOW() | Score generation timestamp |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes**:
- `PRIMARY KEY` on `id`
- `idx_kisan_scores_farmer_id` ON (`farmer_id`)
- `idx_kisan_scores_farmer_season` ON (`farmer_id`, `crop_season`) — UNIQUE per farmer per season
- `idx_kisan_scores_generated_at` ON (`generated_at` DESC)
- `idx_kisan_scores_district_score` ON (`score`) — for analytics queries

**Relationships**:
- `farmer_id` → `farmers.id` (many-to-one)
- One score → one `loan_applications` record (auto-generated)

---

### Table: `loan_applications`

**Purpose**: Tracks every loan application submitted by a farmer to a bank, including the AI recommendation and the bank officer's decision.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid4 | Unique application ID |
| `farmer_id` | UUID | FOREIGN KEY → farmers(id) ON DELETE CASCADE, NOT NULL | Applying farmer |
| `score_id` | UUID | FOREIGN KEY → kisan_scores(id) ON DELETE SET NULL | Score used for this application |
| `bank_id` | UUID | FOREIGN KEY → banks(id) ON DELETE CASCADE, NOT NULL | Target bank |
| `idempotency_key` | VARCHAR(64) | UNIQUE, NOT NULL | Prevents duplicate submissions |
| `recommended_amount_min_inr` | INTEGER | NOT NULL | Lower bound of recommended loan (₹) |
| `recommended_amount_max_inr` | INTEGER | NOT NULL | Upper bound of recommended loan (₹) |
| `recommended_rate_percent` | FLOAT | NOT NULL | Indicative interest rate (% p.a.) |
| `approved_amount_inr` | INTEGER | NULL | Actual approved amount (set by officer) |
| `approved_rate_percent` | FLOAT | NULL | Actual approved rate (set by officer) |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | 'pending', 'approved', 'rejected' |
| `ledger_check_result` | VARCHAR(50) | NULL | 'clear', 'duplicate_detected', 'error' |
| `ledger_check_detail` | TEXT | NULL | JSON with detected bank name if duplicate |
| `decision_comment` | TEXT | NULL | Bank officer's mandatory decision comment |
| `decided_by_officer_id` | UUID | FOREIGN KEY → bank_officers(id) ON DELETE SET NULL | Officer who decided |
| `decided_at` | TIMESTAMP | NULL | Timestamp of approve/reject |
| `rejection_reason_hi` | TEXT | NULL | Plain-language rejection reason in Hindi |
| `rejection_reason_en` | TEXT | NULL | Plain-language rejection reason in English |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Application submission timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes**:
- `PRIMARY KEY` on `id`
- `idx_loan_apps_farmer_id` ON (`farmer_id`)
- `idx_loan_apps_bank_id` ON (`bank_id`)
- `idx_loan_apps_status` ON (`status`)
- `idx_loan_apps_idempotency` ON (`idempotency_key`) — UNIQUE
- `idx_loan_apps_bank_status` ON (`bank_id`, `status`) — for dashboard list queries
- `idx_loan_apps_created_at` ON (`created_at` DESC)

**Relationships**:
- `farmer_id` → `farmers.id`
- `score_id` → `kisan_scores.id`
- `bank_id` → `banks.id`
- `decided_by_officer_id` → `bank_officers.id`
- One application → many `audit_logs` (decision audit trail)

---

### Table: `banks`

**Purpose**: Tenant registry for partner banks. Each bank has an isolated namespace for applications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid4 | Unique bank ID |
| `bank_code` | VARCHAR(20) | UNIQUE, NOT NULL | Short code (e.g., 'NASHIK_GRB') |
| `bank_name` | VARCHAR(255) | NOT NULL | Full bank name |
| `state` | VARCHAR(100) | NOT NULL | Bank's operating state |
| `contact_email` | VARCHAR(255) | NOT NULL | Primary contact email |
| `is_active` | BOOLEAN | DEFAULT TRUE | Partner status |
| `score_band_config` | TEXT | NULL | JSON override of default loan band matrix |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Onboarding timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |

**Indexes**:
- `PRIMARY KEY` on `id`
- `idx_banks_bank_code` ON (`bank_code`) — UNIQUE

**Relationships**:
- One bank → many `bank_officers`
- One bank → many `loan_applications`

---

### Table: `bank_officers`

**Purpose**: Stores authenticated bank officer accounts. Role-based access is scoped per bank (tenant isolation).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid4 | Unique officer ID |
| `bank_id` | UUID | FOREIGN KEY → banks(id) ON DELETE CASCADE, NOT NULL | Officer's bank (tenant) |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Login email |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt hash (12 rounds) |
| `full_name` | VARCHAR(255) | NOT NULL | Officer's full name |
| `role` | VARCHAR(20) | DEFAULT 'officer' | 'officer', 'manager', 'admin' |
| `failed_login_attempts` | INTEGER | DEFAULT 0 | Lockout counter |
| `locked_until` | TIMESTAMP | NULL | Account locked until this time |
| `last_login_at` | TIMESTAMP | NULL | Last successful login |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active status |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Account creation |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |

**Indexes**:
- `PRIMARY KEY` on `id`
- `idx_bank_officers_email` ON (`email`) — UNIQUE
- `idx_bank_officers_bank_id` ON (`bank_id`)

**Relationships**:
- `bank_id` → `banks.id`
- One officer → many `loan_applications` (as `decided_by_officer_id`)
- One officer → many `audit_logs`

---

### Table: `sessions`

**Purpose**: Tracks active JWT refresh tokens for bank officers. Enables session invalidation and multi-device support.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid4 | Session ID |
| `officer_id` | UUID | FOREIGN KEY → bank_officers(id) ON DELETE CASCADE | Session owner |
| `refresh_token_hash` | VARCHAR(64) | UNIQUE, NOT NULL | SHA-256 hash of refresh token |
| `user_agent` | TEXT | NULL | Browser/device info |
| `ip_address` | VARCHAR(45) | NULL | IPv4/IPv6 address |
| `expires_at` | TIMESTAMP | NOT NULL | Token expiry (8 hours from creation) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Session start |

**Indexes**:
- `PRIMARY KEY` on `id`
- `idx_sessions_officer_id` ON (`officer_id`)
- `idx_sessions_refresh_hash` ON (`refresh_token_hash`) — UNIQUE
- `idx_sessions_expires_at` ON (`expires_at`) — for cleanup cron

**Cleanup**: Background task deletes expired sessions daily.

---

### Table: `distress_flags`

**Purpose**: Stores active distress detection records for at-risk farmers. One active flag per farmer at a time.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid4 | Flag record ID |
| `farmer_id` | UUID | FOREIGN KEY → farmers(id) ON DELETE CASCADE, UNIQUE | One active flag per farmer |
| `drought_triggered` | BOOLEAN | NOT NULL | Drought warning present in district |
| `score_drop_triggered` | BOOLEAN | NOT NULL | Score dropped ≥100 points from last season |
| `no_insurance_triggered` | BOOLEAN | NOT NULL | No PMFBY enrollment found |
| `score_current` | INTEGER | NOT NULL | KisanScore at time of flag |
| `score_previous` | INTEGER | NULL | KisanScore from previous season |
| `status` | VARCHAR(20) | DEFAULT 'active' | 'active', 'acknowledged', 'in_progress', 'resolved', 'false_positive' |
| `acknowledged_by_officer_id` | UUID | FOREIGN KEY → bank_officers(id) ON DELETE SET NULL | Officer who acknowledged |
| `acknowledged_at` | TIMESTAMP | NULL | Acknowledgement timestamp |
| `officer_action_note` | TEXT | NULL | Officer's comment/action taken |
| `data_quality_warning` | BOOLEAN | DEFAULT FALSE | True if stale data used |
| `flagged_at` | TIMESTAMP | DEFAULT NOW() | When flag was raised |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Record creation |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last status change |

**Indexes**:
- `PRIMARY KEY` on `id`
- `idx_distress_farmer_id` ON (`farmer_id`) — UNIQUE (one active flag per farmer)
- `idx_distress_status` ON (`status`)
- `idx_distress_flagged_at` ON (`flagged_at`)

---

### Table: `scheme_enrollments`

**Purpose**: Stores government scheme enrollment status (PM-KISAN, PMFBY) per farmer — used as a scoring factor and distress signal.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid4 | Record ID |
| `farmer_id` | UUID | FOREIGN KEY → farmers(id) ON DELETE CASCADE, UNIQUE, NOT NULL | One record per farmer |
| `pm_kisan_enrolled` | VARCHAR(20) | DEFAULT 'unknown' | 'enrolled', 'not_enrolled', 'unknown' |
| `pmfby_enrolled` | VARCHAR(20) | DEFAULT 'unknown' | 'enrolled', 'not_enrolled', 'unknown' |
| `pm_kisan_last_checked_at` | TIMESTAMP | NULL | Last API/mock check timestamp |
| `pmfby_last_checked_at` | TIMESTAMP | NULL | Last API/mock check timestamp |
| `data_source` | VARCHAR(50) | DEFAULT 'mock' | 'mock', 'api' |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Record creation |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |

---

### Table: `audit_logs`

**Purpose**: Immutable append-only log of all approve/reject decisions, distress acknowledgements, and sensitive operations. No DELETE permissions on this table.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid4 | Log entry ID |
| `event_type` | VARCHAR(50) | NOT NULL | 'loan_approved', 'loan_rejected', 'distress_acknowledged', 'distress_cleared', 'flag_raised' |
| `actor_id` | UUID | NOT NULL | ID of officer or system performing action |
| `actor_type` | VARCHAR(20) | NOT NULL | 'bank_officer', 'system' |
| `target_entity_type` | VARCHAR(50) | NOT NULL | 'loan_application', 'distress_flag', 'farmer' |
| `target_entity_id` | UUID | NOT NULL | ID of the affected record |
| `payload_json` | TEXT | NOT NULL | Full JSON snapshot of the change (before/after) |
| `ip_address` | VARCHAR(45) | NULL | Actor's IP address |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Event timestamp (immutable) |

**Indexes**:
- `PRIMARY KEY` on `id`
- `idx_audit_target_entity` ON (`target_entity_type`, `target_entity_id`)
- `idx_audit_actor_id` ON (`actor_id`)
- `idx_audit_event_type` ON (`event_type`)
- `idx_audit_created_at` ON (`created_at` DESC)

**Constraints**: Application-level enforcement — no UPDATE or DELETE operations are permitted on this table.

---

### Entity Relationship Summary

```
banks ──────< bank_officers >──── sessions
  │                │
  │                └──── audit_logs
  │
  └──────< loan_applications >──── kisan_scores
                │                        │
             farmers <──────────────────┘
                │
                ├──── distress_flags
                └──── scheme_enrollments
```

---

## 4. API Endpoints

**Base URL**: `/api/v1`  
**Content-Type**: `application/json`  
**Auth Header**: `Authorization: Bearer {access_token}` (where required)

---

### Authentication Endpoints

#### `POST /api/v1/auth/login`

**Purpose**: Authenticate bank officer and return JWT access + refresh tokens.  
**Auth**: Public

**Request Body**:
```json
{
  "email": "priya.nair@nashikgrb.in",
  "password": "SecurePass123!"
}
```

**Validation**:
- `email`: Valid format, max 255 chars
- `password`: 8–128 characters

**Response (200)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "officer": {
    "id": "uuid",
    "email": "priya.nair@nashikgrb.in",
    "full_name": "Priya Nair",
    "bank_id": "uuid",
    "bank_name": "Nashik Grameen Bank",
    "role": "officer"
  }
}
```

**Errors**:
- `401`: Invalid credentials
- `403`: Account locked (failed_login_attempts ≥ 3; retry after locked_until)
- `429`: Rate limited (5 attempts per 15 min per IP)

**Side Effects**:
- Updates `bank_officers.last_login_at`
- Creates `sessions` record with hashed refresh token
- Resets `failed_login_attempts` on success
- Increments `failed_login_attempts` on failure; sets `locked_until` after 3 fails

---

#### `POST /api/v1/auth/refresh`

**Purpose**: Exchange refresh token for a new access token.  
**Auth**: Refresh token in request body

**Request Body**:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors**:
- `401`: Invalid or expired refresh token
- `401`: Session not found (logged out)

---

#### `POST /api/v1/auth/logout`

**Purpose**: Invalidate current session (delete refresh token).  
**Auth**: Bearer token

**Response (200)**:
```json
{ "message": "Logged out successfully." }
```

**Side Effects**: Deletes `sessions` record for the current `refresh_token_hash`.

---

#### `POST /api/v1/auth/reset-password`

**Purpose**: Initiate password reset via email OTP.  
**Auth**: Public

**Request Body**:
```json
{ "email": "priya.nair@nashikgrb.in" }
```

**Response (200)**:
```json
{ "message": "Password reset OTP sent to registered email." }
```

---

### Farmer Endpoints

#### `POST /api/v1/farmers/register`

**Purpose**: Register a new farmer and trigger KisanScore generation.  
**Auth**: Public (farmer self-registers via mobile app)

**Request Body**:
```json
{
  "full_name": "Ramesh Kumar",
  "aadhaar_number": "123456789012",
  "mobile_number": "9876543210",
  "state": "Madhya Pradesh",
  "district": "Vidisha",
  "primary_crop": "Wheat",
  "secondary_crop": "Soybean",
  "land_area_acres": 2.5,
  "preferred_language": "hi"
}
```

**Validation**:
- `aadhaar_number`: Exactly 12 digits
- `mobile_number`: 10-digit Indian mobile number
- `land_area_acres`: Float, 0.1–1000
- `state`: Must match valid Indian state list
- `district`: Must match valid district list for the given state
- `primary_crop`: Non-empty, max 100 chars

**Response (201)**:
```json
{
  "farmer_id": "KK-2026-00001",
  "message": "Registration successful. Generating your KisanScore...",
  "score_status": "processing",
  "estimated_wait_seconds": 30
}
```

**Errors**:
- `400`: Validation failed (inline field errors)
- `409`: Aadhaar already registered — "This Aadhaar is already linked to a profile. Please log in."

**Side Effects**:
- Creates `farmers` record (Aadhaar AES-256 encrypted, SHA-256 hash indexed)
- Triggers background task: `ScoringService.generate_score(farmer_id)`
- Checks `scheme_enrollments` mock data and creates record

---

#### `GET /api/v1/farmers/{farmer_id}/dashboard`

**Purpose**: Fetch farmer dashboard data — score, loan offer, distress flag.  
**Auth**: Farmer OTP session (MVP: farmer_id + mobile OTP)

**Response (200)**:
```json
{
  "farmer_id": "KK-2026-00001",
  "full_name": "Ramesh Kumar",
  "district": "Vidisha",
  "latest_score": {
    "score": 720,
    "score_category": "Good",
    "is_estimated": false,
    "crop_season": "Rabi_2025",
    "generated_at": "2026-04-24T10:30:00Z",
    "sub_scores": {
      "crop_health": 158,
      "weather_risk": 120,
      "income_potential": 180,
      "land_size": 140,
      "scheme_enrollment": 122
    }
  },
  "loan_offer": {
    "amount_min_inr": 75000,
    "amount_max_inr": 120000,
    "rate_percent": 9.0,
    "score_band": "Good"
  },
  "distress_flag": null,
  "scheme_status": {
    "pm_kisan": "enrolled",
    "pmfby": "enrolled"
  },
  "aadhaar_masked": "XXXXXXXX9012"
}
```

**Errors**:
- `404`: Farmer not found
- `202`: Score still processing — `{ "score_status": "processing" }`

---

#### `GET /api/v1/farmers/{farmer_id}/score-history`

**Purpose**: Return past score snapshots for the score timeline (Feature 12).  
**Auth**: Farmer OTP session

**Response (200)**:
```json
{
  "farmer_id": "KK-2026-00001",
  "history": [
    {
      "score": 680,
      "score_category": "Good",
      "crop_season": "Kharif_2025",
      "generated_at": "2025-09-01T08:00:00Z"
    },
    {
      "score": 720,
      "score_category": "Good",
      "crop_season": "Rabi_2025",
      "generated_at": "2026-04-24T10:30:00Z"
    }
  ],
  "message": null
}
```

**Note**: If fewer than 2 data points, `message` = "More history will appear after your next season."

---

#### `GET /api/v1/farmers/{farmer_id}/xai-report`

**Purpose**: Return the SHAP explainability report and Claude-generated summary for the latest score.  
**Auth**: Farmer OTP session

**Response (200)**:
```json
{
  "farmer_id": "KK-2026-00001",
  "score": 720,
  "crop_season": "Rabi_2025",
  "factors": [
    {
      "label": "Crop Health (Wheat, Vidisha)",
      "label_hi": "फसल स्वास्थ्य (गेहूं, विदिशा)",
      "impact": "positive",
      "contribution_points": +42,
      "description_en": "Your wheat crop health is above the district average.",
      "description_hi": "आपकी गेहूं की फसल का स्वास्थ्य जिले के औसत से बेहतर है।"
    },
    {
      "label": "Rainfall Risk",
      "label_hi": "वर्षा जोखिम",
      "impact": "negative",
      "contribution_points": -28,
      "description_en": "Your district had below-average rainfall this season.",
      "description_hi": "इस मौसम में आपके जिले में औसत से कम बारिश हुई।"
    }
  ],
  "ai_summary_en": "Ramesh Kumar is a strong candidate with above-average crop health and a good repayment profile. Moderate rainfall risk is offset by active crop insurance enrollment.",
  "ai_summary_hi": "रमेश कुमार एक मजबूत उम्मीदवार हैं जिनकी फसल स्वास्थ्य औसत से बेहतर है। वर्षा जोखिम को सक्रिय फसल बीमा से संतुलित किया गया है।",
  "data_sources": {
    "ndvi": "NASA POWER API",
    "rainfall": "OpenWeatherMap",
    "mandi_price": "AGMARKNET",
    "scheme": "Mock Data"
  }
}
```

---

#### `GET /api/v1/farmers/{farmer_id}/credit-passport`

**Purpose**: Generate and return the Farmer Credit Passport PDF (Feature 11).  
**Auth**: Farmer OTP session

**Response (200)**: Binary PDF file with headers:
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="KisanKhata_Passport_KK-2026-00001.pdf"
```

---

#### `GET /api/v1/farmers/{farmer_id}/benchmark`

**Purpose**: Return regional score comparison (Feature 15).  
**Auth**: Farmer OTP session

**Response (200)**:
```json
{
  "farmer_score": 720,
  "district": "Vidisha",
  "district_average": 695,
  "state_average": 682,
  "district_sample_size": 47,
  "message": null
}
```

---

### Score Generation Endpoints

#### `POST /api/v1/scores/generate`

**Purpose**: Manually trigger score regeneration for a farmer (used internally and for season refresh).  
**Auth**: Internal (system-level) or Bank Officer Bearer token

**Request Body**:
```json
{ "farmer_id": "KK-2026-00001" }
```

**Response (202)**:
```json
{
  "message": "Score generation queued.",
  "farmer_id": "KK-2026-00001",
  "estimated_wait_seconds": 30
}
```

**Side Effects**:
- Calls `WeatherService`, `MandiService`, `ScoringService`, `XAIService` in sequence
- Stores new `kisan_scores` record
- Auto-generates `loan_applications` recommendation record
- Checks distress conditions and raises flag if needed

---

#### `GET /api/v1/scores/{farmer_id}/status`

**Purpose**: Poll score generation status (for loading screen on mobile).  
**Auth**: Public (farmer_id only, no PII returned)

**Response (200)**:
```json
{
  "status": "complete",
  "score": 720,
  "score_category": "Good"
}
```
or:
```json
{ "status": "processing" }
```

---

### Bank Dashboard Endpoints

#### `GET /api/v1/bank/applications`

**Purpose**: Paginated list of all loan applications for the authenticated officer's bank (Feature B2).  
**Auth**: Bank Officer Bearer token

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `limit` | int | 20 | Rows per page (20 / 50 / 100) |
| `sort_by` | string | `created_at` | `score`, `created_at` |
| `sort_order` | string | `desc` | `asc`, `desc` |
| `score_category` | string | null | Filter: Poor / Fair / Good / Excellent |
| `district` | string | null | Filter by district name |
| `distress_only` | bool | false | Show only distress-flagged applications |
| `status` | string | null | `pending`, `approved`, `rejected` |

**Response (200)**:
```json
{
  "applications": [
    {
      "application_id": "uuid",
      "farmer_id": "KK-2026-00001",
      "farmer_name": "Ramesh Kumar",
      "district": "Vidisha",
      "score": 720,
      "score_category": "Good",
      "recommended_amount_max_inr": 120000,
      "distress_flag": false,
      "status": "pending",
      "created_at": "2026-04-24T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 87,
    "pages": 5
  }
}
```

**Caching**:
- Cache key: `bank:{bank_id}:applications:page:{page}:filters:{hash}`
- TTL: 60 seconds
- Invalidate on: new application submitted, any decision recorded

---

#### `GET /api/v1/bank/applications/{application_id}`

**Purpose**: Full detail view for a single farmer application (Feature B3).  
**Auth**: Bank Officer Bearer token (must belong to same bank as application)

**Response (200)**:
```json
{
  "application_id": "uuid",
  "farmer": {
    "farmer_id": "KK-2026-00001",
    "full_name": "Ramesh Kumar",
    "aadhaar_masked": "XXXXXXXX9012",
    "district": "Vidisha",
    "state": "Madhya Pradesh",
    "primary_crop": "Wheat",
    "land_area_acres": 2.5
  },
  "score": {
    "score": 720,
    "score_category": "Good",
    "crop_season": "Rabi_2025",
    "sub_scores": {
      "crop_health": 158,
      "weather_risk": 120,
      "income_potential": 180,
      "land_size": 140,
      "scheme_enrollment": 122
    },
    "estimated_revenue_inr": 98000
  },
  "xai": {
    "factors": [...],
    "ai_summary_en": "Ramesh Kumar is a reliable candidate..."
  },
  "loan_recommendation": {
    "amount_min_inr": 75000,
    "amount_max_inr": 120000,
    "rate_percent": 9.0
  },
  "ledger_check": {
    "result": "clear",
    "detail": null
  },
  "distress_flag": null,
  "scheme_status": {
    "pm_kisan": "enrolled",
    "pmfby": "enrolled"
  },
  "status": "pending",
  "created_at": "2026-04-24T10:30:00Z"
}
```

**Errors**:
- `403`: Application belongs to a different bank (tenant isolation)
- `404`: Application not found

---

#### `POST /api/v1/bank/applications/{application_id}/decide`

**Purpose**: Bank officer approves or rejects a loan application (Feature B4). Immutable once submitted.  
**Auth**: Bank Officer Bearer token

**Request Body**:
```json
{
  "decision": "approved",
  "approved_amount_inr": 100000,
  "approved_rate_percent": 9.0,
  "comment": "Good crop health; rainfall risk mitigated by PMFBY enrollment. Approved for Kisan Credit Card."
}
```

**Validation**:
- `decision`: `approved` or `rejected`
- `comment`: 10–500 characters (mandatory)
- `approved_amount_inr`: Required if `approved`; must be within ±20% of `recommended_amount_max_inr`
- Application must be in `pending` status (cannot re-decide)

**Response (200)**:
```json
{
  "application_id": "uuid",
  "status": "approved",
  "decided_at": "2026-04-24T11:00:00Z",
  "message": "Decision recorded. Farmer will be notified via SMS."
}
```

**Errors**:
- `400`: Comment too short, or `approved_amount_inr` out of permitted range
- `409`: Application already decided — "This application has already been decided and cannot be modified."
- `403`: Officer not authorised for this bank

**Side Effects**:
- Updates `loan_applications.status`, `decided_at`, `decision_comment`
- Writes immutable record to `audit_logs`
- Triggers SMS notification to farmer (via MSG91 / background task)
- If decision is `rejected`, stores `rejection_reason_hi` and `rejection_reason_en` using Claude API

---

### Distress Management Endpoints

#### `GET /api/v1/bank/distress`

**Purpose**: List all active distress flags for the officer's bank (Feature B5).  
**Auth**: Bank Officer Bearer token

**Query Parameters**: `status` (active / acknowledged / in_progress / resolved)

**Response (200)**:
```json
{
  "distress_alerts": [
    {
      "distress_id": "uuid",
      "farmer_id": "KK-2026-00045",
      "farmer_name": "Govind Yadav",
      "district": "Osmanabad",
      "triggers": {
        "drought": true,
        "score_drop": true,
        "no_insurance": true
      },
      "score_current": 510,
      "score_previous": 640,
      "status": "active",
      "flagged_at": "2026-04-24T00:00:00Z",
      "days_since_flagged": 0
    }
  ],
  "total": 7
}
```

---

#### `POST /api/v1/bank/distress/{distress_id}/acknowledge`

**Purpose**: Bank officer acknowledges a distress flag with action taken (Feature B5).  
**Auth**: Bank Officer Bearer token

**Request Body**:
```json
{
  "action_note": "Called farmer. Advised PMFBY enrollment. Field visit scheduled Wednesday.",
  "new_status": "in_progress"
}
```

**Response (200)**:
```json
{
  "distress_id": "uuid",
  "status": "in_progress",
  "acknowledged_at": "2026-04-24T11:15:00Z"
}
```

**Side Effects**: Updates `distress_flags`, writes to `audit_logs`.

---

#### `POST /api/v1/bank/distress/{distress_id}/resolve`

**Purpose**: Clear/resolve a distress flag (including false positive marking).  
**Auth**: Bank Officer Bearer token

**Request Body**:
```json
{
  "resolution_note": "Drought warning lifted. Score stabilised.",
  "is_false_positive": false
}
```

---

### Analytics Endpoints

#### `GET /api/v1/bank/analytics`

**Purpose**: Portfolio-level analytics for the bank officer (Feature B6).  
**Auth**: Bank Officer Bearer token

**Query Parameters**: `period` = `this_month` / `this_quarter` / `all_time`

**Response (200)**:
```json
{
  "period": "this_month",
  "total_applications": 87,
  "pending": 23,
  "approved": 51,
  "rejected": 13,
  "approval_rate_percent": 79.7,
  "average_score_approved": 714,
  "active_distress_count": 7,
  "district_breakdown": [
    { "district": "Vidisha", "count": 34 },
    { "district": "Nashik", "count": 22 }
  ]
}
```

---

#### `GET /api/v1/bank/applications/export`

**Purpose**: Export filtered applications as CSV (Feature B8).  
**Auth**: Bank Officer Bearer token

**Query Parameters**: Same filters as `GET /api/v1/bank/applications`

**Response (200)**: Binary CSV file
```
Content-Type: text/csv
Content-Disposition: attachment; filename="KisanKhata_Applications_2026-04.csv"
```

**Note**: Aadhaar field is masked (`XXXXXXXX{last4}`) in export.

---

### System / Internal Endpoints

#### `POST /api/v1/internal/distress/run-detection`

**Purpose**: Trigger the nightly distress detection job manually (for demo/testing).  
**Auth**: Internal API key header `X-Internal-Key`

**Response (200)**:
```json
{
  "farmers_checked": 500,
  "new_flags_raised": 7,
  "existing_flags_updated": 2
}
```

---

## 5. Authentication & Authorization

### JWT Token Structure

**Access Token** (30-minute expiry for MVP, 15-min for production):
```json
{
  "sub": "officer_uuid",
  "email": "priya.nair@nashikgrb.in",
  "bank_id": "bank_uuid",
  "role": "officer",
  "iat": 1745472000,
  "exp": 1745473800
}
```

**Refresh Token** (8-hour expiry per PRD spec):
```json
{
  "sub": "officer_uuid",
  "session_id": "session_uuid",
  "iat": 1745472000,
  "exp": 1745500800
}
```

### Authorization Levels

**Public Routes** (no auth):
- `POST /api/v1/farmers/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/scores/{farmer_id}/status`

**Farmer OTP Session** (mobile app — MVP uses farmer_id + SMS OTP):
- `GET /api/v1/farmers/{farmer_id}/dashboard`
- `GET /api/v1/farmers/{farmer_id}/xai-report`
- `GET /api/v1/farmers/{farmer_id}/score-history`
- `GET /api/v1/farmers/{farmer_id}/credit-passport`

**Bank Officer JWT** (bank dashboard — all tenant-scoped):
- `GET /api/v1/bank/applications`
- `GET /api/v1/bank/applications/{id}`
- `POST /api/v1/bank/applications/{id}/decide`
- `GET /api/v1/bank/distress`
- `POST /api/v1/bank/distress/{id}/acknowledge`
- `GET /api/v1/bank/analytics`
- `GET /api/v1/bank/applications/export`

**Internal System Key**:
- `POST /api/v1/scores/generate`
- `POST /api/v1/internal/distress/run-detection`

### Password Security

- Hashing: **bcrypt** with 12 salt rounds (via `passlib[bcrypt]`)
- Never stored in plain text, never returned in any API response
- Reset only via email OTP (6-digit, 10-minute expiry)
- Account locked for 15 minutes after 3 consecutive failed logins

### Tenant Isolation

Every bank officer request is scoped to their `bank_id` (extracted from JWT). All database queries include `WHERE bank_id = :current_bank_id`. Cross-tenant access returns `403 Forbidden`.

---

## 6. Data Validation Rules

### Aadhaar Number
```python
import re
AADHAAR_REGEX = re.compile(r'^\d{12}$')
# - Exactly 12 digits
# - No spaces or special characters
# - Luhn-style checksum validation (optional for MVP)
# - Stored AES-256 encrypted; indexed as SHA-256 hash only
```

### Mobile Number
```python
MOBILE_REGEX = re.compile(r'^[6-9]\d{9}$')
# - 10 digits, starting with 6, 7, 8, or 9 (Indian mobile)
```

### Land Area
```python
# - Float, min: 0.1 acres, max: 1000 acres
# - Must be positive
```

### Decision Comment (Approve/Reject)
```python
# - Min 10 characters, max 500 characters
# - Cannot be empty or whitespace-only
```

### Content Sanitization
- All text inputs sanitized via Pydantic `validator` before storage
- HTML tags stripped from all free-text fields
- SQL injection prevented by SQLAlchemy parameterised queries
- Max field lengths enforced both at Pydantic schema level and database column level

---

## 7. Error Handling

### Standard Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed for submitted data.",
    "details": [
      {
        "field": "aadhaar_number",
        "message": "Aadhaar number must be exactly 12 digits."
      }
    ]
  }
}
```

### Error Code Reference

| Code | HTTP Status | When |
|------|-------------|------|
| `VALIDATION_ERROR` | 400 | Request body fails Pydantic validation |
| `AADHAAR_ALREADY_REGISTERED` | 409 | Duplicate Aadhaar hash detected |
| `UNAUTHORIZED` | 401 | Missing or invalid JWT / OTP |
| `SESSION_EXPIRED` | 401 | Refresh token expired or session deleted |
| `FORBIDDEN` | 403 | Valid token but insufficient permissions (wrong bank tenant) |
| `NOT_FOUND` | 404 | Farmer, application, or distress record not found |
| `DECISION_ALREADY_MADE` | 409 | Attempt to re-decide an approved/rejected application |
| `SCORE_PROCESSING` | 202 | Score not yet ready (background job in progress) |
| `EXTERNAL_API_UNAVAILABLE` | 503 | All external API sources and fallbacks exhausted |
| `RATE_LIMITED` | 429 | Too many requests from this IP |
| `SERVER_ERROR` | 500 | Unhandled exception (generic) |

### Global Exception Handler (FastAPI)
```python
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    # Log to stderr (no PII in logs)
    # Return standardised error response
    # Never leak stack traces to client in production
```

---

## 8. Caching Strategy

### Cache Implementation

**MVP**: Python `dict`-based in-memory cache (per-process, keyed by district)  
**Production**: Redis with TTL (integrate via `aioredis`)

### What Gets Cached

| Data | Cache Key | TTL | Invalidation |
|------|-----------|-----|--------------|
| NASA POWER rainfall data | `nasa:{district}:{season}` | 24 hours | Never (historical data) |
| OpenWeatherMap current weather | `owm:{lat}:{lng}` | 1 hour | Time-based expiry |
| AGMARKNET mandi price | `mandi:{crop}:{district}` | 24 hours | Daily reset |
| District average scores | `avg_score:{district}` | 1 hour | On new score generated |
| Bank applications list | `bank:{bank_id}:apps:{hash}` | 60 seconds | On any decision or new application |

### Why District-Level Caching Matters

The PRD mandates caching because NASA POWER allows only 1,000 calls/day and OpenWeatherMap free tier allows 60 calls/minute. By caching at the district level (not farmer level), one API call serves all farmers in that district, making the system scalable to 10,000+ farmers without hitting rate limits.

---

## 9. Rate Limiting

### Limits by Endpoint

| Endpoint | Limit | Window | Per |
|----------|-------|--------|-----|
| `POST /auth/login` | 5 requests | 15 minutes | IP |
| `POST /farmers/register` | 10 requests | 1 hour | IP |
| `POST /scores/generate` | 20 requests | 1 hour | IP |
| Bank API (authenticated) | 200 requests | 1 minute | Officer JWT |
| Public API | 60 requests | 1 minute | IP |

### Implementation

```python
# Using slowapi (FastAPI-compatible rate limiter)
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
```

**Response on limit exceeded** (`429 Too Many Requests`):
```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please try again in 15 minutes.",
    "retry_after_seconds": 847
  }
}
```

---

## 10. ML Scoring Pipeline

### Model Architecture
```
Input Features → Feature Engineering → XGBoost (primary) + RandomForest (secondary)
                                            ↓
                          Final Score = 0.7 × XGBoost + 0.3 × RandomForest
                                            ↓
                              SHAP Explainer → XAI Factor List
                                            ↓
                                   Claude API → Hindi/English Summary
```

### Features Used by Model

| Feature | Source | Weight Category |
|---------|--------|-----------------|
| `land_area_acres` | Farmer profile | Land sub-score |
| `primary_crop_encoded` | Farmer profile + lookup | Income sub-score |
| `ndvi_value` | NASA POWER API | Crop health sub-score (0–200) |
| `rainfall_deviation_pct` | NASA POWER + OWM | Weather risk sub-score (0–200) |
| `estimated_revenue_inr` | Land × yield × mandi price | Income potential sub-score (0–200) |
| `pm_kisan_enrolled` | Scheme mock data | Scheme sub-score |
| `pmfby_enrolled` | Scheme mock data | Scheme sub-score + distress signal |
| `district_avg_score` | KisanKhata DB | Regional normalisation |

### Score Band → Loan Matrix (Configurable)

```python
SCORE_BAND_CONFIG = {
    "Poor":      {"min": 0,   "max": 400,  "loan_min": 0,      "loan_max": 25000,   "rate": 14.0},
    "Fair":      {"min": 401, "max": 600,  "loan_min": 25001,  "loan_max": 75000,   "rate": 12.0},
    "Good":      {"min": 601, "max": 750,  "loan_min": 75001,  "loan_max": 150000,  "rate": 9.0},
    "Excellent": {"min": 751, "max": 1000, "loan_min": 150001, "loan_max": 200000,  "rate": 7.0},
}
```
This config is stored in `banks.score_band_config` (JSON) for per-bank overrides (Feature B11).

### Distress Detection Logic (Nightly Job)
```python
def check_distress(farmer_id: str) -> bool:
    drought = WeatherService.is_drought_active(district)         # OWM drought alert
    score_drop = current_score <= (last_season_score - 100)      # ≥100 point drop
    no_insurance = scheme.pmfby_enrolled != "enrolled"           # No PMFBY
    return drought and score_drop and no_insurance               # ALL THREE required
```

---

## 11. Database Migrations

### Migration Tool: Alembic (SQLAlchemy-native)

```bash
# Initial setup
alembic init migrations

# Create a new migration
alembic revision --autogenerate -m "add_distress_flags_table"

# Apply migrations (dev)
alembic upgrade head

# Apply to production
alembic upgrade head  # Run against PostgreSQL DATABASE_URL

# Rollback one step
alembic downgrade -1
```

### Migration Workflow
1. Edit SQLAlchemy model in `app/models/`
2. Run `alembic revision --autogenerate`
3. Review generated migration file (never edit post-deploy)
4. Test locally with SQLite
5. Deploy to staging, run `alembic upgrade head`
6. Verify, then deploy to production

---

## 12. Environment Variables

```bash
# === Database ===
DATABASE_URL="sqlite:///./kisankhata.db"             # MVP
# DATABASE_URL="postgresql://user:pass@host:5432/kisankhata"  # Prod

# === Security ===
SECRET_KEY="your-256-bit-random-secret-key"          # JWT signing key
ENCRYPTION_KEY="your-32-byte-aes-256-key-base64"     # AES-256 for Aadhaar

# === External APIs ===
OPENWEATHER_API_KEY="..."
NASA_POWER_BASE_URL="https://power.larc.nasa.gov/api/temporal/climatology/point"
AGMARKNET_API_KEY="..."                               # Optional for MVP (mock fallback)
ANTHROPIC_API_KEY="..."                               # Claude API — capped at $20

# === SMS (Optional — P1 Feature) ===
MSG91_AUTH_KEY="..."
SMS_ENABLED="false"                                   # Toggle SMS on/off

# === App ===
APP_ENV="development"                                  # development / production
LOG_LEVEL="INFO"
INTERNAL_API_KEY="..."                                # For /internal/* endpoints
```

---

## 13. Security Considerations

| Area | Implementation |
|------|---------------|
| **Aadhaar Encryption** | AES-256-CBC via `cryptography` library; encrypted before insert, decrypted only in secure service layer |
| **Aadhaar Display** | Always masked: first 8 digits shown as `XXXXXXXX` in all API responses and exports |
| **Password Hashing** | bcrypt, 12 rounds, via `passlib[bcrypt]` |
| **Transport Security** | HTTPS / TLS 1.2+ enforced in production; local dev uses HTTP |
| **JWT** | HS256 signed with `SECRET_KEY`; access token 30 min, refresh token 8 hours |
| **Tenant Isolation** | All bank officer queries are `WHERE bank_id = {jwt.bank_id}` — no cross-bank data access |
| **Audit Trail** | All approve/reject and distress actions written to append-only `audit_logs` table |
| **No PII in Logs** | Log scrubbing middleware strips Aadhaar, mobile, and name from all log lines |
| **Input Validation** | All inputs validated by Pydantic v2 before reaching service layer |
| **SQL Injection** | Prevented by SQLAlchemy ORM parameterised queries (no raw SQL string concatenation) |
| **Rate Limiting** | `slowapi` enforces per-IP limits; login locked after 3 failures |

---

## 14. API Versioning

**Current Version**: `v1`  
**URL Structure**: `/api/v1/{resource}`

- No version in URL defaults to `v1` (backwards compatible)
- Versioning is URL-based (not header-based) for simplicity and hackathon readiness
- Breaking changes will be introduced as `/api/v2/` with 3-month deprecation notice
- Version header `X-API-Version: 1` returned in all responses for client awareness

---

## 15. Backup & Recovery

### MVP (SQLite on Render)
- **Daily**: Automated SQLite file snapshot to disk
- **Retention**: 7 days of rolling backups

### Production (PostgreSQL on Supabase)
- **Frequency**: Continuous WAL archiving + daily full dump at 02:00 UTC
- **Retention**: 30 days
- **Location**: Cloud storage bucket with AES encryption
- **Recovery SLA**: < 4 hours RTO for full restore

### Recovery Procedure
1. Identify the target backup timestamp
2. Restore dump to a fresh PostgreSQL instance
3. Apply WAL logs up to the failure point
4. Run `alembic upgrade head` to confirm schema state
5. Verify row counts and critical application records
6. Update `DATABASE_URL` in environment config
7. Run smoke tests on `/api/v1/bank/analytics` and `/api/v1/farmers/{id}/dashboard`

---

*KisanKhata Backend Structure — Team Utkarsh · April 2026*
