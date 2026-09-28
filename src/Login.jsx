import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from './AuthContext'
import { API_URL } from './config'

function Login() {
    const [isSignUp, setIsSignUp] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [isSlow, setIsSlow] = useState(false)
    const { login } = useAuth()

    // Pre-warm backend as soon as user opens login screen
    useEffect(() => {
        axios.get(`${API_URL}/api/health`).catch(() => {})
    }, [])

    const toggleMode = () => {
        setIsSignUp(!isSignUp)
        setError(null)
        setPassword('')
        setConfirmPassword('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)

        if (isSignUp) {
            if (password.length < 6) {
                setError('Password must be at least 6 characters long.')
                return
            }
            if (password !== confirmPassword) {
                setError('Passwords do not match.')
                return
            }
        }

        setLoading(true)
        setIsSlow(false)

        const timer = setTimeout(() => {
            setIsSlow(true)
        }, 3000)

        const endpoint = isSignUp ? `${API_URL}/api/auth/register` : `${API_URL}/api/auth/login`

        try {
            const response = await axios.post(endpoint, {
                email,
                password
            })

            login(response.data.access_token, response.data.email)
        } catch (err) {
            setError(err.response?.data?.detail || (isSignUp ? 'Registration failed. Please try again.' : 'Login failed. Please try again.'))
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
                    <h1>{isSignUp ? 'Create Account' : 'Script Engine'}</h1>
                    <p>{isSignUp ? 'Sign up to start generating scripts' : 'Sign in to continue'}</p>
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
                            placeholder="you@example.com"
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
                            placeholder={isSignUp ? 'Create a password (min 6 chars)' : 'Enter your password'}
                            required
                        />
                    </div>

                    {isSignUp && (
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter your password"
                                required
                            />
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner"></span>{' '}
                                {isSignUp ? 'Creating account...' : 'Signing in...'}
                            </>
                        ) : (
                            isSignUp ? 'Create Account' : 'Sign In'
                        )}
                    </button>

                    {loading && isSlow && (
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.85rem', textAlign: 'center' }}>
                            ⏳ Waking up cloud server (Render free tier takes ~30s on first request)...
                        </p>
                    )}
                </form>

                <div className="login-toggle">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button type="button" onClick={toggleMode}>
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Login
