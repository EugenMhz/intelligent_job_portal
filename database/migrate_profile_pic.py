import os
import psycopg2
from dotenv import load_dotenv

# Load env vars
env_path = os.path.join(os.path.dirname(__file__), '../server/.env')
load_dotenv(dotenv_path=env_path)

def migrate():
    host = os.getenv("DB_HOST", "localhost")
    database = os.getenv("DB_NAME", "intelligent_job_portal")
    user = os.getenv("DB_USER", "postgres")
    password = os.getenv("DB_PASSWORD", "1234")
    port = os.getenv("DB_PORT", "5432")

    print(f"Connecting to database '{database}' on '{host}:{port}' as user '{user}'...")
    
    try:
        conn = psycopg2.connect(
            host=host,
            database=database,
            user=user,
            password=password,
            port=port
        )
        cur = conn.cursor()
        
        # Add column to jobseeker_profiles if not exists
        print("Checking jobseeker_profiles table...")
        cur.execute("ALTER TABLE jobseeker_profiles ADD COLUMN IF NOT EXISTS profile_picture_url VARCHAR(255);")
        
        # Add column to recruiter_profiles if not exists
        print("Checking recruiter_profiles table...")
        cur.execute("ALTER TABLE recruiter_profiles ADD COLUMN IF NOT EXISTS profile_picture_url VARCHAR(255);")
        
        conn.commit()
        print("Migration completed successfully!")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == '__main__':
    migrate()
