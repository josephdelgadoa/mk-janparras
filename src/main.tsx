import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import { setApiKey } from './services/geminiService';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (apiKey) {
    setApiKey(apiKey);
} else {
    console.error("Gemini API Key missing in environment variables");
}

ReactDOM.createRoot(document.getElementById('app')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
