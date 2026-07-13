"""
skills_data.py
----------------
A curated list of known skills, organized by category. This is the
"dictionary" the skill_extractor searches for inside resume/job text.

Why a fixed list instead of pure AI guessing?
    Generic NLP models don't inherently know that "Docker" or "React.js"
    are skills — they just look like normal words/nouns to them. A
    curated skill list (used alongside NLP for matching, not instead of
    it) is exactly the "keyword extraction" approach used in the
    Daryani et al. (2020) and Mkrtchyan papers from your literature
    review, and it also gives you EXPLAINABILITY: you can show a
    recruiter exactly which words in the resume triggered a match
    (see Khelkhal & Lanasri, 2025 on why that transparency matters).

You should keep expanding this list as you test on real resumes —
it's meant to grow over time, not be exhaustive on day one.
"""

SKILLS_DATABASE = {
    "programming_languages": [
        "python", "java", "javascript", "typescript", "c++", "c#", "c",
        "php", "ruby", "go", "rust", "kotlin", "swift", "r", "matlab",
        "sql", "html", "css", "scala", "dart",
    ],
    "frameworks_libraries": [
        "react.js", "react", "angular", "vue.js", "vue", "node.js", "node",
        "flask", "django", "express.js", "spring boot", "spring",
        "next.js", "fastapi", "laravel", ".net", "bootstrap", "tailwind",
        "jquery", "redux",
    ],
    "databases": [
        "postgresql", "mysql", "mongodb", "sqlite", "oracle", "redis",
        "firebase", "dynamodb", "cassandra", "elasticsearch", "mariadb",
        "sql server",
    ],
    "ml_ai_data": [
        "machine learning", "deep learning", "nlp",
        "natural language processing", "computer vision", "bert",
        "sentence-bert", "sbert", "transformers", "tensorflow", "pytorch",
        "keras", "scikit-learn", "sklearn", "pandas", "numpy", "opencv",
        "spacy", "nltk", "data analysis", "data science", "llm",
        "large language models", "generative ai", "rag",
        "retrieval augmented generation", "cosine similarity",
        "k-nearest neighbors", "knn", "svm",
        "support vector machine", "neural network", "cnn", "lstm",
    ],
    "cloud_devops": [
        "aws", "azure", "gcp", "google cloud", "docker", "kubernetes",
        "jenkins", "ci/cd", "terraform", "git", "github", "gitlab",
        "linux", "bash", "nginx", "microservices", "rest api", "rest apis",
        "graphql", "api development",
    ],
    "tools_platforms": [
        "figma", "jira", "postman", "vs code", "excel", "power bi",
        "tableau", "slack", "notion", "confluence",
    ],
    "soft_skills": [
        "communication", "leadership", "teamwork", "problem solving",
        "project management", "time management", "critical thinking",
        "team leadership", "collaboration", "adaptability",
        "agile", "scrum",
    ],
}


def get_flat_skill_list():
    """
    Returns all skills from every category as a single flat list.
    Useful for building the PhraseMatcher, which doesn't need to know
    about categories — it just needs every phrase to search for.
    """
    all_skills = []
    for category_skills in SKILLS_DATABASE.values():
        all_skills.extend(category_skills)
    return all_skills
