import re

def clean_job_text(raw_text: str) -> str:
    # Normalize line endings and collapse multiple newlines
    text = raw_text.replace('\r\n', '\n').replace('\r', '\n')
    text = re.sub(r'\n{2,}', '\n\n', text)  # Collapse 3+ newlines to 2

    # Remove common boilerplate headings
    patterns_to_remove = [
        r'^About (the )?job[:\s]*', 
        r'^Job Description[:\s]*',
        r'^About The (Role|Team)[:\s]*',
        r'^Details/Notes[:\s]*',
        r'^Equal Opportunity Statement[:\s]*',
    ]
    for pattern in patterns_to_remove:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE | re.MULTILINE)

    # Remove leading/trailing whitespace
    text = text.strip()

    # Remove common field labels that add noise
    text = re.sub(r'^(Company|Location|Duration|Hours|Compensation|Completion|Hiring Process|Requirements|Must-Haves|Nice-to-Haves)[:\s]*', '', text, flags=re.MULTILINE)

    return text
