# ResumeRadar 🎯

A Chrome extension that analyzes resumes against job descriptions using AI-powered keyword extraction and matching.

## Features

- **AI-Powered Analysis**: Uses OpenAI GPT models to extract relevant technical keywords from job descriptions
- **Smart Matching**: Matches resume content against required and preferred keywords
- **LinkedIn Integration**: Automatically extracts job descriptions from LinkedIn job postings
- **File Support**: Upload PDF and DOCX resume files
- **Real-time Scoring**: Provides match percentage and detailed keyword breakdown
- **Chrome Extension**: Easy-to-use browser extension interface

## Architecture

```
ResumeRadar/
├── backend/                 # FastAPI backend server
│   ├── extractor/          # Keyword extraction modules
│   ├── routers/            # API endpoints
│   ├── tests/              # Unit tests
│   └── main.py             # Server entry point
├── extension/              # Chrome extension
│   ├── src/                # React frontend
│   ├── content.js          # Content script for LinkedIn
│   └── manifest.json       # Extension manifest
└── README.md
```

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- OpenAI API key (optional, for enhanced keyword extraction)

### Backend Setup

1. **Install dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your OpenAI API key if desired
   ```

3. **Run the server**:
   ```bash
   python main.py
   ```
   
   The API will be available at `http://localhost:8000`

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

## Usage

1. **Upload Resume**: Click the extension icon and upload your resume (PDF or DOCX)
2. **Get Job Description**: 
   - Navigate to a LinkedIn job posting (auto-extraction)
   - Or paste the job description manually
3. **Analyze**: Click "Analyze Resume" to get your match score and keyword breakdown

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

### GET `/analyze/health`
Health check endpoint.

## Configuration

Environment variables in `.env`:

```bash
# OpenAI Configuration
USE_OPENAI=false
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4o-mini
OPENAI_TEMPERATURE=0.0
OPENAI_TIMEOUT=10

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=false

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_EXTENSIONS=["pdf", "docx"]
TEMP_DIR=tmp

# CORS
CORS_ORIGINS=["*"]
```

## Development

### Running Tests

```bash
cd backend
pytest tests/
```

### Code Quality

```bash
# Backend
cd backend
black .
flake8 .

# Frontend
cd extension/extension
npm run lint
```

### Building for Production

```bash
# Frontend
cd extension/extension
npm run build

# Backend
cd backend
# Use a production WSGI server like gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Troubleshooting

### Common Issues

1. **Extension not loading**: Make sure you're loading from the `dist` folder after building
2. **API connection errors**: Verify the backend server is running on port 8000
3. **File upload issues**: Check file size (max 10MB) and format (PDF/DOCX only)
4. **OpenAI errors**: Verify your API key is valid and has sufficient credits

### Debug Mode

Enable debug logging by setting `DEBUG=true` in your `.env` file.

## Roadmap

- [ ] Support for more job sites (Indeed, Glassdoor)
- [ ] Resume optimization suggestions
- [ ] Keyword importance weighting
- [ ] Batch analysis for multiple jobs
- [ ] Export analysis reports
- [ ] Integration with job application tracking