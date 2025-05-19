# 🌊 ProjectCleanFlow

ProjectCleanFlow is a mobile-first reporting tool for flooding and other water-related issues. Users can select affected areas on a map and submit data, which is sent to a backend server for processing. This app is designed with accessibility and ease of use in mind, targeting communities prone to seasonal flooding.

## ✨ Features

- 📱 React Native frontend (via Expo)
- 🧭 Leaflet map interface embedded in a WebView
- 🐍 Flask backend server for handling reports
- 🌐 Cross-platform setup (Mac & Windows support)
- 🔐 `.gitignore` and private IP protection

---

## 📁 Project Structure
ProjectCleanFlow/
├── App.js                 # Main React Native app
├── public/
│   └── leafletMap.html    # Leaflet map interface
├── main.py                # Flask backend API
├── requirements.txt       # Python dependencies
├── package.json           # JS dependencies
├── .gitignore
├── app.json
└── README.md              # This file
---

## 🚀 Getting Started

### 1️⃣ Backend (Flask API)

**Install dependencies:**

<details>
<summary><strong>macOS / Linux</strong></summary>

```bash
# (Optional) Create a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install required packages
pip install -r requirements.txt
</details>
<details>
<summary><strong>Windows</strong></summary>
# (Optional) Create a virtual environment
python -m venv venv
venv\Scripts\activate

# Install required packages
pip install -r requirements.txt
</details>
Run the Flask server:
python main.py
📍 The server should run at http://0.0.0.0:5000 or http://localhost:5000
2️⃣ Frontend (Expo + React Native)

Install dependencies:
npm install
Start the Expo development server:
npx expo start
	•	On your mobile phone (same Wi-Fi), open the Expo Go app and scan the QR code.
	•	For WebView to work properly, ensure you’re not using localhost. Replace it with your local IP (e.g., http://192.168.1.100:3000/leafletMap.html in App.js).
