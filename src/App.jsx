import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from './AuthContext'
import Login from './Login'
import PreviewSection from './PreviewSection'
import ModeSelector from './ModeSelector'
import TemplateSelector from './TemplateSelector'
import SearchPanel from './SearchPanel'
import './login.css'
import './user-menu.css'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  const { user, logout, loading: authLoading } = useAuth()
  const [mode, setMode] = useState('create')  // 'search' or 'create'
  const [selectedTemplate, setSelectedTemplate] = useState('csv_etl')
  const [userInput, setUserInput] = useState('')
  const [fileType] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('script')
  const [theme, setTheme] = useState('dark')
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark'
    setTheme(savedTheme)
    document.documentElement.dataset.theme = savedTheme
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.dataset.theme = newTheme
  }

  // Show login page if not authenticated
  if (authLoading) {
    return <div className="loading-container"><div className="spinner"></div></div>
  }

  if (!user) {
    return <Login />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    setActiveTab('script')

    try {
      const response = await axios.post(`${API_URL}/api/scripts/generate`, {
        user_input: userInput,
        template_id: selectedTemplate,
        file_type: fileType || null,
        schema_info: null
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      setResult(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const handleExport = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/scripts/export`, {
        script_content: result.script_content,
        user_input: userInput,
        file_type: fileType,
        config_content: result.config_content || null
      }, {
        responseType: 'blob'
      })

      // Create download link
      const url = globalThis.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url

      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers['content-disposition']
      let filename = 'script_engine.py'
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="([^"]+)"/)
        if (filenameMatch?.[1]) {
          filename = filenameMatch[1]
        }
      }

      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      globalThis.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed:', err)
      setError('Failed to export script. Please try again.')
    }
  }

  const getActiveContent = () => {
    if (!result) return ''

    switch (activeTab) {
      case 'script':
        return result.script_content
      case 'config':
        return result.config_content || 'No config file available for this script type.'
      case 'usage':
        return result.usage_instructions || 'No usage instructions available.'
      default:
        return ''
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div>
              <h1>Script Engine</h1>
              <p className="tagline">AI-Powered Script Generator</p>
            </div>
          </div>

          <div className="header-actions">
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            <div className="profile-menu">
              <button
                className="profile-button"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-label="Profile menu"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>

              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="profile-header">
                    <div className="profile-avatar">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <div className="profile-info">
                      <div className="profile-email">{user.email}</div>
                      <div className="profile-role">Admin</div>
                    </div>
                  </div>
                  <div className="profile-divider"></div>
                  <button onClick={logout} className="profile-logout">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <ModeSelector mode={mode} onModeChange={setMode} />

        {mode === 'search' && (
          <div className="card">
            <h2 className="card-title">🔍 Search Approved Scripts</h2>
            <p className="card-description">Find and reuse existing scripts from the approved library</p>
            <SearchPanel onScriptSelect={async (script) => {
              // Fetch full script content from backend
              setLoading(true)
              try {
                const response = await axios.post(`${API_URL}/api/scripts/get_script`, {
                  repo_path: script.repo_path,
                  script_type: script.script_type
                })
                setResult({
                  script_type: response.data.script_type,
                  script_content: response.data.script_content,
                  reused: true,
                  similarity: script.similarity,
                  repo_path: response.data.repo_path,
                  config_content: response.data.config_content,
                  usage_instructions: response.data.usage_instructions
                })
                setMode('create')  // Switch to create mode to show result
              } catch (err) {
                setError('Failed to load script content. Please try again.')
                console.error('Failed to fetch script:', err)
              } finally {
                setLoading(false)
              }
            }} />
          </div>
        )}

        {mode === 'create' && (
          <>
            <div className="card">
              <h2 className="card-title">✨ Create New Script</h2>
              <TemplateSelector
                selectedTemplate={selectedTemplate}
                onSelect={setSelectedTemplate}
              />

              <div className="step-divider">
                <h3 className="step-title">Step 2: Describe Your Transformation</h3>
              </div>

              <form onSubmit={handleSubmit} className="form">
                <div className="form-group">
                  <label htmlFor="userInput">What do you want to do?</label>
                  <textarea
                    id="userInput"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="e.g., add a new column with today's date, filter rows where status is active..."
                    required
                    rows="4"
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner"></span>{' '}
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                      </svg>
                      Generate Script
                    </>
                  )}
                </button>
              </form>
            </div>

            {error && (
              <div className="alert alert-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {loading && (
              <div className="loading-container">
                <div className="ai-loader">
                  <div className="ai-brain">
                    <div className="neuron"></div>
                    <div className="neuron"></div>
                    <div className="neuron"></div>
                    <div className="neuron"></div>
                  </div>
                  <p className="loading-text">AI is generating your script...</p>
                  <div className="loading-bar">
                    <div className="loading-progress"></div>
                  </div>
                </div>
              </div>
            )}

            {result && !loading && (
              <>
                <div className="card">
                  <div className="card-header">
                    <div>
                      <h2 className="card-title">Generated Script</h2>
                      <span className={`badge ${result.reused ? 'badge-success' : 'badge-primary'}`}>
                        {result.reused ? `✓ Reused (${(result.similarity * 100).toFixed(1)}% match)` : '✨ Newly Generated'}
                      </span>
                    </div>
                    <div className="header-button-group">
                      <button
                        onClick={() => copyToClipboard(getActiveContent())}
                        className="btn btn-secondary btn-sm"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        Copy {({ script: 'Code', config: 'Config', usage: 'Instructions' })[activeTab]}
                      </button>
                      <button
                        onClick={handleExport}
                        className="btn btn-primary btn-sm"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Download {result.config_content ? '.zip' : '.py'}
                      </button>
                    </div>
                  </div>

                  {result.repo_path && (
                    <p className="file-path">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                        <polyline points="13 2 13 9 20 9" />
                      </svg>
                      {result.repo_path}
                    </p>
                  )}

                  <div className="tabs">
                    <button
                      className={`tab ${activeTab === 'script' ? 'tab-active' : ''}`}
                      onClick={() => setActiveTab('script')}
                    >
                      📄 Script
                    </button>
                    {result.config_content && (
                      <button
                        className={`tab ${activeTab === 'config' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('config')}
                      >
                        ⚙️ Config
                      </button>
                    )}
                    {result.usage_instructions && (
                      <button
                        className={`tab ${activeTab === 'usage' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('usage')}
                      >
                        📖 Usage
                      </button>
                    )}
                  </div>

                  <div className="code-block">
                    <pre style={{ whiteSpace: activeTab === 'usage' ? 'pre-wrap' : 'pre' }}>
                      {getActiveContent()}
                    </pre>
                  </div>
                </div>

                <PreviewSection result={result} />
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default App
