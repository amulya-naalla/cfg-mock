import { useState } from 'react';
import { CONFIG } from '../config.js';
import api from '../api/api.js';

export default function ApiConfigModal({ isOpen, onClose, onUrlUpdated }) {
  const [url, setUrl] = useState(CONFIG.API_BASE_URL);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    CONFIG.setApiBaseUrl(url);
    const isOk = await api.checkHealth();
    setTesting(false);
    setTestResult(isOk ? 'connected' : 'offline');
  };

  const handleSave = async () => {
    CONFIG.setApiBaseUrl(url);
    if (onUrlUpdated) onUrlUpdated(url);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span>⚙️</span> Backend API Configuration
          </div>
          <button className="modal-close-icon" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <p className="modal-subtitle">
            Paste Person B's <strong>ngrok URL</strong> below. All REST API requests will route to this URL immediately without restarting.
          </p>

          <div className="form-field" style={{ marginTop: '12px' }}>
            <label className="field-label" htmlFor="backend-url-input">
              Backend API Base URL
            </label>
            <input
              id="backend-url-input"
              type="text"
              className="form-input"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setTestResult(null);
              }}
              placeholder="e.g. https://xxxx.ngrok-free.app or http://localhost:5000"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '13px' }}
              onClick={handleTest}
              disabled={testing}
            >
              {testing ? '⚡ Testing...' : '⚡ Test Connection'}
            </button>
            {testResult === 'connected' && (
              <span style={{ color: '#047857', fontWeight: '700', fontSize: '12.5px' }}>✓ Connected!</span>
            )}
            {testResult === 'offline' && (
              <span style={{ color: '#b45309', fontWeight: '600', fontSize: '12.5px' }}>⚠️ Unreachable (using local demo data)</span>
            )}
          </div>

          <div style={{ marginTop: '16px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', fontSize: '12px', color: '#64748b' }}>
            <strong>Offline Resilience:</strong> If the backend cannot be reached, the app automatically switches to realistic seed data so your live demo never stalls.
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave}>
            Save & Connect
          </button>
        </div>
      </div>
    </div>
  );
}
