import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPlantes, deletePlanta } from '../services/api';
import PlantaCard from '../components/public/PlantaCard';
import PlantaModal from '../components/admin/PlantaModal';
import toast from 'react-hot-toast';
import './Plantes.css';

const ETIQUETES = [
    { valor: null, label: 'Totes' },
    { valor: 'plantes', label: 'Plantes' },
    { valor: 'suculentes', label: 'Suculentes' },
    { valor: 'cactus', label: 'Cactus' },
    { valor: 'crases', label: 'Crases' },
];

const Plantes = () => {
    const { isAuthenticated } = useAuth();
    const [plantes, setPlantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedPlanta, setSelectedPlanta] = useState(null);
    const [filtreEtiqueta, setFiltreEtiqueta] = useState(null);
    const [cercaText, setCercaText] = useState('');

    useEffect(() => {
        fetchPlantes();
    }, []);

    const fetchPlantes = async () => {
        try {
            const response = await getPlantes();
            setPlantes(response.data);
        } catch (error) {
            toast.error('Error carregant les plantes');
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
    }, [plantes, filtreEtiqueta, cercaText]);

    const handleCreate = () => {
        setSelectedPlanta(null);
        setShowModal(true);
    };

    const handleEdit = (planta) => {
        setSelectedPlanta(planta);
        setShowModal(true);
    };

    const handleDelete = async (planta) => {
        if (!window.confirm(`Segur que vols eliminar "${planta.nom}"?`)) return;
        try {
            await deletePlanta(planta.id);
            toast.success('Planta eliminada correctament');
            fetchPlantes();
        } catch (error) {
            const message = error.response?.data?.error || 'Error eliminant la planta';
            toast.error(message);
        }
    };

    const handleModalClose = (refresh) => {
        setShowModal(false);
        setSelectedPlanta(null);
        if (refresh) fetchPlantes();
    };

    if (loading) {
        return <div className="loading-container"><p>Carregant...</p></div>;
    }

    return (
        <div className="plantes-page">
            <div className="plantes-header">
                <div className="plantes-header-content">
                    <Link to="/" className="breadcrumb">← Tots els racons</Link>
                    <h1>🌿 Plantes</h1>
                    <p>Cria, hibridació i cuidado de plantes</p>
                </div>
            </div>

            <div className="plantes-content">
                <div className="plantes-content-header">
                    <h2>Col·lecció</h2>
                    {isAuthenticated && (
                        <button onClick={handleCreate} className="btn-create">
                            + Afegir Planta
                        </button>
                    )}
                </div>

                <div className="plantes-toolbar">
                    <div className="plantes-filters">
                        {ETIQUETES.map((et) => (
                            <button
                                key={et.label}
                                className={`filter-btn ${filtreEtiqueta === et.valor ? 'active' : ''}`}
                                onClick={() => setFiltreEtiqueta(et.valor)}
                            >
                                {et.label}
                            </button>
                        ))}
                    </div>
                    <div className="plantes-search">
                        <input
                            type="text"
                            placeholder="Cercar planta..."
                            value={cercaText}
                            onChange={(e) => setCercaText(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>

                {plantesFiltrades.length === 0 ? (
                    <div className="empty-state">
                        <p>
                            {plantes.length === 0
                                ? `Encara no hi ha plantes.${isAuthenticated ? ' Afegeix la primera!' : ''}`
                                : 'Cap planta coincideix amb els filtres.'}
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
