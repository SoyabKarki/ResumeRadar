from fastapi import APIRouter, HTTPException
from models import AutoAnalyzePayload, AutoAnalyzeResponse
from matcher import match_sets
from cleanup import clean_text, build_keyword_sets, score

router = APIRouter(
    prefix="/analyze",
    tags=["analyze"]
)

@router.post("/auto", response_model=AutoAnalyzeResponse)
def analyze_auto(payload: AutoAnalyzePayload):
    if not payload.resume_text or not payload.job_text:
        raise HTTPException(status_code=400, detail="Missing resume or job text")
    
    # Clean
    jd_clean = clean_text(payload.job_text)
    resume_clean = clean_text(payload.resume_text)

    # Extract keyword sets
    required, preferred = build_keyword_sets(jd_clean)

    # Match
    matched_req, matched_pref, missing_req, missing_pref = match_sets(resume_clean, required, preferred)

    # Score
    match_score = score(required, preferred, set(matched_req), set(matched_pref))

    return AutoAnalyzeResponse(
        match_score=match_score,
        required=sorted(required),
        preferred=sorted(preferred),
        matched_required=matched_req,
        missing_required=missing_req,
        matched_preferred=matched_pref,
        missing_preferred=missing_pref,
        auto_extracted=True
    )
