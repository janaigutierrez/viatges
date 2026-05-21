import { useState, useEffect } from 'react';
import { createApartat, updateApartat } from '../../services/api';
import { getImageUrl } from '../../utils/imageUrl';
import toast from 'react-hot-toast';
import './Modal.css';

const slugify = (str) =>
    (str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .substring(0, 80);

const ApartatModal = ({ apartat, puntInteresId, onClose }) => {
    const [formData, setFormData] = useState({
        nom: '',
        slug: '',
        descripcio: '',
        ordre: 0,
    });
    const [imatgePortada, setImatgePortada] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (apartat) {
            setFormData({
                nom: apartat.nom,
                slug: apartat.slug,
                descripcio: apartat.descripcio || '',
                ordre: apartat.ordre || 0,
            });
        }
    }, [apartat]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const next = { ...prev, [name]: value };
            if (name === 'nom' && !apartat) {
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
            data.append('descripcio', formData.descripcio);
            data.append('ordre', formData.ordre);

            if (!apartat && puntInteresId) {
                data.append('puntInteres', puntInteresId);
            }

            if (imatgePortada) {
                data.append('imatgePortada', imatgePortada);
            }

            if (apartat) {
                await updateApartat(apartat.id, data);
                toast.success('Apartado actualizado correctamente');
            } else {
                await createApartat(data);
                toast.success('Apartado creado correctamente');
            }

            onClose(true);
        } catch (error) {
            const message = error.response?.data?.error || 'Error al guardar el apartado';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={() => onClose(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{apartat ? 'Editar apartado' : 'Nuevo apartado'}</h2>
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
                            placeholder="Jardines / Monasterio / Centro / Afueras"
                            required
                        />
                    </div>

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

                    <div className="form-group">
                        <label htmlFor="descripcio">Descripción</label>
                        <textarea
                            id="descripcio"
                            name="descripcio"
                            value={formData.descripcio}
                            onChange={handleChange}
                            placeholder="Describe este apartado..."
                            rows="5"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="imatgePortada">Imagen de portada</label>
                        {apartat?.imatgePortada && !imatgePortada && (
                            <img
                                src={getImageUrl(apartat.imatgePortada)}
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

export default ApartatModal;
