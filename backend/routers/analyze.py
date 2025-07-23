from fastapi import APIRouter
from models import AnalyzePayload
from matcher import match_keywords

router = APIRouter(
    prefix="/analyze",
    tags=["analyze"]
)

@router.post("/keywords")
def analyze_keywords(payload: AnalyzePayload):
    res = match_keywords(payload.resume_text, payload.jd)

    return {
        "required_total": len(payload.jd.required),
        "required_found": len(res["required"]["found"]),
        "required_missing": res["required"]["missing"],
        "preferred_total": len(payload.jd.preferred),
        "preferred_found": len(res["preferred"]["found"]),
        "preferred_missing": res["preferred"]["missing"],
        "pass": len(res["required"]["found"]) == len(payload.jd.required)
    }
