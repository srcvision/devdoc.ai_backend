# 🛡️ DevDoc.AI - Backend API Service 🩺

The core intelligence and orchestration layer for the DevDoc.AI SaaS ecosystem. This backend handles AI analysis, secure authentication, and project health metrics.

---

## 🚀 Tech Stack

- **Runtime**: `Node.js` (LTS)
- **Framework**: `Express.js` (High-performance API)
- **Database**: `MongoDB Atlas` with `Mongoose` ODM
- **Intelligence**: `Gemini 1.5 Flash` & `Groq SDK`
- **Security**: `JWT` + `bcryptjs`
- **Error Handling**: `express-async-handler` + Custom Middlewares

---

## 🏗️ Architecture & Modules

The backend follows a **Modular Layered Architecture** to ensure scalability and ease of maintenance:

### 📂 Directory Overview
- **`controllers/`**: Core business logic and tool orchestration.
- **`routes/`**: Defined RESTful endpoints for Auth and AI Tools.
- **`models/`**: Mongoose schemas for Users and Analysis Reports.
- **`services/`**: Integration layer for Gemini AI and external APIs.
- **`middleware/`**: JWT-based protection and centralized error handling.
- **`config/`**: Database and security configurations.

---

## 📡 API Documentation

### 🔐 Authentication
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Create a new project account. |
| `POST` | `/api/auth/login` | Authenticate and receive a secure JWT. |
| `GET` | `/api/auth/me` | Fetch detailed profile of the current user. |

### 🧠 AI Analytics Tools (JWT Protected)
| Method | Endpoint | Payload | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/tools/code-review` | `{ code }` | General code health and best practices audit. |
| `POST` | `/api/tools/bug-detect` | `{ code }` | Scans for potential logic and runtime bugs. |
| `POST` | `/api/tools/security-scan` | `{ code }` | Identifies vulnerabilities like injections. |
| `POST` | `/api/tools/performance` | `{ code }` | Analyzes performance bottlenecks. |
| `POST` | `/api/tools/code-quality` | `{ code }` | Scores readability and complexity. |
| `POST` | `/api/tools/architecture` | `{ code }` | Audits system design and decoupling. |
| `POST` | `/api/tools/github-analyze` | `{ repoUrl }` | Automated deep-dive into remote repositories. |
| `POST` | `/api/tools/debug` | `{ code }` | Root-cause analysis of provided stack traces. |
| `POST` | `/api/tools/explain` | `{ code }` | Step-by-step plain English explanations. |

### 📊 Report Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/tools/reports` | List all historical analysis reports. |
| `GET` | `/api/tools/reports/:id` | Fetch specific details of a single report. |
| `DELETE` | `/api/tools/reports/:id` | Permanently remove a report. |
| `GET` | `/api/tools/dashboard-stats` | Aggregated analytics for the user dashboard. |

---

## 🛠️ Installation & Environment Setup

### 1️⃣ Clone and Install
```bash
git clone https://github.com/your-username/devdoctor-ai.git
cd devdoctor-ai/backend
npm install
```

### 2️⃣ Environment Configuration
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_premium_secret_key
GEMINI_API_KEY=your_gemini_api_key
GITHUB_TOKEN=your_github_rest_api_token
```

### 3️⃣ Running the Server
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

---

## 🔒 Security & Performance
- **Stateless Auth**: JWT protection for all intelligence endpoints.
- **Payload Sanitization**: Protecting the AI engine from injection attacks.
- **Stat Tracking**: All report metadata is persisted for longitudinal health tracking.
- **CORS Protection**: Origin-restricted access for secure service delivery.

---
**Powering the next generation of AI-driven code intelligence.**
