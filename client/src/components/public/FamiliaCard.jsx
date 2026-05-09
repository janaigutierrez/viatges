import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../utils/imageUrl';
import './FamiliaCard.css';

const ETIQUETA_LABELS = {
    planta: 'Planta',
    'crases-suculentes': 'Crasa/Suculenta',
    cactus: 'Cactus',
};

const ETIQUETA_COLORS = {
    planta: '#48734c',
    'crases-suculentes': '#f59e0b',
    cactus: '#ef4444',
};

const UBICACIO_LABELS = {
    interior: 'Interior',
    exterior: 'Exterior',
};

const FamiliaCard = ({ familia, onEdit, onDelete }) => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="familia-card">
            <Link to={`/plantes/familia/${familia.slug}`} className="familia-card-link">
                <div className="familia-card-image">
                    <img src={getImageUrl(familia.imatgePortada)} alt={familia.nom} />
                    <span
                        className="familia-card-tag"
                        style={{ background: ETIQUETA_COLORS[familia.etiqueta] || '#48734c' }}
                    >
                        {ETIQUETA_LABELS[familia.etiqueta] || familia.etiqueta}
                    </span>
                    {familia.etiqueta === 'planta' && familia.ubicacio && (
                        <span className="familia-card-ubicacio">
                            {UBICACIO_LABELS[familia.ubicacio]}
                        </span>
                    )}
                </div>
                <div className="familia-card-content">
                    <h3>{familia.nom}</h3>
                    {familia.descripcio && (
                        <p className="familia-card-desc">{familia.descripcio}</p>
                    )}
                </div>
            </Link>

            {isAuthenticated && (
                <div className="familia-card-actions">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(familia);
                        }}
                        className="btn-edit"
                    >
                        Editar
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(familia);
                        }}
                        className="btn-delete"
                    >
                        Eliminar
                    </button>
                </div>
            )}
        </div>
    );
};

export default FamiliaCard;
