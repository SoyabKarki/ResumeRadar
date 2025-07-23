from typing import Set
from models import JDKeywords
from textprep import tokenize, build_ngrams, normalize


def match_keywords(resume_text: str, jd: JDKeywords):
    """
    OLD endpoint: takes pre-specified keyword specs (word/phrase).
    """

    norm_resume = normalize(resume_text)
    tokens = tokenize(norm_resume)

    # Set for faster lookup
    token_set: Set[str] = set(tokens) 
    ngrams = set(build_ngrams(tokens))  

    results = {
        "required": {"found": [], "missing": []},
        "preferred": {"found": [], "missing": []},
    }


    def check(spec_list, bucket):
        for spec in spec_list:
            term = spec.term
            if spec.kind == "phrase":
                hit = term in ngrams
            else:  # word
                hit = term in token_set
            
            (results[bucket]["found" if hit else "missing"]).append(term)
        
    
    check(jd.required, "required")
    check(jd.preferred, "preferred")

    return results


def match_sets(resume_text: str, required: Set[str], preferred: Set[str]):
    """
    NEW helper: resume_text vs simple sets of auto-extracted tokens/phrases
    """

    norm_resume = normalize(resume_text)
    tokens = tokenize(norm_resume)
    token_set: Set[str] = set(tokens)
    ngrams = set(build_ngrams(tokens))

    def hit(term: str):
        # phrase if contains space
        return term in (ngrams if " " in term else token_set)
    
    matched_req = sorted([t for t in required if hit(t)])
    matched_pref = sorted([t for t in preferred if hit(t)])
    missing_req = sorted([t for t in required if not hit(t)])
    missing_pref = sorted([t for t in preferred if not hit(t)])

    return matched_req, matched_pref, missing_req, missing_pref