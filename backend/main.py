from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os

from cleanup import clean_job_text

UPLOAD_PATH = "resume.txt"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
 
class JobDescription(BaseModel):
    job_text: str

@app.post("/upload_resume/")
async def upload_resume(file: UploadFile = File(...)):
    contents = await file.read()
    with open(UPLOAD_PATH, "wb") as f:
        f.write(contents)
    return {"message": "Resume uploaded successfully"}

@app.post("/analyze/")
async def analyze_job(payload: JobDescription):
    if not os.path.exists(UPLOAD_PATH):
        return {"error": "Resume not uploaded"}
    
    with open(UPLOAD_PATH, "r") as f:
        resume_text = f.read()

    raw_text = payload.job_text
    job_text = clean_job_text(raw_text)
    
    job_words = set(job_text.lower().split())
    resume_words = set(resume_text.lower().split())
    
    matching_words = job_words.intersection(resume_words)
    score = round(len(matching_words) / len(job_words) * 100, 2) if job_words else 0

    return {"match_score": score, "matching_words": list(matching_words)}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)