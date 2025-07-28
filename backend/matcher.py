from typing import Set, Tuple
from backend.extractor.textprep import tokenize, build_ngrams, normalize
import logging

logger = logging.getLogger(__name__)


def match_sets(resume_text: str, required: Set[str], preferred: Set[str]) -> Tuple[list[str], list[str], list[str], list[str]]:
    """Auto mode matcher: set of tokens/phrases on both sides."""
    norm_resume = normalize(resume_text)
    tokens = tokenize(norm_resume)
    token_set: Set[str] = set(tokens)
    ngrams = set(build_ngrams(tokens, n_min=2, n_max=5))


    def hit(term: str) -> bool:
        term_lower = term.lower()
        result = term_lower in (ngrams if " " in term else token_set)
        return result

    matched_req   = sorted([t for t in required  if hit(t)])
    missing_req   = sorted([t for t in required  if not hit(t)])
    matched_pref  = sorted([t for t in preferred if hit(t)])
    missing_pref  = sorted([t for t in preferred if not hit(t)])

    return matched_req, missing_req, matched_pref, missing_pref
