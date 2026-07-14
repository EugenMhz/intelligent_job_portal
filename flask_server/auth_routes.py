import os
import datetime
from flask import Blueprint, request, jsonify, current_app
from psycopg2.extras import RealDictCursor
from db import bcrypt, get_db_connection

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.get_json() or {}
    email = data.get('email')
    if email:
        email = email.strip().lower()
    password = data.get('password')
    role = data.get('role')  # 'seeker' or 'recruiter'
    full_name = data.get('fullName')
    phone = data.get('phone', '')
    company_name = data.get('companyName', '')

    if not email or not password or not role or not full_name:
        return jsonify({"error": "Missing required fields: email, password, role, fullName"}), 400

    if role not in ['seeker', 'recruiter']:
        return jsonify({"error": "Invalid role. Must be 'seeker' or 'recruiter'"}), 400

    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # Check if user already exists (case-insensitively)
        cur.execute("SELECT id FROM users WHERE LOWER(email) = %s", (email,))
        if cur.fetchone():
            return jsonify({"error": "User with this email already exists"}), 400

        # Insert user into users table (storing lowercase email)
        cur.execute(
            "INSERT INTO users (email, password_hash, role) VALUES (%s, %s, %s) RETURNING id, email, role",
            (email, password_hash, role)
        )
        user = cur.fetchone()
        user_id = user['id']

        # Insert into specific profile table
        if role == 'seeker':
            cur.execute(
                "INSERT INTO jobseeker_profiles (user_id, full_name) VALUES (%s, %s)",
                (user_id, full_name)
            )
        elif role == 'recruiter':
            cur.execute(
                "INSERT INTO recruiter_profiles (user_id, full_name, phone, department) VALUES (%s, %s, %s, %s)",
                (user_id, full_name, phone, company_name)
            )

        conn.commit()
        from flask_jwt_extended import create_access_token
        access_token = create_access_token(identity=str(user_id), additional_claims={"role": role})
        return jsonify({
            "id": user_id,
            "email": user['email'],
            "role": user['role'],
            "name": full_name,
            "token": access_token
        }), 201

    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error during signup: {str(e)}")
        return jsonify({"error": "Internal server error during registration"}), 500
    finally:
        cur.close()
        conn.close()


@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    if email:
        email = email.strip().lower()
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT * FROM users WHERE LOWER(email) = %s", (email,))
        user = cur.fetchone()

        if not user or not bcrypt.check_password_hash(user['password_hash'], password):
            return jsonify({"error": "Invalid email or password"}), 401

        user_id = user['id']
        role = user['role']

        # Fetch the user's name and profile picture from profile
        full_name = ""
        profile_picture_url = None
        if role == 'seeker':
            cur.execute("SELECT full_name, profile_picture_url FROM jobseeker_profiles WHERE user_id = %s", (user_id,))
            prof = cur.fetchone()
            if prof:
                full_name = prof['full_name']
                profile_picture_url = prof.get('profile_picture_url')
        elif role == 'recruiter':
            cur.execute("SELECT full_name, profile_picture_url FROM recruiter_profiles WHERE user_id = %s", (user_id,))
            prof = cur.fetchone()
            if prof:
                full_name = prof['full_name']
                profile_picture_url = prof.get('profile_picture_url')

        from flask_jwt_extended import create_access_token
        access_token = create_access_token(identity=str(user_id), additional_claims={"role": role})
        return jsonify({
            "id": user_id,
            "email": user['email'],
            "role": role,
            "name": full_name,
            "profile_picture_url": profile_picture_url,
            "token": access_token
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error during login: {str(e)}")
        return jsonify({"error": "Internal server error during login"}), 500
    finally:
        cur.close()
        conn.close()


@auth_bp.route('/api/auth/change-password', methods=['PUT'])
def change_password():
    data = request.get_json() or {}
    user_id = data.get('userId')
    old_password = data.get('oldPassword')
    new_password = data.get('newPassword')

    if not user_id or not old_password or not new_password:
        return jsonify({"error": "Missing required fields: userId, oldPassword, newPassword"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT password_hash FROM users WHERE id = %s", (user_id,))
        user = cur.fetchone()

        if not user:
            return jsonify({"error": "User not found"}), 404

        if not bcrypt.check_password_hash(user['password_hash'], old_password):
            return jsonify({"error": "Incorrect current password"}), 401

        new_password_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
        cur.execute("UPDATE users SET password_hash = %s WHERE id = %s", (new_password_hash, user_id))
        conn.commit()

        return jsonify({"message": "Password updated successfully"}), 200

    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error during password change: {str(e)}")
        return jsonify({"error": "Internal server error during password change"}), 500
    finally:
        cur.close()
        conn.close()


def send_reset_email(to_email, reset_link):
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart

    mail_server = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    mail_port = os.getenv("MAIL_PORT", "587")
    mail_username = os.getenv("MAIL_USERNAME")
    mail_password = os.getenv("MAIL_PASSWORD")

    # If SMTP username/password are placeholders or empty, do not attempt to send
    if (not mail_username or not mail_password or 
        mail_username == "your-email@gmail.com" or 
        mail_password == "your-16-character-app-password"):
        current_app.logger.warning("SMTP Mail credentials are using placeholders or not configured. Email NOT sent.")
        return False

    msg = MIMEMultipart()
    msg['From'] = mail_username
    msg['To'] = to_email
    msg['Subject'] = "Reset Your Password - Intelligent Job Portal"

    body = f"""Hello,

We received a request to reset your password for your Intelligent Job Portal account. 
Please click the link below to choose a new password:

{reset_link}

Note: This link will expire in 15 minutes.

If you did not request this, you can safely ignore this email.

Best regards,
Intelligent Job Portal Team
"""
    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP(mail_server, int(mail_port))
        server.starttls()  # Upgrade connection to secure SSL/TLS
        server.login(mail_username, mail_password)
        server.sendmail(mail_username, to_email, msg.as_string())
        server.quit()
        current_app.logger.info(f"Password reset email successfully sent to {to_email}.")
        return True
    except Exception as e:
        current_app.logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False


@auth_bp.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    import secrets
    data = request.get_json() or {}
    email = data.get('email')

    if not email:
        return jsonify({"error": "Email is required"}), 400

    email = email.strip().lower()

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT id FROM users WHERE LOWER(email) = %s", (email,))
        user = cur.fetchone()

        if not user:
            return jsonify({"message": "If the email is registered, a password reset link will be sent."}), 200

        token = secrets.token_urlsafe(32)
        expiry = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=15)

        cur.execute(
            "UPDATE users SET reset_token = %s, reset_token_expiry = %s WHERE id = %s",
            (token, expiry, user['id'])
        )
        conn.commit()

        reset_link = f"http://localhost:5173/reset-password?token={token}"
        email_sent = send_reset_email(email, reset_link)

        # Log it to console for easy local access
        current_app.logger.info(f"\n========================================\nPASSWORD RESET LINK FOR {email}:\n{reset_link}\n========================================\n")

        return jsonify({
            "message": "If the email is registered, a password reset link will be sent.",
            "dev_reset_link": reset_link,
            "email_sent": email_sent
        }), 200

    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error during forgot password: {str(e)}")
        return jsonify({"error": "Internal server error during password reset request"}), 500
    finally:
        cur.close()
        conn.close()


@auth_bp.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json() or {}
    token = data.get('token')
    new_password = data.get('newPassword')

    if not token or not new_password:
        return jsonify({"error": "Token and newPassword are required"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # Check token and expiry
        cur.execute(
            "SELECT id FROM users WHERE reset_token = %s AND reset_token_expiry > CURRENT_TIMESTAMP",
            (token,)
        )
        user = cur.fetchone()

        if not user:
            return jsonify({"error": "Invalid or expired token"}), 400

        # Update password
        new_password_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
        cur.execute(
            "UPDATE users SET password_hash = %s, reset_token = NULL, reset_token_expiry = NULL WHERE id = %s",
            (new_password_hash, user['id'])
        )
        conn.commit()

        return jsonify({"message": "Password has been reset successfully"}), 200

    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error during reset password: {str(e)}")
        return jsonify({"error": "Internal server error during password reset"}), 500
    finally:
        cur.close()
        conn.close()
