import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getLlocBySlug, getPuntsInteres, deletePuntInteres, addImatgesGaleria, deleteImatgeGaleria } from '../services/api';
import LlocModal from '../components/admin/LlocModal';
import PuntInteresModal from '../components/admin/PuntInteresModal';
import PuntInteresCard from '../components/public/PuntInteresCard';
import Lightbox from '../components/Lightbox';
import { getImageUrl, getThumbnailUrl } from '../utils/imageUrl';
import toast from 'react-hot-toast';
import './Lloc.css';

const Lloc = () => {
    const { regioSlug, llocSlug } = useParams();
    const { isAuthenticated } = useAuth();
    const [lloc, setLloc] = useState(null);
    const [punts, setPunts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showLlocModal, setShowLlocModal] = useState(false);
    const [showPuntModal, setShowPuntModal] = useState(false);
    const [selectedPunt, setSelectedPunt] = useState(null);
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const [uploadingGaleria, setUploadingGaleria] = useState(false);

    useEffect(() => {
        fetchData();
    }, [regioSlug, llocSlug]);

    const fetchData = async () => {
        try {
            const response = await getLlocBySlug(regioSlug, llocSlug);
            const llocData = response.data;
            setLloc(llocData);

            const puntsRes = await getPuntsInteres(llocData.id);
            setPunts(puntsRes.data);
        } catch (error) {
            toast.error('Error carregant el lloc');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLlocModalClose = (refresh) => {
        setShowLlocModal(false);
        if (refresh) fetchData();
    };

    const handleCreatePunt = () => {
        setSelectedPunt(null);
        setShowPuntModal(true);
    };

    const handleEditPunt = (punt) => {
        setSelectedPunt(punt);
        setShowPuntModal(true);
    };

    const handleDeletePunt = async (punt) => {
        if (!window.confirm(`Segur que vols eliminar "${punt.nom}"?`)) return;
        try {
            await deletePuntInteres(punt.id);
            toast.success('Punt d\'interès eliminat');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error eliminant el punt');
        }
    };

    const handlePuntModalClose = (refresh) => {
        setShowPuntModal(false);
        setSelectedPunt(null);
        if (refresh) fetchData();
    };

    const handleGaleriaUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        setUploadingGaleria(true);
        try {
            const formData = new FormData();
            files.forEach(file => formData.append('imatges', file));
            await addImatgesGaleria(lloc.id, formData);
            toast.success(`${files.length} imatge${files.length > 1 ? 's' : ''} afegida${files.length > 1 ? 's' : ''}`);
            fetchData();
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
            await deleteImatgeGaleria(lloc.id, imatgeUrl);
            toast.success('Imatge eliminada');
            fetchData();
        } catch (error) {
            toast.error('Error eliminant la imatge');
        }
    };

    const openLightbox = (index) => setLightboxIndex(index);
    const closeLightbox = () => setLightboxIndex(null);
    const prevImage = () => setLightboxIndex((i) => (i - 1 + lloc.galeriaImatges.length) % lloc.galeriaImatges.length);
    const nextImage = () => setLightboxIndex((i) => (i + 1) % lloc.galeriaImatges.length);

    if (loading) {
        return <div className="loading-container"><p>Carregant...</p></div>;
    }

    if (!lloc) {
        return (
            <div className="error-container">
                <h2>Lloc no trobat</h2>
                <Link to={`/viatges/regio/${regioSlug}`} className="btn-back">
                    Tornar a {regioSlug}
                </Link>
            </div>
        );
    }

    return (
        <div className="lloc-page">
            {/* Hero amb imatge */}
            <div className="lloc-hero" style={{ backgroundImage: `url(${getImageUrl(lloc.imatgePortada)})` }}>
                <div className="lloc-hero-overlay">
                    <div className="lloc-hero-content">
                        <Link to={`/viatges/regio/${regioSlug}`} className="breadcrumb">
                            ← Tornar a {lloc.regio.nom}
                        </Link>
                        <h1>{lloc.nom}</h1>
                    </div>
                </div>
            </div>

            {/* Contingut */}
            <div className="lloc-content">
                <div className="lloc-content-header">
                    <h2>Sobre {lloc.nom}</h2>
                    {isAuthenticated && (
                        <button onClick={() => setShowLlocModal(true)} className="btn-edit-main">
                            ✏️ Editar
                        </button>
                    )}
                </div>

                {/* Descripció */}
                {lloc.descripcio && (
                    <div className="lloc-section">
                        <p className="lloc-description">{lloc.descripcio}</p>
                    </div>
                )}

                {/* Punts d'interès */}
                <div className="lloc-section">
                    <div className="section-title-row">
                        <h3>Punts d'interès{punts.length > 0 && ` (${punts.length})`}</h3>
                        {isAuthenticated && (
                            <button onClick={handleCreatePunt} className="btn-add-section">
                                + Afegir punt
                            </button>
                        )}
                    </div>

                    {punts.length === 0 ? (
                        <p className="empty-section">
                            Encara no hi ha punts d'interès.
                            {isAuthenticated && ' Afegeix-ne el primer!'}
                        </p>
                    ) : (
                        <div className="punts-grid">
                            {punts.map((punt) => (
                                <PuntInteresCard
                                    key={punt.id}
                                    punt={punt}
                                    regioSlug={regioSlug}
                                    llocSlug={llocSlug}
                                    onEdit={handleEditPunt}
                                    onDelete={handleDeletePunt}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Galeria d'imatges del lloc */}
                <div className="lloc-section">
                    <div className="galeria-header">
                        <h3>Galeria{lloc.galeriaImatges.length > 0 && ` (${lloc.galeriaImatges.length})`}</h3>
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

                    {lloc.galeriaImatges.length === 0 ? (
                        <p className="empty-section">Encara no hi ha fotos en aquest lloc.</p>
                    ) : (
                        <div className="galeria-grid">
                            {lloc.galeriaImatges.map((img, index) => (
                                <div key={index} className="galeria-item">
                                    <img
                                        src={getThumbnailUrl(img)}
                                        alt={`${lloc.nom} ${index + 1}`}
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

            {showLlocModal && (
                <LlocModal
                    lloc={lloc}
                    regioId={lloc.regio.id}
                    onClose={handleLlocModalClose}
                />
            )}

            {showPuntModal && (
                <PuntInteresModal
                    punt={selectedPunt}
                    llocId={lloc.id}
                    regioId={lloc.regio.id}
                    onClose={handlePuntModalClose}
                />
            )}

            {lightboxIndex !== null && lloc.galeriaImatges.length > 0 && (
                <Lightbox
                    imatges={lloc.galeriaImatges}
                    indexActiu={lightboxIndex}
                    onClose={closeLightbox}
                    onPrev={prevImage}
                    onNext={nextImage}
                />
            )}
        </div>
    );
};

export default Lloc;
