import { useState, useEffect } from 'react'
import axios from 'axios'
import './TemplateSelector.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function TemplateSelector({ selectedTemplate, onSelect }) {
    const [templates, setTemplates] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/templates`)
                setTemplates(response.data)
            } catch (err) {
                console.error('Failed to fetch templates:', err)
                // Use default templates if API fails
                setTemplates([
                    {
                        id: 'csv_etl',
                        name: 'CSV ETL',
                        description: 'Transform CSV files - add columns, filter rows, clean data',
                        icon: '📄',
                        examples: ['Add a new column with date', 'Filter rows by status']
                    },
                    {
                        id: 'xlsx_etl',
                        name: 'XLSX ETL',
                        description: 'Transform Excel files with formatting support',
                        icon: '📊',
                        examples: ['Merge columns', 'Add summary row']
                    },
                    {
                        id: 'xlsx_to_csv',
                        name: 'XLSX to CSV',
                        description: 'Convert Excel to CSV with transformations',
                        icon: '⬇️',
                        examples: ['Convert first sheet', 'Export with semicolon']
                    },
                    {
                        id: 'csv_to_xlsx',
                        name: 'CSV to XLSX',
                        description: 'Convert CSV to Excel with styling',
                        icon: '⬆️',
                        examples: ['Create styled report', 'Add Excel formatting']
                    }
                ])
            } finally {
                setLoading(false)
            }
        }
        fetchTemplates()
    }, [])

    if (loading) {
        return (
            <div className="template-loading">
                <div className="spinner"></div>
                Loading templates...
            </div>
        )
    }

    return (
        <div className="template-selector">
            <h3 className="template-section-title">Step 1: Select Template</h3>
            <div className="template-grid">
                {templates.map(template => (
                    <div
                        key={template.id}
                        className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
                        onClick={() => onSelect(template.id)}
                    >
                        <div className="template-icon">{template.icon}</div>
                        <div className="template-info">
                            <h4 className="template-name">{template.name}</h4>
                            <p className="template-description">{template.description}</p>
                            <div className="template-examples">
                                {template.examples?.slice(0, 2).map((ex, i) => (
                                    <span key={i} className="example-tag">• {ex}</span>
                                ))}
                            </div>
                        </div>
                        {selectedTemplate === template.id && (
                            <div className="template-check">✓</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default TemplateSelector
