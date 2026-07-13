"""
matching_engine.py
------------------
Step 5 of the pipeline (Automated Job Matching and Self-Application):
    - Converts resume text and job description to SBERT embeddings.
    - Computes cosine similarity (semantic similarity).
    - Extracts keyword-based skill overlap.
    - Computes a weighted hybrid matching percentage.
    - Triggers auto-apply if the percentage meets or exceeds the 70% threshold
      and the job seeker has auto-apply enabled.
"""

from sentence_transformers import SentenceTransformer, util
import numpy as np

# Load a lightweight, high-performance SentenceTransformers model
# It will automatically be downloaded and cached on first run
print("[info] Loading Sentence-BERT model (all-MiniLM-L6-v2)...")
model = SentenceTransformer("all-MiniLM-L6-v2")


def calculate_semantic_similarity(text1: str, text2: str) -> float:
    """
    Computes semantic similarity between two texts using SBERT embeddings.
    Returns a score between 0.0 and 1.0.
    """
    if not text1.strip() or not text2.strip():
        return 0.0

    # Encode both text strings
    embeddings1 = model.encode(text1, convert_to_tensor=True)
    embeddings2 = model.encode(text2, convert_to_tensor=True)

    # Compute cosine similarity
    similarity = util.cos_sim(embeddings1, embeddings2)
    
    # Return similarity as a float between 0.0 and 1.0
    return max(0.0, min(1.0, float(similarity.item())))


def calculate_hybrid_score(
    resume_text: str,
    job_description: str,
    extracted_resume_skills: list,
    extracted_job_skills: list,
    semantic_weight: float = 0.6,
    skill_weight: float = 0.4
) -> dict:
    """
    Calculates a hybrid matching percentage.
    
    - semantic_weight: Importance of full context / sentence embeddings (default 60%)
    - skill_weight: Importance of specific key skill overlap (default 40%)
    
    Returns a dict with:
        - semantic_match_percentage: SBERT similarity %
        - skill_match_percentage: Keyword skills overlap %
        - hybrid_match_percentage: Combined weighted %
        - matching_skills: List of skills found in both
        - missing_skills: List of job skills not found in resume
    """
    # 1. Calculate Semantic Score
    semantic_score = calculate_semantic_similarity(resume_text, job_description)

    # 2. Calculate Skill Overlap Score (Keyword Match)
    resume_skills_set = set(s.lower() for s in extracted_resume_skills)
    job_skills_set = set(s.lower() for s in extracted_job_skills)

    if not job_skills_set:
        # If the job description lists no key skills, default keyword score to 100%
        skill_score = 1.0
    else:
        matching_skills = resume_skills_set & job_skills_set
        skill_score = len(matching_skills) / len(job_skills_set)

    # 3. Compute Weighted Hybrid Score
    hybrid_score = (semantic_score * semantic_weight) + (skill_score * skill_weight)

    # Convert to standard percentage format (0-100)
    semantic_pct = round(semantic_score * 100, 2)
    skill_pct = round(skill_score * 100, 2)
    hybrid_pct = round(hybrid_score * 100, 2)

    return {
        "semantic_match_percentage": semantic_pct,
        "skill_match_percentage": skill_pct,
        "hybrid_match_percentage": hybrid_pct,
        "matching_skills": sorted(list(resume_skills_set & job_skills_set)),
        "missing_skills": sorted(list(job_skills_set - resume_skills_set))
    }


def check_auto_apply(match_result: dict, user_settings: dict) -> dict:
    """
    Determines if the job application should be automatically submitted.
    
    - threshold: Match percentage requirement (default 70.0)
    - auto_apply_enabled: Whether user has enabled self-application
    """
    threshold = user_settings.get("threshold", 70.0)
    auto_apply_enabled = user_settings.get("auto_apply_enabled", False)
    
    match_percentage = match_result["hybrid_match_percentage"]
    is_above_threshold = match_percentage >= threshold
    
    should_apply = is_above_threshold and auto_apply_enabled

    if should_apply:
        status = "AUTO-APPLIED SUCCESSFULLY"
    elif not auto_apply_enabled:
        status = "SKIPPED (Auto-Apply feature is disabled by the candidate)"
    else:
        status = f"SKIPPED (Match score {match_percentage}% is below the {threshold}% threshold)"

    return {
        "match_percentage": match_percentage,
        "threshold": threshold,
        "auto_apply_enabled": auto_apply_enabled,
        "should_apply": should_apply,
        "status": status
    }


if __name__ == "__main__":
    # Small self-test
    res_text = "Software engineer specialized in Python backend development and SQL databases."
    job_text = "We are seeking a Python backend engineer with database experience."
    res_skills = ["python", "sql"]
    job_skills = ["python", "sql", "aws"]
    
    res = calculate_hybrid_score(res_text, job_text, res_skills, job_skills)
    print("Self-Test Hybrid Score:", res)
    
    settings = {"threshold": 70.0, "auto_apply_enabled": True}
    apply_res = check_auto_apply(res, settings)
    print("Self-Test Auto-Apply Decision:", apply_res)
