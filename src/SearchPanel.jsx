import { useState } from 'react'
import axios from 'axios'
import './SearchPanel.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Script type filters for search (based on database script_type values)
const SCRIPT_TYPE_FILTERS = [
    { id: '', name: 'All Script Types' },
    { id: 'csv_etl', name: '� CSV ETL' },
    { id: 'xlsx_etl', name: '� XLSX ETL' },
    { id: 'csv_to_xlsx', name: '⬆️ CSV to XLSX' },
    { id: 'xlsx_to_csv', name: '⬇️ XLSX to CSV' },
    { id: 'csv_to_bq', name: '☁️ CSV to BQ Load' }
]

function SearchPanel({ onScriptSelect }) {
    const [query, setQuery] = useState('')
    const [templateFilter, setTemplateFilter] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!query.trim()) return

        setLoading(true)
        setSearched(true)
        try {
            const response = await axios.post(`${API_URL}/api/scripts/search`, {
                query: query.trim(),
                script_type: templateFilter || null,
                limit: 10
            })
            setResults(response.data.results)
        } catch (err) {
            console.error('Search failed:', err)
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    const getSimilarityBadge = (similarity) => {
        const percent = (similarity * 100).toFixed(0)
        if (similarity >= 0.8) {
            return <span className="similarity-badge high">{percent}% match</span>
        } else if (similarity >= 0.5) {
            return <span className="similarity-badge medium">{percent}% match</span>
        } else {
            return <span className="similarity-badge low">{percent}% match</span>
        }
    }

    return (
        <div className="search-panel">
            <form onSubmit={handleSearch} className="search-form">
                <div className="search-filter-row">
                    <select
                        value={templateFilter}
                        onChange={(e) => setTemplateFilter(e.target.value)}
                        className="template-filter-select"
                    >
                        {SCRIPT_TYPE_FILTERS.map(opt => (
                            <option key={opt.id} value={opt.id}>{opt.name}</option>
                        ))}
                    </select>
                </div>
                <div className="search-input-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search scripts... (e.g., 'convert date format', 'add new column')"
                        className="search-input"
                    />
                    <button type="submit" className="search-btn" disabled={loading}>
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>
            </form>

            {loading && (
                <div className="search-loading">
                    <div className="spinner"></div>
                    Searching approved scripts...
                </div>
            )}

            {!loading && searched && results.length === 0 && (
                <div className="no-results">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="m15 9-6 6" />
                        <path d="m9 9 6 6" />
                    </svg>
                    <p>No matching scripts found</p>
                    <span>Try different keywords or create a new script</span>
                </div>
            )}

            {!loading && results.length > 0 && (
                <div className="search-results">
                    <h4 className="results-title">Found {results.length} matching scripts</h4>
                    <div className="results-list">
                        {results.map((result, index) => (
                            <div
                                key={index}
                                className="result-card"
                                onClick={() => onScriptSelect(result)}
                            >
                                <div className="result-header">
                                    <span className="result-type">{result.script_type}</span>
                                    {getSimilarityBadge(result.similarity)}
                                </div>
                                <div className="result-path">{result.repo_path}</div>
                                {result.description && (
                                    <div className="result-description">{result.description}</div>
                                )}
                                <button className="use-script-btn">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 12h14" />
                                        <path d="m12 5 7 7-7 7" />
                                    </svg>
                                    Open
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default SearchPanel
