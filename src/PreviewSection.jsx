import React, { useState } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function PreviewSection({ result }) {
    const [uploadedFile, setUploadedFile] = useState(null)
    const [startRow, setStartRow] = useState(0)
    const [previewResult, setPreviewResult] = useState(null)
    const [previewLoading, setPreviewLoading] = useState(false)
    const [previewError, setPreviewError] = useState(null)

    const handleFileUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            const ext = file.name.split('.').pop().toLowerCase()
            if (!['csv', 'xlsx', 'xls'].includes(ext)) {
                setPreviewError('Please upload a CSV or XLSX file')
                return
            }
            setUploadedFile(file)
            setPreviewError(null)
        }
    }

    const extractFunctionBody = (scriptContent) => {
        const lines = scriptContent.split('\n')

        let functionStartIndex = -1
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim().match(/^def (convert|transform)\(df/)) {
                functionStartIndex = i
                break
            }
        }

        if (functionStartIndex === -1) {
            return scriptContent
        }

        const bodyLines = []
        let inFunction = false

        for (let i = functionStartIndex + 1; i < lines.length; i++) {
            const line = lines[i]
            const trimmed = line.trim()

            if (!inFunction && !trimmed) continue

            if (!inFunction && trimmed) {
                inFunction = true
            }

            if (trimmed.startsWith('def ') || (inFunction && line.length > 0 && !line.startsWith(' '))) {
                break
            }

            if (inFunction) {
                bodyLines.push(line)
            }
        }

        return bodyLines.join('\n')
    }

    const handlePreview = async () => {
        if (!uploadedFile || !result) return

        setPreviewLoading(true)
        setPreviewError(null)
        setPreviewResult(null)

        try {
            const formData = new FormData()
            formData.append('file', uploadedFile)
            formData.append('function_code', extractFunctionBody(result.script_content))
            formData.append('start_row', startRow)

            const response = await axios.post(
                `${API_URL}/api/scripts/preview`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            )

            setPreviewResult(response.data)
        } catch (err) {
            setPreviewError(err.response?.data?.detail || err.message || 'Preview failed')
        } finally {
            setPreviewLoading(false)
        }
    }

    if (result.reused) return null

    return (
        <>
            {/* Preview Upload Section */}
            <div className="card">
                <h2 className="card-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                    Preview Transformation
                </h2>
                <p className="card-description">
                    Upload a sample file to see how the transformation works on your data
                </p>

                <div className="preview-upload">
                    <div className="form-group">
                        <label htmlFor="fileUpload">Upload CSV/XLSX</label>
                        <input
                            id="fileUpload"
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={handleFileUpload}
                            className="file-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="startRow">Start from row</label>
                        <input
                            id="startRow"
                            type="number"
                            min="0"
                            value={startRow}
                            onChange={(e) => setStartRow(Number.parseInt(e.target.value) || 0)}
                            placeholder="0"
                        />
                    </div>

                    <button
                        onClick={handlePreview}
                        className="btn btn-primary"
                        disabled={!uploadedFile || previewLoading}
                    >
                        {previewLoading ? (
                            <>
                                <span className="spinner"></span>
                                Processing...
                            </>
                        ) : (
                            'Preview Transformation'
                        )}
                    </button>
                </div>

                {uploadedFile && (
                    <p className="file-info">
                        📎 {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
                    </p>
                )}

                {previewError && (
                    <div className="alert alert-error">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        {previewError}
                    </div>
                )}
            </div>

            {/* Preview Results */}
            {previewResult && (
                <div className="card">
                    <div className="card-header">
                        <div>
                            <h2 className="card-title">Preview Results</h2>
                            <p className="card-meta">
                                Processed {previewResult.rows_processed} rows in {previewResult.execution_time_ms.toFixed(0)}ms
                            </p>
                        </div>
                    </div>

                    {previewResult.warnings && previewResult.warnings.length > 0 && (
                        <div className="alert alert-warning">
                            ⚠️ {previewResult.warnings.join(', ')}
                        </div>
                    )}

                    <div className="preview-grid">
                        <div className="preview-section">
                            <h4>Before (Original)</h4>
                            <div className="table-wrapper">
                                <table className="preview-table">
                                    <thead>
                                        <tr>
                                            {previewResult.before_columns.map(col => (
                                                <th key={col}>{col}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewResult.before_data.slice(0, 10).map((row, i) => (
                                            <tr key={i}>
                                                {previewResult.before_columns.map(col => (
                                                    <td key={col}>{row[col] || ''}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {previewResult.before_data.length > 10 && (
                                <p className="table-footer">
                                    Showing 10 of {previewResult.before_data.length} rows
                                </p>
                            )}
                        </div>

                        <div className="preview-section">
                            <h4>After (Transformed)</h4>
                            <div className="table-wrapper">
                                <table className="preview-table">
                                    <thead>
                                        <tr>
                                            {previewResult.after_columns.map(col => (
                                                <th key={col} className={!previewResult.before_columns.includes(col) ? 'new-column' : ''}>
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewResult.after_data.slice(0, 10).map((row, i) => (
                                            <tr key={i}>
                                                {previewResult.after_columns.map(col => (
                                                    <td key={col} className={!previewResult.before_columns.includes(col) ? 'new-column' : ''}>
                                                        {row[col] || ''}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {previewResult.after_data.length > 10 && (
                                <p className="table-footer">
                                    Showing 10 of {previewResult.after_data.length} rows
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

PreviewSection.propTypes = {
    result: PropTypes.shape({
        script_content: PropTypes.string,
        reused: PropTypes.bool
    }).isRequired
}

export default PreviewSection
