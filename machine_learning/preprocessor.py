"""
preprocessor.py
----------------
Step 3 of the pipeline (see Chapter 4 pseudocode: preprocessText):
    removeSpecialCharacters(text)
    convertToLowerCase(text)
    removeStopWords(text)
    -> RETURN cleanedText

Purpose:
    Raw extracted text is messy (extra whitespace, bullet symbols, phone
    numbers, punctuation, inconsistent casing). Before we can extract
    skills or compute similarity, we need to normalize it.

This module produces TWO outputs, because you'll need both later:
    1. clean_text_string  -> a clean, readable string (good for BERT/
       Sentence-BERT embeddings later, since transformer models want
       natural sentences, not a stripped bag of words)
    2. clean_tokens        -> a list of lemmatized, stopword-free tokens
       (good for simpler methods like TF-IDF / keyword matching)
"""

import re
import spacy

# Load spaCy's small English model once, at import time (loading it inside
# a function would reload it every call, which is slow).
nlp = spacy.load("en_core_web_sm")


def remove_special_characters(text: str) -> str:
    """
    Strips out characters that add noise but no meaning for matching:
    bullets, emojis, excessive punctuation, multiple line breaks etc.

    We KEEP letters, numbers, and basic punctuation like '+', '#', '.'
    because things like "C++", "C#", and "Node.js" are meaningful skill
    names and would be broken if we stripped all symbols.
    """
    # Replace common bullet characters with a space
    text = re.sub(r"[•●▪♦►·]", " ", text)

    # Keep letters, numbers, spaces, and a few tech-relevant symbols
    text = re.sub(r"[^a-zA-Z0-9\s\.\+\#\-]", " ", text)

    # Collapse multiple spaces/newlines into a single space
    text = re.sub(r"\s+", " ", text).strip()

    return text


def to_lowercase(text: str) -> str:
    """Converts text to lowercase for consistent matching."""
    return text.lower()


def remove_stopwords_and_lemmatize(text: str) -> list:
    """
    Uses spaCy to:
      1. Tokenize the text (split into words)
      2. Remove stopwords (common words like 'the', 'and', 'is' that
         carry no useful meaning for skill/job matching)
      3. Lemmatize each remaining word (reduce to its base/dictionary
         form, e.g. "developing" -> "develop", "managed" -> "manage")

    Returns a list of cleaned, lemmatized tokens.
    """
    doc = nlp(text)

    tokens = [
        token.lemma_
        for token in doc
        if not token.is_stop        # skip stopwords
        and not token.is_punct      # skip stray punctuation tokens
        and not token.is_space      # skip whitespace tokens
        and len(token.lemma_) > 1   # skip single leftover characters
    ]

    return tokens


def preprocess_text(raw_text: str) -> dict:
    """
    Full preprocessing pipeline. Call this one function from the rest
    of your code — it runs all the steps above in the right order.

    Returns a dict with:
        - "clean_string": cleaned, readable text (for embeddings)
        - "tokens": list of lemmatized tokens (for TF-IDF/keyword methods)
    """
    step1 = remove_special_characters(raw_text)
    step2 = to_lowercase(step1)
    tokens = remove_stopwords_and_lemmatize(step2)

    clean_string = " ".join(tokens)

    return {
        "clean_string": clean_string,
        "tokens": tokens,
    }


if __name__ == "__main__":
    sample = """
    • Software Engineer with 3+ years of experience developing scalable
    web applications using Python, React.js, and Node.js.
    Managed a team of 4 developers and improved deployment speed by 40%!!
    """
    result = preprocess_text(sample)
    print("Clean string:\n", result["clean_string"])
    print("\nTokens:\n", result["tokens"])
