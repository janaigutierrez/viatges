import { useState, useEffect } from 'react';
import { createPlanta, updatePlanta } from '../../services/api';
import toast from 'react-hot-toast';
import './Modal.css';

const ETIQUETES = ['plantes', 'suculentes', 'cactus', 'crases'];

const PlantaModal = ({ planta, onClose }) => {
    const [formData, setFormData] = useState({
        nom: '',
        nomLlati: '',
        descripcio: '',
        etiqueta: 'plantes',
        ordre: 0,
    });
    const [imatgePortada, setImatgePortada] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (planta) {
            setFormData({
                nom: planta.nom,
                nomLlati: planta.nomLlati || '',
                descripcio: planta.descripcio || '',
                etiqueta: planta.etiqueta || 'plantes',
                ordre: planta.ordre || 0,
            });
        }
    }, [planta]);

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

        if (!formData.nom) {
            toast.error('El nom és obligatori');
            return;
        }

        setLoading(true);

        try {
            const data = new FormData();
            data.append('nom', formData.nom);
            data.append('nomLlati', formData.nomLlati);
            data.append('descripcio', formData.descripcio);
            data.append('etiqueta', formData.etiqueta);
            data.append('ordre', formData.ordre);

            if (imatgePortada) {
                data.append('imatgePortada', imatgePortada);
            }

            if (planta) {
                await updatePlanta(planta.id, data);
                toast.success('Planta actualitzada correctament');
            } else {
                await createPlanta(data);
                toast.success('Planta creada correctament');
            }

            onClose(true);
        } catch (error) {
            const message = error.response?.data?.error || 'Error guardant la planta';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={() => onClose(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{planta ? 'Editar Planta' : 'Nova Planta'}</h2>
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
                            placeholder="Aloe Vera"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="nomLlati">Nom llatí</label>
                        <input
                            type="text"
                            id="nomLlati"
                            name="nomLlati"
                            value={formData.nomLlati}
                            onChange={handleChange}
                            placeholder="Aloe barbadensis miller"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="etiqueta">Etiqueta *</label>
                            <select
                                id="etiqueta"
                                name="etiqueta"
                                value={formData.etiqueta}
                                onChange={handleChange}
                            >
                                {ETIQUETES.map((et) => (
                                    <option key={et} value={et}>
                                        {et.charAt(0).toUpperCase() + et.slice(1)}
                                    </option>
                                ))}
                            </select>
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
                    </div>

                    <div className="form-group">
                        <label htmlFor="descripcio">Descripció</label>
                        <textarea
                            id="descripcio"
                            name="descripcio"
                            value={formData.descripcio}
                            onChange={handleChange}
                            placeholder="Descripció de la planta..."
                            rows="4"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="imatgePortada">Foto</label>
                        <input
                            type="file"
                            id="imatgePortada"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        {planta?.imatgePortada && !imatgePortada && (
                            <small>Imatge actual assignada</small>
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

export default PlantaModal;
