import redis
import os
from typing import Optional
import json
import logging

logger = logging.getLogger(__name__)

class RedisCache:
    def __init__(self):
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        self.redis_client = redis.from_url(redis_url)
        self.default_ttl = 30 * 24 * 60 * 60  # 30 days
    
    def get_by_cache_key(self, cache_key: str) -> Optional[dict]:
        """Get cached data by cache key"""
        try:
            cached_data = self.redis_client.get(cache_key)
            if cached_data:
                logger.info(f"Cache hit for key: {cache_key}")
                return json.loads(cached_data)
            logger.info(f"Cache miss for key: {cache_key}")
            return None
        except Exception as e:
            logger.error(f"Error getting cache for key {cache_key}: {e}")
            return None

    def set_by_cache_key(self, cache_key: str, data: dict, ttl: int = None) -> bool:
        """Set cached data by cache key"""
        try:
            ttl = ttl or self.default_ttl
            self.redis_client.setex(cache_key, ttl, json.dumps(data))
            logger.info(f"Cached data for key: {cache_key}")
            return True
        except Exception as e:
            logger.error(f"Error setting cache for key {cache_key}: {e}")
            return False

    def delete_by_cache_key(self, cache_key: str) -> bool:
        """Delete cached data by cache key"""
        try:
            self.redis_client.delete(cache_key)
            logger.info(f"Deleted cache for key: {cache_key}")
            return True
        except Exception as e:
            logger.error(f"Error deleting cache for key {cache_key}: {e}")
            return False
        
    def get_cache_stats(self) -> dict:
        """Get cache statistics"""
        try:
            stats = self.redis_client.info()
            return {
                "connected_clients": stats.get("connected_clients", 0),
                "used_memory_human": stats.get("used_memory_human", "0B"),
                "keyspace_hits": stats.get("keyspace_hits", 0),
                "keyspace_misses": stats.get("keyspace_misses", 0)
            }
        except Exception as e:
            logger.error(f"Error getting cache statistics: {e}")
            return {}
        

redis_cache = RedisCache()