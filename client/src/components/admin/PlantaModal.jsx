import { useState, useEffect } from 'react';
import { createPlanta, updatePlanta } from '../../services/api';
import toast from 'react-hot-toast';
import './Modal.css';

const ETIQUETES = [
    { valor: 'planta', label: 'Planta' },
    { valor: 'crases-suculentes', label: 'Crasa o suculenta' },
    { valor: 'cactus', label: 'Cactus' },
];

const UBICACIONS = [
    { valor: '', label: '— Sin especificar —' },
    { valor: 'interior', label: 'Interior' },
    { valor: 'exterior', label: 'Exterior' },
];

const PlantaModal = ({ planta, onClose }) => {
    const [formData, setFormData] = useState({
        nom: '',
        nomLlati: '',
        descripcio: '',
        etiqueta: 'planta',
        ubicacio: '',
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
                etiqueta: planta.etiqueta || 'planta',
                ubicacio: planta.ubicacio || '',
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
            toast.error('El nombre es obligatorio');
            return;
        }

        setLoading(true);

        try {
            const data = new FormData();
            data.append('nom', formData.nom);
            data.append('nomLlati', formData.nomLlati);
            data.append('descripcio', formData.descripcio);
            data.append('etiqueta', formData.etiqueta);
            data.append('ubicacio', formData.ubicacio);
            data.append('ordre', formData.ordre);

            if (imatgePortada) {
                data.append('imatgePortada', imatgePortada);
            }

            if (planta) {
                await updatePlanta(planta.id, data);
                toast.success('Planta actualizada correctamente');
            } else {
                await createPlanta(data);
                toast.success('Planta creada correctamente');
            }

            onClose(true);
        } catch (error) {
            const message = error.response?.data?.error || 'Error al guardar la planta';
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
                    <h2>{planta ? 'Editar planta' : 'Nueva planta'}</h2>
                    <button className="modal-close" onClick={() => onClose(false)}>
                        ✕
                    </button>
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
                            placeholder="Aloe Vera"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="nomLlati">Nombre latín</label>
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
                            placeholder="Descripción de la planta..."
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

export default PlantaModal;
