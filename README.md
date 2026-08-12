# Weather Explorer 🌤️

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js-000000.svg)](https://nextjs.org/)
[![Google Cloud Storage](https://img.shields.io/badge/Cloud-Google%20Cloud%20Storage-4285F4.svg)](https://cloud.google.com/storage)
[![Open-Meteo](https://img.shields.io/badge/Data-Open--Meteo-FF6F00.svg)](https://open-meteo.com/)

A production-grade, full-stack application built from scratch to query historical daily weather metrics from Open-Meteo, archive raw JSON files in Google Cloud Storage (with auto local storage fallback), and display temperature trends using interactive Recharts line graphs and paginated tables.

---

## 📌 Links

- **GitHub Repository**: `https://github.com/your-username/weather-explorer` (Placeholder)
- **Live Frontend**: `https://weather-explorer.vercel.app` (Placeholder)
- **Backend API (Cloud Run)**: `https://weather-explorer-backend-uc.a.run.app` (Placeholder)

---

## 🏗️ Architecture Overview

```
                        +----------------------------+
                        |  Browser (Next.js Dashboard)|
                        +--------------+-------------+
                                       |
                                       v  HTTP (CORS)
                        +--------------+-------------+
                        |   FastAPI Backend Service   |
                        +-------+--------------+-----+
                                |              |
            Historical Weather  |              | Raw JSON Storage
            API Request         v              v
                  +-------------+---+     +----+-----------------------+
                  |  Open-Meteo API |     | Google Cloud Storage (GCS) |
                  |  (Archive API)  |     | (or Local Fallback Dir)   |
                  +-----------------+     +----------------------------+
```

> **Security Note**: The client browser **never** connects directly to Google Cloud Storage or Open-Meteo. All storage access and external API calls pass securely through the FastAPI backend API.

---

## ✨ Features

1. **Weather Search & Input**:
   - Accepts Latitude ($-90$ to $90$) and Longitude ($-180$ to $180$).
   - Accepts Start Date and End Date ($YYYY-MM-DD$).
   - Client-side & server-side validation enforcing max 31 calendar days per request.

2. **Cloud Storage Archiving**:
   - Calls Open-Meteo Archive API requesting `temperature_2m_max`, `temperature_2m_min`, `apparent_temperature_max`, and `apparent_temperature_min`.
   - Stores FULL raw JSON response in Google Cloud Storage following deterministic naming:
     `weather_<lat>_<lon>_<start>_<end>_<timestamp>.json`
   - Includes automatic local directory fallback (`.gcs_local/`) for local development without active GCP credentials.

3. **Cloud Object Browser**:
   - Lists stored JSON objects with size in Bytes/KB and created ISO timestamps using GCS object metadata listing.

4. **Data Visualization**:
   - Interactive Recharts line chart displaying maximum, minimum, and apparent temperatures.
   - Paginated daily weather data table supporting **10, 20, or 50 rows per page**.

5. **Production Quality**:
   - Fully containerized backend with Dockerfile optimized for Google Cloud Run.
   - Comprehensive unit test suite with `pytest` and mocks.
   - Strict TypeScript interfaces and error state handling.

---

## 📂 Repository Structure

```
InRisks/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app, CORS, exception handlers
│   │   ├── config.py            # Pydantic environment configuration
│   │   ├── models.py            # Request / response pydantic models
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   └── weather.py       # API endpoints (/store-weather-data, /list-weather-files, /weather-file-content/{file})
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── open_meteo.py    # httpx Open-Meteo API client
│   │       ├── storage.py       # GCS SDK integration with local fallback
│   │       └── validation.py    # Request validation logic
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_validation.py  # Validation unit tests
│   │   └── test_weather.py     # Endpoint unit tests with pytest mocks
│   ├── Dockerfile               # Production Cloud Run container specification
│   ├── requirements.txt         # Python dependencies
│   └── .env.example             # Backend environment template
├── frontend/
│   ├── app/
│   │   ├── layout.tsx           # Root HTML layout & metadata
│   │   ├── page.tsx             # Dashboard page
│   │   └── globals.css          # Tailwind CSS styles
│   ├── components/
│   │   ├── WeatherInput.tsx     # Lat/Lon/Date input form
│   │   ├── StoredFiles.tsx      # Stored files list panel
│   │   ├── WeatherChart.tsx     # Recharts line chart
│   │   ├── WeatherTable.tsx     # Paginated data table
│   │   ├── LoadingState.tsx     # Loading spinner component
│   │   ├── ErrorMessage.tsx     # Error alert banner
│   │   └── EmptyState.tsx       # Empty placeholder component
│   ├── lib/
│   │   ├── api.ts               # Centralized API fetch client
│   │   ├── types.ts             # TypeScript interfaces
│   │   └── weather.ts           # Data transformation utilities
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   └── .env.example             # Frontend environment template
├── .gitignore
├── implementation_plan.md
└── README.md
```

---

## 🛠️ Tech Stack & Requirements

- **Backend**: Python 3.11+, FastAPI, Pydantic v2, `httpx`, `google-cloud-storage`, `pytest`, `uvicorn`.
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts, `lucide-react`.
- **Cloud Infrastructure**: Google Cloud Run (Backend), Google Cloud Storage (Bucket), Vercel (Frontend).

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=8000
FRONTEND_ORIGIN=http://localhost:3000
GCS_BUCKET_NAME=your-weather-explorer-bucket
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
OPEN_METEO_BASE_URL=https://archive-api.open-meteo.com/v1/archive
USE_LOCAL_STORAGE=false
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

---

## 🚀 Running Locally

### 1. Setup Backend

```bash
# Navigate to backend directory
cd backend

# Create & activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
uvicorn app.main:app --reload --port 8000
```
FastAPI interactive Swagger documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

### 2. Setup Frontend

```bash
# Open a new terminal in frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Next.js development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Automated Tests

### Backend Unit Tests
```bash
cd backend
pytest tests/ -v
```

### Frontend Linting & Type Checks
```bash
cd frontend
npm run lint
npx tsc --noEmit
npm run build
```

---

## ☁️ Google Cloud Storage Setup & Authentication

### 1. Create GCS Bucket
```bash
gcloud storage buckets create gs://your-weather-explorer-bucket --location=us-central1
```

### 2. Local Authentication
For local development against real Google Cloud Storage:
```bash
gcloud auth application-default login
```
Set `GCS_BUCKET_NAME=your-weather-explorer-bucket` and `GOOGLE_CLOUD_PROJECT=your-gcp-project-id` in `backend/.env`.

---

## 🐳 Docker & Cloud Run Deployment

### Docker Build & Local Run
```bash
cd backend
docker build -t weather-explorer-backend .
docker run -p 8000:8000 -e PORT=8000 weather-explorer-backend
```

### Deploy to Google Cloud Run
```bash
# Build & submit container to Artifact Registry / Container Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/weather-explorer-backend backend/

# Deploy to Cloud Run with service account granted GCS Storage Object Admin role
gcloud run deploy weather-explorer-backend \
  --image gcr.io/YOUR_PROJECT_ID/weather-explorer-backend \
  --platform managed \
  --region us-central1 \
  --set-env-vars GCS_BUCKET_NAME=your-weather-explorer-bucket,FRONTEND_ORIGIN=https://weather-explorer.vercel.app \
  --allow-unauthenticated
```

---

## 📡 API Endpoint Documentation

### 1. `POST /store-weather-data`
Queries Open-Meteo and archives JSON in Cloud Storage.

**Request Body**:
```json
{
  "latitude": 17.3850,
  "longitude": 78.4867,
  "start_date": "2026-08-01",
  "end_date": "2026-08-07"
}
```

**Response (200 OK)**:
```json
{
  "status": "ok",
  "file": "weather_17.3850_78.4867_2026-08-01_2026-08-07_20260812183000.json"
}
```

**Response (400 Bad Request)**:
```json
{
  "status": "error",
  "message": "Date range exceeds 31 days (35 calendar days requested)."
}
```

### 2. `GET /list-weather-files`
Lists stored weather JSON objects.

**Response (200 OK)**:
```json
{
  "files": [
    {
      "name": "weather_17.3850_78.4867_2026-08-01_2026-08-07_20260812183000.json",
      "size": 1420,
      "created_at": "2026-08-12T18:30:00Z"
    }
  ]
}
```

### 3. `GET /weather-file-content/{file}`
Fetches content of a specific weather JSON file.

**Response (200 OK)**:
Returns raw Open-Meteo JSON object.

**Response (404 Not Found)**:
```json
{
  "status": "error",
  "message": "not found"
}
```

---

## 🛡️ Security & Design Decisions

1. **Path Traversal Protection**: Filename parameters are validated using strict regex `^weather_[a-zA-Z0-9_\-\.]+\.json$` to prevent directory traversal attacks.
2. **Credential Safety**: No hardcoded API keys or service account JSON keys. Credentials rely on Google Cloud Application Default Credentials (ADC) or runtime IAM roles.
3. **No Direct Storage Access**: The browser client does not interact directly with GCS, avoiding public bucket permissions.
4. **Free Tier Friendly**: Built exclusively with free-tier services (Open-Meteo free API, Cloud Run free tier allowance, Vercel Hobby tier).
