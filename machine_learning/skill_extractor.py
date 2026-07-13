"""
skill_extractor.py
--------------------
Step 4 of the pipeline (see Chapter 4 pseudocode):
    userSkills = SkillExtractor.extractSkills(cleanText)

Purpose:
    Takes cleaned text (from a resume OR a job description — this
    function works for both) and returns the list of known skills found
    inside it, using the skills dictionary in skills_data.py.

Why PhraseMatcher instead of just Python's `in` string search?
    PhraseMatcher works on TOKENS, not raw characters, so it correctly
    matches "machine learning" as one phrase even with extra spaces or
    different punctuation, and it won't accidentally match "java" inside
    the word "javascript" the way a naive substring search might.
"""

import spacy
from spacy.matcher import PhraseMatcher

from skills_data import get_flat_skill_list, SKILLS_DATABASE
from preprocessor import remove_special_characters, to_lowercase

nlp = spacy.load("en_core_web_sm")

# Build the matcher ONCE at import time (reused across every resume/job
# we process — rebuilding it every call would be wasteful).
matcher = PhraseMatcher(nlp.vocab, attr="LOWER")

# spaCy needs each skill phrase turned into a "pattern" (a mini spaCy doc)
skill_patterns = [nlp.make_doc(skill) for skill in get_flat_skill_list()]
matcher.add("SKILLS", skill_patterns)


def extract_skills(raw_or_clean_text: str) -> dict:
    """
    Finds all known skills mentioned in the given text.

    Returns a dict:
        {
            "skills_found": ["python", "flask", "react.js", ...],  (unique, sorted)
            "skills_by_category": {"programming_languages": [...], ...},
            "raw_matches": [ (skill, position_in_text), ... ]
        }
    """
    # Light cleaning only — NOT full lemmatization, since lemmatizing
    # would turn "machine learning" into "machine learn" and break the
    # phrase match against our skills dictionary.
    text = remove_special_characters(raw_or_clean_text)
    text = to_lowercase(text)

    doc = nlp(text)
    matches = matcher(doc)

    found_skills = set()
    raw_matches = []

    for match_id, start, end in matches:
        span = doc[start:end]
        skill_text = span.text
        found_skills.add(skill_text)
        raw_matches.append((skill_text, start))

    # Group the found skills back into their categories, so the
    # recruiter dashboard can show e.g. "Programming Languages: Python, SQL"
    skills_by_category = {}
    for category, category_skills in SKILLS_DATABASE.items():
        matched_in_category = [s for s in found_skills if s in category_skills]
        if matched_in_category:
            skills_by_category[category] = sorted(matched_in_category)

    return {
        "skills_found": sorted(found_skills),
        "skills_by_category": skills_by_category,
        "raw_matches": raw_matches,
    }


if __name__ == "__main__":
    sample_resume_text = """
    Software Engineer with 3+ years of experience developing scalable
    web applications using Python, Flask, React.js, and PostgreSQL.
    Skilled in Machine Learning, NLP, and BERT-based models.
    Experience with Git, Docker, and AWS. Strong communication and
    teamwork skills.
    """

    result = extract_skills(sample_resume_text)

    print("All skills found:")
    print(result["skills_found"])

    print("\nSkills grouped by category:")
    for category, skills in result["skills_by_category"].items():
        print(f"  {category}: {skills}")
