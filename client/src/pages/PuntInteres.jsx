import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    getPuntInteresBySlug,
    addImatgesGaleriaPunt,
    deleteImatgeGaleriaPunt,
    getApartats,
    deleteApartat,
} from '../services/api';
import PuntInteresModal from '../components/admin/PuntInteresModal';
import ApartatModal from '../components/admin/ApartatModal';
import ApartatCard from '../components/public/ApartatCard';
import SeccioDescripcio from '../components/public/SeccioDescripcio';
import Lightbox from '../components/Lightbox';
import { getImageUrl, getThumbnailUrl } from '../utils/imageUrl';
import toast from 'react-hot-toast';
import './PuntInteres.css';

const PuntInteres = () => {
    const { regioSlug, llocSlug, puntSlug } = useParams();
    const { isAuthenticated } = useAuth();
    const [punt, setPunt] = useState(null);
    const [apartats, setApartats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showApartatModal, setShowApartatModal] = useState(false);
    const [selectedApartat, setSelectedApartat] = useState(null);
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const [uploadingGaleria, setUploadingGaleria] = useState(false);

    useEffect(() => {
        fetchData();
    }, [regioSlug, llocSlug, puntSlug]);

    const fetchData = async () => {
        try {
            const response = await getPuntInteresBySlug(regioSlug, llocSlug, puntSlug);
            setPunt(response.data);
            const apartatsRes = await getApartats(response.data.id);
            setApartats(apartatsRes.data);
        } catch (error) {
            toast.error('Error al cargar el punto de interés');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleModalClose = (refresh) => {
        setShowModal(false);
        if (refresh) fetchData();
    };

    const handleCreateApartat = () => {
        setSelectedApartat(null);
        setShowApartatModal(true);
    };

    const handleEditApartat = (apartat) => {
        setSelectedApartat(apartat);
        setShowApartatModal(true);
    };

    const handleDeleteApartat = async (apartat) => {
        if (!window.confirm(`¿Seguro que quieres eliminar "${apartat.nom}"?`)) return;
        try {
            await deleteApartat(apartat.id);
            toast.success('Apartado eliminado');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error al eliminar el apartado');
        }
    };

    const handleApartatModalClose = (refresh) => {
        setShowApartatModal(false);
        setSelectedApartat(null);
        if (refresh) fetchData();
    };

    const handleGaleriaUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        setUploadingGaleria(true);
        try {
            const formData = new FormData();
            files.forEach(file => formData.append('imatges', file));
            await addImatgesGaleriaPunt(punt.id, formData);
            toast.success(`${files.length} imagen${files.length > 1 ? 'es' : ''} añadida${files.length > 1 ? 's' : ''}`);
            fetchData();
        } catch (error) {
            toast.error('Error al subir las imágenes');
        } finally {
            setUploadingGaleria(false);
            e.target.value = '';
        }
    };

    const handleDeleteImatge = async (imatgeUrl) => {
        if (!window.confirm('¿Eliminar esta imagen?')) return;
        try {
            await deleteImatgeGaleriaPunt(punt.id, imatgeUrl);
            toast.success('Imagen eliminada');
            fetchData();
        } catch (error) {
            toast.error('Error al eliminar la imagen');
        }
    };

    const openLightbox = (index) => setLightboxIndex(index);
    const closeLightbox = () => setLightboxIndex(null);
    const prevImage = () => setLightboxIndex((i) => (i - 1 + punt.galeriaImatges.length) % punt.galeriaImatges.length);
    const nextImage = () => setLightboxIndex((i) => (i + 1) % punt.galeriaImatges.length);

    if (loading) {
        return <div className="loading-container"><p>Cargando...</p></div>;
    }

    if (!punt) {
        return (
            <div className="error-container">
                <h2>Punto de interés no encontrado</h2>
                <Link to={`/viatges/regio/${regioSlug}/${llocSlug}`} className="btn-back">
                    Volver a {llocSlug}
                </Link>
            </div>
        );
    }

    return (
        <div className="punt-page">
            <div
                className="punt-hero"
                style={{ backgroundImage: `url(${getImageUrl(punt.imatgePortada)})` }}
            >
                <div className="punt-hero-overlay">
                    <div className="punt-hero-content">
                        <div className="punt-breadcrumb">
                            <Link to={`/viatges/regio/${regioSlug}`}>{punt.regio.nom}</Link>
                            <span> › </span>
                            <Link to={`/viatges/regio/${regioSlug}/${llocSlug}`}>{punt.lloc.nom}</Link>
                            <span> › </span>
                            <span>{punt.nom}</span>
                        </div>
                        <h1>{punt.nom}</h1>
                    </div>
                </div>
            </div>

            <div className="punt-content">
                <div className="punt-content-header">
                    <h2>Sobre {punt.nom}</h2>
                    {isAuthenticated && (
                        <button onClick={() => setShowModal(true)} className="btn-edit-main">
                            ✏️ Editar
                        </button>
                    )}
                </div>

                <SeccioDescripcio
                    slug={`viatges-punt-${regioSlug}-${llocSlug}-${puntSlug}`}
                    accentColor="#4f6d7a"
                    placeholder="Añade aquí información sobre este punto de interés..."
                />

                {punt.descripcio && (
                    <div className="punt-section">
                        <p className="punt-description">{punt.descripcio}</p>
                    </div>
                )}

                {/* Apartats (sub-nivell) */}
                <div className="punt-section">
                    <div className="section-title-row">
                        <h3>Apartados{apartats.length > 0 && ` (${apartats.length})`}</h3>
                        {isAuthenticated && (
                            <button onClick={handleCreateApartat} className="btn-add-section">
                                + Añadir apartado
                            </button>
                        )}
                    </div>

                    {apartats.length === 0 ? (
                        <p className="empty-section">
                            Aún no hay apartados.
                            {isAuthenticated && ' Añade uno para detallar zonas o aspectos diferentes.'}
                        </p>
                    ) : (
                        <div className="apartats-grid">
                            {apartats.map((apartat) => (
                                <ApartatCard
                                    key={apartat.id}
                                    apartat={apartat}
                                    regioSlug={regioSlug}
                                    llocSlug={llocSlug}
                                    puntSlug={puntSlug}
                                    onEdit={handleEditApartat}
                                    onDelete={handleDeleteApartat}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Galeria */}
                <div className="punt-section">
                    <div className="galeria-header">
                        <h3>Galería{punt.galeriaImatges.length > 0 && ` (${punt.galeriaImatges.length})`}</h3>
                        {isAuthenticated && (
                            <label className="btn-upload-galeria">
                                {uploadingGaleria ? 'Subiendo...' : '+ Añadir fotos'}
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
                        <p className="galeria-buida">Aún no hay fotos en este punto de interés.</p>
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
                <PuntInteresModal
                    punt={punt}
                    llocId={punt.lloc.id}
                    regioId={punt.regio.id}
                    onClose={handleModalClose}
                />
            )}

            {showApartatModal && (
                <ApartatModal
                    apartat={selectedApartat}
                    puntInteresId={punt.id}
                    onClose={handleApartatModalClose}
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
