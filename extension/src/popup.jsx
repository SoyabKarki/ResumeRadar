import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { PassBanner, SectionHeader, TagList } from '../components';
import { styles } from '../styles/styles';
import { readFileAsText, getJobDescriptionFromPage, buildTags } from './utils/fileUtils';

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
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Popup />);
