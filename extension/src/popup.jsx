import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'

function Popup() {
    const [result, setResult] = useState(null);
    const [jobText, setJobText] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const [resumeName, setResumeName] = useState('');
    const [hasResume, setHasResume] = useState(false);

    // Load resume presence on mount
    useEffect(() => {
        chrome.storage.local.get(['resume_text', 'resume_name'], ({ resume_text, resume_name }) => {
            if (resume_text) {
                setHasResume(true);
                setResumeName(resume_name || 'Stored resume');
            }
        });
    }, []);

    const readFileAsText = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsText(file);
        })
    };

    // Try to auto-grab JD text from active tab (LinkedIn) via content script
    const getJobDescriptionFromPage = () => {
        return new Promise((resolve) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    { type: "GET_JOB_DESCRIPTION" },
                    (response) => {
                        if (chrome.runtime.lastError) {
                            resolve(null);
                        } else {
                            resolve(response?.jobText || null);
                        }
                    }
                )
            })
        })
    };

    // Upload resume -> get raw text from backend
    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setMessage("Uploading...");
        setResult(null);

        try{
            // Read locally for persistence
            const localText = await readFileAsText(file);
            chrome.storage.local.set({ resume_text: localText, resume_name: file.name });
            setHasResume(true);
            setResumeName(file.name);
            
            // const res = await fetch("http://localhost:8000/upload/resume/", {
            //     method: "POST",
            //     body: formData
            // });

            // const data = await res.json();
            // setResumeText(data.resume_text);
            
            setMessage("Resume uploaded successfully");
        } catch {
            setMessage("Error uploading resume");
        };
    };

    const handleAnalyze = async () => {        
        setLoading(true);
        setResult(null);
        setMessage("Analyzing...");

        // Ensure resume exists
        const { resume_text } = await chrome.storage.local.get(['resume_text']);
        if (!resume_text) {
            setMessage("Please upload a resume first.");
            setLoading(false);
            return;
        }

        // Get or auto-extract JD
        let jd = jobText.trim();
        if (!jd) {
            jd = await getJobDescriptionFromPage();
            if (!jd) {
                setMessage("Unable to auto-extract. Please paste job description.");
                setLoading(false);
                return;
            }
            setJobText(jd);
        }

        // Call auto endpoint
        try {
            const res = await fetch("http://localhost:8000/analyze/auto", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ job_text: jd, resume_text })
            });

            const data = await res.json();
            if (data.error) {
                setMessage("Error: " + data.error);
            } else {
                setResult(buildTags(data));
                setMessage("");
            }
        } catch {
            setMessage("Error analyzing resume");
        } finally {
            setLoading(false);
        }
    };

    // Build UI tag list
    const buildTags = (data) => {
        const mk = (arr, type, status) => 
            arr.map((tag) => ({
                text: tag, type, status
            }));

        const tags = [
            ...mk(data.matched_required, 'required', 'matched'),
            ...mk(data.missing_required, 'required', 'missing'),
            ...mk(data.matched_preferred, 'preferred', 'matched'),
            ...mk(data.missing_preferred, 'preferred', 'missing'),
        ];
        
        return { ...data, tags };
    };

    // Render
    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Resume Radar</h2>

            <input type="file" onChange={handleUpload} style={styles.inputFile} />
            {hasResume && <p style={styles.small}>Using: {resumeName}</p>}

            <textarea
                rows="4"
                placeholder="Paste job description here (optional, we try to auto-grab)..."
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                style={styles.textarea}
            />

            <button onClick={handleAnalyze} style={styles.button} disabled={loading}>
                {loading ? "Analyzing..." : "Analyze"}
            </button>

            {message && <p style={styles.message}>{message}</p>}

            {result && (
                <div style={styles.resultBox}>
                    <PassBanner missingRequired={result.missing_required.length} />
                    <p><strong>Score:</strong> {result.match_score}%</p>
                    
                    <SectionHeader text={`Required (${result.matched_required.length}/${result.required.length})`} />
                    <TagList tags={result.tags.filter((t) => t.type === 'required')} />

                    <SectionHeader text={`Preferred (${result.matched_preferred.length}/${result.preferred.length})`} />
                    <TagList tags={result.tags.filter((t) => t.type === 'preferred')} />
                </div>
            )}
        </div>
    )
}

/** Small components **/
const PassBanner = ({ missingRequired }) => (
  <div
    style={{
      padding: '6px 8px',
      marginBottom: '8px',
      borderRadius: '4px',
      background: missingRequired === 0 ? '#dff0d8' : '#f2dede',
      color: missingRequired === 0 ? '#3c763d' : '#a94442',
      fontWeight: 600,
      textAlign: 'center',
    }}
  >
    {missingRequired === 0 ? 'PASS: All required keywords present' : 'Missing required keywords'}
  </div>
);

const SectionHeader = ({ text }) => (
  <p style={{ margin: '8px 0 4px', fontWeight: 'bold', fontSize: '13px', color: '#333' }}>{text}</p>
);

const TagList = ({ tags }) => (
  <div style={{ marginBottom: '6px' }}>
    {tags.map((tag, i) => (
      <span key={i} style={tagStyle(tag)}>
        {tag.text}
      </span>
    ))}
  </div>
);

const tagStyle = (tag) => {
  const base = {
    padding: '2px 6px',
    borderRadius: '4px',
    margin: '2px',
    display: 'inline-block',
    fontSize: '12px',
  };
  if (tag.type === 'required' && tag.status === 'matched') return { ...base, background: '#dff0d8', color: '#3c763d' };
  if (tag.type === 'required' && tag.status === 'missing') return { ...base, background: '#f2dede', color: '#a94442' };
  if (tag.type === 'preferred' && tag.status === 'matched') return { ...base, background: '#d9edf7', color: '#31708f' };
  return { ...base, background: '#fcf8e3', color: '#8a6d3b' };
};

const styles = {
  container: { padding: '15px', width: '320px', fontFamily: 'Arial, sans-serif', fontSize: '14px' },
  title: { textAlign: 'center', marginBottom: '10px', fontSize: '18px', color: '#333' },
  inputFile: { width: '100%', marginBottom: '6px' },
  small: { fontSize: '12px', color: '#666', marginTop: '-4px', marginBottom: '8px' },
  textarea: { width: '100%', padding: '8px', resize: 'vertical', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '10px' },
  button: { width: '100%', padding: '8px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  message: { marginTop: '10px', color: '#d9534f' },
  resultBox: { marginTop: '10px', padding: '8px', backgroundColor: '#f9f9f9', border: '1px solid #ccc', borderRadius: '4px' },
};

ReactDOM.createRoot(document.getElementById('root')).render(<Popup />);
