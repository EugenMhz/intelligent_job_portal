"""
test_pipeline.py
-----------------
Runs the full Step 1 -> Step 3 pipeline on a sample resume so you can
see exactly what comes out at each stage.

Run this with: python test_pipeline.py
"""

from text_extractor import extract_text
from preprocessor import preprocess_text
from skill_extractor import extract_skills
from make_sample_resume import make_sample_resume
from matching_engine import calculate_hybrid_score, check_auto_apply

# 1. Generate a sample resume PDF (only needed for this test)
make_sample_resume("sample_resume.pdf")

print("=" * 60)
print("STEP 1: RAW EXTRACTED TEXT (straight from the PDF)")
print("=" * 60)
raw_text = extract_text("sample_resume.pdf")
print(raw_text)

print("\n" + "=" * 60)
print("STEP 2: CLEANED TEXT (for embeddings / BERT later)")
print("=" * 60)
result = preprocess_text(raw_text)
print(result["clean_string"])

print("\n" + "=" * 60)
print("STEP 3: LEMMATIZED TOKENS (for TF-IDF / keyword matching later)")
print("=" * 60)
print(result["tokens"])

print("\n" + "=" * 60)
print("STEP 4: SKILLS EXTRACTED FROM RESUME")
print("=" * 60)
resume_skills = extract_skills(raw_text)
print("Flat list:", resume_skills["skills_found"])
print("\nBy category:")
for category, skills in resume_skills["skills_by_category"].items():
    print(f"  {category}: {skills}")

# --- Now do the same thing for a sample JOB DESCRIPTION ---
# This proves extract_skills() works identically for resumes AND job
# postings, which is exactly what the Matching Engine needs later:
# it has to compare userSkills vs jobSkills.
sample_job_description = """
We are hiring a Backend Developer with strong experience in Python and
Flask. Must know PostgreSQL, REST APIs, Docker, and have familiarity
with Machine Learning or NLP concepts. Experience with Git and AWS is
a plus. Good communication and teamwork skills required.
"""

print("\n" + "=" * 60)
print("STEP 4b: SKILLS EXTRACTED FROM A SAMPLE JOB DESCRIPTION")
print("=" * 60)
job_skills = extract_skills(sample_job_description)
print("Flat list:", job_skills["skills_found"])

print("\n" + "=" * 60)
print("QUICK PREVIEW: overlapping skills (resume & job)")
print("=" * 60)
overlap = set(resume_skills["skills_found"]) & set(job_skills["skills_found"])
print(sorted(overlap))
print(f"({len(overlap)} shared skills out of {len(job_skills['skills_found'])} required — "
      f"this simple overlap count is a preview of what the Matching Engine "
      f"will formalize with cosine similarity in the next step)")

print("\n" + "=" * 60)
print("STEP 5: HYBRID SEMANTIC MATCHING & AUTO-APPLY DECISION")
print("=" * 60)

# Calculate hybrid matching score
match_result = calculate_hybrid_score(
    resume_text=raw_text,
    job_description=sample_job_description,
    extracted_resume_skills=resume_skills["skills_found"],
    extracted_job_skills=job_skills["skills_found"],
    semantic_weight=0.6,
    skill_weight=0.4
)

print(f"Semantic Similarity Match : {match_result['semantic_match_percentage']}%")
print(f"Keyword/Skill Match Score   : {match_result['skill_match_percentage']}%")
print(f"Overall Hybrid Match Score  : {match_result['hybrid_match_percentage']}%")
print(f"Matching Skills             : {match_result['matching_skills']}")
print(f"Missing Skills              : {match_result['missing_skills']}")

# Simulate user settings for auto-apply
user_settings_enabled = {
    "threshold": 70.0,
    "auto_apply_enabled": True
}

user_settings_disabled = {
    "threshold": 70.0,
    "auto_apply_enabled": False
}

print("\n--- Auto-Apply Simulation 1 (Auto-Apply Enabled) ---")
decision_enabled = check_auto_apply(match_result, user_settings_enabled)
print(f"Threshold Requirement       : {decision_enabled['threshold']}%")
print(f"Auto-Apply Flag (Candidate) : {decision_enabled['auto_apply_enabled']}")
print(f"Application Status          : {decision_enabled['status']}")

print("\n--- Auto-Apply Simulation 2 (Auto-Apply Disabled) ---")
decision_disabled = check_auto_apply(match_result, user_settings_disabled)
print(f"Threshold Requirement       : {decision_disabled['threshold']}%")
print(f"Auto-Apply Flag (Candidate) : {decision_disabled['auto_apply_enabled']}")
print(f"Application Status          : {decision_disabled['status']}")
