import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getSeccioInfo, updateSeccioInfo } from '../../services/api';
import toast from 'react-hot-toast';
import './SeccioDescripcio.css';

const SeccioDescripcio = ({ slug, placeholder, accentColor = '#4a4a4a' }) => {
    const { isAuthenticated } = useAuth();
    const [descripcio, setDescripcio] = useState('');
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState('');
    const [saving, setSaving] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [showToggle, setShowToggle] = useState(false);
    const textRef = useRef(null);

    useEffect(() => {
        let cancelled = false;
        getSeccioInfo(slug)
            .then((res) => {
                if (cancelled) return;
                setDescripcio(res.data.descripcio || '');
            })
            .catch(() => {})
            .finally(() => {
                if (!cancelled) setLoaded(true);
            });
        return () => { cancelled = true; };
    }, [slug]);

    // Detecta si el text supera el clamp (cal mostrar "Ver más")
    useLayoutEffect(() => {
        if (textRef.current && descripcio && !expanded) {
            const el = textRef.current;
            setShowToggle(el.scrollHeight > el.clientHeight + 1);
        }
    }, [descripcio, expanded, loaded]);

    const handleEdit = () => {
        setDraft(descripcio);
        setEditing(true);
    };

    const handleCancel = () => {
        setEditing(false);
        setDraft('');
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await updateSeccioInfo(slug, draft);
            setDescripcio(res.data.descripcio || '');
            setEditing(false);
            setExpanded(false);
            toast.success('Descripción guardada');
        } catch (error) {
            toast.error('Error al guardar la descripción');
        } finally {
            setSaving(false);
        }
    };

    if (!loaded) return null;

    if (editing) {
        return (
            <div className="seccio-descripcio seccio-descripcio--editing">
                <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={placeholder || 'Escribe aquí la descripción de esta sección...'}
                    rows={6}
                    autoFocus
                />
                <div className="seccio-descripcio-actions">
                    <button
                        onClick={handleCancel}
                        className="btn-cancel-inline"
                        disabled={saving}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="btn-save-inline"
                        style={{ background: accentColor }}
                        disabled={saving}
                    >
                        {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </div>
        );
    }

    if (!descripcio && !isAuthenticated) return null;

    return (
        <div className="seccio-descripcio">
            {descripcio ? (
                <>
                    <p
                        ref={textRef}
                        className={`seccio-descripcio-text ${
                            expanded ? '' : 'seccio-descripcio-text--clamped'
                        }`}
                    >
                        {descripcio}
                    </p>
                    {showToggle && (
                        <button
                            onClick={() => setExpanded((v) => !v)}
                            className="btn-toggle-descripcio"
                            style={{ color: accentColor }}
                        >
                            {expanded ? 'Ver menos ▲' : 'Ver más ▼'}
                        </button>
                    )}
                </>
            ) : (
                <p className="seccio-descripcio-placeholder">
                    {placeholder || 'Sin descripción todavía.'}
                </p>
            )}
            {isAuthenticated && (
                <button
                    onClick={handleEdit}
                    className="btn-edit-descripcio"
                    style={{ color: accentColor, borderColor: accentColor }}
                >
                    {descripcio ? 'Editar descripción' : 'Añadir descripción'}
                </button>
            )}
        </div>
    );
};

export default SeccioDescripcio;
