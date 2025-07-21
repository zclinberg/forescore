# Forescore Golf Scoreboard

A real-time golf tournament scoreboard application built with React and Flask, deployed on Google Cloud Platform.

## 🏌️ Live App

**URL:** https://forescore.app

## 🏗️ Architecture

- **Frontend:** React (deployed to App Engine)
- **Backend:** Flask API (deployed to App Engine)
- **Database:** Google Cloud Firestore
- **Hosting:** Google App Engine with custom domain

## 🚀 Deployment Commands

### Prerequisites
```bash
# Install Google Cloud SDK
# Install Node.js and npm
# Set up Google Cloud project
gcloud auth login
gcloud config set project forescore-golf
```

### Backend Deployment
```bash
cd backend
gcloud app deploy
```

### Frontend Deployment
```bash
# Build React app
npm install
npm run build

# Deploy to App Engine
gcloud app deploy frontend-app.yaml
```

### Custom Domain Setup
```bash
# Map domains
gcloud app domain-mappings create forescore.app
gcloud app domain-mappings create www.forescore.app

# Check domain status
gcloud app domain-mappings describe forescore.app
```

### Database Setup
```bash
# Enable Firestore
gcloud services enable firestore.googleapis.com
gcloud services enable appengine.googleapis.com

# Create Firestore database
gcloud firestore databases create --region=us-central
```

## 🛠️ Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```
Backend runs on http://localhost:5000

### Frontend
```bash
npm install
npm start
```
Frontend runs on http://localhost:3000

## 📁 Project Structure

```
forescore/
├── src/
│   ├── App.js              # Main React component
│   └── index.js            # React entry point
├── backend/
│   ├── app.py              # Flask API server
│   ├── main.py             # App Engine entry point
│   ├── requirements.txt    # Python dependencies
│   └── app.yaml            # App Engine config
├── public/
│   └── index.html          # HTML template
├── build/                  # Production build (auto-generated)
├── package.json            # Node.js dependencies
├── frontend-app.yaml       # Frontend App Engine config
└── README.md
```

## 🏆 Tournament Features

### Teams
- **Chiefs:** Chris-Tyler, Todd-Joe, Steve-Darby, Gardner-Russ
- **Royals:** Dowell-Rick, Andy-Zac, Marrah-Ben, Ethan-Bross

### Scoring
- 18-hole course (Par 72)
- Two rounds per pairing
- Real-time score updates
- Team standings and leaderboard
- Score-to-par calculations

## 🔧 API Endpoints

### Get All Scores
```bash
GET /api/scores
curl https://forescore.app/api/scores
```

### Update Score
```bash
PUT /api/scores
curl -X PUT https://forescore.app/api/scores \
  -H "Content-Type: application/json" \
  -d '{"pairingId": 1, "round": "round1", "holeIndex": 0, "score": 4}'
```

### Health Check
```bash
GET /health
curl https://forescore.app/health
```

## 📊 Database Schema

**Firestore Collection:** `golf-scores`
**Document:** `current_tournament`

```json
{
  "scores": {
    "1": {
      "round1": [4, 3, null, ...],
      "round2": [null, null, null, ...]
    },
    "2": { ... },
    ...
  },
  "lastUpdated": "2025-07-15T02:16:17.601778"
}
```

## 🌐 DNS Configuration

**Domain:** forescore.app (managed via Squarespace)

### A Records (Root Domain)
```
@ → 216.239.32.21
@ → 216.239.34.21
@ → 216.239.36.21
@ → 216.239.38.21
```

### CNAME Record (WWW)
```
www → ghs.googlehosted.com
```

## 🔐 Security

- HTTPS enabled automatically via Google-managed SSL certificates
- CORS enabled for cross-origin requests
- Firestore security rules allow read/write access

## 📝 Development Notes

### Score Input Logic
- Entering `0` converts to `null` (empty hole)
- Valid scores: 1-10
- Auto-refresh every 30 seconds
- Optimistic UI updates

### Course Information
- Par: [4,4,5,4,3,5,4,3,5,4,4,5,4,4,5,4,3,5]
- Front 9 Par: 37
- Back 9 Par: 35
- Total Par: 72

## 🐛 Troubleshooting

### Check Deployment Status
```bash
gcloud app services list
gcloud app versions list
```

### View Logs
```bash
gcloud app logs tail -s default
gcloud app logs tail -s frontend
```

### Test Database Connection
```bash
# Test read
curl https://forescore.app/api/scores

# Test write
curl -X PUT https://forescore.app/api/scores \
  -H "Content-Type: application/json" \
  -d '{"pairingId": 1, "round": "round1", "holeIndex": 0, "score": 4}'
```

### DNS Debugging
```bash
dig forescore.app
dig www.forescore.app
```

## 📦 Dependencies

### Frontend
- React 18.2.0
- React Scripts 5.0.1
- Lucide React (icons)
- Tailwind CSS (styling)

### Backend
- Flask 2.3.3
- Flask-CORS 4.0.0
- Google Cloud Firestore 2.13.1

## 🏃‍♂️ Quick Start

1. **Clone and install:**
   ```bash
   git clone <repo>
   cd forescore
   npm install
   ```

2. **Deploy backend:**
   ```bash
   cd backend
   gcloud app deploy
   ```

3. **Deploy frontend:**
   ```bash
   npm run build
   gcloud app deploy frontend-app.yaml
   ```

4. **Access app:** https://forescore.app

---

Built for the **2025 TruckMovers Invitational** 🏌️‍♂️