import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    getEntradaHorticulturaBySlug,
    addImatgesGaleriaHorticultura,
    deleteImatgeGaleriaHorticultura,
} from '../services/api';
import { getImageUrl, getThumbnailUrl } from '../utils/imageUrl';
import EntradaHorticulturaModal from '../components/admin/EntradaHorticulturaModal';
import Lightbox from '../components/Lightbox';
import toast from 'react-hot-toast';
import './EntradaHorticultura.css';

const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

const EntradaHorticulturaPage = () => {
    const { entradaSlug } = useParams();
    const { isAuthenticated } = useAuth();
    const [entrada, setEntrada] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchEntrada();
    }, [entradaSlug]);

    const fetchEntrada = async () => {
        try {
            const response = await getEntradaHorticulturaBySlug(entradaSlug);
            setEntrada(response.data);
        } catch (error) {
            toast.error('Error al cargar la entrada');
        } finally {
            setLoading(false);
        }
    };

    const handleModalClose = (refresh) => {
        setShowModal(false);
        if (refresh) fetchEntrada();
    };

    const handleGaleriaUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        setUploading(true);
        try {
            const formData = new FormData();
            files.forEach((file) => formData.append('imatges', file));
            await addImatgesGaleriaHorticultura(entrada.id, formData);
            toast.success('Imágenes añadidas');
            fetchEntrada();
        } catch (error) {
            toast.error('Error al subir las imágenes');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleDeleteImage = async (imatgeUrl) => {
        if (!window.confirm('¿Eliminar esta imagen?')) return;
        try {
            await deleteImatgeGaleriaHorticultura(entrada.id, imatgeUrl);
            toast.success('Imagen eliminada');
            fetchEntrada();
        } catch (error) {
            toast.error('Error al eliminar la imagen');
        }
    };

    if (loading) {
        return <div className="loading-container"><p>Cargando...</p></div>;
    }

    if (!entrada) {
        return (
            <div className="error-container">
                <p>Entrada no encontrada</p>
                <Link to="/plantes/horticultura" className="btn-back">Volver al diario</Link>
            </div>
        );
    }

    return (
        <div className="entrada-page">
            <div
                className="entrada-hero"
                style={
                    entrada.imatgePortada
                        ? { backgroundImage: `url(${getImageUrl(entrada.imatgePortada)})` }
                        : { background: 'linear-gradient(135deg, #7a5b3a 0%, #a8895e 100%)' }
                }
            >
                <div className="entrada-hero-overlay">
                    <div className="entrada-hero-content">
                        <Link to="/plantes/horticultura" className="breadcrumb">
                            ← Volver al diario
                        </Link>
                        <span className="entrada-hero-date">{formatDate(entrada.data)}</span>
                        <h1>{entrada.titol}</h1>
                        {entrada.descripcio && <p className="entrada-hero-desc">{entrada.descripcio}</p>}
                    </div>
                </div>
            </div>

            <div className="entrada-content">
                {isAuthenticated && (
                    <div className="entrada-admin-bar">
                        <button onClick={() => setShowModal(true)} className="btn-edit-main">
                            Editar entrada
                        </button>
                    </div>
                )}

                {entrada.cos && (
                    <article className="entrada-cos">
                        {entrada.cos.split('\n\n').map((paragraf, i) => (
                            <p key={i}>{paragraf}</p>
                        ))}
                    </article>
                )}

                <div className="entrada-galeria">
                    <div className="galeria-header">
                        <h3>Galería</h3>
                        {isAuthenticated && (
                            <label className="btn-upload-galeria">
                                {uploading ? 'Subiendo...' : '+ Añadir imágenes'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleGaleriaUpload}
                                    disabled={uploading}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        )}
                    </div>

                    {entrada.galeriaImatges && entrada.galeriaImatges.length > 0 ? (
                        <div className="galeria-grid">
                            {entrada.galeriaImatges.map((url, idx) => (
                                <div key={url} className="galeria-item">
                                    <img
                                        src={getThumbnailUrl(url)}
                                        alt={`Imagen ${idx + 1}`}
                                        onClick={() => setLightboxIndex(idx)}
                                    />
                                    {isAuthenticated && (
                                        <button
                                            className="galeria-delete-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteImage(url);
                                            }}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="empty-section">Sin imágenes todavía.</p>
                    )}
                </div>
            </div>

            {lightboxIndex !== null && entrada.galeriaImatges.length > 0 && (
                <Lightbox
                    imatges={entrada.galeriaImatges}
                    indexActiu={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                    onNext={() => setLightboxIndex((i) => (i + 1) % entrada.galeriaImatges.length)}
                    onPrev={() =>
                        setLightboxIndex(
                            (i) => (i - 1 + entrada.galeriaImatges.length) % entrada.galeriaImatges.length
                        )
                    }
                />
            )}

            {showModal && (
                <EntradaHorticulturaModal
                    entrada={entrada}
                    onClose={handleModalClose}
                />
            )}
        </div>
    );
};

export default EntradaHorticulturaPage;
