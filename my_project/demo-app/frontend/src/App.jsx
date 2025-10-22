import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [message, setMessage] = useState('')

  const handleClick = () => {
    const newCount = count + 1
    setCount(newCount)
    
    if (newCount === 1) setMessage('Great start! 🎉')
    else if (newCount === 5) setMessage('You\'re on fire! 🔥')
    else if (newCount === 10) setMessage('Amazing! 🌟')
    else if (newCount > 10) setMessage('Unstoppable! 🚀')
    else setMessage('')
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <div className="logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="8" fill="url(#gradient)"/>
              <path d="M12 20L18 26L28 14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="40" y2="40">
                  <stop offset="0%" stopColor="#FF6B6B"/>
                  <stop offset="100%" stopColor="#4ECDC4"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1>Databricks Demo App</h1>
          <p className="subtitle">Powered by React + FastAPI</p>
        </header>

        <div className="card">
          <div className="counter-display">
            <div className="count-number">{count}</div>
            <div className="count-label">Clicks</div>
          </div>
          
          <button 
            className="btn-primary" 
            onClick={handleClick}
          >
            Click Me!
          </button>

          {message && (
            <div className="message">
              {message}
            </div>
          )}
        </div>

        <div className="features">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Fast</h3>
            <p>Lightning-fast React performance</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Beautiful</h3>
            <p>Modern gradient design</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">☁️</div>
            <h3>Serverless</h3>
            <p>Deployed on Databricks Apps</p>
          </div>
        </div>

        <footer className="footer">
          <p>✨ Built with React 18 + Vite + FastAPI ✨</p>
          <p className="footer-note">Running on Databricks Apps</p>
        </footer>
      </div>
    </div>
  )
}

export default App

