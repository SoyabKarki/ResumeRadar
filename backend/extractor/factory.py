# extractor/factory.py
from dotenv import load_dotenv
import os

from .openai  import OpenAIKeywordExtractor

load_dotenv()

USE_OPENAI        = os.getenv("USE_OPENAI", "false").lower() == "true"

def get_extractor():
    # return OpenAIKeywordExtractor() if USE_OPENAI else LocalKeywordExtractor()

    # Always use OpenAI
    return OpenAIKeywordExtractor()