import { useState, useEffect } from 'react';
import { createFamilia, updateFamilia } from '../../services/api';
import toast from 'react-hot-toast';
import './Modal.css';

const ETIQUETES = [
    { valor: 'planta', label: 'Plantas' },
    { valor: 'crases-suculentes', label: 'Crasas y suculentas' },
    { valor: 'cactus', label: 'Cactus' },
];

const UBICACIONS = [
    { valor: '', label: '— Sin especificar —' },
    { valor: 'interior', label: 'Interior' },
    { valor: 'exterior', label: 'Exterior' },
];

const slugify = (str) =>
    (str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .substring(0, 80);

const FamiliaModal = ({ familia, onClose }) => {
    const [formData, setFormData] = useState({
        nom: '',
        slug: '',
        etiqueta: 'planta',
        ubicacio: '',
        descripcio: '',
        ordre: 0,
    });
    const [imatgePortada, setImatgePortada] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (familia) {
            setFormData({
                nom: familia.nom,
                slug: familia.slug,
                etiqueta: familia.etiqueta || 'planta',
                ubicacio: familia.ubicacio || '',
                descripcio: familia.descripcio || '',
                ordre: familia.ordre || 0,
            });
        }
    }, [familia]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const next = { ...prev, [name]: value };
            // Auto-genera slug en crear (no en editar)
            if (name === 'nom' && !familia) {
                next.slug = slugify(value);
            }
            return next;
        });
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImatgePortada(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nom) {
            toast.error('El nombre es obligatorio');
            return;
        }

        const finalSlug = slugify(formData.slug || formData.nom);
        if (!finalSlug) {
            toast.error('El nombre debe contener letras o números');
            return;
        }

        setLoading(true);

        try {
            const data = new FormData();
            data.append('nom', formData.nom);
            data.append('slug', finalSlug);
            data.append('etiqueta', formData.etiqueta);
            data.append('ubicacio', formData.ubicacio);
            data.append('descripcio', formData.descripcio);
            data.append('ordre', formData.ordre);

            if (imatgePortada) {
                data.append('imatgePortada', imatgePortada);
            }

            if (familia) {
                await updateFamilia(familia.id, data);
                toast.success('Familia actualizada correctamente');
            } else {
                await createFamilia(data);
                toast.success('Familia creada correctamente');
            }

            onClose(true);
        } catch (error) {
            const message = error.response?.data?.error || 'Error al guardar la familia';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const showUbicacio = formData.etiqueta === 'planta';

    return (
        <div className="modal-overlay" onClick={() => onClose(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{familia ? 'Editar familia' : 'Nueva familia'}</h2>
                    <button className="modal-close" onClick={() => onClose(false)}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="nom">Nombre *</label>
                        <input
                            type="text"
                            id="nom"
                            name="nom"
                            value={formData.nom}
                            onChange={handleChange}
                            placeholder="Echeverias"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="etiqueta">Categoría *</label>
                            <select
                                id="etiqueta"
                                name="etiqueta"
                                value={formData.etiqueta}
                                onChange={handleChange}
                            >
                                {ETIQUETES.map((et) => (
                                    <option key={et.valor} value={et.valor}>
                                        {et.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {showUbicacio && (
                            <div className="form-group">
                                <label htmlFor="ubicacio">Ubicación</label>
                                <select
                                    id="ubicacio"
                                    name="ubicacio"
                                    value={formData.ubicacio}
                                    onChange={handleChange}
                                >
                                    {UBICACIONS.map((u) => (
                                        <option key={u.label} value={u.valor}>
                                            {u.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="ordre">Orden</label>
                            <input
                                type="number"
                                id="ordre"
                                name="ordre"
                                value={formData.ordre}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="descripcio">Descripción</label>
                        <textarea
                            id="descripcio"
                            name="descripcio"
                            value={formData.descripcio}
                            onChange={handleChange}
                            placeholder="Breve descripción de la familia..."
                            rows="3"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="imatgePortada">Foto de portada</label>
                        <input
                            type="file"
                            id="imatgePortada"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        {familia?.imatgePortada && !imatgePortada && (
                            <small>Imagen actual asignada</small>
                        )}
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            onClick={() => onClose(false)}
                            className="btn-cancel"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FamiliaModal;
