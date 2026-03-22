import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getThumbnailUrl } from '../../utils/imageUrl';
import './PuntInteresCard.css';

const PuntInteresCard = ({ punt, regioSlug, llocSlug, onEdit, onDelete }) => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="punt-card-nav">
            <Link
                to={`/regio/${regioSlug}/${llocSlug}/${punt.slug}`}
                className="punt-card-nav-link"
            >
                <div className="punt-card-nav-image">
                    <img
                        src={getThumbnailUrl(punt.imatgePortada)}
                        alt={punt.nom}
                        loading="lazy"
                    />
                </div>
                <div className="punt-card-nav-content">
                    <h4>📍 {punt.nom}</h4>
                    {punt.descripcio && (
                        <p>
                            {punt.descripcio.substring(0, 120)}
                            {punt.descripcio.length > 120 && '...'}
                        </p>
                    )}
                    <span className="punt-card-nav-cta">Veure detalls →</span>
                </div>
            </Link>

            {isAuthenticated && (
                <div className="punt-card-nav-actions">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(punt); }}
                        className="btn-edit"
                    >
                        ✏️ Editar
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(punt); }}
                        className="btn-delete"
                    >
                        🗑️ Eliminar
                    </button>
                </div>
            )}
        </div>
    );
};

export default PuntInteresCard;
