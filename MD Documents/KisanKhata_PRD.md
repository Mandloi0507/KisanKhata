# Product Requirements Document (PRD)

## 1. Product Overview

| Field | Detail |
|---|---|
| **Project Title** | KisanKhata — AI-Powered Farmer Credit Intelligence System |
| **Version** | 1.0 (Hackathon MVP) |
| **Last Updated** | April 24, 2026 |
| **Owner** | Team Utkarsh |
| **Tagline** | *"Transforming Agricultural Data into Financial Trust"* |
| **Interfaces** | Farmer Mobile App (React Native / PWA) · Bank Officer Web Dashboard (React) |

---

## 2. Problem Statement

Over **10,000 Indian farmers die by suicide every year** — approximately one every 48 minutes — primarily due to financial distress caused by predatory informal lending (Source: NCRB Data).

The root cause is a systemic failure of the formal credit system to serve the agricultural economy:

- **No Credit History**: Farming transactions are cash-based. Banks find no digital footprint to verify income.
- **No Collateral**: Land titles are frequently disputed, shared, or unclear, preventing mortgaging.
- **Financial Invisibility**: High agricultural output does not translate into recognisable financial data.
- **Bank Limitation**: Traditional lenders (relying on ITR, CIBIL) have no tools to assess informal agricultural income.

The result is a vicious cycle: farmers are denied formal loans → forced to borrow from moneylenders at **36–60% interest rates** → trapped in debt → no safety net during crop failure → financial collapse.

**KisanKhata breaks this cycle** by converting real agricultural activity — satellite-verified crop health, weather risk, mandi sales data, and government scheme enrollment — into a verified, explainable credit score (KisanScore, 0–1000) that any bank can trust.

> *"Currently, no system converts actual agricultural activity into financial credibility."* — KisanKhata Pitch Deck

---

## 3. Goals & Objectives

### Business Goals

1. **Credit Access**: Enable at least **500 previously unscored farmers** to receive a KisanScore within the first pilot month, targeting ≥70% score generation success rate on submitted applications.
2. **Bank Adoption**: Onboard **2–3 partner banks** for a pilot program, with loan approval decisions triggered within **24 hours** of score generation.
3. **Fraud Prevention**: Achieve **0 duplicate loan approvals** per pilot cohort through Aadhaar-linked identity and multi-bank ledger checks.
4. **Interest Rate Reduction**: Demonstrate that KisanScore-backed loans carry a **minimum 40% lower effective interest rate** compared to informal moneylender rates (target: 7–12% p.a. vs. 36–60% p.a.).
5. **Scale Readiness**: Build an API-first backend that can onboard **10,000+ farmers within 6 months** without a rewrite.

### User Goals

- **Farmers**: Obtain a formal credit identity in under 10 minutes using only their Aadhaar and land details, without visiting a bank branch.
- **Bank Officers**: Review, approve, or reject loan applications with full AI-generated risk context in a single browser tab, reducing average decision time from weeks to hours.

---

## 4. Success Metrics

| Metric | Target | Measurement Method |
|---|---|---|
| **KisanScore Generation Rate** | ≥70% of submitted farmer profiles successfully scored | Backend scoring API logs |
| **Farmer Onboarding Time** | End-to-end form submission to score display in ≤10 minutes | Mobile app event timestamps |
| **Bank Decision Time** | Loan approve/reject decision within 24 hours of score generation | Bank dashboard audit log |
| **Score Explainability Coverage** | 100% of generated scores include a SHAP-based breakdown of ≥4 factors | XAI report QA |
| **Distress Detection Accuracy** | Distress flag triggers correctly for ≥90% of simulated drought + score-drop scenarios | Test dataset validation |

---

## 5. Target Users & Personas

### Primary Persona: Ramesh Kumar — The Smallholder Farmer

| Attribute | Detail |
|---|---|
| **Age** | 38 |
| **Location** | Vidisha district, Madhya Pradesh |
| **Land Holding** | 2.5 acres (wheat + soybean rotation) |
| **Income** | ₹80,000–₹1,20,000 per year (seasonal, cash-based) |
| **Education** | Class 10 pass |
| **Device** | Entry-level Android smartphone (4G) |
| **Language** | Hindi |

**Pain Points:**
- Has never received a formal bank loan due to no CIBIL score.
- Borrows from the local moneylender at 48% annual interest every Kharif season.
- Does not understand why his loan application was rejected — the bank gave no explanation.
- Travels 30 km to the nearest bank branch only to be turned away.
- Cannot afford quality seeds and fertilizers without timely credit access.

**Goals:**
- Get a formal Kisan Credit Card with a reasonable interest rate.
- Understand what his credit standing is and how to improve it.
- Avoid the debt trap of informal lending.

**Technical Proficiency:** Low. Uses WhatsApp and YouTube. Comfortable with large buttons, Hindi text, and voice prompts. Cannot navigate complex multi-step forms without guidance.

---

### Secondary Persona: Priya Nair — The Bank Credit Officer

| Attribute | Detail |
|---|---|
| **Age** | 31 |
| **Role** | Agricultural Loan Officer, Regional Rural Bank |
| **Location** | District branch, Nashik, Maharashtra |
| **Experience** | 6 years in agri-lending |
| **Tools Used** | Core banking system, Excel, paper loan files |
| **Workload** | Reviews 20–40 loan applications per week |

**Pain Points:**
- Spends 2–3 days per application verifying land records, income estimates, and past loans through manual channels.
- Has no reliable way to verify a farmer's crop output or income from cash sales.
- Cannot justify loan rejection to the farmer in a clear, evidence-based way.
- Frequently encounters duplicate applications across partner banks.
- Concerned about non-performing assets (NPAs) in the agri-loan portfolio.

**Goals:**
- Make faster, data-backed loan decisions without leaving the dashboard.
- Access a single-page view of farmer risk profile, score, and recommendation.
- Have evidence to support approval or rejection with regulators.
- Identify high-risk applications (distress alerts) before disbursement.

**Technical Proficiency:** Medium-High. Comfortable with web-based tools and dashboards. Expects professional, data-rich interface with sortable tables and downloadable reports.

---

## 6. Features & Requirements

> **Scope Note**: Features 1–16 below apply **exclusively to the Farmer Mobile Application**. The Bank Officer Web Dashboard is defined separately in Section 6B.

---

### 6A. Farmer Mobile Application

#### Must-Have Features (P0)

---

**Feature 1: Farmer Onboarding Form**

- **Description**: A guided, multi-step registration form collecting Aadhaar number, district, primary crop type, secondary crop type, and land area. Designed for low-literacy users with large input fields and Hindi labels.
- **User Story**: As a farmer, I want to register my profile using my Aadhaar and farm details so that the system can generate my KisanScore without requiring bank documents.
- **Acceptance Criteria**:
  - [ ] Form collects: Aadhaar number (12 digits, validated format), district (dropdown from Indian district list), primary crop, secondary crop (optional), and land area in acres.
  - [ ] Aadhaar field masks the first 8 digits after entry for privacy.
  - [ ] District selection is filterable by state first, then district.
  - [ ] Form validates all required fields before allowing submission; shows inline error messages in Hindi.
  - [ ] On successful submission, farmer receives a unique Farmer ID and is redirected to the score loading screen.
  - [ ] Form completes in ≤5 steps with a visible progress indicator.
- **Success Metric**: ≥80% of users who start the onboarding form complete it within 10 minutes without support.

---

**Feature 2: KisanScore Engine**

- **Description**: The core ML scoring pipeline that ingests farmer profile + external data and outputs a KisanScore between 0 and 1000. Model: XGBoost or Random Forest ensemble. Score is categorised as Poor (0–400), Fair (401–600), Good (601–750), and Excellent (751–1000).
- **User Story**: As a farmer, I want to receive a credit score that reflects my actual farming capability so that banks can assess my loan eligibility fairly.
- **Acceptance Criteria**:
  - [ ] Score generation completes within 30 seconds of form submission.
  - [ ] Score output is a single integer between 0 and 1000.
  - [ ] Score is displayed with a colour-coded gauge (Red → Orange → Green) and a category label.
  - [ ] Score is stored against the farmer's profile and timestamped.
  - [ ] If external API data is unavailable, the system falls back to district-level averages and marks the score as "estimated".
  - [ ] Score is regenerated automatically at the start of each new crop season.
- **Success Metric**: Score generation success rate ≥70% for all submitted profiles.

---

**Feature 3: NDVI Crop Health Sub-Score**

- **Description**: Uses NASA POWER API (MVP) or Sentinel Hub (enhanced) satellite data to compute an NDVI-based crop health index for the farmer's district. This sub-score contributes to the overall KisanScore.
- **User Story**: As a farmer, I want my crop health to be considered in my score so that a good harvest season improves my credit standing even without formal income proof.
- **Acceptance Criteria**:
  - [ ] NDVI value is fetched for the farmer's district coordinates from NASA POWER API.
  - [ ] NDVI is normalised to a 0–200 sub-score and displayed as "Crop Health" in the score breakdown.
  - [ ] If satellite data is unavailable or cloud-covered, a historical 3-year district average is used as a fallback.
  - [ ] NDVI source and date are disclosed to the farmer in the XAI report.
  - [ ] Sub-score is included in the SHAP breakdown with a plain-language label.
- **Success Metric**: NDVI sub-score successfully computed for ≥85% of submitted profiles.

---

**Feature 4: Weather Risk Score**

- **Description**: Fetches historical and recent rainfall data from NASA POWER API and OpenWeatherMap to compute a weather risk score for the farmer's district. Drought, flood, and irregular rainfall patterns lower this sub-score.
- **User Story**: As a farmer, I want my weather conditions to be factored into my score so that a drought year does not permanently damage my credit standing.
- **Acceptance Criteria**:
  - [ ] Historical seasonal rainfall data is fetched from NASA POWER API for the past 3 years.
  - [ ] Current-season rainfall is fetched from OpenWeatherMap using district GPS coordinates.
  - [ ] Weather risk is normalised to a 0–200 sub-score and labelled "Rainfall Risk" in the breakdown.
  - [ ] Abnormal rainfall (>2 standard deviations from district mean) triggers a "Weather Anomaly" flag visible to bank officers.
  - [ ] Weather data source and period are disclosed in the XAI report.
- **Success Metric**: Weather risk sub-score computed for ≥90% of profiles (high API availability).

---

**Feature 5: Mandi Revenue Estimator**

- **Description**: Computes estimated seasonal revenue using the formula: `Land Area × Expected Yield per Acre × Current Mandi Price`. Mandi prices fetched from AGMARKNET / data.gov.in API.
- **User Story**: As a farmer, I want my expected crop income to be estimated from government price data so that my repayment capacity is assessed realistically.
- **Acceptance Criteria**:
  - [ ] Mandi price is fetched for the farmer's primary crop and district from AGMARKNET API.
  - [ ] Expected yield per acre is sourced from state agriculture department district averages (static lookup table).
  - [ ] Estimated seasonal revenue is computed and displayed in INR (₹) on the farmer dashboard.
  - [ ] Revenue estimate contributes to a 0–200 "Income Potential" sub-score.
  - [ ] If the mandi API is unavailable, the last fetched price is used with a "Price as of [date]" disclosure.
- **Success Metric**: Revenue estimate computed for ≥80% of profiles with ≥70% mandi API uptime.

---

**Feature 6: Explainable AI (XAI) Report**

- **Description**: A SHAP-value-based score breakdown that translates model predictions into plain-language factors. Each factor (crop health, rainfall, income estimate, land size) is shown with its positive or negative contribution to the KisanScore. Claude API generates a 2–3 sentence natural language summary of the score.
- **User Story**: As a farmer, I want to understand why I received my score so that I know what to improve to get a better loan offer next season.
- **Acceptance Criteria**:
  - [ ] XAI report displays the top 4–6 contributing factors with their impact direction (positive/negative) and weight.
  - [ ] Each factor has a plain-language label (e.g., "Your rice crop health is above average for your district").
  - [ ] Claude API generates a 2–3 sentence Hindi/English summary explaining the score in simple terms.
  - [ ] Report is accessible from the farmer dashboard within 3 taps.
  - [ ] Report is downloadable as a PDF (linked to Farmer Credit Passport in P1).
  - [ ] No raw SHAP values or technical jargon appear in the farmer-facing view.
- **Success Metric**: ≥85% of test users correctly identify at least 2 score factors from the report without assistance.

---

**Feature 7: Farmer Mobile Dashboard**

- **Description**: The main screen of the farmer app showing the KisanScore gauge, score category, last updated date, and a pre-approved loan offer card based on the score band.
- **User Story**: As a farmer, I want to see my score and loan eligibility on one screen so that I can immediately understand my financial standing and next steps.
- **Acceptance Criteria**:
  - [ ] Dashboard displays an animated circular gauge showing the KisanScore (0–1000).
  - [ ] Score is colour-coded: Red (0–400), Orange (401–600), Yellow-Green (601–750), Green (751–1000).
  - [ ] A loan offer card shows: loan amount range, indicative interest rate, and an "Apply Now" CTA.
  - [ ] Last score update date is visible on the dashboard.
  - [ ] Dashboard loads within 3 seconds on a 4G connection.
  - [ ] Distress flag (if triggered) appears as a red banner above the score with a support message.
- **Success Metric**: ≥90% of beta users rate the dashboard as "easy to understand" in post-demo survey.

---

**Feature 8: Bank Officer Dashboard (Mobile View)**

- **Description**: A lightweight mobile-compatible view for bank officers to see a farmer's score and recommendation while in the field. Full dashboard functionality is in the Bank Web App (Section 6B).
- **User Story**: As a bank officer, I want to view a farmer's KisanScore from my phone so that I can make a preliminary assessment during field visits.
- **Acceptance Criteria**:
  - [ ] Accessible via a unique URL with bank officer authentication (OTP-based for MVP).
  - [ ] Displays farmer name, Farmer ID, KisanScore, and score category.
  - [ ] Shows the loan recommendation (amount + rate) generated by Feature 9.
  - [ ] Loads within 5 seconds on mobile network.
  - [ ] Approve / Reject buttons are present but require web dashboard confirmation (mobile is view-only for decisions).
- **Success Metric**: Mobile view renders correctly on Android Chrome and iOS Safari without layout breaks.

---

**Feature 9: Loan Recommendation Engine**

- **Description**: Maps the KisanScore to a loan amount range and suggested interest rate using a rule-based matrix. Output: loan amount range (₹) and indicative interest rate (% p.a.).
- **User Story**: As a farmer, I want to receive a pre-calculated loan offer so that I know exactly how much I can borrow and at what rate without negotiating blindly with a bank.
- **Acceptance Criteria**:
  - [ ] Loan amount and rate are computed from a configurable score-band matrix (e.g., 751–1000 → ₹1,00,000–₹2,00,000 @ 7% p.a.).
  - [ ] Loan recommendation is displayed on the farmer dashboard (Feature 7) and the bank officer dashboard.
  - [ ] Recommendation is stored with the farmer profile and timestamped.
  - [ ] Score band matrix is editable via an admin config file (not hardcoded).
  - [ ] Recommendation is regenerated whenever the KisanScore changes.
- **Success Metric**: 100% of scored farmer profiles have a corresponding loan recommendation generated automatically.

---

**Feature 10: Distress Detection Flag**

- **Description**: An automated alert system that flags a farmer profile as "At Risk" when all three conditions are met simultaneously: (a) active drought warning in the district, (b) KisanScore drops by ≥100 points from last season, and (c) no active crop insurance found.
- **User Story**: As a farmer at risk, I want the system to alert my bank officer before I default so that I can receive support, insurance referrals, or loan restructuring early.
- **Acceptance Criteria**:
  - [ ] Distress algorithm checks all three conditions (drought flag, score drop, no insurance) before triggering.
  - [ ] Distress flag appears as a red alert banner on both the farmer dashboard and the bank officer dashboard.
  - [ ] Farmer sees a plain-language message: "Your farm may be at risk. Contact your bank officer for support."
  - [ ] Bank officer sees a "Distress Alert" badge on the farmer's record in the applications list.
  - [ ] Flag is logged with a timestamp and the three triggering conditions for audit.
  - [ ] Flag can be manually cleared by a bank officer after review.
- **Success Metric**: Distress flag triggers correctly for ≥90% of test scenarios with all three conditions present.

---

#### Should-Have Features (P1)

---

**Feature 11: Farmer Credit Passport (QR-Linked PDF)**

- **Description**: A portable, downloadable PDF that the farmer can carry to any partner bank. Contains: name, Farmer ID, KisanScore, score category, SHAP summary, and a QR code linking to the live score profile.
- **User Story**: As a farmer, I want a digital document I can show to any bank so that I do not have to re-register every time I apply for a loan.
- **Acceptance Criteria**:
  - [ ] PDF is generated on demand from the farmer dashboard with a single tap.
  - [ ] PDF includes a scannable QR code linking to the farmer's live public score page.
  - [ ] PDF is available in Hindi and English (user selects language).
  - [ ] QR code links to a read-only, publicly shareable score view (no PII beyond name and score).
  - [ ] PDF renders correctly on standard A4 paper when printed.
- **Success Metric**: PDF generated successfully for 100% of requests; QR code resolves within 3 seconds.

---

**Feature 12: Score History Timeline**

- **Description**: A visual timeline on the farmer dashboard showing KisanScore changes across past seasons (Kharif / Rabi), allowing farmers to track their credit improvement over time.
- **User Story**: As a farmer, I want to see how my score has changed each season so that I can see the impact of better farming practices on my loan eligibility.
- **Acceptance Criteria**:
  - [ ] Timeline shows up to 4 past score snapshots with season label (e.g., "Kharif 2025 – 620").
  - [ ] Each data point is tappable and shows the score breakdown for that season.
  - [ ] Timeline renders as a simple line chart with date labels.
  - [ ] If fewer than 2 data points exist, a message is shown: "More history will appear after your next season."
- **Success Metric**: Timeline visible and accurate for all farmer profiles with 2+ scoring events.

---

**Feature 13: Mock Multi-Bank Ledger Check**

- **Description**: A simulated cross-bank loan check that queries a mock ledger (or real eNAM-equivalent API if available) to detect if the farmer has active loans from other banks for the same crop season, preventing "double-dipping" fraud.
- **User Story**: As a bank officer, I want to know if a farmer has already taken a loan elsewhere for the same season so that I can avoid approving a fraudulent duplicate application.
- **Acceptance Criteria**:
  - [ ] Ledger check is triggered automatically on every new loan application.
  - [ ] Check result appears on the bank officer dashboard as "No existing loans found" or "⚠ Active loan detected at [Bank Name]".
  - [ ] Mock data covers at least 20 simulated farmers with pre-existing loans for demo purposes.
  - [ ] Result is displayed within 5 seconds of application loading.
  - [ ] Ledger check outcome is logged against the application record.
- **Success Metric**: Ledger check flag correctly identifies 100% of mock duplicate-loan scenarios in demo dataset.

---

**Feature 14: SMS Score Delivery**

- **Description**: Delivers the KisanScore and a simplified loan offer summary to the farmer's registered mobile number via SMS using MSG91 or Twilio, for farmers who cannot access the mobile app.
- **User Story**: As a farmer with a feature phone, I want to receive my score and loan offer via SMS so that I do not need a smartphone to benefit from KisanKhata.
- **Acceptance Criteria**:
  - [ ] SMS is sent automatically when a score is generated for a new farmer.
  - [ ] SMS message is ≤160 characters and includes: Score, category, estimated loan amount, and a short URL to the Credit Passport.
  - [ ] SMS is available in Hindi and English based on farmer preference set during onboarding.
  - [ ] Delivery confirmation is logged; failed deliveries are retried once after 5 minutes.
  - [ ] SMS sending is configurable (enable/disable) via environment variable.
- **Success Metric**: SMS delivery rate ≥95% in pilot districts (MSG91 SLA benchmark).

---

**Feature 15: Regional Benchmark Comparison**

- **Description**: Shows the farmer their score relative to the district average and state average, providing context for their standing within the agricultural community.
- **User Story**: As a farmer, I want to know how my score compares to other farmers in my district so that I understand whether my score is strong or weak relative to my peers.
- **Acceptance Criteria**:
  - [ ] Dashboard shows three score bars: "Your Score", "District Average", "State Average".
  - [ ] District and state averages are computed from all scored profiles in the system (updated daily).
  - [ ] If fewer than 10 scores exist in a district, "Not enough data for district average" is shown.
  - [ ] Benchmark data does not expose any individual farmer's score.
- **Success Metric**: Comparison displayed correctly for districts with ≥10 scored profiles.

---

**Feature 16: Government Scheme Enrollment Checker**

- **Description**: A simple lookup that checks whether the farmer is enrolled in PM-KISAN (direct income support) and PMFBY (crop insurance) using mock data (or real API if accessible), and displays enrollment status on the dashboard.
- **User Story**: As a farmer, I want to see which government schemes I am enrolled in so that I can confirm my benefits are active and my score reflects my full financial safety net.
- **Acceptance Criteria**:
  - [ ] Scheme checker displays enrollment status for PM-KISAN and PMFBY (enrolled / not enrolled / unknown).
  - [ ] Enrollment status is shown on the XAI report as a positive or neutral scoring factor.
  - [ ] For not-enrolled farmers, a one-line referral link to the scheme portal is shown.
  - [ ] Mock data is used for MVP; real API integration is flagged as a V1.1 enhancement.
  - [ ] Scheme check does not block score generation if data is unavailable.
- **Success Metric**: Scheme status displayed for 100% of profiles (mock data coverage = 100%).

---

### 6B. Bank Officer Web Dashboard

> **Note**: This section is fully designed for the Bank Officer persona (Priya Nair). The dashboard is a separate React-based web application accessible only to authenticated bank officers.

#### Must-Have Features (P0) — Bank Dashboard

---

**Feature B1: Bank Officer Authentication**

- **Description**: Secure login for bank officers using email + password with role-based access control. MVP uses JWT-based authentication. Each bank has a separate tenant namespace.
- **User Story**: As a bank officer, I want to securely log in to the KisanKhata dashboard so that I can access only the farmer applications assigned to my bank.
- **Acceptance Criteria**:
  - [ ] Login screen accepts email and password; validates credentials against the bank officer database.
  - [ ] Failed login after 3 attempts locks the account for 15 minutes.
  - [ ] Session expires after 8 hours of inactivity.
  - [ ] Each bank officer sees only applications submitted to their bank (tenant isolation).
  - [ ] Logout clears session token from client storage.
  - [ ] Password reset is available via email OTP.
- **Success Metric**: 100% of login attempts by valid credentials succeed within 3 seconds; no cross-tenant data leakage in testing.

---

**Feature B2: Applications List View**

- **Description**: A paginated, filterable table showing all farmer loan applications submitted to the bank, with columns for Farmer Name, KisanScore, Score Category, Loan Amount Requested, Distress Flag, and Application Status.
- **User Story**: As a bank officer, I want to see all pending loan applications in one view so that I can prioritise high-score applicants and flag distress cases quickly.
- **Acceptance Criteria**:
  - [ ] Table displays: Farmer Name, Farmer ID, KisanScore (colour-coded badge), Score Category, District, Loan Amount Recommended, Distress Flag (icon), Application Status (Pending / Approved / Rejected).
  - [ ] Table is sortable by KisanScore (high to low / low to high) and by Date Submitted.
  - [ ] Table is filterable by: Score Category, District, Distress Flag (Yes/No), and Status.
  - [ ] Pagination supports 20/50/100 rows per page.
  - [ ] Distress-flagged applications appear highlighted with a red row indicator.
  - [ ] Table loads within 3 seconds for up to 500 records.
- **Success Metric**: Bank officer can locate a specific application within 30 seconds using filters.

---

**Feature B3: Farmer Application Detail View**

- **Description**: A full single-page view of a farmer's application, including their profile, KisanScore gauge, all sub-score breakdowns, XAI report (SHAP factors), loan recommendation, ledger check result, and approve/reject controls.
- **User Story**: As a bank officer, I want to see a complete farmer risk profile on one screen so that I can make an informed loan decision without switching between systems.
- **Acceptance Criteria**:
  - [ ] Detail view shows: Farmer Name, Aadhaar (masked), District, Crop, Land Area, KisanScore (gauge), sub-scores (crop health, weather risk, income estimate), XAI factor list, loan recommendation (amount + rate), ledger check result, distress flag status, and approve/reject buttons.
  - [ ] XAI section lists top 4–6 SHAP factors with plain-language labels and contribution direction.
  - [ ] Claude API-generated natural language score summary is shown in 2–3 sentences.
  - [ ] Approve and Reject buttons trigger a confirmation modal with a mandatory comment field.
  - [ ] Decision (approve/reject) is logged with officer name, timestamp, and comment.
  - [ ] Farmer Credit Passport PDF is downloadable from this view.
- **Success Metric**: Bank officer completes a full review and decision in ≤5 minutes per application.

---

**Feature B4: Approve / Reject Workflow**

- **Description**: A controlled workflow for bank officers to approve or reject loan applications with mandatory comment and confirmation. Decisions are logged immutably and update the farmer's application status in real time.
- **User Story**: As a bank officer, I want to approve or reject applications with a documented reason so that all decisions are auditable and farmers receive timely communication.
- **Acceptance Criteria**:
  - [ ] "Approve" and "Reject" buttons are present on the Application Detail View (Feature B3).
  - [ ] Clicking either button opens a confirmation modal requiring a comment (min 10 characters, max 500 characters).
  - [ ] Decision is submitted only after the officer confirms in the modal.
  - [ ] On approval: application status updates to "Approved", approved loan amount is confirmed (editable within ±20% of recommendation), and farmer's dashboard updates within 60 seconds.
  - [ ] On rejection: application status updates to "Rejected", and rejection reason is stored and shown to the farmer in plain language.
  - [ ] All decisions are immutable once confirmed (no edit or undo).
  - [ ] Decision log is exportable as a CSV for regulatory reporting.
- **Success Metric**: 100% of approve/reject actions are logged with officer name, timestamp, and comment; no unlogged decisions in testing.

---

**Feature B5: Distress Alert Management**

- **Description**: A dedicated distress queue showing all farmer profiles with active distress flags, allowing bank officers to review, acknowledge, and take action (e.g., schedule a field visit, trigger insurance referral, or restructure the loan).
- **User Story**: As a bank officer, I want a dedicated view for distressed farmers so that I can proactively intervene before a loan defaults or a crisis worsens.
- **Acceptance Criteria**:
  - [ ] A "Distress Alerts" tab in the navigation shows the count of active distress flags (e.g., "⚠ 3 Distress Alerts").
  - [ ] Each distress record shows: Farmer Name, District, Distress Trigger Summary (which of the 3 conditions triggered), KisanScore trend (current vs. last season), and days since flag was raised.
  - [ ] Bank officer can mark a distress flag as "Acknowledged" with a comment and action taken.
  - [ ] Acknowledged flags are moved to an "In Progress" sub-tab; cleared flags move to "Resolved".
  - [ ] Distress list is sorted by days since flag raised (oldest first by default).
- **Success Metric**: 100% of distress flags are acknowledged within 48 hours in pilot bank testing.

---

**Feature B6: Portfolio Analytics Dashboard**

- **Description**: A summary analytics panel visible to bank officers showing portfolio-level metrics: total applications, approval rate, average KisanScore of approved loans, district-wise score distribution, and distress rate.
- **User Story**: As a bank officer, I want to see portfolio-level statistics so that I can identify high-risk districts and report lending performance to my branch manager.
- **Acceptance Criteria**:
  - [ ] Analytics panel shows: Total Applications (this month / all time), Approval Rate (%), Average KisanScore of Approved Loans, Active Distress Alerts Count, and Applications by District (bar chart).
  - [ ] Time filter allows switching between "This Month", "This Quarter", and "All Time".
  - [ ] District-wise breakdown is shown as a horizontal bar chart sorted by application volume.
  - [ ] All metrics update in real time when new applications are submitted or decisions are made.
  - [ ] Analytics data is exportable as a CSV or PDF summary report.
- **Success Metric**: Analytics dashboard loads within 5 seconds and displays accurate data matching raw application counts.

---

#### Should-Have Features (P1) — Bank Dashboard

---

**Feature B7: Farmer Map View**

- **Description**: An interactive map (Google Maps or Mapbox) showing the geographic distribution of all submitted applications, colour-coded by KisanScore band. Allows bank officers to identify high-density districts for field visits.
- **User Story**: As a bank officer, I want to see a map of all applicants so that I can plan field verification visits efficiently.
- **Acceptance Criteria**:
  - [ ] Map displays a pin for each application colour-coded by score band (red / orange / green).
  - [ ] Clicking a pin opens a summary card with farmer name, score, and a link to the detail view.
  - [ ] Map supports zoom and pan; clusters overlapping pins at low zoom levels.
  - [ ] Distress-flagged farmers have a distinct icon (warning triangle) on the map.
- **Success Metric**: Map renders all pins for up to 500 applications within 5 seconds.

---

**Feature B8: Bulk Application Export**

- **Description**: Allows bank officers to export the full applications table (filtered or unfiltered) as a CSV or Excel file for internal reporting and regulatory submission.
- **User Story**: As a bank officer, I want to export application data so that I can include it in my monthly branch report without manually copying data.
- **Acceptance Criteria**:
  - [ ] "Export" button is present on the Applications List View.
  - [ ] Export respects active filters (only exports visible/filtered records).
  - [ ] Exported file includes all table columns plus the decision comment.
  - [ ] Export completes within 10 seconds for up to 500 records.
  - [ ] Aadhaar numbers are masked in the export (first 8 digits replaced with "XXXXXXXX").
- **Success Metric**: Export file matches table data with 100% row accuracy in verification testing.

---

**Feature B9: Notification Centre**

- **Description**: An in-app notification panel alerting bank officers to new applications, new distress flags, and score changes on previously approved farmers.
- **User Story**: As a bank officer, I want real-time notifications so that I can act on urgent distress alerts and new applications without manually refreshing the dashboard.
- **Acceptance Criteria**:
  - [ ] Notification bell icon in the header shows unread count badge.
  - [ ] Notification types: "New Application" (blue), "Distress Alert" (red), "Score Updated" (yellow).
  - [ ] Notifications appear within 60 seconds of the triggering event.
  - [ ] Clicking a notification navigates directly to the relevant application or alert.
  - [ ] Notifications can be marked as read individually or all at once.
- **Success Metric**: Distress alert notifications delivered within 60 seconds of flag trigger in end-to-end testing.

---

#### Nice-to-Have Features (P2) — Bank Dashboard

**Feature B10: Role-Based Access (Branch Manager View)** — A read-only analytics view for branch managers showing aggregated portfolio data without access to individual farmer PII.

**Feature B11: Custom Score Band Configuration** — Allow each partner bank to define their own loan amount matrix per score band, rather than using the system default.

**Feature B12: Comparative Peer Benchmarking** — Show each bank officer how their approval rate and average approved score compare to anonymised peer banks in the same state.

---

## 7. Explicitly OUT OF SCOPE

The following will **NOT** be built in Version 1.0:

1. **Real biometric Aadhaar authentication** — Aadhaar number is collected for identity linkage only; no UIDAI API integration for live biometric OTP in MVP.
2. **Actual loan disbursement or payment processing** — KisanKhata generates recommendations and records decisions; fund transfer is handled by the bank's core banking system outside this product.
3. **Farmer-to-farmer social or community features** — No forums, chat, or peer lending functionality.
4. **Real-time stock/commodity futures integration** — Mandi prices use government data (AGMARKNET); live futures or futures hedging is not in scope.
5. **Multi-language support beyond Hindi and English** — Regional languages (Tamil, Telugu, Marathi, Kannada) are a V2 roadmap item.
6. **Offline-first mobile app with full sync** — App requires internet connectivity; offline caching is limited to the last loaded score.
7. **Integration with actual CIBIL / Experian credit bureau** — KisanKhata is intentionally alternative-data-first; CIBIL lookup is not included.
8. **Automated loan contract generation or e-signing** — Contract creation and digital signing are handled by the bank's existing systems.
9. **Crop advisory or agronomic recommendation engine** — KisanKhata is a credit scoring system; crop guidance is out of scope.
10. **In-app video KYC or document scanning** — Physical document verification is conducted by the bank officer outside the app.

---

## 8. User Scenarios

### Scenario 1: First-Time Farmer Onboarding and Score Discovery

**Context**: Ramesh Kumar, a wheat farmer in Vidisha, MP, has never had a CIBIL score. His neighbour told him about KisanKhata. He downloads the app and registers.

**Steps**:
1. Ramesh opens the KisanKhata mobile app and taps "Register as Farmer".
2. He enters his Aadhaar number (12 digits), selects "Madhya Pradesh → Vidisha" from the district dropdown, and selects "Wheat" as his primary crop.
3. He inputs his land holding as 2.5 acres and taps "Submit".
4. The app shows a loading animation with the message: "Fetching your farm's weather and crop data…" (≤30 seconds).
5. The KisanScore dashboard appears, showing a score of **720 – Good**, with a green gauge animation.
6. Ramesh sees a loan offer card: "Pre-Approved: ₹75,000 – ₹1,20,000 @ 9% p.a."
7. He taps "Why this score?" and reads the XAI report in Hindi: "Your wheat crop health in Vidisha is above average. However, your district has had below-average rainfall this season, which reduces your score slightly."
8. He taps "Download Credit Passport" and shares the PDF with his local State Bank branch.

**Expected Outcome**: Ramesh has a KisanScore within 10 minutes, without visiting a bank or providing ITR.

**Edge Cases**:
- NASA POWER API is slow: App shows "Fetching satellite data…" with a timeout message at 45 seconds; falls back to district average NDVI.
- Aadhaar number already registered: App shows "This Aadhaar is already linked to a profile. Log in instead."
- District has fewer than 10 scored profiles: Regional benchmark section shows "Insufficient local data."

---

### Scenario 2: Bank Officer Reviews and Approves a High-Score Application

**Context**: Priya Nair, agricultural loan officer at a regional rural bank in Nashik, logs in to the KisanKhata bank dashboard on a Monday morning.

**Steps**:
1. Priya logs in with her bank email and password. The dashboard loads showing 14 pending applications.
2. She sorts the table by KisanScore (high to low). She sees Ramesh Kumar at the top with a score of 720.
3. She clicks on Ramesh's row. The Application Detail View opens.
4. She reviews: NDVI crop health score (158/200 — Good), Rainfall Risk (120/200 — Moderate), Income Estimate (₹98,000 for the season), Ledger Check ("No existing loans found"), Distress Flag (None).
5. She reads the Claude-generated summary: "Ramesh Kumar is a reliable candidate with strong crop health and no prior loan defaults. Moderate rainfall risk is a manageable concern given his crop insurance status."
6. She clicks "Approve", sets the loan amount to ₹1,00,000, types the comment: "Good crop health; rainfall risk mitigated by PMFBY enrollment. Approved for Kisan Credit Card.", and confirms.
7. The application status updates to "Approved". Ramesh receives an SMS: "Badhai ho! Aapka loan ₹1,00,000 ke liye approve ho gaya."

**Expected Outcome**: Priya completes a full review and approval in under 5 minutes; Ramesh receives confirmation within 60 seconds.

**Edge Cases**:
- Approve button clicked accidentally: Confirmation modal requires a comment before submit; accidental taps are caught.
- Internet drops mid-approval: Form state is preserved; submission is retried; duplicate submissions are prevented by idempotency key.

---

### Scenario 3: Distress Detection and Bank Officer Intervention

**Context**: Drought warnings are issued for Osmanabad district in Maharashtra. The KisanKhata system runs its nightly distress detection job.

**Steps**:
1. The automated job detects that 7 farmer profiles in Osmanabad meet all three distress conditions: drought alert active, KisanScore dropped by ≥100 points vs. last season, and no PMFBY enrollment found.
2. All 7 profiles are flagged. Their dashboards show a red banner: "⚠ Your farm may be at risk this season. Contact your bank officer immediately."
3. The bank dashboard for Nashik Grameen Bank now shows "⚠ 7 Distress Alerts" in the navigation badge.
4. Priya opens the Distress Alerts tab. She sees Govind Yadav's entry: Score dropped from 640 to 510; Drought trigger: YES; Insurance: NOT ENROLLED; Days since flagged: 0.
5. She clicks on Govind's profile. She reads the AI summary: "Govind Yadav's score has declined significantly due to drought conditions and absence of crop insurance. Immediate support is recommended."
6. Priya calls Govind (phone number on profile), advises him to enroll in PMFBY, and marks the distress flag as "Acknowledged – Field visit scheduled for Wednesday."
7. The distress alert moves to the "In Progress" tab.

**Expected Outcome**: Govind is contacted within 24 hours of the distress flag being raised, before a potential default occurs.

**Edge Cases**:
- Distress alert is a false positive (drought warning lifted): Bank officer can clear the flag with a "False Positive" tag and comment.
- All 3 conditions appear but score data is from a stale API fetch: System logs a data quality warning alongside the distress flag.

---

## 9. Dependencies & Constraints

### Technical Constraints

- **Mobile App**: Must function on entry-level Android devices (2 GB RAM, Android 8+); APK size ≤50 MB.
- **Backend**: FastAPI (Python) with PostgreSQL for structured data and optional MongoDB for document storage. Hosted on a single cloud VM for MVP (AWS EC2 / GCP Compute Engine t3.medium equivalent).
- **API Rate Limits**: OpenWeatherMap free tier = 60 calls/minute; NASA POWER = 1,000 calls/day. Aggressive caching (Redis, 24-hour TTL per district) is mandatory.
- **ML Model**: XGBoost or Random Forest must run inference in ≤5 seconds on a single CPU core.
- **No Blockchain**: All immutability guarantees are implemented with append-only PostgreSQL audit tables, not distributed ledger.

### Business Constraints

- **Timeline**: MVP to be demo-ready within **48 hours** (hackathon constraint).
- **Team Size**: 3–5 developers (backend, ML, frontend, design).
- **Budget**: Zero third-party API cost for MVP (all free tiers used); Claude API cost capped at $20 for hackathon demo.
- **Compliance**: Aadhaar data handling must follow UIDAI guidelines; PII fields must be encrypted at rest (AES-256).

### External Dependencies (APIs)

#### Must-Have APIs (P0)

| API | Purpose | Tier Used |
|---|---|---|
| **OpenWeatherMap** | Live rainfall and temperature by district GPS coordinates | Free (60 calls/min) |
| **AGMARKNET / data.gov.in** | Government mandi crop prices by commodity and district | Free (Government Open Data) |
| **NASA POWER API** | Historical seasonal rainfall and solar radiation for risk scoring | Free (1,000 calls/day) |
| **Anthropic Claude API** | Natural-language XAI explanation of KisanScore in Hindi/English | Pay-per-use (capped at $20 for MVP) |

#### Good-to-Have APIs (P1)

| API | Purpose | Tier Used |
|---|---|---|
| **Sentinel Hub (ESA)** | Real NDVI satellite imagery per farm polygon | Free trial (limited area) |
| **MSG91 / Twilio** | SMS delivery of KisanScore and loan offer to farmer phone | Pay-per-SMS (limited to 100 SMS for MVP) |
| **eNAM API** | Richer crop price data across national agriculture markets | Free (Government API, pending approval) |
| **Google Maps / Mapbox** | Farm location visualisation on bank officer dashboard | Free tier (Mapbox: 50,000 map loads/month) |

---

## 10. Timeline & Milestones

| Milestone | Target Date | Features Included |
|---|---|---|
| **Hackathon MVP (Demo Build)** | Day 2 (48 hrs from start) | Farmer onboarding (F1), KisanScore engine (F2), Weather sub-score (F4), Mandi estimator (F5), Farmer dashboard (F7), Loan recommendation (F9), Bank dashboard basic list + detail + approve/reject (B2, B3, B4), Distress flag (F10), XAI report (F6) |
| **Post-Hackathon Prototype (V0.5)** | +2 weeks | NDVI crop health (F3), Credit Passport PDF (F11), SMS delivery (F14), Bank analytics (B6), Distress management (B5), Regional benchmark (F15) |
| **Pilot V1.0** | +8 weeks | Score history (F12), Multi-bank ledger check (F13), Scheme checker (F16), Map view (B7), Bulk export (B8), Notification centre (B9), Security hardening, bank partner onboarding |
| **Scale V1.1** | +6 months | Multi-language support, real Sentinel Hub NDVI, eNAM integration, Branch Manager role (B10), Custom score bands (B11), 10,000 farmer onboarding target |

---

## 11. Risks & Assumptions

### Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Satellite / weather API downtime** | Medium | High | District-level fallback averages; cache all API responses for 24 hours |
| **AI model bias across agro-climatic zones** | Medium | High | Regional normalisation in scoring; SHAP bias audit before pilot launch |
| **Bank skepticism of alternative credit scores** | High | High | Transparent back-testing vs. historical loan repayment data; pilot with small-ticket loans (₹25,000–₹50,000) first |
| **Data privacy / Aadhaar misuse** | Low | Very High | AES-256 encryption at rest; masked display; no UIDAI API call in MVP; consent-based data architecture |
| **Satellite cloud cover gaps** | Medium | Medium | Multi-source fallback: NASA POWER → district average → state average |
| **Low farmer smartphone adoption** | Medium | Medium | SMS score delivery (F14) serves feature-phone users; IVR is a V2 roadmap item |

### Assumptions

1. Farmers in target districts have Aadhaar numbers and can enter them on a mobile form.
2. Government AGMARKNET and NASA POWER APIs are accessible without registration for prototype volumes.
3. Bank officers are willing to use a new web dashboard alongside (not replacing) their core banking system.
4. XGBoost model trained on synthetic/proxy agricultural data will demonstrate the scoring logic adequately for hackathon demo purposes.
5. A KisanScore is treated as a credit recommendation, not a regulated credit rating, for the purposes of the MVP.

---

## 12. Non-Functional Requirements

### Performance

- KisanScore generated within **30 seconds** of farmer form submission (end-to-end, including external API calls).
- Bank dashboard Applications List loads within **3 seconds** for up to 500 records.
- Mobile app initial load within **5 seconds** on a 4G connection.
- API endpoints respond within **500 ms** (P95) for non-score-generation requests.

### Security

- Aadhaar numbers encrypted at rest with **AES-256**; masked (first 8 digits) in all UI displays and exports.
- All API communication over **HTTPS / TLS 1.2+**.
- JWT authentication with **8-hour session expiry** for bank officers.
- All approve/reject decisions are logged to an **immutable audit table** (append-only, no delete permissions).
- No PII is logged in application logs or error reporting (Sentry-style log scrubbing).

### Accessibility

- Mobile app text minimum **18sp font size** for readability on small screens.
- Colour-coded scores **always accompanied by text labels** (not colour-only), to support colour-blind users.
- Key farmer actions (submit, download, view score) accessible within **3 taps from the home screen**.
- Bank dashboard is navigable via keyboard (Tab + Enter) for accessibility compliance.

### Scalability

- Backend API is **stateless** and horizontally scalable (Docker-containerised, deploy multiple replicas behind a load balancer).
- Database schema supports **10 million farmer records** without schema migration (proper indexing on Aadhaar hash, district, crop type).
- External API calls are **cached at the district level** (Redis, 24-hour TTL) to avoid per-farmer API calls at scale.
- Score generation is **queued asynchronously** (Celery / RQ) for batch processing; farmer is notified via webhook/SMS when complete.

---

## 13. References & Resources

- NCRB Annual Report — Farmer Suicide Statistics (Source for 10,000+ deaths per year figure)
- NASA POWER API Documentation — https://power.larc.nasa.gov/api/pages/
- AGMARKNET Open Data — https://agmarknet.gov.in
- Anthropic Claude API Documentation — https://docs.anthropic.com
- OpenWeatherMap API — https://openweathermap.org/api
- PM-KISAN Scheme Portal — https://pmkisan.gov.in
- PMFBY (Pradhan Mantri Fasal Bima Yojana) — https://pmfby.gov.in
- Sentinel Hub (ESA Copernicus) — https://www.sentinel-hub.com
- eNAM (National Agriculture Market) — https://enam.gov.in
- MSG91 SMS API — https://msg91.com/api
- KisanKhata Pitch Deck — Team Utkarsh (internal reference)
