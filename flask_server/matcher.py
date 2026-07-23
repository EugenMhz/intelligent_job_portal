import os
import re
import numpy as np

import threading

_model = None
_model_lock = threading.Lock()

def log_info(msg):
    """Logs info to Flask logger if in context, otherwise prints to stderr/stdout."""
    try:
        from flask import current_app
        if current_app:
            current_app.logger.info(msg)
            return
    except Exception:
        pass
    print(f"[INFO] {msg}")

def log_warn(msg):
    """Logs warning to Flask logger if in context, otherwise prints to stderr/stdout."""
    try:
        from flask import current_app
        if current_app:
            current_app.logger.warning(msg)
            return
    except Exception:
        pass
    print(f"[WARN] {msg}")

def log_error(msg):
    """Logs error to Flask logger if in context, otherwise prints to stderr/stdout."""
    try:
        from flask import current_app
        if current_app:
            current_app.logger.error(msg)
            return
    except Exception:
        pass
    print(f"[ERROR] {msg}")

def get_model():
    """Lazy-loads the SentenceTransformer model to prevent slow Flask startup."""
    global _model
    if os.getenv("DISABLE_ML_MATCHER") == "true" or os.getenv("RENDER") == "true":
        log_info("ML Matcher is disabled (detected Render or manual disable). Falling back to keyword matching.")
        return None
    if _model is None:
        with _model_lock:
            if _model is None:
                try:
                    from sentence_transformers import SentenceTransformer
                    log_info("Initializing SentenceTransformer('all-MiniLM-L6-v2')...")
                    _model = SentenceTransformer('all-MiniLM-L6-v2')
                except Exception as e:
                    log_error(f"Failed to load SentenceTransformer: {e}")
    return _model

def get_seeker_text(cur, seeker_id):
    """
    Fetches the candidate's profile title, education, skills, and work history,
    then combines them into a single descriptive text representation.
    Handles cursor rows as either dictionaries or tuples.
    """
    try:
        # Fetch profile
        cur.execute("SELECT title, education FROM jobseeker_profiles WHERE user_id = %s", (seeker_id,))
        profile = cur.fetchone()
        title = ""
        education = ""
        if profile:
            if isinstance(profile, dict):
                title = profile.get('title') or ""
                education = profile.get('education') or ""
            else:
                title = profile[0] or ""
                education = profile[1] or ""
        
        # Fetch skills
        cur.execute("""
            SELECT s.name 
            FROM jobseeker_skills jsk
            JOIN skills s ON jsk.skill_id = s.id
            WHERE jsk.jobseeker_id = %s
        """, (seeker_id,))
        skills_rows = cur.fetchall()
        skills = []
        for row in skills_rows:
            if isinstance(row, dict):
                skills.append(row.get('name') or "")
            else:
                skills.append(row[0] or "")
        skills_str = ", ".join(skills)
        
        # Fetch work history
        cur.execute("SELECT role, description FROM jobseeker_work_histories WHERE jobseeker_id = %s", (seeker_id,))
        histories = cur.fetchall()
        history_list = []
        for h in histories:
            if isinstance(h, dict):
                role = h.get('role') or ""
                desc = h.get('description') or ""
            else:
                role = h[0] or ""
                desc = h[1] or ""
            history_list.append(f"{role}: {desc}")
        history_str = "; ".join(history_list)
        
        # Build text description
        parts = []
        if title:
            parts.append(f"Title: {title}")
        if skills_str:
            parts.append(f"Skills: {skills_str}")
        if education:
            parts.append(f"Education: {education}")
        if history_str:
            parts.append(f"Experience: {history_str}")
            
        return " ".join(parts) if parts else "No profile information"
    except Exception as e:
        log_error(f"Error building seeker text: {e}")
        return "No profile information"

def get_job_text(job):
    """
    Combines job details (title, department, location, skills, and description)
    into a single descriptive text representation.
    """
    title = job.get('title', '')
    department = job.get('department', '')
    location = job.get('location', '')
    skills_list = job.get('skills', [])
    description = job.get('description', '')
    
    parts = []
    if title:
        parts.append(f"Job Title: {title}")
    if department or location:
        dept_loc = f"in {department}" if department else ""
        if location:
            dept_loc += f" ({location})"
        parts.append(dept_loc.strip())
    if skills_list:
        parts.append(f"Required Skills: {', '.join(skills_list)}")
    if description:
        parts.append(f"Description: {description}")
    return " ".join(parts)

def calculate_keyword_fallback(cur, seeker_id, job):
    """Fallback keyword matching calculation if SentenceTransformer is unavailable."""
    try:
        # Get seeker's skills
        cur.execute("""
            SELECT s.name 
            FROM jobseeker_skills jsk 
            JOIN skills s ON jsk.skill_id = s.id 
            WHERE jsk.jobseeker_id = %s
        """, (seeker_id,))
        rows = cur.fetchall()
        seeker_skills = []
        for row in rows:
            if isinstance(row, dict):
                seeker_skills.append((row.get('name') or "").lower())
            else:
                seeker_skills.append((row[0] or "").lower())
        
        job_skills = [s.lower() for s in job.get('skills', [])]
        
        if not job_skills:
            return 75
            
        matches = [s for s in job_skills if s in seeker_skills]
        return round((len(matches) / len(job_skills)) * 100)
    except Exception as e:
        log_error(f"Keyword fallback match error: {e}")
        return 75

def calculate_matches(cur, seeker_id, jobs):
    """
    Computes semantic similarity match percentages for a list of jobs against a seeker profile.
    Falls back to simple keyword overlap matching if SentenceTransformer fails to load.
    """
    model = get_model()
    if model is None:
        log_warn("Falling back to keyword overlap matching.")
        for job in jobs:
            job['match_score'] = calculate_keyword_fallback(cur, seeker_id, job)
        return jobs
        
    try:
        seeker_text = get_seeker_text(cur, seeker_id)
        job_texts = [get_job_text(job) for job in jobs]
        
        # Calculate embeddings
        from sentence_transformers import util
        seeker_emb = model.encode(seeker_text, convert_to_tensor=True)
        job_embs = model.encode(job_texts, convert_to_tensor=True)
        
        # Calculate cosine similarities
        cosine_scores = util.cos_sim(seeker_emb, job_embs)[0]
        
        for i, job in enumerate(jobs):
            sim = cosine_scores[i].item()
            # Scale cosine similarity (usually between 0.0 and 1.0 for these embeddings) to 0-100%
            match_score = min(100, max(0, round(sim * 100)))
            job['match_score'] = match_score
            
        return jobs
    except Exception as e:
        log_error(f"Semantic match scoring failed: {e}. Falling back to keyword match.")
        for job in jobs:
            job['match_score'] = calculate_keyword_fallback(cur, seeker_id, job)
        return jobs

def run_auto_apply(job_id):
    """
    Background worker function that runs when a job is published.
    Identifies jobseekers with auto-apply enabled, calculates their semantic match score,
    and automatically applies to the job if the score exceeds their custom threshold.
    """
    from db import get_db_connection
    from psycopg2.extras import RealDictCursor
    
    log_info(f"Auto-Apply Automation triggered for job ID {job_id}")
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # 1. Fetch job details
        cur.execute("""
            SELECT j.*, 
                   ARRAY(
                     SELECT s.name 
                     FROM job_skills js
                     JOIN skills s ON js.skill_id = s.id
                     WHERE js.job_id = j.id
                   ) AS skills
            FROM jobs j
            WHERE j.id = %s AND j.status = 'Active'
        """, (job_id,))
        job = cur.fetchone()
        if not job:
            log_warn(f"Auto-Apply aborted: Job {job_id} not found or not active.")
            return
            
        # 2. Find jobseekers with auto-apply enabled who haven't applied yet
        cur.execute("""
            SELECT jp.user_id, jp.auto_apply_match_threshold
            FROM jobseeker_profiles jp
            WHERE jp.auto_apply = TRUE 
              AND jp.user_id NOT IN (
                  SELECT jobseeker_id FROM applications WHERE job_id = %s
              )
        """, (job_id,))
        candidates = cur.fetchall()
        
        if not candidates:
            log_info(f"No auto-apply candidates to evaluate for job {job_id}")
            return
            
        log_info(f"Evaluating auto-apply for {len(candidates)} candidates for job {job_id}...")
        
        # 3. For each candidate, calculate semantic match and auto-apply if eligible
        for cand in candidates:
            seeker_id = cand['user_id']
            threshold = cand['auto_apply_match_threshold']
            
            # Use copy to prevent mutating base job dict
            job_copy = dict(job)
            enriched = calculate_matches(cur, seeker_id, [job_copy])
            score = enriched[0]['match_score']
            
            if score >= threshold:
                try:
                    cur.execute("""
                        INSERT INTO applications (jobseeker_id, job_id, status, match_score, method, applied_at, updated_at)
                        VALUES (%s, %s, 'Applied', %s, 'Auto-Applied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                        ON CONFLICT DO NOTHING
                    """, (seeker_id, job_id, score))
                    conn.commit()
                    log_info(f"Successfully Auto-Applied candidate {seeker_id} to job {job_id} (Score: {score}%, Threshold: {threshold}%)")
                except Exception as db_err:
                    conn.rollback()
                    log_error(f"Failed to insert auto-application for candidate {seeker_id} to job {job_id}: {db_err}")
            else:
                log_info(f"Candidate {seeker_id} did not meet auto-apply threshold ({score}% < {threshold}%) for job {job_id}")
                
    except Exception as e:
        log_error(f"Error in auto-apply background worker: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

def run_auto_apply_for_candidate(seeker_id):
    """
    Background worker function that runs when a jobseeker updates their profile or uploads a CV.
    Identifies all Active jobs the candidate has not applied to yet, calculates semantic match scores,
    and automatically applies to any jobs where the score exceeds their threshold.
    """
    from db import get_db_connection
    from psycopg2.extras import RealDictCursor
    
    log_info(f"Auto-Apply Automation triggered for jobseeker ID {seeker_id}")
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # 1. Fetch jobseeker details
        cur.execute("""
            SELECT auto_apply, auto_apply_match_threshold 
            FROM jobseeker_profiles 
            WHERE user_id = %s
        """, (seeker_id,))
        seeker = cur.fetchone()
        
        if not seeker or not seeker['auto_apply']:
            log_info(f"Auto-Apply aborted: Seeker {seeker_id} profile not found or auto_apply is disabled.")
            return
            
        threshold = seeker['auto_apply_match_threshold']
        
        # 2. Find all Active jobs the candidate has not applied to yet
        cur.execute("""
            SELECT j.*, 
                   ARRAY(
                     SELECT s.name 
                     FROM job_skills js
                     JOIN skills s ON js.skill_id = s.id
                     WHERE js.job_id = j.id
                   ) AS skills
            FROM jobs j
            WHERE j.status = 'Active' 
              AND j.id NOT IN (
                  SELECT job_id FROM applications WHERE jobseeker_id = %s
              )
        """, (seeker_id,))
        jobs = cur.fetchall()
        
        if not jobs:
            log_info(f"No qualifying active jobs to evaluate for seeker {seeker_id}")
            return
            
        log_info(f"Evaluating auto-apply for seeker {seeker_id} against {len(jobs)} active jobs...")
        
        # 3. Calculate semantic match scores for all these jobs
        enriched_jobs = calculate_matches(cur, seeker_id, jobs)
        
        # 4. Apply to jobs exceeding the threshold
        for job in enriched_jobs:
            score = job['match_score']
            if score >= threshold:
                try:
                    cur.execute("""
                        INSERT INTO applications (jobseeker_id, job_id, status, match_score, method, applied_at, updated_at)
                        VALUES (%s, %s, 'Applied', %s, 'Auto-Applied', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                        ON CONFLICT DO NOTHING
                    """, (seeker_id, job['id'], score))
                    conn.commit()
                    log_info(f"Successfully Auto-Applied candidate {seeker_id} to job {job['id']} (Score: {score}%, Threshold: {threshold}%)")
                except Exception as db_err:
                    conn.rollback()
                    log_error(f"Failed to insert auto-application for candidate {seeker_id} to job {job['id']}: {db_err}")
            else:
                log_info(f"Candidate {seeker_id} did not meet auto-apply threshold ({score}% < {threshold}%) for job {job['id']}")
                
    except Exception as e:
        log_error(f"Error in auto-apply-for-candidate background worker: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

