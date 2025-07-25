import json
import logging
import openai
from typing import Set, Tuple
from dotenv import load_dotenv
import os
import re

from .base import KeywordExtractor

load_dotenv()
logger = logging.getLogger(__name__)

USE_OPENAI        = os.getenv("USE_OPENAI", "false").lower() == "true"
OPENAI_API_KEY    = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL      = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_TEMPERATURE= float(os.getenv("OPENAI_TEMPERATURE", 0.0))
OPENAI_TIMEOUT    = int(os.getenv("OPENAI_TIMEOUT", 10))


class OpenAIKeywordExtractor(KeywordExtractor):
    def __init__(self):
        openai.api_key = OPENAI_API_KEY
        self.model      = OPENAI_MODEL
        self.temperature= OPENAI_TEMPERATURE
        self.timeout    = OPENAI_TIMEOUT

    def extract(self, text: str) -> Tuple[Set[str], Set[str]]:
        # If no key, immediately fallback
        if not OPENAI_API_KEY:
            logger.warning("OpenAI API key not found. Fallback to local extractor.")
            return set(), set()
        
        prompt = f"""
        You are an expert technical recruiter and resume analyzer.

        Given the following job description, extract only the most relevant, concrete technical skills, tools, programming languages, frameworks, platforms, and certifications mentioned. 
        **Do NOT include** soft skills, company names, team names, job titles, or generic business terms (such as "teamwork", "project", "process improvement", "communication", "leadership", "retail", "business", "stakeholder", "collaboration", "innovation", "compliance", "continuous improvement", etc).

        **Classify each keyword as either:**
        - "required" (high priority, must-have, essential, or mandatory)
        - "preferred" (low priority, nice-to-have, bonus, or optional)

        **Return the result as a JSON object with two arrays:**
        - "required": [list of required keywords]
        - "preferred": [list of preferred keywords]

        **Guidelines:**
        - Only include concrete, technical, or tool-based keywords (e.g., "Python", "Databricks", "CI/CD", "Node.js", "GCP", "SQL", "Vertex AI", "microservices", "API", "NoSQL", "Go", "Azure", "data modeling", "serverless", "DevOps", "design patterns", "Rapid Prototyping").
        - Do not include duplicates or synonyms in the same list.
        - Each keyword should be a single word or short phrase (no full sentences).
        - Limit each list to a maximum of 20 items, prioritizing the most important or frequently mentioned.
        - If a keyword could fit both categories, place it in "required" unless the job description clearly marks it as "preferred" or "nice to have".

        **Example output:**
        {{
            "required": ["Python", "Databricks", "SQL", "Node.js", "GCP", "Serverless", "CI/CD", "Java"],
            "preferred": ["Go", "Azure", "NoSQL", "Vertex AI", "API", "data modeling", "microservices", "DevOps"]
        }}

        Job Description:
        \"\"\"{text}\"\"\"

        Return only the JSON object, without any markdown or code block formatting.
        """        

        try:
            res = openai.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=self.temperature,
                timeout=self.timeout
            )
            content = res.choices[0].message.content
            if not content:
                logger.error("OpenAI API returned empty content.")
                return set(), set()

            try:       
                # Remove markdown code block if present
                if content.strip().startswith("```"):
                    content = re.sub(r"^```[a-zA-Z]*\n?", "", content.strip())
                    content = re.sub(r"\n?```$", "", content.strip())

                data = json.loads(content)
            except json.JSONDecodeError as e:
                logger.error(f"OpenAI API returned invalid JSON: {content}")
                return set(), set()

            req_list = data.get("required", [])[:30]
            pref_list = data.get("preferred", [])[:30]
            return set(req_list), set(pref_list)
        
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            return set(), set()