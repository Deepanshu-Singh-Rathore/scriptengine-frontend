import PropTypes from 'prop-types'
import './ModeSelector.css'

function ModeSelector({ mode, onModeChange }) {
    return (
        <div className="mode-selector">
            <button
                className={`mode-btn ${mode === 'search' ? 'active' : ''}`}
                onClick={() => onModeChange('search')}
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                </svg>
                Search Approved Scripts
            </button>
            <button
                className={`mode-btn ${mode === 'create' ? 'active' : ''}`}
                onClick={() => onModeChange('create')}
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                Create New Script
            </button>
        </div>
    )
}

ModeSelector.propTypes = {
    mode: PropTypes.oneOf(['search', 'create']).isRequired,
    onModeChange: PropTypes.func.isRequired
}

export default ModeSelector
