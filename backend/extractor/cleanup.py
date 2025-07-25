import re
from typing import Set, Tuple

# Expanded stopwords/filler
STOPWORDS = {
    'and','or','the','a','an','of','to','in','on','for','with','by','as','at','is','are','be','will','this','that','it',
    'our','we','you','your','their','they','from','about','job','role','team','company','responsibilities','requirement',
    'requirements','preferred','nice','must','have','description','qualification','qualifications','skills','ability',
    'experience','including','includes','include','using','use','used','needed','need','necessary','plus','open','all',
    'work','mode','modes','remote','flex','on-site','request','provide','provides','providing','support','support.this',
    'general','project','process','processes','between','availability','available','hours','hour','hrs','min','mins',
    'minute','minutes','am','pm','et','pst','cst','ist','gmt','one','two','three','such','as','etc','per','day','days',
    'role','roles','task','tasks','will','can','ability','able','ensure','ensuring','ensure','ensures','ensure'
}

REQ_HEADINGS = ("requirements", "must-haves", "must have", "required", "basic qualifications")
PREF_HEADINGS = ("preferred", "nice-to-haves", "nice to have", "bonus", "good to have")

# keep letters, numbers and a small set of skill punctuation
TOKEN_RE = re.compile(r"[A-Za-z0-9+#./-]+")

def clean_text(raw: str) -> str:
    """Normalize newlines, spacing, and remove duplicate punctuation."""
    if not raw:
        return ""
    text = raw.replace("\r", "\n")
    # put a space after periods to help splitting (not after decimals)
    text = re.sub(r"([a-zA-Z0-9])\.(\s|$)", r"\1. ", text)
    # collapse multiple newlines
    text = re.sub(r"\n{2,}", "\n\n", text)
    return text.strip()

def split_sections(text: str):
    current = "other"
    sections = {"required": [], "preferred": [], "other": []}
    for line in text.splitlines():
        l = line.strip()
        low = l.lower().rstrip(':')
        if any(h in low for h in REQ_HEADINGS):
            current = "required"; continue
        if any(h in low for h in PREF_HEADINGS):
            current = "preferred"; continue
        sections[current].append(l)
    return {k: "\n".join(v).strip() for k, v in sections.items()}

def _normalize_token(tok: str) -> str:
    tok = tok.lower().strip("-./+ ")
    tok = re.sub(r"[^a-z0-9+#./-]", "", tok)
    return tok

def _valid_token(tok: str) -> bool:
    if not tok or tok in STOPWORDS:
        return False
    if tok.isdigit():
        return False
    if len(tok) < 2:
        return False
    return True

def extract_tokens(text: str) -> Set[str]:
    tokens = {_normalize_token(t) for t in TOKEN_RE.findall(text or "")}
    return {t for t in tokens if _valid_token(t)}

def extract_phrases(text: str, max_len: int = 3) -> Set[str]:
    # Tokenize first
    toks = [t for t in TOKEN_RE.findall(text or "") if _valid_token(_normalize_token(t))]
    normed = [_normalize_token(t) for t in toks]
    phrases: Set[str] = set()
    for n in range(2, max_len + 1):
        for i in range(len(normed) - n + 1):
            window = normed[i:i+n]
            if all(_valid_token(w) for w in window):
                phrase = " ".join(window)
                # reject if all are stopwords (unlikely after filter, but safe)
                if any(w not in STOPWORDS for w in window):
                    phrases.add(phrase)
    return phrases

def build_keyword_sets(text: str) -> Tuple[Set[str], Set[str]]:
    sections = split_sections(text)
    req_text = sections.get("required", "")
    pref_text = sections.get("preferred", "")

    def keyset(t: str) -> Set[str]:
        return extract_tokens(t) | extract_phrases(t)

    required = keyset(req_text)
    preferred = keyset(pref_text)

    if not required and not preferred:
        # fallback: treat all as required
        required = keyset(text)

    return required, preferred

def score(required: Set[str], preferred: Set[str],
          matched_req: Set[str] | list[str], matched_pref: Set[str] | list[str]) -> float:
    total = len(required) * 2 + len(preferred)
    got = len(matched_req) * 2 + len(matched_pref)
    return round((got / total) * 100, 2) if total else 0.0
