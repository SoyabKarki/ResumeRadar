from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routers import upload, analyze 
from backend.config.logging_config import setup_logging

setup_logging()

app = FastAPI(title="ATS Keyword Checker MVP")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(upload.router)
app.include_router(analyze.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)