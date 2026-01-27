// src/pages/Lloc.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getLlocBySlug } from '../services/api';
import LlocModal from '../components/admin/LlocModal';
import toast from 'react-hot-toast';
import './Lloc.css';

const Lloc = () => {
    const { regioSlug, llocSlug } = useParams();
    const { isAuthenticated } = useAuth();
    const [lloc, setLloc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchLloc();
    }, [regioSlug, llocSlug]);

    const fetchLloc = async () => {
        try {
            const response = await getLlocBySlug(regioSlug, llocSlug);
            setLloc(response.data);
        } catch (error) {
            toast.error('Error carregant el lloc');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setShowModal(true);
    };

    const handleModalClose = (refresh) => {
        setShowModal(false);
        if (refresh) {
            fetchLloc();
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <p>Carregant...</p>
            </div>
        );
    }

    if (!lloc) {
        return (
            <div className="error-container">
                <h2>Lloc no trobat</h2>
                <Link to={`/regio/${regioSlug}`} className="btn-back">
                    Tornar a {regioSlug}
                </Link>
            </div>
        );
    }

    const imageUrl = lloc.imatgePortada
        ? `http://localhost:5000${lloc.imatgePortada}`
        : 'https://via.placeholder.com/1200x400?text=Sense+Imatge';

    return (
        <div className="lloc-page">
            {/* Hero amb imatge */}
            <div className="lloc-hero" style={{ backgroundImage: `url(${imageUrl})` }}>
                <div className="lloc-hero-overlay">
                    <div className="lloc-hero-content">
                        <Link to={`/regio/${regioSlug}`} className="breadcrumb">
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
                        <button onClick={handleEdit} className="btn-edit-main">
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
                {lloc.puntsInteres && lloc.puntsInteres.length > 0 && (
                    <div className="lloc-section">
                        <h3>Punts d'interès</h3>
                        <div className="punts-grid">
                            {lloc.puntsInteres.map((punt, index) => (
                                <div key={index} className="punt-card">
                                    <h4>📍 {punt.nom}</h4>
                                    {punt.descripcio && <p>{punt.descripcio}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Galeria d'imatges */}
                {lloc.galeriaImatges && lloc.galeriaImatges.length > 0 && (
                    <div className="lloc-section">
                        <h3>Galeria</h3>
                        <div className="galeria-grid">
                            {lloc.galeriaImatges.map((img, index) => (
                                <div key={index} className="galeria-item">
                                    <img
                                        src={`http://localhost:5000${img}`}
                                        alt={`${lloc.nom} ${index + 1}`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {showModal && (
                <LlocModal
                    lloc={lloc}
                    regioId={lloc.regio.id}
                    onClose={handleModalClose}
                />
            )}
        </div>
    );
};

export default Lloc;