import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function Modal({ open, onClose, children, title }) {
  if (!open) return null;

  // Bloquea el scroll del body mientras el modal está abierto
  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = overflow; };
  }, []);

  // Cerrar con ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const overlay = (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.(); // solo overlay
      }}
      style={{ zIndex: 10000 }} // bien arriba de todo
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
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

  // 🔥 Renderiza el modal en <body>, fuera del árbol del panel
  return createPortal(overlay, document.body);
}
