/**
 * Configuration for cfg-mock Frontend
 * 
 * Central place for API URL, benchmarks, educator profile, and runtime overrides.
 */

const DEFAULT_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const getSavedApiUrl = () => {
  try {
    return localStorage.getItem('VITE_API_BASE_URL') || DEFAULT_API_BASE_URL;
  } catch (e) {
    return DEFAULT_API_BASE_URL;
  }
};

export const CONFIG = {
  API_BASE_URL: getSavedApiUrl(),

  setApiBaseUrl(newUrl) {
    const cleanUrl = (newUrl || '').trim().replace(/\/+$/, '');
    this.API_BASE_URL = cleanUrl || DEFAULT_API_BASE_URL;
    try {
      localStorage.setItem('VITE_API_BASE_URL', this.API_BASE_URL);
    } catch (e) {
      console.warn('Could not persist API_BASE_URL to localStorage', e);
    }
    return this.API_BASE_URL;
  },

  EDUCATOR: {
    name: 'Sunita Sharma',
    role: 'Community Field Educator',
    district: 'Pune Rural',
    cluster: 'North-2',
    badge: 'Field Educator #408'
  },

  GRADE_BENCHMARKS: {
    '1': 40,
    '2': 45,
    '3': 50,
    '4': 55,
    '5': 60,
    '6': 65,
    '7': 70,
    '8': 75
  },

  SUBJECTS: ['Math', 'Reading', 'Science', 'English']
};

export const GRADE_BENCHMARKS = CONFIG.GRADE_BENCHMARKS;
export const SUBJECTS = CONFIG.SUBJECTS;
export const EDUCATOR_PROFILE = CONFIG.EDUCATOR;
