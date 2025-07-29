from fastapi import APIRouter, HTTPException
import logging
from datetime import datetime
import hashlib
import time

from backend.models import AutoAnalyzePayload, AutoAnalyzeResponse
from backend.matcher import match_sets
from backend.extractor.textprep import normalize
from backend.extractor.factory import get_extractor
from backend.config.redis_config import redis_cache

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/analyze",
    tags=["analyze"]
)

extractor = get_extractor()


def calculate_score(required: set, preferred: set, matched_req: set, matched_pref: set) -> float:
    """Calculate keywordmatch score"""
    total = len(required) * 2 + len(preferred)
    got = len(matched_req) * 2 + len(matched_pref)
    return round((got / total) * 100, 2) if total else 0.0


@router.post("/auto", response_model=AutoAnalyzeResponse)
def analyze_auto(payload: AutoAnalyzePayload):
    """Analyze a job description and resume with Redis caching for keywords"""
    start_time = time.time()

    logger.info(f"Analysis request - Job text: {len(payload.job_text)} chars, Resume: {len(payload.resume_text)} chars")

    if not payload.resume_text or not payload.job_text:
        raise HTTPException(status_code=400, detail="Missing resume or job text")
    
    # Clean
    jd_clean = normalize(payload.job_text)
    resume_clean = normalize(payload.resume_text)

    # Check Redis cache first
    job_text_hash = hashlib.md5(payload.job_text.encode()).hexdigest()
    cache_key = f"job_analysis:{job_text_hash}"
    
    cached_analysis = redis_cache.get_by_cache_key(cache_key)
    if cached_analysis:
        logger.info(f"Using cached keywords for analysis")
        required = set(cached_analysis.get("required_keywords", []))
        preferred = set(cached_analysis.get("preferred_keywords", []))
    else:
        # Extract keyword sets
        logger.info(f"Extracting keywords for analysis")
        required, preferred = extractor.extract(jd_clean)
        
        # Cache the extracted keywords
        cache_data = {
            "required_keywords": list(required),
            "preferred_keywords": list(preferred),
            "extracted_at": datetime.utcnow().isoformat(),
            "job_text_length": len(payload.job_text)
        }
        redis_cache.set_by_cache_key(cache_key, cache_data)

    # Scoring
    matched_req, missing_req, matched_pref, missing_pref = match_sets(
        resume_clean,
        required, 
        preferred
    )
    match_score = calculate_score(required, 
                        preferred, 
                        set(matched_req), 
                        set(matched_pref)
                        )
    end_time = time.time() - start_time

    logger.info(f"Analysis complete - Score: {match_score}%, Required matched: {len(matched_req)}/{len(required)}, Time taken: {end_time:.6f}s")

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


