import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'

function Popup() {
    const [result, setResult] = useState(null);
    const [jobText, setJobText] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const [resumeText, setResumeText] = useState("");
    const [requiredStr, setRequiredStr] = useState("");  
    const [preferredStr, setPreferredStr] = useState(""); 

    // Upload resume -> get raw text from backend
    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setMessage("Uploading...");
        setResult(null);

        try{
            const res = await fetch("http://localhost:8000/upload/resume/", {
                method: "POST",
                body: formData
            });

            const data = await res.json();
            setResumeText(data.resume_text);
            setMessage("Resume uploaded successfully");
        } catch {
            setMessage("Error uploading resume");
        };
    };

    // Turn comma/newline separated list into KeywordSpec[]
    const toSpecs = (str) => {
        return str
            .split(/[,;\n]+/)
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean)
            .map((term) => ({
                term,
                kind: term.includes(" ") ? "phrase" : "word"
            }))
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

    const handleAnalyze = async () => {        
        setLoading(true);
        setResult(null);
        setMessage("Analyzing...");

        let jobTextToUse = jobText;

        if (!jobTextToUse.trim()) {
            jobTextToUse = await getJobDescriptionFromPage();

            if (!jobTextToUse) {
                setMessage("Unable to auto-extract. Please paste job description.");
                setLoading(false);
                return;
            }
            setJobText(jobTextToUse);
        }

        // Build strict keyword payload
        const payload = {
            resume_text: resumeText,
            jd: {
                required: toSpecs(requiredStr),
                preferred: toSpecs(preferredStr)
            }
        };

        try {
            const res = await fetch("http://localhost:8000/analyze/keywords", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.error) {
                setMessage("Error: " + data.error);
            } else {
                setResult(data);
                setMessage("");
            }
        } catch {
            setMessage("Error analyzing resume");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Resume Radar</h2>

            <input type="file" onChange={handleUpload} style={styles.inputFile} />

            <textarea
                rows="4"
                placeholder="Paste job description here (optional, we try to auto-grab)..."
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                style={styles.textarea}
            />

            <textarea 
                rows="3"
                placeholder="Required keywords (comma or newline separated)"
                value={requiredStr}
                onChange={(e) => setRequiredStr(e.target.value)}
                style={styles.textarea}
            />

            <textarea 
                rows="3"
                placeholder="Optional keywords"
                value={preferredStr}
                onChange={(e) => setPreferredStr(e.target.value)}
                style={styles.textarea}
            />

            <button onClick={handleAnalyze} style={styles.button} disabled={loading}>
                {loading ? "Analyzing..." : "Analyze"}
            </button>

            {message && <p style={styles.message}>{message}</p>}

            {result && (
                <div style={styles.resultBox}>
                    <p><strong>Pass (all required present): </strong>{result.pass ? "YES" : "NO"}</p>
                    <p><strong>Required:</strong> {result.required_found}/{result.required_total}</p>

                    {result.required_missing.length > 0 && (
                        <>
                            <p><strong>Required missing:</strong></p>
                            <ul style={styles.keywordList}>
                                {result.required_missing.map((w, i) => <li key={i}>{w}</li>)}
                            </ul>
                        </>
                    )}

                    <p style={{marginTop: "6px"}}><strong>Preferred:</strong> {result.preferred_found}/{result.preferred_total}</p>

                    {result.preferred_missing.length > 0 && (
                        <>
                            <p><strong>Preferred missing:</strong></p>
                            <ul style={styles.keywordList}>
                                {result.preferred_missing.map((w, i) => <li key={i}>{w}</li>)}
                            </ul>
                        </>
                    )}

                </div>
            )}
        </div>
    )
}

const styles = {
  container: {
    padding: "15px",
    width: "300px",
    fontFamily: "Arial, sans-serif",
    fontSize: "14px",
  },
  title: {
    textAlign: "center",
    marginBottom: "10px",
    fontSize: "18px",
    color: "#333",
  },
  inputFile: {
    width: "100%",
    marginBottom: "10px",
  },
  textarea: {
    width: "100%",
    padding: "8px",
    resize: "vertical",
    borderRadius: "4px",
    border: "1px solid #ccc",
    marginBottom: "10px",
  },
  button: {
    width: "100%",
    padding: "8px",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  message: {
    marginTop: "10px",
    color: "#d9534f",
  },
  resultBox: {
    marginTop: "10px",
    padding: "8px",
    backgroundColor: "#f9f9f9",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
  keywordList: {
    paddingLeft: "18px",
  },
};

ReactDOM.createRoot(document.getElementById("root")).render(<Popup />);