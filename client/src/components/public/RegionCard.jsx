import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../utils/imageUrl';
import './RegionCard.css';

const RegionCard = ({ regio, onEdit, onDelete }) => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="region-card">
            <Link to={`/regio/${regio.slug}`} className="region-card-link">
                <div className="region-card-image">
                    <img src={getImageUrl(regio.imatgePortada)} alt={regio.nom} />
                </div>
                <div className="region-card-content">
                    <h3>{regio.nom}</h3>
                </div>
            </Link>

            {isAuthenticated && (
                <div className="region-card-actions">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(regio);
                        }}
                        className="btn-edit"
                    >
                        ✏️ Editar
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(regio);
                        }}
                        className="btn-delete"
                    >
                        🗑️ Eliminar
                    </button>
                </div>
            )}
        </div>
    );
};

export default RegionCard;