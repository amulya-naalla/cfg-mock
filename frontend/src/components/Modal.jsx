/**
 * Shared modal shell + small form primitives used by Dashboard & Content pages.
 * Reuses the existing .modal-* styles from index.css.
 */

import { useEffect } from 'react';

export default function Modal({ title, icon, onClose, children, wide = false }) {
  // Close on Escape, lock body scroll while open
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal-container ${wide ? 'modal-container-wide' : ''}`} role="dialog" aria-modal="true">
        <div className="modal-header">
          <span className="modal-title">
            {icon && <span aria-hidden="true">{icon}</span>} {title}
          </span>
          <button className="modal-close-icon" onClick={onClose} aria-label="Close dialog">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <div className="form-field">
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}

export function FormError({ message }) {
  if (!message) return null;
  return <div className="error-banner">{message}</div>;
}
