import re
from typing import List

TOKEN_RE = re.compile(r"[a-z0-9\+\#\.]+") 

def normalize(text: str) -> str:
    text = text.lower()
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[“”]", '"', text)
    text = re.sub(r"[’‘]", "'", text)
    text = re.sub(r"[–—]", "-", text)
    return re.sub(r"\s+", " ", text).strip()

def tokenize(text: str) -> List[str]:
    return TOKEN_RE.findall(text)

def build_ngrams(tokens: List[str], n_min=2, n_max=5) -> List[str]:
    grams = []
    for n in range(n_min, n_max + 1):
        for i in range(len(tokens) - n + 1):
            grams.append(" ".join(tokens[i : i + n]))
    return grams
