from flask import Blueprint, request, jsonify, current_app
from psycopg2.extras import RealDictCursor
from db import get_db_connection

applicant_bp = Blueprint('applicant', __name__)

@applicant_bp.route('/api/applicants', methods=['GET'])
def get_applicants():
    job_id = request.args.get('jobId')
    recruiter_id = request.args.get('recruiterId')
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        query = """
            SELECT 
                a.id, 
                a.jobseeker_id,
                jp.full_name AS name, 
                jp.title AS role, 
                COALESCE(rp.department, 'Creative Flow') AS company,
                a.match_score AS "matchScore",
                a.status,
                a.method,
                jp.education,
                a.job_id AS "jobId",
                j.title AS "jobTitle",
                jp.resume_url AS "resumeUrl",
                jp.profile_picture_url AS "profilePictureUrl",
                ARRAY(
                  SELECT s.name 
                  FROM jobseeker_skills jsk
                  JOIN skills s ON jsk.skill_id = s.id
                  WHERE jsk.jobseeker_id = a.jobseeker_id
                ) AS skills,
                jp.title AS "experienceLevel",
                u.email AS "email"
            FROM applications a
            JOIN jobseeker_profiles jp ON a.jobseeker_id = jp.user_id
            JOIN jobs j ON a.job_id = j.id
            LEFT JOIN users u ON a.jobseeker_id = u.id
            LEFT JOIN recruiter_profiles rp ON u.id = rp.user_id
        """
        
        where_clauses = []
        params = []
        
        if job_id:
            where_clauses.append("a.job_id = %s")
            params.append(job_id)
            
        if recruiter_id:
            where_clauses.append("j.recruiter_id = %s")
            params.append(recruiter_id)
            
        if where_clauses:
            query += " WHERE " + " AND ".join(where_clauses)
            
        cur.execute(query, tuple(params))
        applicants_list = cur.fetchall()
        
        # Enrich each applicant with work history from jobseeker_work_histories table
        for applicant in applicants_list:
            seeker_id = applicant['jobseeker_id']
            cur.execute("""
                SELECT role, company, period, description AS desc
                FROM jobseeker_work_histories
                WHERE jobseeker_id = %s
                ORDER BY id DESC
            """, (seeker_id,))
            applicant['workHistory'] = cur.fetchall()
            
        return jsonify(applicants_list), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching applicants: {str(e)}")
        return jsonify({"error": "Failed to fetch applicants list"}), 500
    finally:
        cur.close()
        conn.close()


@applicant_bp.route('/api/applicants/<int:app_id>/status', methods=['PATCH'])
def update_applicant_status(app_id):
    data = request.get_json() or {}
    status = data.get('status')
    
    if not status:
        return jsonify({"error": "Status is required"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        if status == 'Withdrawn':
            # Instead of updating the status as Withdrawn, delete the record from the database
            cur.execute("DELETE FROM applications WHERE id = %s RETURNING *", (app_id,))
            row = cur.fetchone()
            if not row:
                return jsonify({"error": "Application record not found"}), 404
            conn.commit()
            return jsonify({"message": "Application withdrawn and deleted successfully", "id": app_id}), 200
        else:
            cur.execute("""
                UPDATE applications 
                SET status = %s, updated_at = CURRENT_TIMESTAMP 
                WHERE id = %s 
                RETURNING *
            """, (status, app_id))
            row = cur.fetchone()
            if not row:
                return jsonify({"error": "Application record not found"}), 404
            conn.commit()
            return jsonify(row), 200
    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error updating application status: {str(e)}")
        return jsonify({"error": "Database update failed"}), 500
    finally:
        cur.close()
        conn.close()
