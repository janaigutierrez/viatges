import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../utils/imageUrl';
import './ApartatCard.css';

const ApartatCard = ({ apartat, regioSlug, llocSlug, puntSlug, onEdit, onDelete }) => {
    const { isAuthenticated } = useAuth();
    const to = `/viatges/regio/${regioSlug}/${llocSlug}/${puntSlug}/${apartat.slug}`;

    return (
        <div className="apartat-card">
            <Link to={to} className="apartat-card-link">
                <div className="apartat-card-image">
                    <img src={getImageUrl(apartat.imatgePortada)} alt={apartat.nom} />
                </div>
                <div className="apartat-card-content">
                    <h4>{apartat.nom}</h4>
                    {apartat.descripcio && (
                        <p className="apartat-card-desc">{apartat.descripcio}</p>
                    )}
                </div>
            </Link>

            {isAuthenticated && (
                <div className="apartat-card-actions">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(apartat);
                        }}
                        className="btn-edit"
                    >
                        Editar
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(apartat);
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

export default ApartatCard;
