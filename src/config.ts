/**
 * Application Congfiguration
 */

// Use environment variable if available, otherwise fallback to localhost
// For production, this should be set in Vercel project settings
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
