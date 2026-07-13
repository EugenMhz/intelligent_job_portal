"""
Generates a fake sample resume PDF so we have something to test
text_extractor.py against. You'll replace this with real uploaded
resumes later — this is purely for testing the pipeline.
"""

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

def make_sample_resume(path="sample_resume.pdf"):
    c = canvas.Canvas(path, pagesize=letter)
    lines = [
        "Aashish Tamang",
        "Software Engineer",
        "",
        "Summary:",
        "Motivated Software Engineer with 3+ years of experience developing",
        "scalable web applications using Python, Flask, React.js, and PostgreSQL.",
        "",
        "Skills:",
        "- Python, JavaScript, SQL",
        "- Flask, React.js, Node.js",
        "- Machine Learning, NLP, BERT",
        "- Git, Docker, AWS",
        "",
        "Experience:",
        "Backend Developer, ABC Tech (2023 - Present)",
        "- Developed REST APIs using Flask and PostgreSQL",
        "- Implemented resume parsing features using spaCy and NLTK",
        "",
        "Education:",
        "Bachelor of Computer Science (Hons), IIMS College, 2022-2026",
    ]

    y = 750
    for line in lines:
        c.drawString(50, y, line)
        y -= 20

    c.save()
    print(f"Sample resume saved to {path}")

if __name__ == "__main__":
    make_sample_resume()
