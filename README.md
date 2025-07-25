# ResumeRadar

A Chrome extension that analyzes your resume against job descriptions using AI so you can ensure you're not missing out on keywords ATS might be looking for :)

`ChatGPT wrapper :(`

## Features

- **AI-Powered Analysis**: Uses OpenAI GPT models to extract relevant technical keywords from job descriptions
- **Smart Matching**: Matches resume content against required and preferred keywords
- **LinkedIn Integration**: Automatically extracts job descriptions from LinkedIn job postings
- **File Support**: Upload PDF and DOCX resume files
- **Real-time Scoring**: Provides match percentage and detailed keyword breakdown
- **Chrome Extension**: Easy-to-use browser extension interface

## How it works

1. **Upload your resume** (PDF or DOCX)
2. **Navigate to a LinkedIn job** (or paste description manually)
3. **Click analyze** to get your match score
4. **Review results** and optimize your resume accordingly

## Architecture

```
ResumeRadar/
├── backend/                 # FastAPI backend server
│   ├── extractor/          # Keyword extraction modules
│   ├── routers/            # API endpoints
│   └── main.py             # Server entry point
├── extension/              # Chrome extension
│   ├── src/                # React frontend
│   ├── content.js          # Content script for LinkedIn
│   └── manifest.json       # Extension manifest
└── README.md
```

## Quick Start (if you plan on forking or just checking out the codebase)

### Prerequisites

- Python 3.8+
- Node.js 16+
- OpenAI API key

### Backend Setup

1. **Install dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure environment**:
Environment variables in `.env`:

    ```bash
    # OpenAI Configuration
    # These variables are designed so that you can change them accordingly. Feel free to mess around :)
    USE_OPENAI=false
    OPENAI_API_KEY=your_api_key_here 
    OPENAI_MODEL=gpt-4o-mini
    OPENAI_TEMPERATURE=0.0
    OPENAI_TIMEOUT=10
    ```

3. **Run the server**:
   ```bash
   # Make sure you are in the root directory, then:
   source backend/venv/bin/activate
   python -m backend.main
   ```
   
   The API will be available at `http://localhost:8000`
   You can check out the swagger docs provided by FastAPI at `http://localhost:8000/docs`

### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd extension/extension
   npm install
   ```

2. **Build the extension**:
   ```bash
   npm run build
   ```

3. **Load in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `extension/extension/dist` folder

## API Endpoints

### POST `/analyze/auto`
Analyze resume against job description.

**Request**:
```json
{
  "job_text": "Job description text...",
  "resume_text": "Resume text..."
}
```

**Response**:
```json
{
  "match_score": 85.5,
  "required": ["Python", "SQL", "React"],
  "preferred": ["Docker", "AWS", "TypeScript"],
  "matched_required": ["Python", "React"],
  "missing_required": ["SQL"],
  "matched_preferred": ["Docker"],
  "missing_preferred": ["AWS", "TypeScript"],
  "auto_extracted": true
}
```

### POST `/upload/resume`
Upload and extract text from resume file.

**Request**: Multipart form with PDF/DOCX file

**Response**:
```json
{
  "text": "Extracted resume text...",
  "filename": "resume.pdf",
  "size": 12345,
  "extracted_length": 1500
}
```

## Troubleshooting

### Common Issues

1. **Extension not loading**: Make sure you're loading from the `dist` folder after building
2. **API connection errors**: Verify the backend server is running on port 8000
3. **File upload issues**: The current version only supports PDF/DOCX
4. **OpenAI errors**: Verify your API key is valid and has sufficient credits

If you face any issues, please post them on the issues tab of this GitHub repository.

## Future Goals

- Support for more job sites (Indeed, Glassdoor)
- More robust keyword importance weighting
- Export analysis reports
- Integration with job application tracking
