import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from './AuthContext'
import { API_URL } from './config'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [isSlow, setIsSlow] = useState(false)
    const { login } = useAuth()

    // Pre-warm backend as soon as user opens login screen
    useEffect(() => {
        axios.get(`${API_URL}/api/health`).catch(() => {})
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setIsSlow(false)

        const timer = setTimeout(() => {
            setIsSlow(true)
        }, 3000)

        try {
            const response = await axios.post(`${API_URL}/api/auth/login`, {
                email,
                password
            })

            login(response.data.access_token, response.data.email)
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. Please try again.')
        } finally {
            clearTimeout(timer)
            setLoading(false)
            setIsSlow(false)
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="logo-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                    </div>
                    <h1>Script Engine</h1>
                    <p>Sign in to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
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

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@scriptengine.com"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner"></span>{' '}
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>

                    {loading && isSlow && (
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.85rem', textAlign: 'center' }}>
                            ⏳ Waking up cloud server (Render free tier takes ~30s on first request)...
                        </p>
                    )}
                </form>
            </div>
        </div>
    )
}

export default Login
