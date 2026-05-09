import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRegions, deleteRegio } from '../services/api';
import RegionCard from '../components/public/RegionCard';
import RegioModal from '../components/admin/RegioModal';
import SeccioDescripcio from '../components/public/SeccioDescripcio';
import toast from 'react-hot-toast';
import './Viatges.css';

const Viatges = () => {
    const { isAuthenticated } = useAuth();
    const [regions, setRegions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedRegio, setSelectedRegio] = useState(null);

    useEffect(() => {
        fetchRegions();
    }, []);

    const fetchRegions = async () => {
        try {
            const response = await getRegions();
            setRegions(response.data);
        } catch (error) {
            toast.error('Error al cargar las regiones');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedRegio(null);
        setShowModal(true);
    };

    const handleEdit = (regio) => {
        setSelectedRegio(regio);
        setShowModal(true);
    };

    const handleDelete = async (regio) => {
        if (!window.confirm(`¿Seguro que quieres eliminar "${regio.nom}"?`)) return;
        try {
            await deleteRegio(regio.id);
            toast.success('Región eliminada correctamente');
            fetchRegions();
        } catch (error) {
            const message = error.response?.data?.error || 'Error al eliminar la región';
            toast.error(message);
        }
    };

    const handleModalClose = (refresh) => {
        setShowModal(false);
        setSelectedRegio(null);
        if (refresh) fetchRegions();
    };

    if (loading) {
        return <div className="loading-container"><p>Cargando...</p></div>;
    }

    return (
        <div className="viatges-page">
            <div className="viatges-header">
                <div className="viatges-header-texture"></div>
                <div className="viatges-header-content">
                    <Link to="/" className="breadcrumb">← Todos los rincones</Link>
                    <h1>Viajes</h1>
                    <p>Regiones, pueblos y lugares de interés visitados</p>
                </div>
            </div>

            <div className="viatges-content">
                <SeccioDescripcio
                    slug="viatges"
                    accentColor="#4f6d7a"
                    placeholder="Describe esta sección de viajes..."
                />

                <div className="viatges-content-header">
                    <h2>Regiones</h2>
                    {isAuthenticated && (
                        <button onClick={handleCreate} className="btn-create">
                            + Añadir región
                        </button>
                    )}
                </div>

                {regions.length === 0 ? (
                    <div className="empty-state">
                        <p>Aún no hay regiones. {isAuthenticated && '¡Añade la primera!'}</p>
                    </div>
                ) : (
                    <div className="regions-grid">
                        {regions.map((regio) => (
                            <RegionCard
                                key={regio.id}
                                regio={regio}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <RegioModal
                    regio={selectedRegio}
                    onClose={handleModalClose}
                />
            )}
        </div>
    );
};

export default Viatges;
