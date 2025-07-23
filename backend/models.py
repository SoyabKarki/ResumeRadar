from pydantic import BaseModel
from typing import List, Literal, Optional

class KeywordSpec(BaseModel):
    term: str                 # lowercase
    kind: Literal["word","phrase"]

class JDKeywords(BaseModel):
    required: List[KeywordSpec]
    preferred: List[KeywordSpec] = []

class AnalyzePayload(BaseModel):
    resume_text: str
    jd: JDKeywords