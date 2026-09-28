// API configuration
// In production, fallback to Render backend instead of localhost
export const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? 'https://scriptengine-backend.onrender.com' : 'http://localhost:8000');
