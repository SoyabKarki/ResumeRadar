import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'

function Popup() {
    const [result, setResult] = useState([])
    
    return (
        <div>
            <h1>Popup</h1>
        </div>
    )
}

ReactDOM.createRoot(document.getElementById("root")).render(<Popup />);