from typing import Set
from models import JDKeywords
from textprep import tokenize, build_ngrams, normalize


def match_keywords(resume_text: str, jd: JDKeywords):
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