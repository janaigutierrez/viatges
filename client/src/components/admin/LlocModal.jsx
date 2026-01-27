import { useState, useEffect } from 'react';
import { createLloc, updateLloc, getRegions } from '../../services/api';
import toast from 'react-hot-toast';
import './Modal.css';

const LlocModal = ({ lloc, regioId, onClose }) => {
    const [regions, setRegions] = useState([]);
    const [formData, setFormData] = useState({
        nom: '',
        slug: '',
        regio: regioId || '',
        descripcio: '',
        ordre: 0,
    });
    const [puntsInteres, setPuntsInteres] = useState([]);
    const [imatgePortada, setImatgePortada] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchRegions();

        if (lloc) {
            setFormData({
                nom: lloc.nom,
                slug: lloc.slug,
                regio: lloc.regio.id,
                descripcio: lloc.descripcio || '',
                ordre: lloc.ordre,
            });
            setPuntsInteres(lloc.puntsInteres || []);
        }
    }, [lloc]);

    const fetchRegions = async () => {
        try {
            const response = await getRegions();
            setRegions(response.data);
        } catch (error) {
            console.error('Error carregant regions:', error);
        }
    };

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

    const handleAddPunt = () => {
        setPuntsInteres([...puntsInteres, { nom: '', descripcio: '' }]);
    };

    const handlePuntChange = (index, field, value) => {
        const newPunts = [...puntsInteres];
        newPunts[index][field] = value;
        setPuntsInteres(newPunts);
    };

    const handleRemovePunt = (index) => {
        setPuntsInteres(puntsInteres.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nom || !formData.slug || !formData.regio) {
            toast.error('Nom, slug i regió són obligatoris');
            return;
        }

        setLoading(true);

        try {
            const data = new FormData();
            data.append('nom', formData.nom);
            data.append('slug', formData.slug);
            data.append('regio', formData.regio);
            data.append('descripcio', formData.descripcio);
            data.append('ordre', formData.ordre);
            data.append('puntsInteres', JSON.stringify(puntsInteres));

            if (imatgePortada) {
                data.append('imatgePortada', imatgePortada);
            }

            if (lloc) {
                await updateLloc(lloc.id, data);
                toast.success('Lloc actualitzat correctament');
            } else {
                await createLloc(data);
                toast.success('Lloc creat correctament');
            }

            onClose(true);
        } catch (error) {
            const message = error.response?.data?.error || 'Error guardant el lloc';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={() => onClose(false)}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{lloc ? 'Editar Lloc' : 'Nou Lloc'}</h2>
                    <button className="modal-close" onClick={() => onClose(false)}>
                        ✕
                    </button>
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
                                onChange={handleChange}
                                placeholder="Barcelona"
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
                                placeholder="barcelona"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="regio">Regió *</label>
                            <select
                                id="regio"
                                name="regio"
                                value={formData.regio}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Selecciona una regió</option>
                                {regions.map((reg) => (
                                    <option key={reg.id} value={reg.id}>
                                        {reg.nom}
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
                            placeholder="Descripció del lloc..."
                            rows="4"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="imatgePortada">Imatge de portada</label>
                        <input
                            type="file"
                            id="imatgePortada"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </div>

                    {/* Punts d'interès */}
                    <div className="form-section">
                        <div className="section-header">
                            <h3>Punts d'interès</h3>
                            <button
                                type="button"
                                onClick={handleAddPunt}
                                className="btn-add-small"
                            >
                                + Afegir punt
                            </button>
                        </div>

                        {puntsInteres.map((punt, index) => (
                            <div key={index} className="punt-item">
                                <div className="punt-fields">
                                    <input
                                        type="text"
                                        placeholder="Nom del punt"
                                        value={punt.nom}
                                        onChange={(e) =>
                                            handlePuntChange(index, 'nom', e.target.value)
                                        }
                                    />
                                    <input
                                        type="text"
                                        placeholder="Descripció"
                                        value={punt.descripcio}
                                        onChange={(e) =>
                                            handlePuntChange(index, 'descripcio', e.target.value)
                                        }
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemovePunt(index)}
                                    className="btn-remove"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
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

export default LlocModal;