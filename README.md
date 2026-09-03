# OnboardPro — Software Engineering Training & Onboarding Tracker

> **“Track. Train. Become Production Ready.”**  
> *Developed by Gunjan Hedaoo*

An enterprise SaaS platform engineered to track, manage, and accelerate technical onboarding for software engineering teams.

---

## 🌟 Key Features

- 🔐 **Authentication & Security**:
  - **Google OAuth 2.0 Integration**: Sign in with any Google / Gmail account with CSRF state validation, backend token exchange, and automatic session persistence.
  - **First-Time Developer Setup**: Automated profile provisioning, capturing employee ID, engineering squad, role, and experience level.
  - **Role-Based Access Control (RBAC)**: Distinct, protected portals for **Engineering Managers / Admins** and **Software Developers**.
  - **1-Click Offline Demo Accounts**: Instant evaluation access for Admin and Developer personas.

- 📊 **Executive & Developer Dashboards**:
  - **Admin Overview**: Cohort velocity, department readiness distribution, SLA compliance tracker, overdue flags, and gamification leaderboards.
  - **Developer Portal**: Personalized training roadmaps, streak counters, XP progression, interactive checklists, and certificate downloads.

- 📚 **Comprehensive Technical Curriculum**:
  - 12 comprehensive engineering training modules with interactive lessons, terminal sandboxes, code review exercises, and timed assessments.

- 🌓 **Enterprise Theme Engine**:
  - Seamless toggle between **Light Theme**, **Dark Theme**, and **System OS Synchronization**.

- 🛠️ **Backend API Engine**:
  - Full REST API with endpoints for `/api/health`, `/api/auth/me`, `/api/auth/config`, `/api/reports`, and `/api/teams`.
  - Standalone Node.js Express server (`server.js`) and integrated Vite dev server middleware.

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/gunjancs23149/Software-Engineering-Training-Onboarding-Tracker.git
cd Software-Engineering-Training-Onboarding-Tracker
npm install
```

### 2. Environment Configuration (Optional for Google OAuth)
Copy the example environment file:
```bash
cp .env.example .env
```
Fill in your Google Cloud OAuth 2.0 credentials if live Google sign-in is required:
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5173/auth/google/callback
SESSION_SECRET=your_secure_session_secret
ADMIN_EMAILS=admin@onboardpro.dev,alex.morgan@onboardpro.dev
```

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

---

## 📂 Project Architecture

```
├── public/                 # Static public assets and icons
├── src/
│   ├── components/
│   │   ├── assessments/    # Assessment list, quiz runner & results
│   │   ├── auth/           # Enterprise login, Google OAuth modal & onboarding
│   │   ├── common/         # Navbar, Sidebar, modals & certificates
│   │   ├── dashboard/      # Admin analytics, KPI cards & tables
│   │   ├── developer-view/ # Developer roadmaps, gamification & checklists
│   │   ├── developers/     # Developer profiles & management
│   │   ├── modules/        # Interactive curriculum & lesson viewer
│   │   ├── notifications/  # Notification center
│   │   ├── progress/       # Progress matrices & SLA tracking
│   │   ├── reports/        # Executive export & compliance analytics
│   │   └── settings/       # System preferences & appearance/theme tab
│   ├── context/            # AuthContext, DataContext, RouterContext, ThemeContext, ToastContext
│   ├── data/               # Seed datasets & module curriculum
│   ├── types/              # TypeScript models and interfaces
│   └── utils/              # Math calculations, date formatters & export tools
├── server.js               # Dedicated Node.js backend server
├── vite-plugin-google-auth.ts # Vite OAuth middleware
└── vite.config.ts          # Vite configuration
```

---

## 📜 License & Attribution

© 2026 OnboardPro System · Software Engineering Training & Readiness Platform · **Developed by Gunjan Hedaoo**
