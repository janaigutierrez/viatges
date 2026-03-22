import { useState, useEffect } from 'react';
import { createPuntInteres, updatePuntInteres } from '../../services/api';
import { getImageUrl } from '../../utils/imageUrl';
import toast from 'react-hot-toast';
import './Modal.css';

const PuntInteresModal = ({ punt, llocId, regioId, onClose }) => {
    const [formData, setFormData] = useState({
        nom: '',
        slug: '',
        descripcio: '',
        ordre: 0,
    });
    const [imatgePortada, setImatgePortada] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (punt) {
            setFormData({
                nom: punt.nom,
                slug: punt.slug,
                descripcio: punt.descripcio || '',
                ordre: punt.ordre,
            });
        }
    }, [punt]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleNomChange = (e) => {
        const nom = e.target.value;
        const slugAuto = nom
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');
        setFormData((prev) => ({
            ...prev,
            nom,
            slug: prev.slug === '' || !punt ? slugAuto : prev.slug,
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
            data.append('descripcio', formData.descripcio);
            data.append('ordre', formData.ordre);

            if (!punt) {
                data.append('lloc', llocId);
                data.append('regio', regioId);
            }

            if (imatgePortada) {
                data.append('imatgePortada', imatgePortada);
            }

            if (punt) {
                await updatePuntInteres(punt.id, data);
                toast.success('Punt d\'interès actualitzat correctament');
            } else {
                await createPuntInteres(data);
                toast.success('Punt d\'interès creat correctament');
            }

            onClose(true);
        } catch (error) {
            const message = error.response?.data?.error || 'Error guardant el punt d\'interès';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={() => onClose(false)}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{punt ? 'Editar punt d\'interès' : 'Nou punt d\'interès'}</h2>
                    <button className="modal-close" onClick={() => onClose(false)}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="nom">Nom *</label>
                            <input
                                type="text"
                                id="nom"
                                name="nom"
                                value={formData.nom}
                                onChange={handleNomChange}
                                placeholder="Sagrada Família"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="slug">Slug *</label>
                            <input
                                type="text"
                                id="slug"
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                placeholder="sagrada-familia"
                                required
                            />
                        </div>
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
                    </div>

                    <div className="form-group">
                        <label htmlFor="descripcio">Descripció</label>
                        <textarea
                            id="descripcio"
                            name="descripcio"
                            value={formData.descripcio}
                            onChange={handleChange}
                            placeholder="Descripció del punt d'interès..."
                            rows="5"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="imatgePortada">Imatge de portada</label>
                        {punt && punt.imatgePortada && !imatgePortada && (
                            <img
                                src={getImageUrl(punt.imatgePortada)}
                                alt="Portada actual"
                                style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }}
                            />
                        )}
                        <input
                            type="file"
                            id="imatgePortada"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
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

export default PuntInteresModal;
