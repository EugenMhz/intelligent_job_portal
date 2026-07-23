from flask import Blueprint, request, jsonify, current_app
from psycopg2.extras import RealDictCursor
from db import get_db_connection

job_bp = Blueprint('job', __name__)

@job_bp.route('/api/jobs', methods=['GET'])
def get_jobs():
    recruiter_id = request.args.get('recruiterId')
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        if recruiter_id:
            cur.execute("""
                SELECT j.*, 
                       COALESCE(COUNT(a.id), 0)::integer AS "applicantsCount",
                       ARRAY(
                         SELECT s.name 
                         FROM job_skills js
                         JOIN skills s ON js.skill_id = s.id
                         WHERE js.job_id = j.id
                       ) AS skills
                FROM jobs j
                LEFT JOIN applications a ON j.id = a.job_id
                WHERE j.recruiter_id = %s
                GROUP BY j.id
                ORDER BY j.posted_date DESC
            """, (recruiter_id,))
        else:
            cur.execute("""
                SELECT j.*, 
                       COALESCE(COUNT(a.id), 0)::integer AS "applicantsCount",
                       ARRAY(
                         SELECT s.name 
                         FROM job_skills js
                         JOIN skills s ON js.skill_id = s.id
                         WHERE js.job_id = j.id
                       ) AS skills
                FROM jobs j
                LEFT JOIN applications a ON j.id = a.job_id
                WHERE j.status = 'Active'
                GROUP BY j.id
                ORDER BY j.posted_date DESC
            """)
        jobs_list = cur.fetchall()
        
        # If seekerId is provided, enrich jobs with semantic match scores
        seeker_id = request.args.get('seekerId')
        if seeker_id and not recruiter_id:
            try:
                from matcher import calculate_matches
                jobs_list = calculate_matches(cur, int(seeker_id), jobs_list)
            except Exception as match_err:
                current_app.logger.error(f"Error calculating matches: {match_err}")

        return jsonify(jobs_list), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching jobs: {str(e)}")
        return jsonify({"error": "Database query failed"}), 500
    finally:
        cur.close()
        conn.close()


@job_bp.route('/api/jobs/<int:job_id>', methods=['GET'])
def get_job_by_id(job_id):
    """Get details of a single job opportunity by ID."""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("""
            SELECT j.*, 
                   rp.full_name AS recruiter_name,
                   rp.title AS recruiter_title,
                   rp.profile_picture_url AS recruiter_profile_picture_url,
                   rp.location AS recruiter_location,
                   rp.bio AS recruiter_bio,
                   u.email AS recruiter_email,
                   ARRAY(
                     SELECT s.name 
                     FROM job_skills js
                     JOIN skills s ON js.skill_id = s.id
                     WHERE js.job_id = j.id
                   ) AS skills
            FROM jobs j
            LEFT JOIN recruiter_profiles rp ON j.recruiter_id = rp.user_id
            LEFT JOIN users u ON j.recruiter_id = u.id
            WHERE j.id = %s
        """, (job_id,))
        job = cur.fetchone()
        
        if not job:
            cur.close()
            return jsonify({"error": "Job opportunity not found"}), 404
            
        # If seekerId is provided, enrich job with semantic match score
        seeker_id = request.args.get('seekerId')
        if seeker_id:
            try:
                from matcher import calculate_matches
                enriched = calculate_matches(cur, int(seeker_id), [job])
                job = enriched[0]
            except Exception as match_err:
                current_app.logger.error(f"Error calculating match for job {job_id}: {match_err}")
                
        cur.close()
            
        return jsonify(job), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching job by ID: {str(e)}")
        return jsonify({"error": "Failed to fetch job details"}), 500
    finally:
        conn.close()


@job_bp.route('/api/jobs', methods=['POST'])
def post_job():
    data = request.get_json() or {}
    recruiter_id = data.get('recruiter_id', 6)
    title = data.get('title')
    department = data.get('department')
    location = data.get('location')
    description = data.get('description')
    status = data.get('status', 'Active')
    skills = data.get('skills', [])

    if not title or not description:
        return jsonify({"error": "Title and description are required"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # Insert job details
        cur.execute("""
            INSERT INTO jobs (recruiter_id, title, department, location, status, description)
            VALUES (%s, %s, %s, %s, %s, %s) RETURNING *
        """, (recruiter_id, title, department, location, status, description))
        job = cur.fetchone()
        job_id = job['id']

        # Link skills
        if skills:
            for skill_name in skills:
                # Find or create skill in master table
                cur.execute("SELECT id FROM skills WHERE name = %s", (skill_name,))
                skill_row = cur.fetchone()
                if not skill_row:
                    cur.execute("INSERT INTO skills (name) VALUES (%s) RETURNING id", (skill_name,))
                    skill_id = cur.fetchone()['id']
                else:
                    skill_id = skill_row['id']

                # Link skill to job
                cur.execute("""
                    INSERT INTO job_skills (job_id, skill_id) 
                    VALUES (%s, %s) 
                    ON CONFLICT DO NOTHING
                """, (job_id, skill_id))

        conn.commit()

        # Trigger Auto-Apply background worker if status is Active
        if status == 'Active':
            try:
                import threading
                from matcher import run_auto_apply
                threading.Thread(target=run_auto_apply, args=(job_id,)).start()
            except Exception as thread_err:
                current_app.logger.error(f"Failed to start auto-apply background thread: {thread_err}")

        return jsonify(job), 201
    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error creating job: {str(e)}")
        return jsonify({"error": "Failed to create job posting"}), 500
    finally:
        cur.close()
        conn.close()


@job_bp.route('/api/jobs/<int:job_id>', methods=['PUT'])
def update_job(job_id):
    data = request.get_json() or {}
    title = data.get('title')
    department = data.get('department')
    location = data.get('location')
    description = data.get('description')
    status = data.get('status')

    if not title or not description:
        return jsonify({"error": "Title and description are required"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("""
            UPDATE jobs 
            SET title = %s, department = %s, location = %s, description = %s, status = %s
            WHERE id = %s
            RETURNING *
        """, (title, department, location, description, status, job_id))
        job = cur.fetchone()

        if not job:
            return jsonify({"error": "Job not found"}), 404

        conn.commit()

        # Trigger Auto-Apply background worker if status is Active
        if status == 'Active':
            try:
                import threading
                from matcher import run_auto_apply
                threading.Thread(target=run_auto_apply, args=(job_id,)).start()
            except Exception as thread_err:
                current_app.logger.error(f"Failed to start auto-apply background thread on update_job: {thread_err}")

        return jsonify(job), 200
    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error updating job: {str(e)}")
        return jsonify({"error": "Failed to update job"}), 500
    finally:
        cur.close()
        conn.close()


@job_bp.route('/api/jobs/<int:job_id>', methods=['DELETE'])
def delete_job(job_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("DELETE FROM jobs WHERE id = %s RETURNING *", (job_id,))
        job = cur.fetchone()
        if not job:
            return jsonify({"error": "Job not found"}), 404
        conn.commit()
        return jsonify({"message": "Job deleted successfully", "job": job}), 200
    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error deleting job: {str(e)}")
        return jsonify({"error": "Failed to delete job"}), 500
    finally:
        cur.close()
        conn.close()

