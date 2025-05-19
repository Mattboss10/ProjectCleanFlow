from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enables CORS so your mobile app can make requests

# Route to test if server is running
@app.route('/')
def home():
    return '🚀 Flask backend is running!'

# Route to handle draw submissions
@app.route('/submit', methods=['POST'])  
def submit():
    data = request.get_json()
    print("Received data:", data)

    geometry = data.get("geometry")
    report_type = data.get("type")
    user_id = data.get("userId")

    # Respond to app
    return jsonify({"status": "success", "message": "Flood report received!"}), 200

# 👇 Keep this at the bottom 👇
if __name__ == '__main__':
    print("Starting Flask server on port 5000...")
    app.run(host='0.0.0.0', port=5000)