import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'

function Popup() {
    const [result, setResult] = useState(null);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);

        await fetch("http://localhost:8000/upload_resume/", {
            method: "POST",
            body: formData
        });

        alert("Resume uploaded successfully");
    }

    const handleAnalyze = async (e) => {
        const jobText = prompt("Paste job description here:");

        const res = await fetch("http://localhost:8000/analyze/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ job_text: jobText })
        });

        const data = await res.json();
        setResult(data);
    }

    return (
        <div style={{ padding: "10px", width: "300px" }}>
            <h3>Resume Radar</h3>

            <input type="file" onChange={handleUpload} />
            <br />
            <button onClick={handleAnalyze}>Analyze</button>

            {result && (
                <div>
                    <p>Match Score: {result.match_score}</p>
                    <p>Matching Words: {result.matching_words.join(", ")}</p>
                </div>
            )}
        </div>
    )
}

ReactDOM.createRoot(document.getElementById("root")).render(<Popup />);