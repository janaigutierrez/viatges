import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    getFamiliaBySlug,
    getPlantes,
    deletePlanta,
} from '../services/api';
import PlantaCard from '../components/public/PlantaCard';
import PlantaModal from '../components/admin/PlantaModal';
import FamiliaModal from '../components/admin/FamiliaModal';
import { getImageUrl } from '../utils/imageUrl';
import toast from 'react-hot-toast';
import './FamiliaPlantes.css';

const ETIQUETA_LABELS = {
    planta: 'Plantas',
    'crases-suculentes': 'Crasas y suculentas',
    cactus: 'Cactus',
};

const FamiliaPlantes = () => {
    const { familiaSlug } = useParams();
    const { isAuthenticated } = useAuth();
    const [familia, setFamilia] = useState(null);
    const [plantes, setPlantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPlantaModal, setShowPlantaModal] = useState(false);
    const [showFamiliaModal, setShowFamiliaModal] = useState(false);
    const [selectedPlanta, setSelectedPlanta] = useState(null);
    const [cercaText, setCercaText] = useState('');

    useEffect(() => {
        fetchData();
    }, [familiaSlug]);

    const fetchData = async () => {
        try {
            const familiaRes = await getFamiliaBySlug(familiaSlug);
            setFamilia(familiaRes.data);
            const plantesRes = await getPlantes({ familia: familiaRes.data.id });
            setPlantes(plantesRes.data);
        } catch (error) {
            toast.error('Error al cargar la familia');
        } finally {
            setLoading(false);
        }
    };

    const plantesFiltrades = useMemo(() => {
        if (!cercaText.trim()) return plantes;
        const cerca = cercaText.toLowerCase().trim();
        return plantes.filter(
            (p) =>
                p.nom.toLowerCase().includes(cerca) ||
                (p.nomLlati && p.nomLlati.toLowerCase().includes(cerca)) ||
                (p.descripcio && p.descripcio.toLowerCase().includes(cerca))
        );
    }, [plantes, cercaText]);

    const handleCreate = () => {
        setSelectedPlanta(null);
        setShowPlantaModal(true);
    };

    const handleEdit = (planta) => {
        setSelectedPlanta(planta);
        setShowPlantaModal(true);
    };

    const handleDelete = async (planta) => {
        if (!window.confirm(`¿Seguro que quieres eliminar "${planta.nom}"?`)) return;
        try {
            await deletePlanta(planta.id);
            toast.success('Planta eliminada correctamente');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error al eliminar la planta');
        }
    };

    const handlePlantaModalClose = (refresh) => {
        setShowPlantaModal(false);
        setSelectedPlanta(null);
        if (refresh) fetchData();
    };

    const handleFamiliaModalClose = (refresh) => {
        setShowFamiliaModal(false);
        if (refresh) fetchData();
    };

    if (loading) {
        return <div className="loading-container"><p>Cargando...</p></div>;
    }

    if (!familia) {
        return (
            <div className="error-container">
                <h2>Familia no encontrada</h2>
                <Link to="/plantes" className="btn-back">Volver a plantas</Link>
            </div>
        );
    }

    return (
        <div className="familia-page">
            <div
                className="familia-hero"
                style={
                    familia.imatgePortada
                        ? { backgroundImage: `url(${getImageUrl(familia.imatgePortada)})` }
                        : { background: 'linear-gradient(135deg, #48734c 0%, #6a9b6e 100%)' }
                }
            >
                <div className="familia-hero-overlay">
                    <div className="familia-hero-content">
                        <Link to="/plantes" className="breadcrumb">← Volver a plantas</Link>
                        <span className="familia-hero-tag">
                            {ETIQUETA_LABELS[familia.etiqueta]}
                            {familia.ubicacio && ` · ${familia.ubicacio === 'interior' ? 'Interior' : 'Exterior'}`}
                        </span>
                        <h1>{familia.nom}</h1>
                        {familia.descripcio && <p className="familia-hero-desc">{familia.descripcio}</p>}
                    </div>
                </div>
            </div>

            <div className="familia-content">
                {isAuthenticated && (
                    <div className="familia-admin-bar">
                        <button onClick={() => setShowFamiliaModal(true)} className="btn-edit-familia">
                            Editar familia
                        </button>
                    </div>
                )}

                <div className="familia-content-header">
                    <h2>Ejemplares</h2>
                    {isAuthenticated && (
                        <button onClick={handleCreate} className="btn-create">
                            + Añadir planta
                        </button>
                    )}
                </div>

                <div className="familia-toolbar">
                    <input
                        type="text"
                        placeholder="Buscar planta..."
                        value={cercaText}
                        onChange={(e) => setCercaText(e.target.value)}
                        className="search-input"
                    />
                </div>

                {plantesFiltrades.length === 0 ? (
                    <div className="empty-state">
                        <p>
                            {plantes.length === 0
                                ? `Aún no hay plantas en esta familia.${isAuthenticated ? ' ¡Añade la primera!' : ''}`
                                : 'Ninguna planta coincide con la búsqueda.'}
                        </p>
                    </div>
                ) : (
                    <div className="plantes-grid">
                        {plantesFiltrades.map((planta) => (
                            <PlantaCard
                                key={planta.id}
                                planta={planta}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

            {showPlantaModal && (
                <PlantaModal
                    planta={selectedPlanta}
                    familiaId={familia.id}
                    onClose={handlePlantaModalClose}
                />
            )}

            {showFamiliaModal && (
                <FamiliaModal
                    familia={familia}
                    onClose={handleFamiliaModalClose}
                />
            )}
        </div>
    );
};

export default FamiliaPlantes;
