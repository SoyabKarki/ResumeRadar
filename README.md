# Resume Radar

A Chrome extension that analyzes your resume against job descriptions using AI so you can ensure you're not missing out on keywords ATS might be looking for :)

`ChatGPT wrapper :(`

## Features

- **AI-Powered Analysis**: Uses OpenAI GPT models to extract relevant technical keywords from job descriptions
- **Smart Matching**: Matches resume content against required and preferred keywords
- **LinkedIn Integration**: Automatically extracts job descriptions from LinkedIn job postings
- **File Support**: Upload PDF and DOCX resume files
- **Real-time Scoring**: Provides match percentage and detailed keyword breakdown
- **Chrome Extension**: Easy-to-use browser extension interface
- **Caching**: Caches data to reduce API calls and improve performance
- **Data privacy**: User data is stored locally and is never fully visible on our end

## How it works

1. **Upload your resume** (PDF or DOCX)
2. **Navigate to a LinkedIn job** (or paste description manually)
3. **Click analyze** to get your match score
4. **Review results** and optimize your resume accordingly

## Architecture

The project is organized into two main components: a FastAPI backend for AI-powered analysis and a Chrome extension frontend. Here's the complete file structure:

```
ResumeRadar/
├── backend/                          # FastAPI backend server
│   ├── config/                       # Configuration modules
│   │   ├── logging_config.py         # Logging setup and configuration
│   │   └── redis_config.py           # Redis caching configuration
│   ├── extractor/                    # AI keyword extraction system
│   │   ├── base.py                   # Abstract base class for extractors
│   │   ├── factory.py                # Factory pattern for extractor selection
│   │   ├── openai.py                 # OpenAI GPT integration
│   │   └── textprep.py               # Text preprocessing and normalization
│   ├── routers/                      # API route definitions
│   │   ├── analyze.py                # Resume analysis endpoint (/analyze/auto)
│   │   └── upload.py                 # File upload endpoint (/upload/resume)
│   ├── main.py                       # FastAPI application entry point
│   ├── matcher.py                    # Core keyword matching logic
│   ├── models.py                     # Pydantic data models
│   ├── requirements.txt              # Python dependencies
│
├── extension/                        # Chrome extension frontend
│   ├── src/                          # React source code
│   │   ├── popup.jsx                 # Main popup interface
│   │   ├── utils/                    # Utility functions
│   │   │   └── fileUtils.js          # File/job description extraction logic
│   ├── components/                   # Reusable UI components
│   │   ├── index.js                  # Component exports
│   │   ├── PassBanner.jsx            # Pass/Fail status display
│   │   ├── SectionHeader.jsx         # Section header component
│   │   └── TagList.jsx               # Keyword tag display
│   ├── styles/                       # Styling and theming
│   │   └── styles.js                 # CSS-in-JS styles
│   ├── public/                       # Static assets
│   │   └── icons/                    # Extension icons (16/32/48/128px)
│   ├── content.js                    # LinkedIn job description extractor
│   ├── background.js                 # Extension background worker
│   ├── popup.html                    # Popup HTML wrapper
│   ├── manifest.json                 # Chrome extension manifest
│   ├── vite.config.js                # Vite build configuration
│   ├── package.json                  # NPM scripts and dependencies
│   └── eslint.config.js              # ESLint rules
│
├── docker-compose.yml               # Docker orchestration file
├── Dockerfile                       # Backend Docker container setup
├── README.md                        # Project documentation
├── .gitignore                       # Git ignored files
└── .env                             # Environment variables (local-only)
```

## Key Technologies
- **Backend**: FastAPI, OpenAI API, Redis
- **Frontend**: React, Vite, Chrome Extension API
- **Tools**: Docker, Git

## Quick Start with Docker (if you plan on forking or just checking out the codebase)

### Prerequisites

- Docker and Docker Compose
- OpenAI API key

### Docker Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/SoyabKarki/ResumeRadar.git
   cd ResumeRadar
   ```

2. **Create environment file**:
   Create a `.env` file in the root directory:
   ```bash
   # OpenAI Configuration
   OPENAI_API_KEY=your_api_key_here
   USE_OPENAI=true
   OPENAI_MODEL=gpt-4o-mini
   OPENAI_TEMPERATURE=0.0
   OPENAI_TIMEOUT=20
   
   # Redis Configuration (Docker will handle this automatically)
   REDIS_URL=redis://redis:6379
   ```

3. **Build and run with Docker Compose**:
   ```bash
   docker-compose up --build
   ```
   
   This will:
   - Build the backend container with all dependencies
   - Start Redis for caching
   - Run the FastAPI backend on `http://localhost:8000`
   - Set up proper networking between services

4. **Build the extension** (in a separate terminal):
   ```bash
   cd extension
   npm install
   npm run build
   ```

5. **Load the extension in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `extension/dist` folder

### Extras (Docker Commands) 

**Start the application:**
```bash
docker-compose up
```

**Start in background:**
```bash
docker-compose up -d
```

**Stop the application:**
```bash
docker-compose down
```

**View logs:**
```bash
docker-compose logs -f backend
```

**Rebuild after changes:**
```bash
docker-compose up --build
```

### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd extension
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

## How to Use

### Step 1: Setup
1. Follow the installation instructions above
2. Ensure both backend and frontend are running
3. Load the extension in Chrome

### Step 2: Upload Resume
1. Click the ResumeRadar extension icon
2. Upload your resume (PDF or DOCX)
3. Your resume will be stored locally for analysis

### Step 3: Analyze Job
1. Navigate to a LinkedIn job posting
2. Click "Analyze" in the extension popup
3. Wait for AI-powered keyword extraction and matching

### Step 4: Review Results
- **Match Score**: Overall percentage match
- **Required Keywords**: Must-have skills (green = present, red = missing)
- **Preferred Keywords**: Nice-to-have skills (blue = present, yellow = missing)
- **Pass/Fail**: Whether you have all required keywords

## API Documentation

Once the backend is running, you can view the interactive API documentation at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

Key endpoints:
- `POST /analyze/auto` - Analyze resume against job description
- `POST /upload/resume` - Upload and extract resume text

## Future Goals

- Support for more job sites (Indeed, Glassdoor)
- Better UI/UX
- More robust keyword importance weighting
- Integration with job application tracking


`If you face any issues, please post them on the issues tab of this GitHub repository.`