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
            toast.error('Error carregant les dades');
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
        if (!window.confirm(`Segur que vols eliminar "${lloc.nom}"?`)) {
            return;
        }

        try {
            await deleteLloc(lloc.id);
            toast.success('Lloc eliminat correctament');
            fetchData();
        } catch (error) {
            const message = error.response?.data?.error || 'Error eliminant el lloc';
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
                <p>Carregant...</p>
            </div>
        );
    }

    if (!regio) {
        return (
            <div className="error-container">
                <h2>Regió no trobada</h2>
                <Link to="/viatges" className="btn-back">Tornar a viatges</Link>
            </div>
        );
    }

    return (
        <div className="region-page">
            <div className="region-header">
                <div className="region-header-content">
                    <Link to="/viatges" className="breadcrumb">← Tornar a regions</Link>
                    <h1>{regio.nom}</h1>
                </div>
            </div>

            <div className="region-content">
                <div className="region-content-header">
                    <h2>Llocs per visitar</h2>
                    {isAuthenticated && (
                        <button onClick={handleCreate} className="btn-create">
                            + Afegir Lloc
                        </button>
                    )}
                </div>

                {llocs.length === 0 ? (
                    <div className="empty-state">
                        <p>Encara no hi ha llocs a aquesta regió. {isAuthenticated && 'Afegeix el primer!'}</p>
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