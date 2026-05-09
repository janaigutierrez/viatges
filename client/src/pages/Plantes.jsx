import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPlantes, deletePlanta } from '../services/api';
import PlantaCard from '../components/public/PlantaCard';
import PlantaModal from '../components/admin/PlantaModal';
import SeccioDescripcio from '../components/public/SeccioDescripcio';
import toast from 'react-hot-toast';
import './Plantes.css';

// Categories principals
const CATEGORIES = [
    { valor: null, label: 'Todas' },
    { valor: 'planta', label: 'Plantas' },
    { valor: 'crases-suculentes', label: 'Crasas y suculentas' },
    { valor: 'cactus', label: 'Cactus' },
];

const UBICACIONS = [
    { valor: null, label: 'Todas' },
    { valor: 'interior', label: 'Interior' },
    { valor: 'exterior', label: 'Exterior' },
];

const Plantes = () => {
    const { isAuthenticated } = useAuth();
    const [plantes, setPlantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedPlanta, setSelectedPlanta] = useState(null);
    const [filtreEtiqueta, setFiltreEtiqueta] = useState(null);
    const [filtreUbicacio, setFiltreUbicacio] = useState(null);
    const [cercaText, setCercaText] = useState('');

    useEffect(() => {
        fetchPlantes();
    }, []);

    const fetchPlantes = async () => {
        try {
            const response = await getPlantes();
            setPlantes(response.data);
        } catch (error) {
            toast.error('Error al cargar las plantas');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const plantesFiltrades = useMemo(() => {
        let result = plantes;

        if (filtreEtiqueta) {
            result = result.filter((p) => p.etiqueta === filtreEtiqueta);
        }

        // Sub-filtre ubicació només té sentit per "planta" (interior/exterior)
        if (filtreEtiqueta === 'planta' && filtreUbicacio) {
            result = result.filter((p) => p.ubicacio === filtreUbicacio);
        }

        if (cercaText.trim()) {
            const cerca = cercaText.toLowerCase().trim();
            result = result.filter(
                (p) =>
                    p.nom.toLowerCase().includes(cerca) ||
                    (p.nomLlati && p.nomLlati.toLowerCase().includes(cerca)) ||
                    (p.descripcio && p.descripcio.toLowerCase().includes(cerca))
            );
        }

        return result;
    }, [plantes, filtreEtiqueta, filtreUbicacio, cercaText]);

    const handleCreate = () => {
        setSelectedPlanta(null);
        setShowModal(true);
    };

    const handleEdit = (planta) => {
        setSelectedPlanta(planta);
        setShowModal(true);
    };

    const handleDelete = async (planta) => {
        if (!window.confirm(`¿Seguro que quieres eliminar "${planta.nom}"?`)) return;
        try {
            await deletePlanta(planta.id);
            toast.success('Planta eliminada correctamente');
            fetchPlantes();
        } catch (error) {
            const message = error.response?.data?.error || 'Error al eliminar la planta';
            toast.error(message);
        }
    };

    const handleModalClose = (refresh) => {
        setShowModal(false);
        setSelectedPlanta(null);
        if (refresh) fetchPlantes();
    };

    const handleCategoria = (valor) => {
        setFiltreEtiqueta(valor);
        // Reset sub-filtre si no estem a "planta"
        if (valor !== 'planta') setFiltreUbicacio(null);
    };

    if (loading) {
        return <div className="loading-container"><p>Cargando...</p></div>;
    }

    return (
        <div className="plantes-page">
            <div className="plantes-header">
                <div className="plantes-header-texture"></div>
                <div className="plantes-header-content">
                    <Link to="/" className="breadcrumb">← Todos los rincones</Link>
                    <h1>Plantas</h1>
                    <p>Cría, hibridación y curas de plantas</p>
                </div>
            </div>

            <div className="plantes-content">
                <SeccioDescripcio
                    slug="plantes"
                    accentColor="#48734c"
                    placeholder="Describe esta sección de plantas..."
                />

                <div className="plantes-content-header">
                    <h2>Colección</h2>
                    <div className="plantes-content-actions">
                        <Link to="/plantes/horticultura" className="btn-horticultura">
                            📔 Horticultura
                        </Link>
                        {isAuthenticated && (
                            <button onClick={handleCreate} className="btn-create">
                                + Añadir planta
                            </button>
                        )}
                    </div>
                </div>

                <div className="plantes-toolbar">
                    <div className="plantes-filters">
                        {CATEGORIES.map((et) => (
                            <button
                                key={et.label}
                                className={`filter-btn ${filtreEtiqueta === et.valor ? 'active' : ''}`}
                                onClick={() => handleCategoria(et.valor)}
                            >
                                {et.label}
                            </button>
                        ))}
                    </div>
                    <div className="plantes-search">
                        <input
                            type="text"
                            placeholder="Buscar planta..."
                            value={cercaText}
                            onChange={(e) => setCercaText(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>

                {/* Sub-filtre interior/exterior només quan l'usuari ha triat "Plantas" */}
                {filtreEtiqueta === 'planta' && (
                    <div className="plantes-subfilters">
                        <span className="subfilter-label">Ubicación:</span>
                        {UBICACIONS.map((u) => (
                            <button
                                key={u.label}
                                className={`subfilter-btn ${filtreUbicacio === u.valor ? 'active' : ''}`}
                                onClick={() => setFiltreUbicacio(u.valor)}
                            >
                                {u.label}
                            </button>
                        ))}
                    </div>
                )}

                {plantesFiltrades.length === 0 ? (
                    <div className="empty-state">
                        <p>
                            {plantes.length === 0
                                ? `Aún no hay plantas.${isAuthenticated ? ' ¡Añade la primera!' : ''}`
                                : 'Ninguna planta coincide con los filtros.'}
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

            {showModal && (
                <PlantaModal
                    planta={selectedPlanta}
                    onClose={handleModalClose}
                />
            )}
        </div>
    );
};

export default Plantes;
