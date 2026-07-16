FROM python:3.9-slim

WORKDIR /app

# Install build dependencies for compiling any source code (e.g. psycopg2)
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

# Pre-install CPU version of PyTorch to minimize slug size and RAM usage
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir sentence-transformers flask flask-cors psycopg2 gunicorn python-dotenv werkzeug pymupdf python-docx flask-bcrypt

COPY . .

# Hugging Face Spaces routes internal traffic through port 7860
EXPOSE 7860

CMD ["gunicorn", "--bind", "0.0.0.0:7860", "app:app"]
