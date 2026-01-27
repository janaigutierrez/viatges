// src/components/public/RegionCard.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './RegionCard.css';

const RegionCard = ({ regio, onEdit, onDelete }) => {
    const { isAuthenticated } = useAuth();
    const imageUrl = regio.imatgePortada
        ? `http://localhost:5000${regio.imatgePortada}`
        : 'https://via.placeholder.com/400x300?text=Sense+Imatge';

    return (
        <div className="region-card">
            <Link to={`/regio/${regio.slug}`} className="region-card-link">
                <div className="region-card-image">
                    <img src={imageUrl} alt={regio.nom} />
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