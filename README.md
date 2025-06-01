# 🌊 ProjectCleanFlow

ProjectCleanFlow is a mobile-first reporting tool for flooding and other environment-related issues. Users can select affected areas on a map and submit data, which is sent to a backend server for processing. This app is designed with accessibility and ease of use in mind, targeting communities prone to seasonal flooding. 

## Goal
The App's Goal is to use Geospatial Data to send notification alerts to the user to warn them of potentially dangerous areas, through customizable notifications and prompts users will be subtly nudged to carry out certain actions ranging from littering awareness to re-routing to safer areas. 
We hope the app will attract widespread adoption where it will reach a critical mass of users so that we have a well connected network to support better diaster preparedness in the country.

## ✨ Features

### Map Interface
- Interactive Leaflet map with custom controls
- Geolocation support with automatic map centering
- Custom area selection with 4-point polygon drawing
- Visual feedback during area selection
- Confirmation system for drawn areas
- Success notifications with animations
- Ability to delete selected areas

### Location Handling
- Automatic location detection
- Permission handling for location services
- Default location fallback (Kingston, Jamaica)
- Quick recenter button for current location
- Clear error messages for location issues

### User Interface
- Clean, modern design with intuitive controls
- Mobile-optimized button placement
- Visual feedback for active tools
- Centered confirmation controls
- Responsive layout for all screen sizes
- Clear success/error notifications

### Backend Integration
- Flask backend server for handling reports
- Cross-platform compatibility
- Private IP Protection
- Proper error handling and logging
- API endpoints for data submission

## 🚀 Getting Started

### To run Backend (Flask Server)
1. `cd` to project directory
2. Run `python3 main.py` in terminal
3. Server will start on port 3000

### To run Frontend
1. Open a new terminal window
2. `cd` to project directory
3. Run `npm start`
4. Scan the QR code with your phone's camera

## 🔧 Troubleshooting

### Common Issues

1. **Port 3000 Already in Use**
   - Check if another process is using port 3000
   - Kill the process or change the port in `main.py`

2. **"Not Found" Error on Mobile App**
   - Check if your phone and computer are on the same WiFi network
   - Verify the IP address in `App.js` matches your computer's local IP
   - Test the backend URL in your computer's browser:
     ```
     http://YOUR_IP:3000/
     http://YOUR_IP:3000/leafletMap.html
     ```

3. **Connection Refused**
   - Make sure the Flask server is running
   - Check if your firewall is blocking the connection
   - Verify you're using the correct IP address

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

## 📱 Usage Guide

1. **Starting the App**
   - Launch the app and allow location permissions
   - The map will center on your location
   - Or use the default location if permissions are denied

2. **Reporting a Flood Area**
   - Click the polygon tool (⬡)
   - Click four points on the map to define the area
   - Confirm or cancel using the bottom controls
   - Success message will appear when area is saved

3. **Managing Reports**
   - Click any drawn area to select it
   - Use the delete button (🗑️) to remove selected areas
   - Use the recenter button (📍) to return to your location

## 🔒 Security Notes
- Location data is only used for map centering
- No personal data is stored without consent
- All communications are handled securely
