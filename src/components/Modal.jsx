export default function Modal({ open, onClose, children, title }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-head">
          <div className="modal-title">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
              <path d="M3 3h8v8H3V3Zm10 0h8v8h-8V3ZM3 13h8v8H3v-8Zm10 0h8v8h-8v-8Z" fill="currentColor"/>
            </svg>
            <span>{title}</span>
          </div>
          <button className="btn btn--primary btn--sm" onClick={onClose}>Cerrar</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
