from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import logging
from werkzeug.middleware.proxy_fix import ProxyFix

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='public')
app.wsgi_app = ProxyFix(app.wsgi_app)
CORS(app)  # Enables CORS so your mobile app can make requests

@app.before_request
def log_request_info():
    logger.debug('Headers: %s', request.headers)
    logger.debug('Body: %s', request.get_data())

# Route to test if server is running
@app.route('/')
def home():
    logger.info("Home route accessed")
    return '🚀 Flask backend is running!'

# Serve static files from public directory
@app.route('/<path:filename>')
def serve_static(filename):
    logger.info(f"Attempting to serve file: {filename}")
    logger.info(f"Current directory: {os.getcwd()}")
    logger.info(f"Public directory contents: {os.listdir('public')}")
    
    file_path = os.path.join('public', filename)
    logger.info(f"Full file path: {os.path.abspath(file_path)}")
    logger.info(f"File exists: {os.path.exists(file_path)}")
    
    try:
        return send_from_directory('public', filename)
    except Exception as e:
        logger.error(f"Error serving {filename}: {str(e)}", exc_info=True)
        return f"Error serving file: {str(e)}", 404

# Route to handle draw submissions
@app.route('/submit', methods=['POST'])  
def submit():
    logger.info("Received submit request")
    data = request.get_json()
    logger.debug(f"Received data: {data}")

    geometry = data.get("geometry")
    report_type = data.get("type")
    user_id = data.get("userId")

    # Respond to app
    return jsonify({"status": "success", "message": "Flood report received!"}), 200

# 👇 Keep this at the bottom 👇
if __name__ == '__main__':
    logger.info("Starting Flask server...")
    logger.info(f"Static folder path: {os.path.abspath('public')}")
    logger.info(f"Current working directory: {os.getcwd()}")
    logger.info(f"Public directory contents: {os.listdir('public')}")
    logger.info(f"leafletMap.html exists: {os.path.exists(os.path.join('public', 'leafletMap.html'))}")
    app.run(host='0.0.0.0', port=3000, debug=True)