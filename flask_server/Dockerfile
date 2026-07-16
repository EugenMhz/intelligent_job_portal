FROM python:3.9-slim

WORKDIR /app

# Install build dependencies for compiling any source code (e.g. psycopg2)
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

# Copy requirements file first to leverage Docker caching
COPY requirements.txt .

# Pre-install CPU version of PyTorch and then all other requirements
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Bind dynamically to the port provided by the host environment (Render uses $PORT, Hugging Face uses 7860/PORT)
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT:-5000} app:app"]
