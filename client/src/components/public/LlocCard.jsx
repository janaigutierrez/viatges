// src/components/public/LlocCard.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './LlocCard.css';

const LlocCard = ({ lloc, regioSlug, onEdit, onDelete }) => {
    const { isAuthenticated } = useAuth();
    const imageUrl = lloc.imatgePortada
        ? `http://localhost:5000${lloc.imatgePortada}`
        : 'https://via.placeholder.com/400x300?text=Sense+Imatge';

    return (
        <div className="lloc-card">
            <Link to={`/regio/${regioSlug}/${lloc.slug}`} className="lloc-card-link">
                <div className="lloc-card-image">
                    <img src={imageUrl} alt={lloc.nom} />
                </div>
                <div className="lloc-card-content">
                    <h3>{lloc.nom}</h3>
                    {lloc.descripcio && (
                        <p className="lloc-card-description">
                            {lloc.descripcio.substring(0, 100)}
                            {lloc.descripcio.length > 100 && '...'}
                        </p>
                    )}
                </div>
            </Link>

            {isAuthenticated && (
                <div className="lloc-card-actions">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(lloc);
                        }}
                        className="btn-edit"
                    >
                        ✏️ Editar
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(lloc);
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

export default LlocCard;