# 🇵🇰 Project AINA – Backend Architecture & API Documentation
**AI National Assistant for Pakistani Civic Problem Resolution (NYLP AI Hackathon 2026)**

---

## 🏛️ Executive Summary

Project AINA's backend is an enterprise-grade, high-performance Node.js service engineered to bridge the gap between Pakistani citizens and complex bureaucratic governance structures. Built with **Node.js 24**, **Express 5**, and native **`node:sqlite` (WAL Mode)**, it guarantees zero native build friction, instant sub-millisecond local queries, ACID compliance, and complete bilingual support (**English & اردو**).

---

## 🚀 Key Architectural Pillars

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Runtime** | Node.js v24.21+ (ES Modules) | Modern JavaScript standards, native modules, high performance |
| **HTTP Framework** | Express 5 | Robust routing, middleware support, and JSON parsing |
| **Database** | Native `node:sqlite` (WAL Mode) | Zero external dependencies, ultra-fast synchronous operations, persistent relational storage with foreign keys |
| **Validation** | Zod 4 | Strict input parameter schema validation & sanitized payloads |
| **Security** | Helmet & CORS | Production HTTP headers and cross-origin resource sharing protection |
| **AI Layer** | Gemini 1.5 Flash + Cognitive Heuristic Matrix | Hybrid architecture: Live LLM when API key is provided, with built-in Pakistani Civic Intelligence Engine fallback |
| **Privacy** | 13-Digit Masked CNICs | Automatically masks citizen CNICs (e.g. `35201-*****67-1`) |

---

## 📁 Project Structure

```
ANA/
├── backend/
│   ├── config/
│   │   ├── env.js                # Environment variable loader with defaults
│   │   └── db.js                 # node:sqlite WAL mode connector & schema initializer
│   ├── db/
│   │   ├── schema.sql            # SQL DDL for cases, timeline, directory, statutes
│   │   └── seed.js               # Verified Pakistani civic directory & laws seeder
│   ├── middleware/
│   │   ├── errorHandler.js       # Centralized JSON error & 404 handler
│   │   ├── requestLogger.js      # Structured HTTP request logger with ms timing
│   │   └── validate.js           # Reusable Zod schema validation middleware
│   ├── routes/
│   │   ├── aiRoutes.js           # POST /api/ai/diagnose, POST /api/ai/draft
│   │   ├── caseRoutes.js         # CRUD, search, diary updates, petition export
│   │   ├── directoryRoutes.js    # Verified emergency helplines & official portals
│   │   ├── lawsRoutes.js         # Legal acts, citizen rights, and penalty clauses
│   │   ├── analyticsRoutes.js    # Real-time platform grievance statistics
│   │   └── healthRoutes.js       # System health & database connection checks
│   ├── services/
│   │   ├── aiService.js          # Bilingual heuristic cognitive matrix & Gemini LLM
│   │   ├── caseService.js        # Tracking code generator, petition formatter & timeline
│   │   ├── directoryService.js   # Civic directory search & category aggregation
│   │   ├── lawsService.js        # Pakistani statutes query handler
│   │   └── analyticsService.js   # Real-time case distribution metrics
│   ├── app.js                    # Express application setup & middleware assembly
│   └── server.js                 # Server entry point & graceful shutdown listeners
├── .env.example                  # Environment configuration template
├── vite.config.js                # Vite dev server with /api proxy to localhost:5000
└── package.json                  # Integrated start, dev, build, seed, and preview scripts
```

---

## ⚙️ Configuration (`.env`)

```env
PORT=5000
NODE_ENV=development

# Optional: Google Gemini API Key for dynamic real-time LLM reasoning
# If left blank, AINA will use its built-in Pakistani Civic Intelligence Engine!
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash

# Database path (Default: ./backend/data/aina.sqlite)
DB_PATH=./backend/data/aina.sqlite

# CORS Allowed Origin
CORS_ORIGIN=*
```

---

## 🏃 Available NPM Commands

```bash
# Run both Backend API and Vite Frontend concurrently
npm run dev

# Run only Backend Server (Port 5000)
npm run server

# Run only Vite Frontend (Port 5173 with proxy)
npm run client

# Re-seed Database with Pakistani Civic Directory and Acts
npm run seed

# Build Production Frontend Bundle
npm run build
```

---

## 📡 REST API Reference

### 1. System Health
- **`GET /api/health`**
  Returns server uptime, database status, and AI provider availability.

### 2. AI Civic Intelligence
- **`POST /api/ai/diagnose`**
  Analyzes citizen problem in English, Urdu, or Roman Urdu. Identifies category, competent authority, governing law, 4-phase actionable roadmap, and pre-drafts bilingual complaint letters.
  ```json
  // Request
  {
    "input": "My electricity bill has a 75,000 detection bill claiming meter tampering without any notice"
  }
  ```
- **`POST /api/ai/draft`**
  Generates standard legal complaint text for specific civic departments.

### 3. Case Tracking & Management
- **`POST /api/cases`**
  Saves a drafted petition to the database and generates an official tracking ID (e.g. `AINA-PK-2026-X8F2`).
  ```json
  // Request
  {
    "category": "utilities",
    "title": "Bogus Detection Bill Dispute",
    "description": "75,000 detection units charged without notice",
    "authorityName": "LESCO / NEPRA",
    "applicantName": "Muhammad Ali Khan",
    "applicantCnic": "35201-1234567-1",
    "applicantPhone": "0300-1234567",
    "referenceId": "14-24512-9876543 U",
    "status": "draft"
  }
  ```
- **`GET /api/cases`**
  Search cases by tracking code, phone number, category, or status (`?query=LESCO&status=diary_assigned`).
- **`GET /api/cases/:trackingId`**
  Returns full case dossier with complete chronological timeline milestones.
- **`PATCH /api/cases/:trackingId/status`**
  Updates case status and assigns an official receiving diary number (e.g., SDO Diary # or Police Roznamcha #).
  ```json
  // Request
  {
    "status": "diary_assigned",
    "diaryNumber": "LESCO-MT-2026-8941",
    "officer": "SDO Reader",
    "note": "Formal application submitted; diary number issued and sent for physical verification."
  }
  ```
- **`POST /api/cases/:trackingId/timeline`**
  Appends custom milestone events to the case timeline.
- **`GET /api/cases/:trackingId/export?lang=en|ur`**
  Exports clean, formatted official legal petition ready for print or submission.

### 4. Civic Directory & Helplines
- **`GET /api/directory?category=police&search=15`**
  Returns verified Pakistani emergency lines, utility complaint desks, and official portals.
- **`GET /api/directory/categories`**
  Returns listing counts grouped by category.

### 5. Legal Knowledgebase
- **`GET /api/laws?category=utilities`**
  Returns governing Pakistani statutes, CrPC sections, NEPRA CSM codes, and penalty clauses.

### 6. Platform Analytics
- **`GET /api/analytics/overview`**
  Returns live grievance statistics: total petitions, active cases, category distribution, and top petitioned authorities.
