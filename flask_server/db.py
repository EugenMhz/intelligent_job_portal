import os
import psycopg2
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv

# Load environment variables from the server/.env file
env_path = os.path.join(os.path.dirname(__file__), '../server/.env')
load_dotenv(dotenv_path=env_path)

bcrypt = Bcrypt()

def get_db_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        database=os.getenv("DB_NAME", "intelligent_job_portal"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "1234"),
        port=os.getenv("DB_PORT", "5432")
    )
