import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'

function Popup() {
    const [result, setResult] = useState(null);
    const [jobText, setJobText] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setMessage("Uploading...");
        setResult(null);

        try{
            const res = await fetch("http://localhost:8000/upload_resume/", {
                method: "POST",
                body: formData
            });

            const data = await res.json();
            setMessage(data.message || "Resume uploaded successfully");
        } catch {
            setMessage("Error uploading resume");
        };
    }

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
    }

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

        try {
            const res = await fetch("http://localhost:8000/analyze/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ job_text: jobTextToUse })
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
    }


    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Resume Radar</h2>

            <input type="file" onChange={handleUpload} style={styles.inputFile} />

            <textarea
                rows="5"
                placeholder="Paste job description here..."
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
                    <p><strong>Match Score: </strong> {result.match_score}%</p>
                    <p><strong>Matching Words: </strong></p>
                    <ul style={styles.keywordList}>
                        {result.matching_words.map((word, index) => (
                            <li key={index}>{word}</li>
                        ))}
                    </ul>
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