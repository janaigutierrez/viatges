import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFamilies, deleteFamilia } from '../services/api';
import FamiliaCard from '../components/public/FamiliaCard';
import FamiliaModal from '../components/admin/FamiliaModal';
import SeccioDescripcio from '../components/public/SeccioDescripcio';
import toast from 'react-hot-toast';
import './Plantes.css';

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
    const [families, setFamilies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedFamilia, setSelectedFamilia] = useState(null);
    const [filtreEtiqueta, setFiltreEtiqueta] = useState(null);
    const [filtreUbicacio, setFiltreUbicacio] = useState(null);
    const [cercaText, setCercaText] = useState('');

    useEffect(() => {
        fetchFamilies();
    }, []);

    const fetchFamilies = async () => {
        try {
            const response = await getFamilies();
            setFamilies(response.data);
        } catch (error) {
            toast.error('Error al cargar las familias');
        } finally {
            setLoading(false);
        }
    };

    const familiesFiltrades = useMemo(() => {
        let result = families;

        if (filtreEtiqueta) {
            result = result.filter((f) => f.etiqueta === filtreEtiqueta);
        }

        if (filtreEtiqueta === 'planta' && filtreUbicacio) {
            result = result.filter((f) => f.ubicacio === filtreUbicacio);
        }

        if (cercaText.trim()) {
            const cerca = cercaText.toLowerCase().trim();
            result = result.filter(
                (f) =>
                    f.nom.toLowerCase().includes(cerca) ||
                    (f.descripcio && f.descripcio.toLowerCase().includes(cerca))
            );
        }

        return result;
    }, [families, filtreEtiqueta, filtreUbicacio, cercaText]);

    const handleCreate = () => {
        setSelectedFamilia(null);
        setShowModal(true);
    };

    const handleEdit = (familia) => {
        setSelectedFamilia(familia);
        setShowModal(true);
    };

    const handleDelete = async (familia) => {
        if (!window.confirm(`¿Seguro que quieres eliminar la familia "${familia.nom}"?`)) return;
        try {
            await deleteFamilia(familia.id);
            toast.success('Familia eliminada correctamente');
            fetchFamilies();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error al eliminar la familia');
        }
    };

    const handleModalClose = (refresh) => {
        setShowModal(false);
        setSelectedFamilia(null);
        if (refresh) fetchFamilies();
    };

    const handleCategoria = (valor) => {
        setFiltreEtiqueta(valor);
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
                    <h2>Familias</h2>
                    <div className="plantes-content-actions">
                        <Link to="/plantes/horticultura" className="btn-horticultura">
                            📔 Horticultura
                        </Link>
                        {isAuthenticated && (
                            <button onClick={handleCreate} className="btn-create">
                                + Añadir familia
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
                            placeholder="Buscar familia..."
                            value={cercaText}
                            onChange={(e) => setCercaText(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>

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

                {familiesFiltrades.length === 0 ? (
                    <div className="empty-state">
                        <p>
                            {families.length === 0
                                ? `Aún no hay familias.${isAuthenticated ? ' ¡Crea la primera!' : ''}`
                                : 'Ninguna familia coincide con los filtros.'}
                        </p>
                    </div>
                ) : (
                    <div className="plantes-grid">
                        {familiesFiltrades.map((familia) => (
                            <FamiliaCard
                                key={familia.id}
                                familia={familia}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <FamiliaModal
                    familia={selectedFamilia}
                    onClose={handleModalClose}
                />
            )}
        </div>
    );
};

export default Plantes;
