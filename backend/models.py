from pydantic import BaseModel
from typing import List, Literal, Optional, Set

# ----- OLD MANUAL MODE -----
class KeywordSpec(BaseModel):
    term: str                 # lowercase
    kind: Literal["word","phrase"]

class JDKeywords(BaseModel):
    required: List[KeywordSpec]
    preferred: List[KeywordSpec] = []

class AnalyzePayload(BaseModel):
    resume_text: str
    jd: JDKeywords


# ----- NEW AUTO-EXTRACTED MODE -----
class AutoAnalyzePayload(BaseModel):
    job_text: str
    resume_text: str

class AutoAnalyzeResponse(BaseModel):
    match_score: float
    required: List[str]
    preferred: List[str]
    matched_required: List[str]
    matched_preferred: List[str]
    missing_required: List[str]
    missing_preferred: List[str]
    auto_extracted: bool = True