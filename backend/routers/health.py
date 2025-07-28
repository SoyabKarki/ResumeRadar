from fastapi import APIRouter, HTTPException
from datetime import datetime
import logging

from backend.config.redis_config import redis_cache

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/health",
    tags=["health"]
)


@router.get("/health")
async def redis_health_check():
    """Check Redis connection health"""
    try:
        redis_cache.redis_client.ping()
        return {
            "status": "healthy", 
            "redis": "connected",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Redis health check failed: {e}")
        raise HTTPException(
            status_code=503, 
            detail="Redis connection failed"
        )
    