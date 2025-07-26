from fastapi import APIRouter, File, UploadFile, HTTPException
import fitz
import uuid
from docx import Document
from pathlib import Path
import shutil
import logging

logger = logging.getLogger(__name__)

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
    logger.info(f"Upload request received for file: {file.filename}")

    ext = file.filename.rsplit(".", 1)[-1].lower()

    uid = str(uuid.uuid4())
    dest = TMP_DIR / f"{uid}.{ext}"

    with dest.open("wb") as f:
        shutil.copyfileobj(file.file, f)
    
    if ext == "pdf":
        logger.info("Extracting text from PDF...")
        resume_text = extract_pdf_text(dest)
    elif ext == "docx":
        logger.info("Extracting text from DOCX...")
        resume_text = extract_docx_text(dest)
    else:
        logger.error(f"Unsupported file type: {ext}")
        raise HTTPException(status_code=400, detail="Unsupported file type")

    if not resume_text.strip():
        logger.warning("Extracted text is empty or only whitespace!")
        raise HTTPException(status_code=400, detail="No text could be extracted from file")

    # Clean up temp file
    dest.unlink()
    logger.info("Temp file cleaned up")

    logger.info("Text extraction complete")
    logger.info(f"Resume text length: {len(resume_text)} characters")

    return {"text": resume_text}