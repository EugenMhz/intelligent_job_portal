import os
import psycopg2
from dotenv import load_dotenv

# Load env variables from server/.env
env_path = os.path.join(os.path.dirname(__file__), '../server/.env')
load_dotenv(dotenv_path=env_path)

def migrate():
    print("Starting database migration to add reset password columns...")
    
    # Establish connection
    try:
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST", "localhost"),
            database=os.getenv("DB_NAME", "intelligent_job_portal"),
            user=os.getenv("DB_USER", "postgres"),
            password=os.getenv("DB_PASSWORD", "1234"),
            port=os.getenv("DB_PORT", "5432")
        )
        cur = conn.cursor()
        
        # Add columns if they do not exist
        cur.execute("""
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
            ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP WITH TIME ZONE;
        """)
        
        conn.commit()
        print("Migration successful! reset_token and reset_token_expiry columns added.")
        
    except Exception as e:
        print(f"Migration failed: {e}")
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    migrate()
