# 🌾 CropDr. — AI-Powered Crop Disease Diagnosis & Agricultural Advisory

> **Protecting Harvests. Empowering Farmers. Building Bharat.**

CropDr. is a modern, AI-powered web platform designed to assist Indian farmers with instantaneous crop disease diagnosis, customized multi-day treatment plans, dynamic weather risk analysis, and 24/7 multilingual agricultural advisory.

---

## 📋 Table of Contents
- [Overview](#-overview)
- [The Problem](#-the-problem)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running the Application](#running-the-application)
- [API Documentation](#-api-documentation)
- [Security & Privacy](#-security--privacy)
- [License](#-license)

---

## 🌟 Overview

CropDr. equips farmers with the expertise of an agricultural specialist right in their pocket. By simply snapping photos of affected crop leaves or stems, farmers receive:
1. **Instant Disease Identification** with confidence scoring and severity metrics.
2. **Actionable Treatment Plans** featuring organic remedies and chemical solutions available in local Indian markets.
3. **Hyperlocal Weather Disease Risk** assessing temperature, humidity, and rainfall to predict outbreaks before they spread.
4. **AI Agronomist Chat** providing structured advice in English and regional Indian languages.

---

## 🚨 The Problem

* **146+ Million** farming families across India have limited access to certified agricultural extension officers.
* **20% to 40%** of crop yield is lost annually due to unidentified or misdiagnosed crop pathogens.
* **₹50,000+ Crore** in economic losses occur each year because diagnosis is sought too late.
* **Language & Usability Barriers** prevent smallholder farmers from benefiting from digital advisory tools.

---

## ✨ Key Features

### 🔬 Multi-Image AI Disease Detection
* Upload up to **5 photos** from different angles for enhanced diagnostic accuracy.
* Powered by Google Gemini Vision models to detect diseases, assess severity percentages, evaluate spread risk, and estimate recovery odds.
* Immediate emergency action alerts for fast-spreading pathogens.

### 🗓️ India-Specific Treatment Protocols
* Step-by-step treatment schedule (Day 1 → Day 3 → Day 7 → Day 14).
* Organic alternatives alongside approved chemical fungicides/pesticides easily accessible across India.
* Export comprehensive diagnostic reports as **PDF** with one click.

### 🔒 User Privacy & Data Protection
* Scan history is isolated and strictly private to each authenticated user account.
* Protected endpoints prevent unauthorized access to other farmers' scan reports.

### 🌦️ Live Indian Weather & Pathogen Risk Monitor
* Search any Indian city, district, or village (e.g., *Pune, Ludhiana, Nashik, Karnal, Varanasi, Jaipur*).
* Fast state presets covering 20+ major agricultural states in India.
* Real-time weather parameters (temperature, humidity, precipitation, wind) paired with pathogen risk alerts.

### 🤖 24/7 Multilingual AI Agronomist Chat
* Context-aware conversational assistant trained on Indian agronomy practices.
* Well-structured responses with clear bullet points, bold highlights, and step-by-step guides.
* Full chat session persistence to review past queries anytime.

### 🔐 Flexible Authentication
* **Google Sign-In** via Google Identity Services (GIS).
* Standard Email & Password registration and login with secure bcrypt hashing and JWT tokens.

### 🎙️ Voice Input (Web Speech API)
* Speak crop symptoms directly into the microphone in preferred regional languages.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Semantic HTML5, CSS3 (Modern Flexbox/Grid), Vanilla JavaScript (ES6+), Google Identity Services (GIS), html2pdf.js |
| **Backend** | Node.js, Express.js |
| **AI / LLM** | Google Gemini API (`@google/generative-ai`) |
| **Database** | SQLite3 (WAL mode, persistent storage) |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs, Google OAuth 2.0 |
| **Weather & Geocoding** | Open-Meteo API with Indian geographic coordinates mapping |

---

## 📁 Project Architecture

```
Cropdr-main/
├── backend/
│   ├── database/
│   │   ├── cropdr.db          # SQLite persistent database file
│   │   └── db.js              # SQLite connection, schemas & query helpers
│   ├── middleware/
│   │   └── auth.js            # JWT verification middleware
│   ├── routes/
│   │   ├── analyze.js         # Multimodal AI crop analysis (Gemini Vision)
│   │   ├── auth.js            # Register, Login & Google OAuth routes
│   │   ├── chat.js            # Multilingual AI chat & session history
│   │   ├── scans.js           # User scan history & report retrieval
│   │   ├── user.js            # User profile management
│   │   └── weather.js         # Open-Meteo weather & disease risk engine
│   ├── .env.example           # Template for environment variables
│   ├── package.json           # Backend dependencies and start scripts
│   └── server.js              # Express application entrypoint
├── frontend/
│   ├── css/
│   │   └── style.css          # Design system, responsive styles & chat markdown
│   ├── js/
│   │   ├── auth.js            # Authentication & Google Sign-In handlers
│   │   ├── dashboard.js       # Dashboard logic, scans, weather & AI chat
│   │   ├── i18n.js            # Multilingual translation dictionaries
│   │   └── main.js            # Landing page interactions & navigation
│   ├── auth.html              # Login & registration portal
│   ├── dashboard.html         # Main farmer dashboard & diagnostics suite
│   └── index.html             # Landing page
├── package.json               # Root scripts for starting full stack
└── README.md                  # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

### Installation

1. **Clone or navigate to the repository:**
   ```bash
   cd Cropdr-main
   ```

2. **Install backend dependencies:**
   ```bash
   npm run install:backend
   ```
   *(Or navigate directly to `backend` and run `npm install`)*

---

### Environment Configuration

1. In the `backend/` directory, create a `.env` file (you can copy from `backend/.env.example`):
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Configure your keys in `backend/.env`:
   ```env
   # Server configuration
   PORT=3001
   JWT_SECRET=your_super_secret_jwt_key_here

   # Google Gemini API Key (Free Tier Available)
   # Obtain from: https://aistudio.google.com/app/apikey
   GEMINI_API_KEY=your_gemini_api_key_here

   # Google OAuth 2.0 Client ID (For Google Login)
   # Obtain from: https://console.cloud.google.com/apis/credentials
   GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
   ```

---

### Running the Application

Start the backend server:
```bash
npm start
```
*(Alternatively: `cd backend && npm start`)*

Once started, the backend automatically serves the frontend static assets:
* **Landing Page**: [http://localhost:3001](http://localhost:3001)
* **Farmer Dashboard**: [http://localhost:3001/dashboard.html](http://localhost:3001/dashboard.html)
* **Auth Portal**: [http://localhost:3001/auth.html](http://localhost:3001/auth.html)
* **Health Check**: [http://localhost:3001/api/health](http://localhost:3001/api/health)

> [!TIP]
> If you prefer serving frontend files separately during UI development, you can use any static server such as `npx serve frontend -p 8080` or VS Code Live Server. The frontend automatically detects if it's served on a different port and communicates seamlessly with `http://localhost:3001`.

---

## 🔌 API Documentation

| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/health` | Service health status and Gemini configuration check | No |
| `POST` | `/api/auth/register` | Register a new user account | No |
| `POST` | `/api/auth/login` | Login with email and password | No |
| `POST` | `/api/auth/google` | Verify Google ID token and sign in / sign up | No |
| `GET` | `/api/auth/google/client-id` | Retrieve public Google OAuth Client ID | No |
| `POST` | `/api/analyze` | Upload crop photos and receive AI disease diagnosis | Yes |
| `GET` | `/api/scans` | Fetch scan history and statistics for logged-in user | Yes |
| `GET` | `/api/scans/:id` | Fetch specific scan diagnosis details | Yes |
| `DELETE` | `/api/scans/:id` | Delete a scan record | Yes |
| `POST` | `/api/chat` | Send message to AI agronomist and receive reply | Yes |
| `GET` | `/api/chat/sessions` | Retrieve previous chat conversations | Yes |
| `GET` | `/api/chat/sessions/:id` | Retrieve message history for a chat session | Yes |
| `GET` | `/api/weather` | Query live weather, disease risks & forecasts by location | No |
| `GET` | `/api/user/profile` | Retrieve user profile details | Yes |
| `PUT` | `/api/user/profile` | Update profile information (location, crops, language) | Yes |

---

## 🔒 Security & Privacy

* **Data Isolation**: User scans and diagnostic reports are strictly mapped to the authenticated user's ID. Unauthorized attempts to query other users' scans are blocked with `403 Forbidden`.
* **Password Security**: Passwords are encrypted using salted `bcryptjs` hashing.
* **Token Authentication**: Secure JWT bearer tokens protect all agricultural analysis, history, and chat endpoints.
* **CORS & Rate Limiting**: General rate limiting (200 req/15min) and dedicated AI rate limiting (10 req/min) prevent API abuse and safeguard quota limits.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
