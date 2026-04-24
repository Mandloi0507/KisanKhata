# KisanKhata — Frontend Design System Guidelines
### *"Transforming Agricultural Data into Financial Trust"*

> **Version**: 1.0 | **Last Updated**: April 24, 2026 | **Team**: Utkarsh
> 
> This document governs all visual and interaction design decisions across the KisanKhata **Farmer Mobile App** (React Native / PWA) and the **Bank Officer Web Dashboard** (React). Every component, color, and spacing decision must trace back to a principle in this guide.

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Design Tokens](#2-design-tokens)
3. [Layout System](#3-layout-system)
4. [Component Library](#4-component-library)
5. [Dashboard-Specific Components](#5-dashboard-specific-components)
6. [Accessibility Guidelines](#6-accessibility-guidelines)
7. [Animation Guidelines](#7-animation-guidelines)
8. [Icon System](#8-icon-system)
9. [State Indicators](#9-state-indicators)
10. [Responsive Design](#10-responsive-design)
11. [Performance Guidelines](#11-performance-guidelines)
12. [Browser Support](#12-browser-support)

---

## 1. Design Principles

These five principles govern every design decision in KisanKhata. When in doubt, refer back to them.

### 1.1 Clarity Over Cleverness
A farmer with Class 10 education and a bank officer with years of experience should both understand the interface instantly. No jargon. No ambiguity. Every screen must communicate its single most important piece of information in under 2 seconds.

### 1.2 Trust Through Transparency
Financial tools live and die on trust. The visual system must feel authoritative, calm, and data-backed — never flashy or gimmicky. Data visualisations must be honest. Score breakdowns must be legible. Every number on screen must be sourced and dated.

### 1.3 Nature-Rooted Identity
KisanKhata serves the land. The design language draws from agricultural imagery — lush greens, earth tones, open skies. The color palette, iconography, and visual language must feel rooted in the agrarian world the product serves, not in generic fintech chrome.

### 1.4 Accessibility as a Feature
Our primary user (Ramesh Kumar) uses an entry-level Android on a 4G connection, possibly in bright sunlight. Large touch targets, high contrast, and Hindi-first copy are not afterthoughts — they are core product features.

### 1.5 Progressive Disclosure
Show the most important thing first. The KisanScore is the hero. Everything else — sub-scores, history, scheme status — is one tap deeper. Complexity is available, never imposed.

---

## 2. Design Tokens

### 2.1 Color Palette

The KisanKhata color system is built around **Forest Green** (the brand anchor), complemented by neutral warm whites and earth tones. Semantic colors are used consistently across both apps.

```css
/* =============================================
   KISANKHATA DESIGN TOKENS — colors.css
   ============================================= */

:root {

  /* ── PRIMARY: Forest Green ── */
  --color-primary-50:  #f0faf0;
  --color-primary-100: #d8f3d8;
  --color-primary-200: #aee4ae;
  --color-primary-300: #7bcf7b;
  --color-primary-400: #4db84d;
  --color-primary-500: #2d9e2d;   /* Core brand green — buttons, badges, CTAs */
  --color-primary-600: #1f8022;
  --color-primary-700: #196619;   /* Dark green — headings, hover states */
  --color-primary-800: #134d13;
  --color-primary-900: #0c340c;   /* Deepest green — nav backgrounds */

  /* ── SECONDARY: Sky Teal ── */
  --color-secondary-50:  #f0fbfc;
  --color-secondary-100: #d0f1f5;
  --color-secondary-200: #a0e3ec;
  --color-secondary-300: #5ecfde;
  --color-secondary-400: #29b8cc;
  --color-secondary-500: #119aaf;   /* Accent teal — charts, highlights */
  --color-secondary-600: #0d7d8e;
  --color-secondary-700: #0a6170;
  --color-secondary-800: #074854;
  --color-secondary-900: #04303a;

  /* ── NEUTRAL: Warm Stone ── */
  --color-neutral-0:   #ffffff;
  --color-neutral-50:  #f8f9f6;   /* App background */
  --color-neutral-100: #f0f2ec;   /* Card backgrounds */
  --color-neutral-200: #e3e7dc;   /* Borders, dividers */
  --color-neutral-300: #c8cebd;   /* Disabled borders */
  --color-neutral-400: #9ea89c;   /* Placeholder text */
  --color-neutral-500: #6b7568;   /* Secondary text */
  --color-neutral-600: #4a5147;   /* Body text */
  --color-neutral-700: #323830;   /* Headings */
  --color-neutral-800: #1e2219;   /* Dark text */
  --color-neutral-900: #0f120c;   /* Near-black */

  /* ── EARTH ACCENT: Harvest Gold ── */
  --color-earth-50:  #fdf9ec;
  --color-earth-100: #faf0c0;
  --color-earth-200: #f5de7a;
  --color-earth-300: #efc93a;     /* Score gauge — Fair/Medium range */
  --color-earth-400: #d4a917;
  --color-earth-500: #a8840d;

  /* ── SEMANTIC COLORS ── */
  --color-success-light: #d4edda;
  --color-success:       #1a7f3c;   /* Excellent score — green gauge */
  --color-success-dark:  #145c2b;

  --color-warning-light: #fff3cd;
  --color-warning:       #d97706;   /* Fair score — amber gauge */
  --color-warning-dark:  #92400e;

  --color-error-light:   #fee2e2;
  --color-error:         #dc2626;   /* Poor score, distress alerts */
  --color-error-dark:    #991b1b;

  --color-info-light:    #dbeafe;
  --color-info:          #1d4ed8;   /* Informational badges */
  --color-info-dark:     #1e3a8a;

  /* ── SCORE BAND COLORS ── */
  --score-poor:      #ef4444;   /* 0–400   Red */
  --score-fair:      #f59e0b;   /* 401–600 Amber */
  --score-good:      #84cc16;   /* 601–750 Yellow-Green */
  --score-excellent: #16a34a;   /* 751–1000 Green */

  /* ── SURFACE COLORS ── */
  --surface-page:      var(--color-neutral-50);
  --surface-card:      var(--color-neutral-0);
  --surface-overlay:   rgba(15, 18, 12, 0.55);
  --surface-nav:       var(--color-primary-900);
  --surface-nav-light: var(--color-primary-50);

  /* ── TEXT ON SURFACES ── */
  --text-primary:     var(--color-neutral-700);
  --text-secondary:   var(--color-neutral-500);
  --text-disabled:    var(--color-neutral-400);
  --text-inverse:     var(--color-neutral-0);
  --text-brand:       var(--color-primary-700);
  --text-link:        var(--color-primary-600);
  --text-link-hover:  var(--color-primary-800);
}
```

**Color Usage Rules:**

| Token | Use For | Avoid |
|---|---|---|
| `--color-primary-500` | Primary CTA buttons, active nav, badges | Body text, large backgrounds |
| `--color-primary-700` | Dark text, headings, logo mark | Small UI text (contrast) |
| `--color-primary-900` | Bank dashboard sidebar background | Farmer app (too heavy) |
| `--color-neutral-50` | Page backgrounds | Cards (too flat) |
| `--color-earth-300` | Score gauge mid-range, Fair score badge | Primary CTAs |
| `--color-error` | Distress alerts, validation errors | Decorative elements |
| `--score-*` | KisanScore gauge only | General UI decoration |

---

### 2.2 Typography

KisanKhata uses a dual-font system: **DM Sans** for professional UI clarity, and **Noto Sans Devanagari** for Hindi content (farmer app).

```css
/* ── FONT FAMILIES ── */
:root {
  --font-primary:   'DM Sans', 'Noto Sans', sans-serif;
  --font-devanagari:'Noto Sans Devanagari', 'DM Sans', sans-serif;
  --font-mono:      'DM Mono', 'Fira Code', monospace;   /* For score numbers, IDs */
  --font-display:   'DM Sans', sans-serif;               /* Hero headings */
}

/* ── FONT SIZES ── */
:root {
  --text-xs:   0.75rem;    /* 12px — captions, timestamps, labels */
  --text-sm:   0.875rem;   /* 14px — helper text, table data */
  --text-base: 1rem;       /* 16px — body text */
  --text-lg:   1.125rem;   /* 18px — lead paragraphs, card headers */
  --text-xl:   1.25rem;    /* 20px — section subheadings */
  --text-2xl:  1.5rem;     /* 24px — card titles, modal headings */
  --text-3xl:  1.875rem;   /* 30px — page headings */
  --text-4xl:  2.25rem;    /* 36px — hero headings */
  --text-5xl:  3rem;       /* 48px — KisanScore display number */
  --text-6xl:  3.75rem;    /* 60px — score hero on farmer app */
}

/* ── FONT WEIGHTS ── */
:root {
  --font-light:    300;
  --font-regular:  400;
  --font-medium:   500;
  --font-semibold: 600;
  --font-bold:     700;
  --font-extrabold:800;
}

/* ── LINE HEIGHTS ── */
:root {
  --leading-tight:   1.2;    /* Headings */
  --leading-snug:    1.35;   /* Subheadings */
  --leading-normal:  1.5;    /* Body text */
  --leading-relaxed: 1.65;   /* Long-form reading, Hindi text */
  --leading-loose:   2;      /* Widely spaced labels */
}

/* ── TYPOGRAPHY SCALE — Usage ── */
/* Farmer App: Minimum body size is 18sp (Android). Map: --text-base = 18sp */
/* Bank Dashboard: Standard web sizing, min 14px for table data */
```

**Typography Usage Guidelines:**

| Style | Size | Weight | Line Height | Use Case |
|---|---|---|---|---|
| Hero Score | `--text-6xl` | `--font-extrabold` | `--leading-tight` | KisanScore number on gauge |
| Page Heading | `--text-3xl` | `--font-bold` | `--leading-tight` | Farmer dashboard title, Bank page title |
| Card Title | `--text-2xl` | `--font-semibold` | `--leading-snug` | Metric card headers |
| Section Heading | `--text-xl` | `--font-semibold` | `--leading-snug` | XAI report sections |
| Body | `--text-base` | `--font-regular` | `--leading-normal` | General content |
| Body Large | `--text-lg` | `--font-regular` | `--leading-relaxed` | Hindi body text (farmer app) |
| Label / Caption | `--text-sm` | `--font-medium` | `--leading-normal` | Table column headers, form labels |
| Micro | `--text-xs` | `--font-regular` | `--leading-normal` | Timestamps, API disclosure notes |
| Score Number | `--text-5xl` | `--font-extrabold` | `--leading-tight` | Score on dashboard card |
| Mono / ID | `--text-sm` | `--font-regular` | — | Farmer IDs, Aadhaar masked |

---

### 2.3 Spacing Scale

```css
/* ── SPACING TOKENS ── */
:root {
  --space-0:  0px;
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-7:  28px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-14: 56px;
  --space-16: 64px;
}
```

**Spacing Usage Rules:**

| Scale | Value | Use Case |
|---|---|---|
| `--space-1` (4px) | Inline spacing between icon + label |
| `--space-2` (8px) | Tight component internal spacing, badge padding |
| `--space-3` (12px) | Button padding (vertical), tag padding |
| `--space-4` (16px) | Card internal padding (mobile), form field spacing |
| `--space-6` (24px) | Card padding (desktop), section header gap |
| `--space-8` (32px) | Between cards in a row, modal padding |
| `--space-10` (40px) | Between sections on a page |
| `--space-12` (48px) | Page header bottom padding |
| `--space-16` (64px) | Hero section spacing, large page sections |

---

### 2.4 Border Radius

```css
:root {
  --radius-none: 0px;
  --radius-sm:   4px;    /* Small tags, input fields */
  --radius-base: 6px;    /* Default buttons, table rows */
  --radius-md:   8px;    /* Cards, dropdowns */
  --radius-lg:   12px;   /* Large cards, modals */
  --radius-xl:   16px;   /* Feature cards, score card */
  --radius-2xl:  24px;   /* Hero cards, score gauge container */
  --radius-full: 9999px; /* Pills, badges, circular avatars */
}
```

---

### 2.5 Shadows

```css
:root {
  --shadow-sm:   0 1px 3px rgba(15, 18, 12, 0.08), 0 1px 2px rgba(15, 18, 12, 0.04);
  --shadow-base: 0 2px 8px rgba(15, 18, 12, 0.08), 0 1px 4px rgba(15, 18, 12, 0.06);
  --shadow-md:   0 4px 16px rgba(15, 18, 12, 0.10), 0 2px 6px rgba(15, 18, 12, 0.06);
  --shadow-lg:   0 8px 32px rgba(15, 18, 12, 0.12), 0 4px 12px rgba(15, 18, 12, 0.08);
  --shadow-xl:   0 16px 48px rgba(15, 18, 12, 0.14), 0 8px 20px rgba(15, 18, 12, 0.10);
  --shadow-green:0 4px 20px rgba(45, 158, 45, 0.25);   /* Green glow for CTA buttons */
  --shadow-score:0 8px 40px rgba(45, 158, 45, 0.20);   /* Score card ambient glow */
}
```

---

## 3. Layout System

### 3.1 Grid System

```css
/* ── CONTAINERS ── */
.container-mobile   { max-width: 480px;   padding: 0 var(--space-4);  }
.container-tablet   { max-width: 768px;   padding: 0 var(--space-6);  }
.container-desktop  { max-width: 1280px;  padding: 0 var(--space-8);  }
.container-wide     { max-width: 1440px;  padding: 0 var(--space-10); }

/* ── GRID ── */
.grid-12 { display: grid; grid-template-columns: repeat(12, 1fr); gap: var(--space-6); }
.grid-3  { display: grid; grid-template-columns: repeat(3, 1fr);  gap: var(--space-6); }
.grid-4  { display: grid; grid-template-columns: repeat(4, 1fr);  gap: var(--space-6); }
```

### 3.2 Responsive Breakpoints

```css
/* ── BREAKPOINTS ── */
/* sm  — Mobile:        < 640px  (Farmer primary device) */
/* md  — Tablet:        640px    (Field officer tablet)  */
/* lg  — Desktop:       1024px   (Bank dashboard)        */
/* xl  — Wide Desktop:  1280px   (Analytics view)        */
/* 2xl — Ultra Wide:    1536px   (Branch manager view)   */

@media (min-width: 640px)  { /* sm  — tablet */ }
@media (min-width: 1024px) { /* lg  — desktop */ }
@media (min-width: 1280px) { /* xl  — wide */ }
@media (min-width: 1536px) { /* 2xl — ultra */ }
```

### 3.3 Common Layout Patterns

**Bank Dashboard — Sidebar Layout:**
```jsx
<div className="flex h-screen bg-neutral-50 overflow-hidden">
  {/* Sidebar */}
  <aside className="w-64 bg-primary-900 text-white flex flex-col flex-shrink-0 overflow-y-auto">
    <div className="h-16 flex items-center px-6 border-b border-primary-800">
      <Logo />
    </div>
    <nav className="flex-1 px-4 py-6 space-y-1">
      <NavItem />
    </nav>
    <div className="p-4 border-t border-primary-800">
      <OfficerProfile />
    </div>
  </aside>

  {/* Main Content */}
  <main className="flex-1 flex flex-col overflow-hidden">
    <header className="h-16 bg-white border-b border-neutral-200 flex items-center px-6 justify-between flex-shrink-0">
      <PageTitle />
      <HeaderActions />
    </header>
    <div className="flex-1 overflow-y-auto p-6">
      {children}
    </div>
  </main>
</div>
```

**Farmer App — Mobile Stack Layout:**
```jsx
<div className="min-h-screen bg-neutral-50 flex flex-col">
  <header className="bg-primary-900 text-white px-4 py-4 flex items-center justify-between">
    <Logo />
    <NotificationBell />
  </header>
  <main className="flex-1 px-4 py-6 space-y-4 pb-24">
    {children}
  </main>
  <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 flex justify-around py-2 px-4">
    <BottomNavItem />
  </nav>
</div>
```

**Metric Cards Row (Bank Dashboard):**
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  <MetricCard />
  <MetricCard />
  <MetricCard />
  <MetricCard />
</div>
```

---

## 4. Component Library

### 4.1 Buttons

Buttons use a consistent shape-based hierarchy. Primary is the main action, secondary is for alternate paths, and ghost/outline is for lower-emphasis actions.

```jsx
/* ══════════════════════════════════════════
   BUTTON COMPONENT — KisanKhata
   ══════════════════════════════════════════ */

// ── BASE CLASSES (apply to all buttons) ──
const BASE = `
  inline-flex items-center justify-center font-semibold
  rounded-full transition-all duration-200
  focus:outline-none focus:ring-2 focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
  select-none
`;

// ── SIZE VARIANTS ──
const SIZES = {
  sm:  "text-sm   px-4 py-2   gap-1.5 h-9",
  md:  "text-base px-6 py-3   gap-2   h-11",
  lg:  "text-lg   px-8 py-4   gap-2   h-14 font-bold",
};

// ── COLOR VARIANTS ──
const VARIANTS = {
  // 🟢 PRIMARY — Main CTAs: "Apply Now", "Submit", "Approve"
  primary: `
    bg-primary-500 text-white
    hover:bg-primary-700 hover:shadow-green
    focus:ring-primary-500
    active:scale-95
  `,

  // ⬜ SECONDARY — "See Pricing", "Get a Demo", "Download"
  secondary: `
    bg-white text-primary-700 border border-primary-300
    hover:bg-primary-50 hover:border-primary-500
    focus:ring-primary-400
    active:scale-95
  `,

  // 🔴 DANGER — "Reject", "Delete", destructive actions
  danger: `
    bg-error text-white
    hover:bg-error-dark
    focus:ring-error
    active:scale-95
  `,

  // 👻 GHOST — Tertiary, navigation, icon-only actions
  ghost: `
    bg-transparent text-primary-700
    hover:bg-primary-50
    focus:ring-primary-400
  `,

  // 🌿 OUTLINE — "Try for Free", soft CTAs
  outline: `
    border-2 border-primary-500 text-primary-700
    hover:bg-primary-500 hover:text-white
    focus:ring-primary-400
    active:scale-95
  `,
};

// ── USAGE ──
<button className={`${BASE} ${SIZES.lg} ${VARIANTS.primary}`}>
  Try for Free
</button>

<button className={`${BASE} ${SIZES.lg} ${VARIANTS.secondary}`}>
  See Pricing
</button>

// ── WITH ICON ──
<button className={`${BASE} ${SIZES.md} ${VARIANTS.primary}`}>
  <Download size={18} />
  Download Credit Passport
</button>

// ── LOADING STATE ──
<button className={`${BASE} ${SIZES.md} ${VARIANTS.primary}`} disabled>
  <Loader2 size={18} className="animate-spin" />
  Generating Score...
</button>
```

**Accessibility:** All buttons must have `aria-label` when icon-only. Use `aria-disabled` + `disabled` together for screen readers. Minimum touch target: 44×44px on mobile (use padding to achieve this if needed).

---

### 4.2 Input Fields

```jsx
/* ── BASE LABEL ── */
const Label = ({ htmlFor, children, required }) => (
  <label
    htmlFor={htmlFor}
    className="block text-sm font-semibold text-neutral-700 mb-1.5"
  >
    {children}
    {required && <span className="text-error ml-1" aria-hidden>*</span>}
  </label>
);

/* ── BASE INPUT ── */
const inputBase = `
  w-full rounded-lg border bg-white
  text-neutral-800 placeholder-neutral-400
  transition-all duration-150
  focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-500
  disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed
`;

// ── DEFAULT state ──
// border-neutral-300

// ── ERROR state ──
// border-error ring-2 ring-error/20

// ── SUCCESS state ──
// border-success ring-2 ring-success/20

// ── SIZE ──
// sm:  px-3 py-2 text-sm  h-9
// md:  px-4 py-3 text-base h-11  (default)
// lg:  px-5 py-4 text-lg  h-14  (farmer app)

/* ── FARMER APP TEXT INPUT (larger for accessibility) ── */
<div className="space-y-1.5">
  <Label htmlFor="land-area" required>ज़मीन का रकबा (एकड़ में)</Label>
  <input
    id="land-area"
    type="number"
    placeholder="जैसे: 2.5"
    className={`${inputBase} px-5 py-4 text-lg h-14 border-neutral-300`}
  />
  <p className="text-sm text-neutral-500">न्यूनतम 0.5 एकड़</p>
</div>

/* ── ERROR STATE ── */
<div className="space-y-1.5">
  <Label htmlFor="aadhaar" required>आधार संख्या</Label>
  <input
    id="aadhaar"
    className={`${inputBase} px-5 py-4 text-lg h-14 border-error ring-2 ring-error/20`}
    aria-invalid="true"
    aria-describedby="aadhaar-error"
  />
  <p id="aadhaar-error" className="text-sm text-error flex items-center gap-1">
    <AlertCircle size={14} />
    कृपया 12 अंकों की आधार संख्या दर्ज करें
  </p>
</div>

/* ── SELECT / DROPDOWN ── */
<select className={`${inputBase} px-4 py-3 h-11 border-neutral-300`}>
  <option value="">-- राज्य चुनें --</option>
  <option value="MP">मध्य प्रदेश</option>
  <option value="MH">महाराष्ट्र</option>
</select>
```

---

### 4.3 Cards

All cards use `bg-white`, rounded corners, and a consistent shadow. The green accent stripe on the left edge is used for "featured" or "recommended" cards.

```jsx
/* ── DEFAULT CARD ── */
<div className="bg-white rounded-xl shadow-md p-6 border border-neutral-100">
  {children}
</div>

/* ── HOVER CARD (interactive) ── */
<div className="
  bg-white rounded-xl shadow-base border border-neutral-100 p-6
  cursor-pointer transition-all duration-200
  hover:shadow-lg hover:-translate-y-0.5 hover:border-primary-200
">
  {children}
</div>

/* ── KISAN SCORE CARD (hero) ── */
<div className="
  bg-white rounded-2xl shadow-score border border-primary-100 p-8
  relative overflow-hidden
">
  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-t-2xl" />
  {children}
</div>

/* ── METRIC CARD (bank dashboard) ── */
<div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-5">
  <div className="flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-neutral-500">Total Applications</p>
      <p className="text-3xl font-bold text-neutral-800 mt-1">142</p>
      <p className="text-sm text-success flex items-center gap-1 mt-1">
        <TrendingUp size={14} /> +12% this month
      </p>
    </div>
    <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
      <FileText size={20} className="text-primary-600" />
    </div>
  </div>
</div>

/* ── DISTRESS ALERT CARD ── */
<div className="bg-error-light rounded-xl border border-error/30 p-5">
  <div className="flex items-start gap-3">
    <AlertTriangle size={20} className="text-error flex-shrink-0 mt-0.5" />
    <div>
      <p className="font-semibold text-error">⚠ आपकी फसल खतरे में हो सकती है</p>
      <p className="text-sm text-error/80 mt-1">अपने बैंक अधिकारी से तुरंत संपर्क करें</p>
    </div>
  </div>
</div>

/* ── LOAN OFFER CARD ── */
<div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl text-white p-6">
  <p className="text-sm font-medium opacity-80">Pre-Approved Loan Offer</p>
  <p className="text-2xl font-bold mt-1">₹75,000 – ₹1,20,000</p>
  <p className="text-sm opacity-80 mt-0.5">@ 9% p.a. interest rate</p>
  <button className="mt-4 bg-white text-primary-700 font-semibold rounded-full px-5 py-2 text-sm hover:bg-primary-50 transition">
    Apply Now →
  </button>
</div>
```

---

### 4.4 Badges & Score Labels

```jsx
/* ── SCORE CATEGORY BADGE ── */
const ScoreBadge = ({ category }) => {
  const styles = {
    poor:      "bg-red-100    text-red-700    border-red-200",
    fair:      "bg-amber-100  text-amber-700  border-amber-200",
    good:      "bg-lime-100   text-lime-700   border-lime-200",
    excellent: "bg-green-100  text-green-700  border-green-200",
  };
  const labels = {
    poor: "Poor", fair: "Fair", good: "Good", excellent: "Excellent"
  };
  return (
    <span className={`
      inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold
      border ${styles[category]}
    `}>
      {labels[category]}
    </span>
  );
};

/* ── STATUS BADGE ── */
const StatusBadge = ({ status }) => {
  const map = {
    pending:  "bg-amber-50  text-amber-700  border-amber-200",
    approved: "bg-green-50  text-green-700  border-green-200",
    rejected: "bg-red-50    text-red-700    border-red-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${map[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

/* ── DISTRESS FLAG ICON ── */
<span className="inline-flex items-center gap-1 text-error text-xs font-bold">
  <AlertTriangle size={12} />
  DISTRESS
</span>
```

---

### 4.5 Modals

```jsx
/* ── APPROVE/REJECT CONFIRMATION MODAL ── */
<div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
  {/* Overlay */}
  <div className="absolute inset-0 bg-neutral-900/55 backdrop-blur-sm" onClick={onClose} />

  {/* Modal Panel */}
  <div className="relative mx-auto mt-16 max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
    {/* Header */}
    <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200">
      <h2 className="text-xl font-bold text-neutral-800">Confirm Approval</h2>
      <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 transition" aria-label="Close modal">
        <X size={20} />
      </button>
    </div>

    {/* Body */}
    <div className="px-6 py-5 space-y-4">
      <p className="text-neutral-600 text-sm">
        You are approving a loan of <strong className="text-primary-700">₹1,00,000</strong> for Ramesh Kumar.
      </p>
      <label className="block">
        <span className="text-sm font-semibold text-neutral-700">Decision Comment <span className="text-error">*</span></span>
        <textarea
          className="mt-1.5 w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-primary-400 focus:border-primary-500 outline-none"
          rows={3}
          placeholder="Min 10 characters — e.g. Good crop health; PMFBY enrolled."
          maxLength={500}
        />
      </label>
    </div>

    {/* Footer */}
    <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex gap-3 justify-end">
      <button className={`${BASE} ${SIZES.md} ${VARIANTS.secondary}`} onClick={onClose}>Cancel</button>
      <button className={`${BASE} ${SIZES.md} ${VARIANTS.primary}`} onClick={onConfirm}>Confirm Approval</button>
    </div>
  </div>
</div>
```

---

### 4.6 Alerts / Toasts

```jsx
/* ── TOAST VARIANTS ── */
const toastBase = "flex items-start gap-3 p-4 rounded-xl shadow-lg border max-w-sm";

// Success
<div className={`${toastBase} bg-white border-success`}>
  <CheckCircle size={20} className="text-success flex-shrink-0 mt-0.5" />
  <div>
    <p className="font-semibold text-neutral-800 text-sm">Loan Approved</p>
    <p className="text-neutral-500 text-xs mt-0.5">Farmer will be notified via SMS</p>
  </div>
  <button className="ml-auto text-neutral-400 hover:text-neutral-600"><X size={16} /></button>
</div>

// Distress Alert (red)
<div className={`${toastBase} bg-error-light border-error/40`}>
  <AlertTriangle size={20} className="text-error flex-shrink-0 mt-0.5" />
  <div>
    <p className="font-semibold text-error text-sm">Distress Alert</p>
    <p className="text-error/70 text-xs mt-0.5">Govind Yadav — Osmanabad district flagged</p>
  </div>
  <button className="ml-auto text-error/60 hover:text-error"><X size={16} /></button>
</div>

// Info (new application)
<div className={`${toastBase} bg-info-light border-info/30`}>
  <Info size={20} className="text-info flex-shrink-0 mt-0.5" />
  <div>
    <p className="font-semibold text-neutral-800 text-sm">New Application</p>
    <p className="text-neutral-500 text-xs mt-0.5">Score: 720 — Ramesh Kumar, Vidisha</p>
  </div>
</div>
```

---

### 4.7 Navigation

**Bank Dashboard Sidebar:**
```jsx
const NavItem = ({ icon: Icon, label, href, active, badge }) => (
  <a href={href} className={`
    flex items-center gap-3 px-3 py-2.5 rounded-lg
    text-sm font-medium transition-colors duration-150
    ${active
      ? 'bg-primary-700 text-white'
      : 'text-primary-200 hover:bg-primary-800 hover:text-white'
    }
  `}>
    <Icon size={18} className="flex-shrink-0" />
    <span className="flex-1">{label}</span>
    {badge && (
      <span className="bg-error text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
        {badge}
      </span>
    )}
  </a>
);

// Usage in sidebar nav:
<NavItem icon={LayoutDashboard} label="Portfolio Overview" href="/dashboard" active />
<NavItem icon={FileText}       label="Applications"      href="/applications" badge="14" />
<NavItem icon={AlertTriangle}  label="Distress Alerts"   href="/distress"    badge="3" />
<NavItem icon={BarChart2}      label="Analytics"         href="/analytics" />
<NavItem icon={Map}            label="Farmer Map"        href="/map" />
<NavItem icon={Settings}       label="Settings"          href="/settings" />
```

**Farmer App — Bottom Navigation:**
```jsx
const BottomNav = () => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-2 py-1 flex justify-around">
    {[
      { icon: Home,      label: 'होम',        href: '/'        },
      { icon: BarChart2, label: 'मेरा स्कोर', href: '/score'   },
      { icon: FileText,  label: 'रिपोर्ट',    href: '/report'  },
      { icon: User,      label: 'प्रोफाइल',   href: '/profile' },
    ].map(({ icon: Icon, label, href }) => (
      <a key={href} href={href} className="flex flex-col items-center gap-0.5 py-1 px-3 min-w-[64px]">
        <Icon size={22} className="text-primary-600" />
        <span className="text-xs font-medium text-neutral-600">{label}</span>
      </a>
    ))}
  </nav>
);
```

---

### 4.8 Progress & Onboarding Steps

```jsx
/* ── FARMER ONBOARDING STEP INDICATOR ── */
const StepIndicator = ({ currentStep, totalSteps }) => (
  <div className="flex items-center gap-2 mb-6">
    {Array.from({ length: totalSteps }, (_, i) => (
      <React.Fragment key={i}>
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
          ${i < currentStep
            ? 'bg-primary-500 text-white'
            : i === currentStep
            ? 'border-2 border-primary-500 text-primary-700'
            : 'bg-neutral-200 text-neutral-400'
          }
        `}>
          {i < currentStep ? <Check size={16} /> : i + 1}
        </div>
        {i < totalSteps - 1 && (
          <div className={`flex-1 h-1 rounded-full ${i < currentStep ? 'bg-primary-500' : 'bg-neutral-200'}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);
```

---

## 5. Dashboard-Specific Components

### 5.1 KisanScore Gauge (Farmer App Hero)

```jsx
/* ── SCORE GAUGE — SVG arc-based ── */
const KisanScoreGauge = ({ score }) => {
  const max = 1000;
  const pct = score / max;
  const radius = 80;
  const circumference = Math.PI * radius; // half circle
  const offset = circumference * (1 - pct);

  const color =
    score <= 400 ? '#ef4444' :
    score <= 600 ? '#f59e0b' :
    score <= 750 ? '#84cc16' : '#16a34a';

  const category =
    score <= 400 ? 'Poor' :
    score <= 600 ? 'Fair' :
    score <= 750 ? 'Good' : 'Excellent';

  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="110" viewBox="0 0 200 110">
        {/* Background arc */}
        <path d="M 10 100 A 90 90 0 0 1 190 100"
          fill="none" stroke="#e3e7dc" strokeWidth="16" strokeLinecap="round" />
        {/* Score arc */}
        <path d="M 10 100 A 90 90 0 0 1 190 100"
          fill="none" stroke={color} strokeWidth="16" strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s ease-out, stroke 0.5s' }}
        />
        {/* Score text */}
        <text x="100" y="85" textAnchor="middle"
          className="font-extrabold" fill={color}
          style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'DM Sans' }}>
          {score}
        </text>
      </svg>
      <ScoreBadge category={category.toLowerCase()} />
      <p className="text-xs text-neutral-500 mt-1">Last updated: Kharif 2025</p>
    </div>
  );
};
```

### 5.2 Applications Table (Bank Dashboard)

```jsx
/* ── APPLICATIONS TABLE ── */
const ApplicationsTable = ({ applications }) => (
  <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
    {/* Table Header */}
    <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-neutral-800">Loan Applications</h2>
      <div className="flex items-center gap-2">
        <button className={`${BASE} ${SIZES.sm} ${VARIANTS.secondary}`}>
          <Filter size={14} /> Filter
        </button>
        <button className={`${BASE} ${SIZES.sm} ${VARIANTS.primary}`}>
          <Download size={14} /> Export
        </button>
      </div>
    </div>

    {/* Table */}
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-neutral-50 border-b border-neutral-200">
            {['Farmer', 'KisanScore', 'Category', 'District', 'Loan Amount', 'Distress', 'Status', ''].map(h => (
              <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {applications.map(app => (
            <tr key={app.id}
              className={`hover:bg-neutral-50 transition-colors ${app.distress ? 'bg-red-50/40' : ''}`}
            >
              <td className="px-5 py-4">
                <div>
                  <p className="font-semibold text-neutral-800">{app.name}</p>
                  <p className="text-xs text-neutral-400 font-mono">{app.farmerId}</p>
                </div>
              </td>
              <td className="px-5 py-4">
                <span className="text-xl font-bold" style={{ color: getScoreColor(app.score) }}>
                  {app.score}
                </span>
              </td>
              <td className="px-5 py-4"><ScoreBadge category={getCategory(app.score)} /></td>
              <td className="px-5 py-4 text-neutral-600">{app.district}</td>
              <td className="px-5 py-4 font-medium text-neutral-800">₹{app.loanAmount.toLocaleString('en-IN')}</td>
              <td className="px-5 py-4">
                {app.distress && (
                  <span className="inline-flex items-center gap-1 text-error text-xs font-bold">
                    <AlertTriangle size={12} /> Alert
                  </span>
                )}
              </td>
              <td className="px-5 py-4"><StatusBadge status={app.status} /></td>
              <td className="px-5 py-4">
                <button className="text-primary-600 hover:text-primary-800 font-medium text-sm">Review →</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Pagination */}
    <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
      <p className="text-sm text-neutral-500">Showing 1–20 of 142 applications</p>
      <div className="flex items-center gap-1">
        <button className={`${BASE} ${SIZES.sm} ${VARIANTS.ghost}`}><ChevronLeft size={16} /></button>
        <button className={`${BASE} ${SIZES.sm} ${VARIANTS.primary}`}>1</button>
        <button className={`${BASE} ${SIZES.sm} ${VARIANTS.ghost}`}>2</button>
        <button className={`${BASE} ${SIZES.sm} ${VARIANTS.ghost}`}>3</button>
        <button className={`${BASE} ${SIZES.sm} ${VARIANTS.ghost}`}><ChevronRight size={16} /></button>
      </div>
    </div>
  </div>
);
```

### 5.3 XAI Score Breakdown (Farmer App)

```jsx
/* ── SHAP FACTOR ROW ── */
const ShapFactor = ({ label, score, maxScore, direction, description }) => {
  const pct = (score / maxScore) * 100;
  const isPositive = direction === 'positive';
  return (
    <div className="py-4 border-b border-neutral-100 last:border-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-semibold text-neutral-700">{label}</span>
        <span className={`text-sm font-bold ${isPositive ? 'text-success' : 'text-error'}`}>
          {isPositive ? '+' : '–'}{score}/{maxScore}
        </span>
      </div>
      <div className="h-2 bg-neutral-200 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-700 ${isPositive ? 'bg-primary-500' : 'bg-error'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-neutral-500">{description}</p>
    </div>
  );
};

// Usage:
<ShapFactor
  label="Crop Health (NDVI)"
  score={158} maxScore={200}
  direction="positive"
  description="Your wheat crop health in Vidisha is above district average this season."
/>
<ShapFactor
  label="Rainfall Risk"
  score={90} maxScore={200}
  direction="negative"
  description="Below-average rainfall this season slightly reduces your score."
/>
```

### 5.4 Portfolio Analytics Panel (Bank Dashboard)

```jsx
/* ── ANALYTICS METRIC CARDS ── */
const analyticsMetrics = [
  { label: 'Total Applications', value: '142', trend: '+12%', icon: FileText,   color: 'primary' },
  { label: 'Approval Rate',      value: '68%', trend: '+4%',  icon: CheckCircle, color: 'success' },
  { label: 'Avg. KisanScore',    value: '641', trend: '+23',  icon: BarChart2,   color: 'secondary' },
  { label: 'Distress Alerts',    value: '7',   trend: 'Active', icon: AlertTriangle, color: 'error' },
];

const colorMap = {
  primary:   { bg: 'bg-primary-50',   icon: 'text-primary-600',   value: 'text-primary-700'   },
  success:   { bg: 'bg-green-50',     icon: 'text-green-600',     value: 'text-green-700'     },
  secondary: { bg: 'bg-teal-50',      icon: 'text-teal-600',      value: 'text-teal-700'      },
  error:     { bg: 'bg-red-50',       icon: 'text-red-600',       value: 'text-red-700'       },
};
```

---

## 6. Accessibility Guidelines

KisanKhata targets **WCAG 2.1 Level AA** across both applications. Given our farmer persona (low literacy, bright outdoor conditions), we exceed AA in font sizes and touch targets.

### 6.1 Color Contrast

| Text Type | Minimum Ratio | KisanKhata Target |
|---|---|---|
| Normal body text (< 18px) | 4.5:1 | ≥ 5.5:1 |
| Large text (≥ 18px bold) | 3:1 | ≥ 4.5:1 |
| UI components (borders, icons) | 3:1 | ≥ 3.5:1 |

All score colors (`--score-*`) must be paired with white background and pass contrast. Never use color alone to convey score status — always pair with a text label.

### 6.2 Touch Targets (Mobile)

```css
/* WCAG minimum: 24×24px. KisanKhata minimum: 44×44px */
.touch-target {
  min-width: 44px;
  min-height: 44px;
}

/* For visually smaller elements (e.g. icon buttons), use padding to achieve touch target */
.icon-button {
  padding: 10px;  /* adds to visual 24px icon → 44px total */
}
```

### 6.3 Focus Indicators

```css
/* Visible 3px green ring on all interactive elements */
:focus-visible {
  outline: 3px solid var(--color-primary-500);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```

### 6.4 Form Accessibility

```jsx
/* ✅ CORRECT — label linked to input, error linked via aria-describedby */
<div>
  <label htmlFor="aadhaar-input" className="...">Aadhaar Number</label>
  <input
    id="aadhaar-input"
    aria-required="true"
    aria-invalid={hasError}
    aria-describedby={hasError ? "aadhaar-error" : undefined}
  />
  {hasError && (
    <p id="aadhaar-error" role="alert" className="text-error text-sm">
      Please enter a 12-digit Aadhaar number.
    </p>
  )}
</div>
```

### 6.5 Semantic HTML

- Use `<button>` for actions, `<a>` for navigation. Never use `<div onClick>`.
- Use `<nav>` for navigation, `<main>` for primary content, `<aside>` for sidebar.
- Use `<table>` with `<thead>`, `<tbody>`, `scope="col"` for the applications table.
- Score gauge must include an `aria-label` with the numeric value and category: `aria-label="KisanScore: 720 – Good"`.

### 6.6 Hindi Language Support

```css
/* Devanagari text needs larger line-height for legibility */
[lang="hi"], .text-hindi {
  font-family: var(--font-devanagari);
  line-height: var(--leading-relaxed);
  font-size: var(--text-lg);   /* Minimum on farmer app */
}
```

---

## 7. Animation Guidelines

KisanKhata uses animations purposefully — to communicate progress, confirm actions, and reveal data. Animations never play for decoration alone.

### 7.1 Timing

```css
:root {
  --duration-instant: 100ms;   /* Hover color changes, toggles */
  --duration-fast:    200ms;   /* Button states, badge changes */
  --duration-normal:  300ms;   /* Modal open/close, slide transitions */
  --duration-slow:    500ms;   /* Page transitions, chart reveals */
  --duration-score:   1200ms;  /* Score gauge fill animation — the hero moment */

  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);   /* ease-in-out */
  --ease-bounce:  cubic-bezier(0.34, 1.56, 0.64, 1); /* Score reveal bounce */
  --ease-out:     cubic-bezier(0, 0, 0.2, 1);
}
```

### 7.2 Core Animations

```css
/* ── SCORE REVEAL (most important animation in the product) ── */
@keyframes scoreReveal {
  from { stroke-dashoffset: 251; opacity: 0; }
  to   { stroke-dashoffset: var(--target-offset); opacity: 1; }
}

/* ── FADE UP (cards, sections entering view) ── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-up { animation: fadeUp 300ms var(--ease-out) forwards; }

/* ── CARD STAGGER (metric cards on dashboard load) ── */
.card:nth-child(1) { animation-delay: 0ms; }
.card:nth-child(2) { animation-delay: 80ms; }
.card:nth-child(3) { animation-delay: 160ms; }
.card:nth-child(4) { animation-delay: 240ms; }

/* ── PROGRESS BAR FILL (SHAP factors) ── */
@keyframes barFill {
  from { width: 0; }
  to   { width: var(--target-width); }
}

/* ── DISTRESS PULSE ── */
@keyframes distressPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
  50%       { box-shadow: 0 0 0 8px rgba(220, 38, 38, 0); }
}
.distress-indicator { animation: distressPulse 2s ease-in-out infinite; }

/* ── REDUCED MOTION ── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 7.3 What to Animate

| Animate | Don't Animate |
|---|---|
| Score gauge fill (hero moment) | Background colors alone |
| Card entrance on page load | Text reflows |
| Bar chart fills in XAI report | Tooltip appearances |
| Modal open/close (transform + opacity) | Skeleton loaders (just show/hide) |
| Toast notifications (slide in from right) | Navigation transitions (too slow for officers) |
| Distress alert pulse ring | Table rows (too many, causes jank) |

---

## 8. Icon System

KisanKhata uses **Lucide React** for all iconography.

```bash
npm install lucide-react
```

### 8.1 Icon Sizes

| Size | Pixels | Use Case |
|---|---|---|
| `size={16}` | 16px | Inside badges, inline text icons, micro actions |
| `size={18}` | 18px | Button icons, nav items (sidebar) |
| `size={20}` | 20px | Card action icons, alert icons |
| `size={24}` | 24px | Bottom nav tabs (farmer app), section headers |
| `size={32}` | 32px | Empty state illustrations, feature icons |
| `size={48}` | 48px | Onboarding step icons, success screens |

### 8.2 Standard Icon Set

```jsx
import {
  // Navigation
  Home, LayoutDashboard, FileText, BarChart2,
  Map, Settings, User, Bell, LogOut,

  // Actions
  Download, Upload, Filter, Search,
  ChevronLeft, ChevronRight, ChevronDown, X, Check,
  ArrowRight, ArrowUpRight,

  // Status
  AlertTriangle, AlertCircle, CheckCircle,
  Info, TrendingUp, TrendingDown, Loader2,

  // Domain (Agriculture / Finance)
  Leaf, Sun, CloudRain, Wind,       // Weather
  Banknote, CreditCard, Wallet,     // Finance
  QrCode, FileDown, Share2,         // Credit Passport
  Building2, Users, Shield,         // Bank / Compliance
} from 'lucide-react';
```

### 8.3 Icon Usage Rules

```jsx
/* ✅ Correct — icon paired with label, aria-hidden */
<button className="flex items-center gap-2">
  <Download size={18} aria-hidden="true" />
  Download Report
</button>

/* ✅ Correct — icon-only with aria-label */
<button aria-label="Close modal">
  <X size={20} aria-hidden="true" />
</button>

/* ❌ Wrong — no accessible label */
<button onClick={close}>
  <X size={20} />
</button>
```

---

## 9. State Indicators

### 9.1 Loading States

```jsx
/* ── SCORE LOADING (Farmer App — primary loading state) ── */
<div className="flex flex-col items-center gap-4 py-12">
  <div className="relative w-20 h-20">
    <div className="absolute inset-0 rounded-full border-4 border-primary-100" />
    <div className="absolute inset-0 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
    <Leaf size={28} className="absolute inset-0 m-auto text-primary-500" />
  </div>
  <div className="text-center">
    <p className="font-semibold text-neutral-700">आपके खेत का डेटा ला रहे हैं…</p>
    <p className="text-sm text-neutral-500 mt-1">Fetching satellite and weather data</p>
  </div>
</div>

/* ── SKELETON CARD (Bank Dashboard) ── */
<div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100 animate-pulse">
  <div className="h-4 bg-neutral-200 rounded-full w-32 mb-3" />
  <div className="h-8 bg-neutral-200 rounded-full w-20 mb-2" />
  <div className="h-3 bg-neutral-100 rounded-full w-24" />
</div>

/* ── TABLE ROW SKELETON ── */
<tr className="animate-pulse">
  <td className="px-5 py-4"><div className="h-4 bg-neutral-200 rounded-full w-28" /></td>
  <td className="px-5 py-4"><div className="h-6 bg-neutral-200 rounded-full w-12" /></td>
  <td className="px-5 py-4"><div className="h-5 bg-neutral-200 rounded-full w-16" /></td>
</tr>
```

### 9.2 Empty States

```jsx
/* ── NO APPLICATIONS ── */
<div className="flex flex-col items-center gap-4 py-16 text-center">
  <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center">
    <FileText size={28} className="text-primary-400" />
  </div>
  <div>
    <p className="text-lg font-semibold text-neutral-700">No Applications Yet</p>
    <p className="text-sm text-neutral-500 mt-1 max-w-xs">
      Farmer applications will appear here once submitted.
    </p>
  </div>
</div>

/* ── NO DISTRESS ALERTS ── */
<div className="flex flex-col items-center gap-4 py-12 text-center">
  <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
    <CheckCircle size={28} className="text-success" />
  </div>
  <div>
    <p className="text-lg font-semibold text-neutral-700">All Clear</p>
    <p className="text-sm text-neutral-500 mt-1">No active distress flags in your portfolio.</p>
  </div>
</div>
```

### 9.3 Error States

```jsx
/* ── API ERROR ── */
<div className="bg-error-light border border-error/30 rounded-xl p-6 flex items-start gap-3">
  <AlertCircle size={20} className="text-error flex-shrink-0 mt-0.5" />
  <div>
    <p className="font-semibold text-error">Could Not Fetch Score Data</p>
    <p className="text-sm text-error/70 mt-0.5">
      Satellite data unavailable. Showing district-level estimate instead.
    </p>
    <button className="text-sm font-medium text-error mt-2 underline underline-offset-2">
      Retry
    </button>
  </div>
</div>
```

---

## 10. Responsive Design

### 10.1 Approach

KisanKhata uses a **dual-first** strategy:
- **Farmer App**: Mobile-first (smallest screen, lowest bandwidth, largest font)
- **Bank Dashboard**: Desktop-first (data-dense, multi-column, keyboard-navigable)

Both share the same design token system; only layout and typography scales differ.

### 10.2 Breakpoint Strategy

```
Farmer App Breakpoints:
  Default (0+):   Single column, 16px margins, 18sp minimum font
  sm (640px+):    Tablet two-column for onboarding, wider cards
  md (768px+):    Full PWA view for kiosk/assisted use

Bank Dashboard Breakpoints:
  Default (0+):   Collapsed sidebar, stacked cards (field use)
  lg (1024px+):   Full sidebar, 4-column metric grid, table view
  xl (1280px+):   Wide content, side-by-side panels, map view
```

### 10.3 Responsive Typography

```css
/* Farmer App — scales up from base */
.score-number { font-size: clamp(3rem, 12vw, 4.5rem); }
.page-title   { font-size: clamp(1.5rem, 5vw, 2.25rem); }

/* Bank Dashboard — scales down for smaller screens */
.metric-value { font-size: clamp(1.5rem, 3vw, 2.25rem); }
.table-text   { font-size: clamp(0.75rem, 1.5vw, 0.875rem); }
```

### 10.4 Responsive Farmer App Patterns

```jsx
// Metric cards: 1 col mobile → 2 col tablet
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <MetricCard />
  <MetricCard />
</div>

// Sub-score bars: full-width on all mobile
<div className="w-full space-y-4">
  <ShapFactor />
</div>

// CTA button: full-width on mobile, auto on tablet
<button className="w-full sm:w-auto ...">
  Download Credit Passport
</button>
```

---

## 11. Performance Guidelines

Given the target of ≤5 second initial load on 4G for the farmer app:

### 11.1 Asset Optimization

- All images served in **WebP format** with JPEG fallback
- Score gauge uses **SVG** (not Canvas or image) — zero loading time
- Icons from **Lucide React** are tree-shaken (import only what you use)
- Font loading: `font-display: swap` on all custom fonts; preload critical font files

### 11.2 Code Splitting

```jsx
// Lazy load non-critical pages
const ScoreHistoryPage = React.lazy(() => import('./pages/ScoreHistory'));
const XAIReportPage    = React.lazy(() => import('./pages/XAIReport'));
const MapView          = React.lazy(() => import('./pages/MapView'));  // Bank only

// Wrap in Suspense with skeleton fallback
<Suspense fallback={<CardSkeleton />}>
  <XAIReportPage />
</Suspense>
```

### 11.3 API & Data Caching

- External API responses (NDVI, weather) are **cached 24 hours** at district level (Redis backend)
- Bank dashboard table data is **paginated** (20 rows default) — never load all 500 records
- Score gauge is rendered with the **last known score** immediately on load; refreshed async

### 11.4 Mobile-Specific

- APK / PWA bundle ≤ 50 MB total
- No autoplay videos or GIF animations
- Use `loading="lazy"` on all non-hero images
- Avoid layout shift: reserve space for score gauge before data loads

---

## 12. Browser Support

### 12.1 Supported Browsers

| Platform | Browser | Version |
|---|---|---|
| Android | Chrome | Last 3 versions (farmer primary browser) |
| Android | Samsung Internet | Last 2 versions |
| iOS | Safari | Last 2 versions |
| Desktop | Chrome | Last 2 versions |
| Desktop | Firefox | Last 2 versions |
| Desktop | Edge | Last 2 versions |
| Desktop | Safari | Last 2 versions |

> **Note:** Internet Explorer is not supported. The bank dashboard requires Chrome 90+ or equivalent for CSS Grid and SVG features.

### 12.2 Progressive Enhancement

```jsx
// 1. Core content works without JS (SSR / static score values)
// 2. Score gauge animates when JS loads
// 3. Real-time notifications activate when WebSocket connects
// 4. PDF generation requires JS (falls back to server-rendered link)
```

### 12.3 Feature Detection

```javascript
// Check for IntersectionObserver (for scroll-triggered chart animations)
if ('IntersectionObserver' in window) {
  // Enable scroll animations
} else {
  // Show charts without animation
}

// Check for CSS custom properties (required — polyfill if absent)
if (!CSS.supports('color', 'var(--color-primary-500)')) {
  loadPolyfill('css-vars-ponyfill');
}
```

---

## Appendix A — KisanKhata Component Checklist

Before shipping any new component, verify:

- [ ] Uses only design tokens (no hardcoded hex values or pixel values)
- [ ] Has all required states: default, hover, focus, disabled, loading, error
- [ ] Hindi text uses `font-devanagari` class and `leading-relaxed`
- [ ] Touch targets ≥ 44×44px on mobile
- [ ] Color not used as sole differentiator (text label paired with color)
- [ ] `aria-label` present on all icon-only interactive elements
- [ ] Score display always includes category label (not score number alone)
- [ ] Distress states include both visual indicator AND text description
- [ ] Aadhaar numbers masked (XXXXXXXX + last 4 digits) in all display contexts
- [ ] Tested on Android Chrome (farmer components) and Desktop Chrome (bank components)

---

## Appendix B — Score Band Quick Reference

| Score Range | Category | Color Token | Gauge Color |
|---|---|---|---|
| 0 – 400 | Poor | `--score-poor` | `#ef4444` Red |
| 401 – 600 | Fair | `--score-fair` | `#f59e0b` Amber |
| 601 – 750 | Good | `--score-good` | `#84cc16` Yellow-Green |
| 751 – 1000 | Excellent | `--score-excellent` | `#16a34a` Green |

| Score Range | Loan Amount | Interest Rate |
|---|---|---|
| 0 – 400 | Not eligible | — |
| 401 – 600 | ₹25,000 – ₹50,000 | 12–14% p.a. |
| 601 – 750 | ₹50,000 – ₹1,00,000 | 9–12% p.a. |
| 751 – 1000 | ₹1,00,000 – ₹2,00,000 | 7–9% p.a. |

---

*KisanKhata Frontend Guidelines v1.0 — Team Utkarsh — April 24, 2026*
*Built for Ramesh. Trusted by Priya. Powered by real farm data.*
