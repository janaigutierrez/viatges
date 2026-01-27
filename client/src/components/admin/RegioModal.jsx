// src/components/admin/RegioModal.jsx
import { useState, useEffect } from 'react';
import { createRegio, updateRegio } from '../../services/api';
import toast from 'react-hot-toast';
import './Modal.css';

const RegioModal = ({ regio, onClose }) => {
    const [formData, setFormData] = useState({
        nom: '',
        slug: '',
        ordre: 0,
    });
    const [imatgePortada, setImatgePortada] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (regio) {
            setFormData({
                nom: regio.nom,
                slug: regio.slug,
                ordre: regio.ordre,
            });
        }
    }, [regio]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImatgePortada(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nom || !formData.slug) {
            toast.error('Nom i slug són obligatoris');
            return;
        }

        setLoading(true);

        try {
            const data = new FormData();
            data.append('nom', formData.nom);
            data.append('slug', formData.slug);
            data.append('ordre', formData.ordre);

            if (imatgePortada) {
                data.append('imatgePortada', imatgePortada);
            }

            if (regio) {
                await updateRegio(regio.id, data);
                toast.success('Regió actualitzada correctament');
            } else {
                await createRegio(data);
                toast.success('Regió creada correctament');
            }

            onClose(true); // true = refresh data
        } catch (error) {
            const message = error.response?.data?.error || 'Error guardant la regió';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={() => onClose(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{regio ? 'Editar Regió' : 'Nova Regió'}</h2>
                    <button className="modal-close" onClick={() => onClose(false)}>
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="nom">Nom *</label>
                        <input
                            type="text"
                            id="nom"
                            name="nom"
                            value={formData.nom}
                            onChange={handleChange}
                            placeholder="Catalunya"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="slug">Slug * (URL amigable)</label>
                        <input
                            type="text"
                            id="slug"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            placeholder="catalunya"
                            required
                        />
                        <small>Exemple: "catalunya", "cantabria"</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="ordre">Ordre</label>
                        <input
                            type="number"
                            id="ordre"
                            name="ordre"
                            value={formData.ordre}
                            onChange={handleChange}
                            min="0"
                        />
                        <small>Per ordenar les regions (menor número = primer)</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="imatgePortada">Imatge de portada</label>
                        <input
                            type="file"
                            id="imatgePortada"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        {regio?.imatgePortada && !imatgePortada && (
                            <small>Imatge actual: {regio.imatgePortada}</small>
                        )}
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            onClick={() => onClose(false)}
                            className="btn-cancel"
                            disabled={loading}
                        >
                            Cancel·lar
                        </button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Guardant...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegioModal;