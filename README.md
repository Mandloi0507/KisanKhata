# KisanKhata - AI Credit Score for Indian Farmers

KisanKhata is an end-to-end platform providing AI/ML-driven credit scores for Indian farmers based on satellite health (NDVI), climate risk, market prices, and land data. It consists of a FastAPI backend driving two responsive frontends: a Farmer App and a Bank Officer Dashboard.

## Architecture

* **Backend**: FastAPI (Python 3.14), SQLAlchemy + SQLite. Integrated with XGBoost/RandomForest ensemble models for credit intelligence scoring and SHAP for explainable AI metrics.
* **Farmer App**: React + Vite, TailwindCSS. Designed as a mobile-first interface for farmers to register, check their score, and apply for loans.
* **Bank Dashboard**: React + Vite, TailwindCSS. A secure desktop-first dashboard for bank officers to review loan applications, handle distress alerts, and view portfolio-level analytics.

## Folder Structure

```
KisanKhata/
├── backend/
│   ├── app/                 # FastAPI application (routers, ml, services)
│   ├── data/                # SQLite Database and synthetic data sources
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables configuration
├── farmer-app-src/
│   └── farmer-s-bloom-ui-main/    # Farmer mobile-first React application
└── bank-dashboard-src/
    └── swift-loan-vision-main/    # Bank desktop React application
```

## Prerequisites

* **Python**: 3.10+ (Tested with 3.14)
* **Node.js**: v18+ and `npm`
* Valid `.env` configuration in the `backend` folder.

---

## 🚀 How to Run the Project Locally

To run the full stack, you need to launch three separate terminal windows/tabs.

### 1. Setup and Start the Backend

Open **Terminal 1**:
```powershell
cd backend
python -m venv venv
venv\Scripts\activate   # On Windows
pip install -r requirements.txt
```

Verify your `.env` file inside the `backend` directory. An example configuration:
```env
DATABASE_URL=sqlite+aiosqlite:///./data/kisankhata.db
SECRET_KEY=your_secure_secret_key_here
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef   # Must be exactly 32 bytes for AES
ENVIRONMENT=development
AGMARKNET_API_KEY=mock              # Fallbacks are used if true keys miss
OPENWEATHER_API_KEY=mock
```

**Seed the database & train ML model (Run once):**
```powershell
 python -m app.seed
```
*Note: This creates demonstration farmers, trains the ensemble model, sets up the demo bank officer, and seeds mock API data.*

**Start the FastAPI server:**
```powershell
uvicorn app.main:app --reload
```
*The backend will now be running on `http://localhost:8002`*

### 2. Start the Farmer Application

Open **Terminal 2**:
```powershell
cd farmer-app-src\farmer-s-bloom-ui-main
npm install
npm run dev -- --port 8080
```
*The Farmer App will be running on `http://localhost:8080`*

* **Testing Flow**: Click 'Get Started'. Enter an arbitrary Aadhaar number (e.g. `999988887777`) and fill out the rest of the form to generate a live score against the `localhost:8000` API. Wait ~12 seconds for the ML pipeline mock simulation to finish.

### 3. Start the Bank Dashboard

Open **Terminal 3**:
```powershell
cd bank-dashboard-src\swift-loan-vision-main
npm install
npm run dev -- --port 8081
```
*The Bank Dashboard will be running on `http://localhost:8081`*

* **Login Credentials**:
  * Email: `priya.sharma@ngb.in`
  * Password: `admin123`
* **Testing Flow**: Go to the 'Applications' tab. You'll see seeded applications and the new ones you make via the Farmer App. Click 'Review' and add a comment > 10 characters to approve or reject a loan.

## Features Integrated

* **Distress Detection Workflow**: System actively flags farmers if their score drops by 100+ points alongside drought warnings and a lack of active scheme insurance.
* **Explainable AI (XAI)**: SHAP factors actively display the *Why* behind every score generation.
* **PII Encryption**: Encrypted payload storage for Aadhaar numbers.
* **Authentication**: Real JWT authentication across boundaries with role-based segregation.
