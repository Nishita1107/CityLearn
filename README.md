# 🏙️ CityLearn

### Cities Forget. CityLearn Remembers.

**AI-Powered Traffic Institutional Memory System for Event-Driven Congestion Management**

[![Frontend](https://img.shields.io/badge/frontend-Next.js-black)](#)
[![Backend](https://img.shields.io/badge/backend-FastAPI-009688)](#)
[![ML](https://img.shields.io/badge/ML-CatBoost%20%7C%20Scikit--Learn-orange)](#)
[![License](https://img.shields.io/badge/license-MIT-blue)](#-license)

🔗 **Live Demo:** https://city-learn.vercel.app

---

## 📌 Table of Contents

- [Problem Statement](#-problem-statement)
- [Our Solution](#-our-solution)
- [Core Workflow](#-core-workflow)
- [CityLearn Engine](#-citylearn-engine)
- [Similar Event Retrieval](#-similar-event-retrieval)
- [Impact Prediction Engine](#-impact-prediction-engine)
- [Recommendation Engine](#-recommendation-engine)
- [Traffic Intelligence Dashboard](#-traffic-intelligence-dashboard)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Sample Recommendation Output](#-sample-recommendation-output)
- [Impact](#-impact)
- [Future Enhancements](#-future-enhancements)
- [License](#-license)

---

## 🚦 Problem Statement

Urban traffic authorities face recurring congestion caused by:

- Political Rallies
- Festivals
- Sports Events
- Construction Activities
- Vehicle Breakdowns
- Accidents
- Sudden Public Gatherings

Despite years of operational experience, traffic response strategies are often:

- Experience-driven
- Poorly documented
- Not reusable
- Lacking post-event learning

As a result, cities repeatedly solve the same traffic problems without learning from previous incidents.

---

## 💡 Our Solution

**CityLearn** is a self-learning traffic intelligence platform that transforms historical traffic incidents into operational knowledge.

Instead of treating every traffic disruption as a new problem, CityLearn learns from thousands of past events and recommends the best response strategy for future incidents — acting as an **institutional memory system** for traffic authorities.

---

## 🔄 Core Workflow

```
New Event
   ↓
Generate Event Fingerprint
   ↓
Find Similar Historical Events
   ↓
Predict Traffic Impact
   ↓
Recommend Response Strategy
   ↓
Visualize Insights
   ↓
Compare Actual Outcome
   ↓
Learn & Improve
```

---

## 🧬 CityLearn Engine

Every traffic event is converted into a unique fingerprint using:

- Event Type
- Event Cause
- Corridor
- Police Station
- Zone
- Priority
- Road Closure Requirement
- Time of Day
- Day of Week

**Example:**

```
Event Type: Vehicle Breakdown
Cause: Engine Failure
Corridor: Mysore Road
Police Station: Byatarayanapura
Priority: Medium
Road Closure: False
Hour: 09
```

This fingerprint is transformed into vector embeddings using Sentence Transformers.

---

## 🔍 Similar Event Retrieval

When a new event occurs, CityLearn searches historical records and retrieves the most similar incidents.

**Outputs include:**

- Top Similar Events
- Similarity Scores
- Common Causes
- Recommended Police Station
- Recommended Corridor
- Historical Outcomes

This enables traffic operators to leverage past operational knowledge instantly.

---

## 📈 Impact Prediction Engine

CityLearn predicts operational impact before traffic conditions worsen.

**Current Prediction Model — Road Closure Prediction**

Predicts:
- Whether road closure is required
- Probability of closure

**Model Accuracy: 93%+**

Features used: Event Type, Corridor, Police Station, Priority, Event Cause, Time Features.

---

## 🧭 Recommendation Engine

Using historical similarity and prediction outputs, CityLearn recommends:

| Category | Description |
|---|---|
| **Manpower Deployment** | Suggested police station and response area |
| **Barricading Strategy** | Whether barricades should be deployed |
| **Congestion Risk** | Low / Moderate / High |
| **Operational Actions** | Monitor Traffic Flow, Deploy Barricades Early, Increase Police Presence, Activate Diversion Plan |

---

## 📊 Traffic Intelligence Dashboard

Interactive dashboard features:

- **Traffic Command Center** — Real-time event monitoring
- **Event Analysis** — Historical event insights
- **Prediction Dashboard** — AI-generated forecasts
- **Recommendation Center** — Operational recommendations
- **Event Replay Engine** — Learn from previous incidents
- **Knowledge Graph** — Relationships between Event → Cause → Congestion → Response → Outcome

---

## 🛠 Tech Stack

**AI & Machine Learning**
- Python
- Scikit-Learn
- Sentence Transformers
- CatBoost
- Cosine Similarity / Vector Search

**Backend**
- FastAPI
- Uvicorn
- Pandas / NumPy
- Pydantic

**Frontend**
- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Recharts
- Framer Motion / GSAP
- MongoDB (Mongoose)

---

## 📁 Project Structure

```
CityLearn/
├── backend/                     # FastAPI backend (deployed on Hugging Face Spaces)
│   ├── app/
│   │   ├── main.py              # Proxy entry point → backend/main.py
│   │   └── schemas.py           # Pydantic request/response models
│   ├── main.py                  # Unified FastAPI application & routes
│   ├── fingerprint_engine.py    # Event → fingerprint conversion
│   ├── similarity_service.py    # Similar-event retrieval
│   ├── prediction_service.py    # ML prediction service
│   ├── recommendation_service.py# Recommendation engine
│   ├── citylearn_cleaned_data.csv
│   ├── citylearn_embeddings.pkl
│   └── requirements.txt
│
├── citylearn/                   # Next.js frontend (deployed on Vercel)
│   ├── src/
│   │   ├── app/                 # App router pages & API routes
│   │   ├── components/          # UI components
│   │   ├── lib/                 # DB connection, API helpers
│   │   └── models/              # Mongoose models
│   └── package.json
│
├── ml/                          # Model training pipeline
│   ├── preprocess.py
│   └── train.py
│
├── docs/
│   └── architecture.md          # Fingerprint engine architecture
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm / yarn / pnpm
- MongoDB instance (local or Atlas)

### 1. Clone the repository

```bash
git clone https://github.com/Nishita1107/CityLearn.git
cd CityLearn
```

### 2. Backend setup (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate      # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.

### 3. Frontend setup (Next.js)

```bash
cd citylearn
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

> Make sure the backend is running and `NEXT_PUBLIC_API_URL` (see below) points to it.

---

## 🔐 Environment Variables

### Frontend (`citylearn/.env.local`)

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the FastAPI backend | `http://localhost:8000` (local) / your Hugging Face Space URL (production) |
| `MONGO_URI` | MongoDB connection string used for auth/profile data | `mongodb+srv://...` |

### Backend (`backend/.env`)

The backend currently runs without required secrets out of the box, but add any here if you introduce them (e.g. API keys, DB URIs for future services).

---

## 📡 API Reference

Base URL: `http://localhost:8000` (local) or your Hugging Face Space URL (production).

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health/root check |
| `GET` | `/health` | Service health status |
| `POST` | `/analyze-event` | Full pipeline: fingerprint → similarity → prediction → recommendation |
| `GET` | `/api/last-analysis` | Retrieve the last analyzed event |
| `POST` | `/predict/closure` | Predict road closure probability |
| `POST` | `/predict/priority` | Predict event priority |
| `POST` | `/predict/manpower` | Predict manpower deployment needs |
| `POST` | `/api/fingerprint` | Generate event fingerprint |
| `POST` | `/api/similar-events` | Retrieve similar historical events |
| `POST` | `/api/predictions` | Get model predictions |
| `POST` | `/api/recommendations` | Get response recommendations |
| `POST` | `/api/learning` | Feed actual outcomes back into the learning loop |
| `GET` | `/api/metrics` | Model/engine metrics |
| `GET` | `/api/dashboard-metrics` | Aggregated metrics for the dashboard |
| `POST` | `/api/lessons-learned` | Lessons-learned summary for an event |
| `POST` | `/api/predictive-intelligence` | Predictive intelligence summary |
| `POST` | `/api/strategic-recommendations` | Strategic, higher-level recommendations |

Interactive Swagger docs are available at `/docs` once the backend is running.

---

## ☁️ Deployment

This project is designed to be deployed as two independent services:

### Backend → [Hugging Face Spaces](https://huggingface.co/spaces)

The backend is deployed as a **Docker Space** on Hugging Face.

1. Create a new **Space** → choose the **Docker** SDK.
2. Push/upload the contents of the `backend/` folder to the Space repo (or point the Space to this GitHub repo).
3. Add a `Dockerfile` in `backend/` (Spaces expect the app to listen on port `7860` by default):

   ```dockerfile
   FROM python:3.11-slim

   WORKDIR /app
   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt

   COPY . .

   EXPOSE 7860
   CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
   ```

4. Commit/push — the Space will build and start the FastAPI app automatically.
5. Your backend will be live at:
   `https://<your-username>-<space-name>.hf.space`

> Note: Hugging Face Spaces sleep after a period of inactivity on the free tier — the first request after idling may take a few seconds to wake up.

### Frontend → [Vercel](https://vercel.com)

1. Import this repository into Vercel.
2. Set the **Root Directory** to `citylearn`.
3. Add environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_API_URL` → your Hugging Face Space URL
   - `MONGO_URI` → your MongoDB connection string
4. Deploy.


> 💡 After deploying both services, update the placeholder links at the top of this README with the live demo and deployment URLs.

---

## 📦 Sample Recommendation Output

```json
{
  "similar_events_found": 10,
  "road_closure_probability": "10.0%",
  "recommended_police_station": "Byatarayanapura",
  "recommended_corridor": "Mysore Road",
  "common_cause": "vehicle_breakdown",
  "expected_congestion": "Moderate",
  "recommended_action": "Monitor traffic flow"
}
```

---

## 🌍 Impact

CityLearn helps traffic authorities:

- Forecast event-related congestion
- Improve resource deployment
- Reduce response time
- Reuse operational knowledge
- Learn from past incidents
- Make data-driven decisions

---

## 🔮 Future Enhancements

- Real-Time Traffic Feed Integration
- Dynamic Diversion Planning
- Officer Allocation Optimization
- Congestion Heatmaps
- LLM-Powered Traffic Assistant
- Predictive City-Wide Traffic Simulation

---

## 📄 License

This project is licensed under the MIT License — feel free to use, modify, and build on it.

---

<p align="center">Built with ❤️ to help cities remember and respond smarter.</p>
