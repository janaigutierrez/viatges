import { useState, useEffect } from 'react';
import { createEntradaHorticultura, updateEntradaHorticultura } from '../../services/api';
import toast from 'react-hot-toast';
import './Modal.css';

const formatDateForInput = (date) => {
    if (!date) return new Date().toISOString().slice(0, 10);
    const d = new Date(date);
    return d.toISOString().slice(0, 10);
};

const EntradaHorticulturaModal = ({ entrada, onClose }) => {
    const [formData, setFormData] = useState({
        titol: '',
        slug: '',
        data: formatDateForInput(),
        descripcio: '',
        cos: '',
    });
    const [imatgePortada, setImatgePortada] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (entrada) {
            setFormData({
                titol: entrada.titol,
                slug: entrada.slug,
                data: formatDateForInput(entrada.data),
                descripcio: entrada.descripcio || '',
                cos: entrada.cos || '',
            });
        }
    }, [entrada]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImatgePortada(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.titol || !formData.slug) {
            toast.error('Título y slug son obligatorios');
            return;
        }

        setLoading(true);

        try {
            const data = new FormData();
            data.append('titol', formData.titol);
            data.append('slug', formData.slug);
            data.append('data', formData.data);
            data.append('descripcio', formData.descripcio);
            data.append('cos', formData.cos);

            if (imatgePortada) {
                data.append('imatgePortada', imatgePortada);
            }

            if (entrada) {
                await updateEntradaHorticultura(entrada.id, data);
                toast.success('Entrada actualizada correctamente');
            } else {
                await createEntradaHorticultura(data);
                toast.success('Entrada creada correctamente');
            }

            onClose(true);
        } catch (error) {
            const message = error.response?.data?.error || 'Error al guardar la entrada';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={() => onClose(false)}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{entrada ? 'Editar entrada' : 'Nueva entrada de horticultura'}</h2>
                    <button className="modal-close" onClick={() => onClose(false)}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="titol">Título *</label>
                            <input
                                type="text"
                                id="titol"
                                name="titol"
                                value={formData.titol}
                                onChange={handleChange}
                                placeholder="Plantación de tomates"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="data">Fecha *</label>
                            <input
                                type="date"
                                id="data"
                                name="data"
                                value={formData.data}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="slug">Slug * (URL amigable)</label>
                        <input
                            type="text"
                            id="slug"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            placeholder="plantacion-tomates-2026"
                            required
                        />
                        <small>Solo letras, números y guiones. Ejemplo: "plantacion-tomates-2026"</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="descripcio">Resumen breve</label>
                        <input
                            type="text"
                            id="descripcio"
                            name="descripcio"
                            value={formData.descripcio}
                            onChange={handleChange}
                            placeholder="Una frase para resumir esta entrada"
                        />
                        <small>Aparece en el listado, debajo del título.</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="cos">Cuerpo del texto</label>
                        <textarea
                            id="cos"
                            name="cos"
                            value={formData.cos}
                            onChange={handleChange}
                            placeholder="Cuenta aquí cómo fue, paso a paso..."
                            rows="14"
                        />
                        <small>Texto largo. Las imágenes se gestionan desde la página de la entrada después de crearla.</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="imatgePortada">Imagen de portada</label>
                        <input
                            type="file"
                            id="imatgePortada"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        {entrada?.imatgePortada && !imatgePortada && (
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

export default EntradaHorticulturaModal;
