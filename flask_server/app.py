import os
import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, verify_jwt_in_request
from db import bcrypt, get_db_connection

# Import Blueprints
from auth_routes import auth_bp
from job_routes import job_bp
from applicant_routes import applicant_bp
from profile_routes import profile_bp
from file_routes import file_bp, UPLOAD_FOLDER
from bookmark_routes import bookmark_bp

# Initialize Flask App
app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'default-job-portal-secret-key-1298402')
jwt = JWTManager(app)
CORS(app)
bcrypt.init_app(app)

@app.before_request
def check_jwt():
    # Allow OPTIONS requests for CORS preflight
    if request.method == "OPTIONS":
        return
        
    # List of public endpoints that don't need JWT verification
    public_paths = [
        "/api/auth/login",
        "/api/auth/signup",
        "/api/auth/forgot-password",
        "/api/auth/reset-password",
        "/health"
    ]
    
    path = request.path
    if path.startswith("/api/") and path not in public_paths:
        try:
            verify_jwt_in_request()
        except Exception as e:
            return jsonify({"error": "Authentication required", "details": str(e)}), 401

# Custom JSON Provider to handle Datetime objects
from flask.json.provider import DefaultJSONProvider
class CustomJSONProvider(DefaultJSONProvider):
    def default(self, obj):
        if isinstance(obj, (datetime.datetime, datetime.date)):
            return obj.isoformat()
        return super().default(obj)

app.json = CustomJSONProvider(app)

# Register Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(job_bp)
app.register_blueprint(applicant_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(file_bp)
app.register_blueprint(bookmark_bp)


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "service": "Flask PostgreSQL API (Modularized)"}), 200


if __name__ == '__main__':
    # Ensure upload folder exists
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    
    # Pre-warm sentence-transformers model in a background thread to prevent first-request lag
    if os.environ.get('WERKZEUG_RUN_MAIN') == 'true' or not app.debug:
        import threading
        from matcher import get_model
        threading.Thread(target=get_model, name="ModelPrewarmer", daemon=True).start()

    app.run(host='0.0.0.0', port=5000, debug=True)
