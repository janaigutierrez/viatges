import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPuntInteresBySlug, addImatgesGaleriaPunt, deleteImatgeGaleriaPunt } from '../services/api';
import PuntInteresModal from '../components/admin/PuntInteresModal';
import Lightbox from '../components/Lightbox';
import { getImageUrl, getThumbnailUrl } from '../utils/imageUrl';
import toast from 'react-hot-toast';
import './PuntInteres.css';

const PuntInteres = () => {
    const { regioSlug, llocSlug, puntSlug } = useParams();
    const { isAuthenticated } = useAuth();
    const [punt, setPunt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const [uploadingGaleria, setUploadingGaleria] = useState(false);

    useEffect(() => {
        fetchPunt();
    }, [regioSlug, llocSlug, puntSlug]);

    const fetchPunt = async () => {
        try {
            const response = await getPuntInteresBySlug(regioSlug, llocSlug, puntSlug);
            setPunt(response.data);
        } catch (error) {
            toast.error('Error carregant el punt d\'interès');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleModalClose = (refresh) => {
        setShowModal(false);
        if (refresh) fetchPunt();
    };

    const handleGaleriaUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        setUploadingGaleria(true);
        try {
            const formData = new FormData();
            files.forEach(file => formData.append('imatges', file));
            await addImatgesGaleriaPunt(punt.id, formData);
            toast.success(`${files.length} imatge${files.length > 1 ? 's' : ''} afegida${files.length > 1 ? 's' : ''}`);
            fetchPunt();
        } catch (error) {
            toast.error('Error pujant imatges');
        } finally {
            setUploadingGaleria(false);
            e.target.value = '';
        }
    };

    const handleDeleteImatge = async (imatgeUrl) => {
        if (!window.confirm('Eliminar aquesta imatge?')) return;
        try {
            await deleteImatgeGaleriaPunt(punt.id, imatgeUrl);
            toast.success('Imatge eliminada');
            fetchPunt();
        } catch (error) {
            toast.error('Error eliminant la imatge');
        }
    };

    const openLightbox = (index) => setLightboxIndex(index);
    const closeLightbox = () => setLightboxIndex(null);
    const prevImage = () => setLightboxIndex((i) => (i - 1 + punt.galeriaImatges.length) % punt.galeriaImatges.length);
    const nextImage = () => setLightboxIndex((i) => (i + 1) % punt.galeriaImatges.length);

    if (loading) {
        return <div className="loading-container"><p>Carregant...</p></div>;
    }

    if (!punt) {
        return (
            <div className="error-container">
                <h2>Punt d'interès no trobat</h2>
                <Link to={`/regio/${regioSlug}/${llocSlug}`} className="btn-back">
                    Tornar a {llocSlug}
                </Link>
            </div>
        );
    }

    return (
        <div className="punt-page">
            {/* Hero */}
            <div
                className="punt-hero"
                style={{ backgroundImage: `url(${getImageUrl(punt.imatgePortada)})` }}
            >
                <div className="punt-hero-overlay">
                    <div className="punt-hero-content">
                        <div className="punt-breadcrumb">
                            <Link to={`/regio/${regioSlug}`}>{punt.regio.nom}</Link>
                            <span> › </span>
                            <Link to={`/regio/${regioSlug}/${llocSlug}`}>{punt.lloc.nom}</Link>
                            <span> › </span>
                            <span>{punt.nom}</span>
                        </div>
                        <h1>{punt.nom}</h1>
                    </div>
                </div>
            </div>

            {/* Contingut */}
            <div className="punt-content">
                <div className="punt-content-header">
                    <h2>Sobre {punt.nom}</h2>
                    {isAuthenticated && (
                        <button onClick={() => setShowModal(true)} className="btn-edit-main">
                            ✏️ Editar
                        </button>
                    )}
                </div>

                {punt.descripcio && (
                    <div className="punt-section">
                        <p className="punt-description">{punt.descripcio}</p>
                    </div>
                )}

                {/* Galeria */}
                <div className="punt-section">
                    <div className="galeria-header">
                        <h3>Galeria{punt.galeriaImatges.length > 0 && ` (${punt.galeriaImatges.length})`}</h3>
                        {isAuthenticated && (
                            <label className="btn-upload-galeria">
                                {uploadingGaleria ? 'Pujant...' : '+ Afegir fotos'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleGaleriaUpload}
                                    disabled={uploadingGaleria}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        )}
                    </div>

                    {punt.galeriaImatges.length === 0 ? (
                        <p className="galeria-buida">Encara no hi ha fotos en aquest punt d'interès.</p>
                    ) : (
                        <div className="galeria-grid">
                            {punt.galeriaImatges.map((img, index) => (
                                <div key={index} className="galeria-item">
                                    <img
                                        src={getThumbnailUrl(img)}
                                        alt={`${punt.nom} ${index + 1}`}
                                        loading="lazy"
                                        onClick={() => openLightbox(index)}
                                    />
                                    {isAuthenticated && (
                                        <button
                                            className="galeria-delete-btn"
                                            onClick={() => handleDeleteImatge(img)}
                                            title="Eliminar imatge"
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
                <PuntInteresModal
                    punt={punt}
                    llocId={punt.lloc.id}
                    regioId={punt.regio.id}
                    onClose={handleModalClose}
                />
            )}

            {lightboxIndex !== null && (
                <Lightbox
                    imatges={punt.galeriaImatges}
                    indexActiu={lightboxIndex}
                    onClose={closeLightbox}
                    onPrev={prevImage}
                    onNext={nextImage}
                />
            )}
        </div>
    );
};

export default PuntInteres;
