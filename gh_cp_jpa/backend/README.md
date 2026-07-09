# Flask Backend for Job Portal

## 1) Setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## 2) Run

```powershell
python app.py
```

Server starts at `http://127.0.0.1:5000`.

## 3) Main Endpoints

- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/signup`
- `GET /api/jobs`
- `GET /api/jobs/<job_id>`
- `GET /api/dashboard`
- `GET /api/applications`
- `POST /api/applications`
- `GET /api/saved-jobs`
- `POST /api/saved-jobs`
- `DELETE /api/saved-jobs/<job_id>`
- `POST /api/upload-cv`

## 4) Frontend Integration

Use `http://127.0.0.1:5000/api` as the API base URL in React.
