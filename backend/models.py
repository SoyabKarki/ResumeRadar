from pydantic import BaseModel
from typing import List, Literal, Optional, Set

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