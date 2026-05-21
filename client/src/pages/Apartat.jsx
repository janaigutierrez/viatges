import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    getApartatBySlug,
    addImatgesGaleriaApartat,
    deleteImatgeGaleriaApartat,
} from '../services/api';
import ApartatModal from '../components/admin/ApartatModal';
import SeccioDescripcio from '../components/public/SeccioDescripcio';
import Lightbox from '../components/Lightbox';
import { getImageUrl, getThumbnailUrl } from '../utils/imageUrl';
import toast from 'react-hot-toast';
import './Apartat.css';

const Apartat = () => {
    const { regioSlug, llocSlug, puntSlug, apartatSlug } = useParams();
    const { isAuthenticated } = useAuth();
    const [apartat, setApartat] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchApartat();
    }, [regioSlug, llocSlug, puntSlug, apartatSlug]);

    const fetchApartat = async () => {
        try {
            const response = await getApartatBySlug(regioSlug, llocSlug, puntSlug, apartatSlug);
            setApartat(response.data);
        } catch (error) {
            toast.error('Error al cargar el apartado');
        } finally {
            setLoading(false);
        }
    };

    const handleModalClose = (refresh) => {
        setShowModal(false);
        if (refresh) fetchApartat();
    };

    const handleGaleriaUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        setUploading(true);
        try {
            const formData = new FormData();
            files.forEach((file) => formData.append('imatges', file));
            await addImatgesGaleriaApartat(apartat.id, formData);
            toast.success('Imágenes añadidas');
            fetchApartat();
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
            await deleteImatgeGaleriaApartat(apartat.id, imatgeUrl);
            toast.success('Imagen eliminada');
            fetchApartat();
        } catch (error) {
            toast.error('Error al eliminar la imagen');
        }
    };

    if (loading) {
        return <div className="loading-container"><p>Cargando...</p></div>;
    }

    if (!apartat) {
        return (
            <div className="error-container">
                <h2>Apartado no encontrado</h2>
                <Link to={`/viatges/regio/${regioSlug}/${llocSlug}/${puntSlug}`} className="btn-back">
                    Volver
                </Link>
            </div>
        );
    }

    const galeria = apartat.galeriaImatges || [];

    return (
        <div className="apartat-page">
            <div
                className="apartat-hero"
                style={
                    apartat.imatgePortada
                        ? { backgroundImage: `url(${getImageUrl(apartat.imatgePortada)})` }
                        : { background: 'linear-gradient(135deg, #4f6d7a 0%, #6b8f9e 100%)' }
                }
            >
                <div className="apartat-hero-overlay">
                    <div className="apartat-hero-content">
                        <div className="apartat-breadcrumb">
                            <Link to={`/viatges/regio/${regioSlug}`}>{apartat.regio.nom}</Link>
                            <span> › </span>
                            <Link to={`/viatges/regio/${regioSlug}/${llocSlug}`}>{apartat.lloc.nom}</Link>
                            <span> › </span>
                            <Link to={`/viatges/regio/${regioSlug}/${llocSlug}/${puntSlug}`}>{apartat.puntInteres.nom}</Link>
                            <span> › </span>
                            <span>{apartat.nom}</span>
                        </div>
                        <h1>{apartat.nom}</h1>
                    </div>
                </div>
            </div>

            <div className="apartat-content">
                {isAuthenticated && (
                    <div className="apartat-admin-bar">
                        <button onClick={() => setShowModal(true)} className="btn-edit-main">
                            Editar apartado
                        </button>
                    </div>
                )}

                <SeccioDescripcio
                    slug={`viatges-apartat-${regioSlug}-${llocSlug}-${puntSlug}-${apartatSlug}`}
                    accentColor="#4f6d7a"
                    placeholder="Añade aquí información sobre este apartado..."
                />

                {apartat.descripcio && (
                    <div className="apartat-section">
                        <p className="apartat-description">{apartat.descripcio}</p>
                    </div>
                )}

                <div className="apartat-section">
                    <div className="galeria-header">
                        <h3>Galería{galeria.length > 0 && ` (${galeria.length})`}</h3>
                        {isAuthenticated && (
                            <label className="btn-upload-galeria">
                                {uploading ? 'Subiendo...' : '+ Añadir fotos'}
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

                    {galeria.length === 0 ? (
                        <p className="galeria-buida">Aún no hay fotos en este apartado.</p>
                    ) : (
                        <div className="galeria-grid">
                            {galeria.map((img, index) => (
                                <div key={index} className="galeria-item">
                                    <img
                                        src={getThumbnailUrl(img)}
                                        alt={`${apartat.nom} ${index + 1}`}
                                        loading="lazy"
                                        onClick={() => setLightboxIndex(index)}
                                    />
                                    {isAuthenticated && (
                                        <button
                                            className="galeria-delete-btn"
                                            onClick={() => handleDeleteImage(img)}
                                            title="Eliminar imagen"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <ApartatModal
                    apartat={apartat}
                    puntInteresId={apartat.puntInteres.id}
                    onClose={handleModalClose}
                />
            )}

            {lightboxIndex !== null && galeria.length > 0 && (
                <Lightbox
                    imatges={galeria}
                    indexActiu={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                    onPrev={() =>
                        setLightboxIndex((i) => (i - 1 + galeria.length) % galeria.length)
                    }
                    onNext={() => setLightboxIndex((i) => (i + 1) % galeria.length)}
                />
            )}
        </div>
    );
};

export default Apartat;
