# TruthCheck AI 🔍

### AI-Powered Fake News Detector

> Built for Hack Devengers 1.0 — Open Innovation Hackathon

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-00c853?style=for-the-badge)](https://fake-news-detector-nine-mu.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/RajdeepDas012/Fake_News_Detector)

---

## 🚀 Live Demo

**[https://fake-news-detector-nine-mu.vercel.app](https://fake-news-detector-nine-mu.vercel.app)**

---

## 🎥 Demo Video

https://github.com/user-attachments/assets/dbac0653-4c47-46c7-aa17-7ec228aa65e8

## 📌 About The Project

TruthCheck AI is a full-stack web application that helps users detect fake news and misinformation using the power of Google Gemini AI. Paste any news article or headline and get an instant credibility verdict with detailed reasoning and red flags.

In a world flooded with misinformation, TruthCheck AI gives everyone the power to verify news before sharing it.

---

## ✨ Features

- 🤖 **AI-Powered Analysis** — Powered by Google Gemini AI for accurate fake news detection
- 🔐 **User Authentication** — Secure login and signup with Firebase Auth
- 📊 **Personal Dashboard** — Track your verification history and stats
- 📁 **Archives** — View all your past analyses saved to the cloud
- 👤 **User Profile** — See your activity breakdown (REAL / FAKE / MISLEADING)
- 📄 **File Upload** — Upload PDF, TXT, DOC, DOCX files for analysis
- 🎨 **Modern Dark UI** — Clean, responsive design for desktop and mobile
- ⚡ **Real-time Results** — Instant verdict with confidence score and red flags

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Styling | CSS / Tailwind |
| Authentication | Firebase Auth |
| Database | Firebase Firestore |
| AI Model | Google Gemini 3.1 Flash Lite |
| Backend | Vercel Serverless Functions |
| Deployment | Vercel |

---

## 📸 Pages

| Page | Description |
|---|---|
| **Landing** | Hero section with app introduction |
| **Auth** | Login and Signup with Firebase |
| **Dashboard** | Overview of user stats and recent checks |
| **Verify** | Paste article or upload file for AI analysis |
| **Archives** | Full history of all past analyses |
| **Profile** | User info, activity stats, logout |

---

## 🧠 How It Works

```
1. User pastes a news article or headline
        ↓
2. Text is sent to Vercel serverless function
        ↓
3. Gemini AI analyses for:
   - Sensational language
   - Unverified claims
   - Emotional manipulation
   - Source credibility
   - Logical consistency
        ↓
4. Returns verdict: REAL / FAKE / MISLEADING
   + Confidence score + Reason + Red flags
        ↓
5. Result saved to Firestore for user history
```

---

## 🚦 Verdict Types

| Verdict | Color | Meaning |
|---|---|---|
| ✅ REAL | 🟢 Green | Article appears credible |
| ❌ FAKE | 🔴 Red | Article contains false information |
| ⚠️ MISLEADING | 🟡 Yellow | Article is partially true or misleading |

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v18+
- Firebase account
- Google AI Studio account (for Gemini API key)

### Installation

```bash
# Clone the repository
git clone https://github.com/RajdeepDas012/Fake_News_Detector.git

# Navigate to project
cd Fake_News_Detector

# Install dependencies
npm install

# Create .env file
touch .env
```

### Environment Variables

Create a `.env` file in the root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Run Locally

```bash
# Start frontend
npm run dev

# App runs at http://localhost:5173
```

---

## 📁 Project Structure

```
Fake_News_Detector/
├── api/
│   └── analyse.js          # Vercel serverless function (Gemini API)
├── public/
│   └── fake.jpg            # Favicon
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Auth.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Verify.jsx
│   │   ├── Archives.jsx
│   │   └── Profile.jsx
│   ├── firebase.js
│   └── App.jsx
├── vercel.json
├── vite.config.js
└── package.json
```

---

## 🔒 Security

- API keys stored in environment variables — never exposed to frontend
- Firestore rules ensure users can only access their own data
- Firebase Auth handles all authentication securely
- Serverless function proxies all AI API calls

---

## 🏆 Built For

**Hack Devengers 1.0** — Open Innovation Hackathon  
**Date:** August 9, 2026  
**Category:** AI / Web Application  
**Developer:** Rajdeep Das (Solo)

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Developer

**Rajdeep Das**  
GitHub: [@RajdeepDas012](https://github.com/RajdeepDas012)

---

<div align="center">
  Built with ❤️ using React, Firebase & Gemini AI
  <br/>
  <strong>TruthCheck AI — Fighting misinformation with AI</strong>
</div>
