import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRegioBySlug, getLlocs, deleteLloc } from '../services/api';
import LlocCard from '../components/public/LlocCard';
import LlocModal from '../components/admin/LlocModal';
import toast from 'react-hot-toast';
import './Region.css';

const Region = () => {
    const { regioSlug } = useParams();
    const { isAuthenticated } = useAuth();
    const [regio, setRegio] = useState(null);
    const [llocs, setLlocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedLloc, setSelectedLloc] = useState(null);

    useEffect(() => {
        fetchData();
    }, [regioSlug]);

    const fetchData = async () => {
        try {
            const [regioRes, llocsRes] = await Promise.all([
                getRegioBySlug(regioSlug),
                getLlocs(),
            ]);

            setRegio(regioRes.data);

            // Filtrar llocs d'aquesta regió
            const llocsFiltered = llocsRes.data.filter(
                (lloc) => lloc.regio.id === regioRes.data.id
            );
            setLlocs(llocsFiltered);
        } catch (error) {
            toast.error('Error al cargar los datos');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedLloc(null);
        setShowModal(true);
    };

    const handleEdit = (lloc) => {
        setSelectedLloc(lloc);
        setShowModal(true);
    };

    const handleDelete = async (lloc) => {
        if (!window.confirm(`¿Seguro que quieres eliminar "${lloc.nom}"?`)) {
            return;
        }

        try {
            await deleteLloc(lloc.id);
            toast.success('Lugar eliminado correctamente');
            fetchData();
        } catch (error) {
            const message = error.response?.data?.error || 'Error al eliminar el lugar';
            toast.error(message);
        }
    };

    const handleModalClose = (refresh) => {
        setShowModal(false);
        setSelectedLloc(null);
        if (refresh) {
            fetchData();
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <p>Cargando...</p>
            </div>
        );
    }

    if (!regio) {
        return (
            <div className="error-container">
                <h2>Región no encontrada</h2>
                <Link to="/viatges" className="btn-back">Volver a viajes</Link>
            </div>
        );
    }

    return (
        <div className="region-page">
            <div className="region-header">
                <div className="region-header-content">
                    <Link to="/viatges" className="breadcrumb">← Volver a regiones</Link>
                    <h1>{regio.nom}</h1>
                </div>
            </div>

            <div className="region-content">
                <div className="region-content-header">
                    <h2>Lugares para visitar</h2>
                    {isAuthenticated && (
                        <button onClick={handleCreate} className="btn-create">
                            + Añadir lugar
                        </button>
                    )}
                </div>

                {llocs.length === 0 ? (
                    <div className="empty-state">
                        <p>Aún no hay lugares en esta región. {isAuthenticated && '¡Añade el primero!'}</p>
                    </div>
                ) : (
                    <div className="llocs-grid">
                        {llocs.map((lloc) => (
                            <LlocCard
                                key={lloc.id}
                                lloc={lloc}
                                regioSlug={regioSlug}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <LlocModal
                    lloc={selectedLloc}
                    regioId={regio.id}
                    onClose={handleModalClose}
                />
            )}
        </div>
    );
};

export default Region;