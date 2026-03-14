# 🛒 SmartGrocery — Price Comparison Platform

Save money on groceries by comparing prices across Blinkit, Zepto, Swiggy Instamart, BigBasket, Amazon, and Flipkart Minutes in one place.

---

## 🗂 Project Structure

```
smartgrocery/
├── frontend/          # React + Vite + Tailwind CSS
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/        # Route-level pages
│       ├── hooks/        # Custom React hooks
│       ├── context/      # Auth & Cart context
│       └── lib/          # API client, utilities
├── backend/           # Python FastAPI
│   ├── routers/       # API route handlers
│   ├── models/        # SQLAlchemy ORM models
│   ├── schemas/       # Pydantic schemas
│   ├── services/      # Business logic
│   ├── data/          # Seed data
│   └── utils/         # Helpers (auth, email, etc.)
└── docs/              # Architecture docs
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+

### 1. Clone & install

```bash
git clone https://github.com/your-org/smartgrocery.git
cd smartgrocery
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env
# Edit .env with your DB credentials and secrets

# Create database
createdb smartgrocery

# Run migrations & seed data
python -m alembic upgrade head
python seed.py

# Start dev server
uvicorn main:app --reload --port 8000
```

### 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local: VITE_API_URL=http://localhost:8000

npm run dev
# Open http://localhost:5173
```

---

## 🌐 API Docs

FastAPI auto-generates interactive docs:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 🚀 Deployment

### Backend (Railway / Render / EC2)

```bash
# Set environment variables on your platform:
DATABASE_URL=postgresql://user:pass@host:5432/smartgrocery
SECRET_KEY=your-secret-key-here
FRONTEND_URL=https://your-frontend-domain.com

# Build command:
pip install -r requirements.txt && alembic upgrade head

# Start command:
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Frontend (Vercel / Netlify)

```bash
# Build command: npm run build
# Output directory: dist
# Environment variables:
VITE_API_URL=https://your-backend-api.com
```

### Docker (optional)

```bash
docker-compose up --build
```

---

## 🔐 Default Admin Credentials (dev only)

- Email: admin@smartgrocery.in
- Password: Admin@123

---

## 📊 Tech Stack

| Layer       | Technology              |
|-------------|-------------------------|
| Frontend    | React 18, Vite, Tailwind CSS |
| Backend     | Python FastAPI          |
| Database    | PostgreSQL + SQLAlchemy |
| Auth        | JWT (python-jose)       |
| Charts      | Recharts                |
| Background  | APScheduler (price jobs)|
| Cache       | Redis (optional)        |

---

## 📋 MVP Scope (v1)

- [x] User auth (signup/login)
- [x] Product catalog with 50+ items
- [x] Cart management
- [x] Price comparison across 6 platforms
- [x] Cheapest cart recommendation
- [x] Price drop alerts
- [x] Savings dashboard
- [x] AI grocery planner (GPT-powered)
- [x] Admin dashboard

## 🗺 Roadmap (v2)

- [ ] Real-time price scraping (Playwright/Puppeteer)
- [ ] Affiliate link integration (earn per click)
- [ ] Mobile app (React Native)
- [ ] WhatsApp/SMS price alerts
- [ ] Subscription-based premium features
- [ ] Bulk order / group buying feature
- [ ] Loyalty points tracker
- [ ] Voice-based search
