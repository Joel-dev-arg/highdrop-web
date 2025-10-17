// src/features/cultivos/CultivosPanel.jsx
import { useEffect, useState } from "react";
import {
  listCultivos,
  createCultivo,
  updateCultivo,
  deleteCultivo,
  // 👇 nuevos helpers para sincronizar con el backend/ingestor
  getActiveCultivo,
  setActiveCultivo,
} from "../../api/cultivos";
import Modal from "../../components/Modal";

const TYPES = ["Lechuga", "Aromáticas"];

export default function CultivosPanel({ selectedId, onSelect, onChanged }) {
  const [items, setItems] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);   // { id, nombre, tipo, fecha_plantacion }
  const [confirm, setConfirm] = useState(null);   // { id, nombre }
  const [error, setError] = useState("");

  const load = async () => {
  try {
    const list = await listCultivos();
    setItems(list);
    // 👇 si no hay seleccionado aún, elegimos el primero
    if (!selectedId && list.length) {
      onSelect?.(list[0].id_cultivo);
    }
  } catch (e) {
    setError(e.message);
  }
};

  // Carga lista y, si no hay selección externa, sincroniza con /hardware/active-cultivo
  useEffect(() => {
    let alive = true;
    (async () => {
      await load();
      try {
        if (selectedId == null) {
          const { id } = await getActiveCultivo();
          if (alive && Number.isInteger(id)) onSelect?.(id);
        }
      } catch {
        // si falla, no bloquea la UI
      }
    })();
    return () => { alive = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdd = async (payload) => {
    await createCultivo(payload);
    setShowAdd(false);
    await load();
    onChanged?.();
  };

  const handleEdit = async (id, payload) => {
    await updateCultivo(id, payload);
    setEditing(null);
    await load();
    onChanged?.();
  };

  const handleDelete = async (id) => {
    await deleteCultivo(id);
    setConfirm(null);
    await load();
    onChanged?.();
    if (selectedId === id) onSelect?.(null);
  };

  // 👉 ahora al hacer click, además de seleccionar, avisamos al backend
  const handleSelect = async (id) => {
    // optimista: marcamos seleccionado ya
    onSelect?.(id);
    try {
      await setActiveCultivo(id); // POST /api/hardware/active-cultivo
    } catch (e) {
      // si falla, lo avisamos pero mantenemos la selección para no “rebotar” la UI
      setError(e.message || "No se pudo fijar el cultivo activo");
    }
  };

  return (
    <div className="card card--notch">
      <div className="toolbar">
        <div className="meta-title">Grupos/Nombres</div>
        <button className="btn btn--primary btn--sm" onClick={() => setShowAdd(true)}>+ Agregar</button>
      </div>

      {error && <div className="alertbar"><span className="alertbar-dot" />{error}</div>}

      <div className="cultivos-list">
        {items.map((c) => (
          <div
            key={c.id_cultivo}
            className={`cultivo-item ${selectedId === c.id_cultivo ? "cultivo-item--active" : ""}`}
            onClick={() => handleSelect(c.id_cultivo)}
          >
            <div className="cultivo-item__left">
              <span className="cultivo-dot" />
              <div>
                <div style={{ fontWeight: 700 }}>{c.nombre}</div>
                <div className="muted" style={{ fontSize: 12 }}>
                  {c.tipo} • {new Date(c.fecha_plantacion).toLocaleString()}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 6 }}>
              <button
                className="btn btn--ghost btn--sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditing({
                    id: c.id_cultivo,
                    nombre: c.nombre,
                    tipo: TYPES.includes(c.tipo) ? c.tipo : TYPES[0],
                    fecha_plantacion: c.fecha_plantacion,
                  });
                }}
              >✏️</button>
              <button
                className="btn btn--ghost btn--sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirm({ id: c.id_cultivo, nombre: c.nombre });
                }}
              >🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {/* === MODALES === */}

      {/* Agregar */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Agregar cultivo">
        <AgregarCultivoForm
          onCancel={() => setShowAdd(false)}
          onSubmit={(data) => handleAdd(data)}
        />
      </Modal>

      {/* Editar */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar nombre del cultivo">
        {editing && (
          <EditarCultivoForm
            initial={{
              nombre: editing.nombre,
              tipo: editing.tipo,
              fecha_plantacion: editing.fecha_plantacion?.slice(0, 16) || "",
            }}
            onCancel={() => setEditing(null)}
            onSubmit={(data) => handleEdit(editing.id, data)}
          />
        )}
      </Modal>

      {/* Eliminar */}
      <Modal open={!!confirm} onClose={() => setConfirm(null)} title="Eliminar cultivo">
        {confirm && (
          <div>
            <p>¿Seguro que querés eliminar “<b>{confirm.nombre}</b>”? Esta acción no se puede deshacer.</p>
            <div className="form-footer">
              <button className="btn btn--ghost" onClick={() => setConfirm(null)}>Volver</button>
              <button
                className="btn"
                style={{ background: "#fee2e2", borderColor: "#fecaca" }}
                onClick={() => handleDelete(confirm.id)}
              >
                Eliminar definitivamente
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ====== FORM – CREAR ====== */
function AgregarCultivoForm({ onCancel, onSubmit }) {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState(TYPES[0]);
  const [fecha, setFecha] = useState("");

  return (
    <div className="form-modal">
      <div className="section section--soft">
        <div className="section-title">Nombre del cultivo</div>
        <input
          className="input"
          placeholder="Escribe un nombre..."
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </div>

      <div className="section section--soft">
        <div className="section-title">Tipo</div>
        <div className="toggle">
          {TYPES.map((t) => (
            <button
              key={t}
              className={`toggle-btn ${tipo === t ? "is-active" : ""}`}
              onClick={() => setTipo(t)}
              type="button"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="section section--note">
        <div className="note-row">🪪&nbsp;&nbsp;Nombre: “{nombre || "Nuevo cultivo"}”</div>
        <div className="note-row">🧪&nbsp;&nbsp;Tipo: {tipo}</div>
      </div>

      <div className="section">
        <div className="section-title muted">Fecha de plantación</div>
        <input
          type="datetime-local"
          className="input"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
      </div>

      <div className="form-helper muted">
        Solo necesitas nombre y tipo. Podrás editarlo luego.
      </div>

      <div className="form-footer">
        <button className="btn btn--ghost" onClick={onCancel}>Cancelar</button>
        <button
          className="btn btn--primary"
          disabled={!nombre.trim()}
          onClick={() => onSubmit({ nombre: nombre.trim(), tipo, fecha_plantacion: fecha || null })}
        >
          ✓ Agregar
        </button>
      </div>
    </div>
  );
}

/* ====== FORM – EDITAR ====== */
function EditarCultivoForm({ initial, onCancel, onSubmit }) {
  const [nombre, setNombre] = useState(initial?.nombre || "");
  const [tipo, setTipo] = useState(initial?.tipo || TYPES[0]);
  const [fecha, setFecha] = useState(initial?.fecha_plantacion || "");

  return (
    <div className="form-modal">
      <div className="section section--soft">
        <div className="section-title">Nombre del cultivo</div>
        <input
          className="input"
          placeholder="Escribe un nombre..."
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <div className="hint muted">Consejo: usa nombres cortos y descriptivos (p. ej., “Lechuga Roma 1”).</div>
      </div>

      <div className="section section--soft">
        <div className="section-title">Tipo</div>
        <div className="toggle">
          {TYPES.map((t) => (
            <button
              key={t}
              className={`toggle-btn ${tipo === t ? "is-active" : ""}`}
              onClick={() => setTipo(t)}
              type="button"
            >
              {t}
            </button>
          ))}
        </div>
        <div className="hint muted">Solo puedes elegir uno. Podrás cambiarlo después.</div>
      </div>

      <div className="section section--note">
        <div className="note-row">🪪&nbsp;&nbsp;Nombre actual: “{initial?.nombre || "Nuevo cultivo"}”</div>
        <div className="note-row">🧪&nbsp;&nbsp;Tipo: {tipo}</div>
      </div>

      <div className="section">
        <div className="section-title muted">Fecha de plantación</div>
        <input
          type="datetime-local"
          className="input"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
      </div>

      <div className="form-helper muted">
        Edita el nombre y confirma. Este cambio se reflejará en tu panel.
      </div>

      <div className="form-footer">
        <button className="btn btn--ghost" onClick={onCancel}>↩︎ Volver</button>
        <button
          className="btn btn--primary"
          disabled={!nombre.trim()}
          onClick={() => onSubmit({ nombre: nombre.trim(), tipo, fecha_plantacion: fecha || null })}
        >
          ✓ Guardar
        </button>
      </div>
    </div>
  );
}
