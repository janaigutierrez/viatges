import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    getEntradesHorticultura,
    deleteEntradaHorticultura,
} from '../services/api';
import { getImageUrl } from '../utils/imageUrl';
import EntradaHorticulturaModal from '../components/admin/EntradaHorticulturaModal';
import SeccioDescripcio from '../components/public/SeccioDescripcio';
import toast from 'react-hot-toast';
import './Horticultura.css';

const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

const Horticultura = () => {
    const { isAuthenticated } = useAuth();
    const [entrades, setEntrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedEntrada, setSelectedEntrada] = useState(null);

    useEffect(() => {
        fetchEntrades();
    }, []);

    const fetchEntrades = async () => {
        try {
            const response = await getEntradesHorticultura();
            setEntrades(response.data);
        } catch (error) {
            toast.error('Error al cargar las entradas');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedEntrada(null);
        setShowModal(true);
    };

    const handleEdit = (entrada) => {
        setSelectedEntrada(entrada);
        setShowModal(true);
    };

    const handleDelete = async (entrada) => {
        if (!window.confirm(`¿Seguro que quieres eliminar "${entrada.titol}"?`)) return;
        try {
            await deleteEntradaHorticultura(entrada.id);
            toast.success('Entrada eliminada correctamente');
            fetchEntrades();
        } catch (error) {
            toast.error('Error al eliminar la entrada');
        }
    };

    const handleModalClose = (refresh) => {
        setShowModal(false);
        setSelectedEntrada(null);
        if (refresh) fetchEntrades();
    };

    if (loading) {
        return <div className="loading-container"><p>Cargando...</p></div>;
    }

    return (
        <div className="horticultura-page">
            <div className="horticultura-header">
                <div className="horticultura-header-texture"></div>
                <div className="horticultura-header-content">
                    <Link to="/plantes" className="breadcrumb">← Volver a plantas</Link>
                    <h1>📔 Horticultura</h1>
                    <p>Diario del huerto: procedimientos, pasos y aprendizajes</p>
                </div>
            </div>

            <div className="horticultura-content">
                <SeccioDescripcio
                    slug="horticultura"
                    accentColor="#7a5b3a"
                    placeholder="Describe el diario de horticultura..."
                />

                <div className="horticultura-content-header">
                    <h2>Entradas</h2>
                    {isAuthenticated && (
                        <button onClick={handleCreate} className="btn-create-horticultura">
                            + Nueva entrada
                        </button>
                    )}
                </div>

                {entrades.length === 0 ? (
                    <div className="empty-state">
                        <p>
                            Aún no hay entradas.
                            {isAuthenticated && ' ¡Empieza el diario!'}
                        </p>
                    </div>
                ) : (
                    <div className="horticultura-timeline">
                        {entrades.map((entrada) => (
                            <article key={entrada.id} className="entrada-row">
                                <div className="entrada-row-date">
                                    <span className="entrada-date">
                                        {formatDate(entrada.data)}
                                    </span>
                                </div>
                                <div className="entrada-row-card">
                                    <Link
                                        to={`/plantes/horticultura/${entrada.slug}`}
                                        className="entrada-row-link"
                                    >
                                        {entrada.imatgePortada && (
                                            <div className="entrada-row-image">
                                                <img
                                                    src={getImageUrl(entrada.imatgePortada)}
                                                    alt={entrada.titol}
                                                />
                                            </div>
                                        )}
                                        <div className="entrada-row-body">
                                            <h3>{entrada.titol}</h3>
                                            {entrada.descripcio && (
                                                <p>{entrada.descripcio}</p>
                                            )}
                                            <span className="entrada-row-cta">Leer entrada →</span>
                                        </div>
                                    </Link>
                                    {isAuthenticated && (
                                        <div className="entrada-row-actions">
                                            <button onClick={() => handleEdit(entrada)} className="btn-edit">
                                                Editar
                                            </button>
                                            <button onClick={() => handleDelete(entrada)} className="btn-delete">
                                                Eliminar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <EntradaHorticulturaModal
                    entrada={selectedEntrada}
                    onClose={handleModalClose}
                />
            )}
        </div>
    );
};

export default Horticultura;
