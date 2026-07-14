# How to Setup and Run the Project

This guide provides step-by-step instructions to configure, initialize, and run the Intelligent Job Portal application locally on your machine.

---

## 📋 System Prerequisites

Ensure you have the following installed on your operating system:
* **Node.js** (v18 or higher)
* **Python** (v3.8 or higher, with `pip` package manager)
* **PostgreSQL** (v12 or higher)

---

## ⚙️ Step 1: PostgreSQL Database Setup

1. **Create the Database:**
   Open your PostgreSQL terminal (or client tool like DBeaver/pgAdmin) and create a database named `intelligent_job_portal`:
   ```sql
   CREATE DATABASE intelligent_job_portal;
   ```

2. **Restore the Schema and Current Data:**
   Run the generated backup SQL script to automatically create all enums, tables, functions, triggers, indexes, and restore all the current seed data (including test users, job posts, profile details, and applications):
   ```bash
   # From your command line terminal:
   psql -U postgres -d intelligent_job_portal -f database/backup_full.sql
   ```
   *(Note: Replace `postgres` with your database username if different. Enter your database password when prompted.)*

---

## 🐍 Step 2: Configure & Run the Backend (Flask)

1. **Navigate to the Flask Server Directory:**
   ```bash
   cd flask_server
   ```

2. **Install Python Dependencies:**
   Install all the required server libraries, including PyTorch and Sentence-Transformers (NLP NLP-matching models):
   ```bash
   pip install flask flask-cors psycopg2-binary sentence-transformers torch pymupdf python-docx flask-bcrypt python-dotenv werkzeug
   ```

3. **Configure Environment Variables:**
   The Flask server reads configuration values from the `.env` file located in the `server/` directory. Confirm that `server/.env` exists and contains correct settings for your local database credentials and email SMTP settings:
   ```env
   PORT=5000
   DB_USER=postgres
   DB_PASSWORD=your_db_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=intelligent_job_portal

   # SMTP Email Configuration (used for password reset, auth alerts, etc.)
   MAIL_SERVER=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USE_TLS=True
   MAIL_USERNAME=your_email@gmail.com
   MAIL_PASSWORD=your_email_app_password
   ```

4. **Launch the Flask Application Server:**
   Start the backend application:
   ```bash
   python app.py
   ```
   The API server will launch at `http://localhost:5000`. On first execution, the background matcher will automatically download the lightweight Sentence-Transformer model (`all-MiniLM-L6-v2`) from Hugging Face which will be cached locally for all subsequent operations.

---

## ⚛️ Step 3: Configure & Run the Frontend (React + Vite)

1. **Navigate to the Root Directory:**
   Open a new terminal window in the project's root folder.

2. **Install Node Modules:**
   ```bash
   npm install
   ```

3. **Launch the Frontend Web Client:**
   Start the Vite local development server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

---

## 🔒 Verification Accounts (Test Credentials)

To verify the app features, you can log in directly using the pre-seeded accounts:

### 1. Jobseeker Account (Auto-Apply & NLP Matches)
* **Email:** `nlp_seeker@example.com`
* **Password:** `password123`
* **Features to Test:**
  * View jobs lists (Search Jobs page, Dashboard) to see semantic match scores calculated on the fly.
  * Go to **Profile**, enable **Auto-Apply**, set a match score threshold (e.g. `70%`), and update profile.
  * Go to the **My Applications** tab to view manual or auto-submitted jobs.

### 2. Recruiter Account
* **Email:** `jane.doe@intelligentportal.com`
* **Password:** `password123` *(Note: Hashed in DB, seeded for Jane)*
* **Features to Test:**
  * Post a new React-related job.
  * Spawns a background thread immediately matching and auto-submitting applications for eligible seekers.
  * View applicant listings and review applicant details showing semantic match percentages.
