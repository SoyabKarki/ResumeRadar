from fastapi import APIRouter, File, UploadFile, HTTPException
import fitz
import uuid
from docx import Document
from pathlib import Path
import shutil


router = APIRouter(
    prefix="/upload",
    tags=["upload"]
)

TMP_DIR = Path("tmp")
TMP_DIR.mkdir(exist_ok=True)

def extract_pdf_text(path: Path) -> str:
    text = []
    with fitz.open(path) as doc:
        for page in doc:
            text.append(page.get_text())
    return "\n".join(text)

def extract_docx_text(path: Path) -> str:
    doc = Document(path)
    return "\n".join([p.text for p in doc.paragraphs])

@router.post("/resume")
async def upload_resume(file: UploadFile = File(...)):
    ext = file.filename.rsplit(".", 1)[-1].lower()
    uid = str(uuid.uuid4())
    dest = TMP_DIR / f"{uid}.{ext}"

    with dest.open("wb") as f:
        shutil.copyfileobj(file.file, f)
    
    if ext == "pdf":
        resume_text = extract_pdf_text(dest)
    elif ext == "docx":
        resume_text = extract_docx_text(dest)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    return {"text": resume_text}