# 🌊 ProjectCleanFlow

ProjectCleanFlow is a mobile-first reporting tool for flooding and other water-related issues. Users can select affected areas on a map and submit data, which is sent to a backend server for processing. This app is designed with accessibility and ease of use in mind, targeting communities prone to seasonal flooding.

## ✨ Features so far

- React Native frontend (via Expo)
- Leaflet map interface embedded in a WebView
- Flask backend server for handling reports
- Cross-platform setup (Mac & Windows support)
- Private IP Protection

## To run Backend (Flask Server)
1. `cd` to project directory
2. Run `python3 main.py` in terminal

## To run Frontend
1. Open a new terminal window
2. `cd` to project directory
3. Run `npm start`
4. Scan the QR code with your phone's camera

## Troubleshooting

### Common Issues

1. **Port 5000 Already in Use (MacOS)**
   - Error: "Address already in use" or "Port 5000 is in use by another program"
   - Solution: MacOS uses port 5000 for AirPlay. Edit `main.py` to use port 3000 instead.

2. **"Not Found" Error on Mobile App**
   - Check if your phone and computer are on the same WiFi network
   - Verify the IP address in `App.js` matches your computer's local IP
   - Test the backend URL in your computer's browser first:
     ```
     http://YOUR_IP:3000/
     http://YOUR_IP:3000/leafletMap.html
     ```

3. **Connection Refused**
   - Make sure the Flask server is running
   - Check if your firewall is blocking the connection
   - Verify you're using the correct IP address (run `ipconfig getifaddr en0` in terminal)

4. **WebView Not Loading**
   - Clear your app's cache
   - Restart both the Flask server and the Expo app
   - Make sure all files in the `public` directory are present

### Finding Your IP Address
- On MacOS: Run `ipconfig getifaddr en0` in terminal
- Use this IP in `App.js` for the WebView URL

### Verifying Server Status
1. Start the Flask server
2. Open your computer's browser
3. Try accessing `http://YOUR_IP:3000/`
4. You should see "🚀 Flask backend is running!"
