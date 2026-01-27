import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRegions, deleteRegio } from '../services/api';
import Hero from '../components/public/Hero';
import RegionCard from '../components/public/RegionCard';
import RegioModal from '../components/admin/RegioModal';
import toast from 'react-hot-toast';
import './Home.css';

const Home = () => {
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
            toast.error('Error carregant les regions');
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
        if (!window.confirm(`Segur que vols eliminar "${regio.nom}"?`)) {
            return;
        }

        try {
            await deleteRegio(regio.id);
            toast.success('Regió eliminada correctament');
            fetchRegions();
        } catch (error) {
            const message = error.response?.data?.error || 'Error eliminant la regió';
            toast.error(message);
        }
    };

    const handleModalClose = (refresh) => {
        setShowModal(false);
        setSelectedRegio(null);
        if (refresh) {
            fetchRegions();
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <p>Carregant...</p>
            </div>
        );
    }

    return (
        <div className="home">
            <Hero />

            <div className="home-content">
                <div className="home-header">
                    <h2>Regions d'Espanya</h2>
                    {isAuthenticated && (
                        <button onClick={handleCreate} className="btn-create">
                            + Afegir Regió
                        </button>
                    )}
                </div>

                {regions.length === 0 ? (
                    <div className="empty-state">
                        <p>Encara no hi ha regions. {isAuthenticated && 'Afegeix la primera!'}</p>
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

export default Home;