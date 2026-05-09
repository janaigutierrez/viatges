import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../utils/imageUrl';
import './PlantaCard.css';

const PlantaCard = ({ planta, onEdit, onDelete }) => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="planta-card">
            <div className="planta-card-image">
                <img src={getImageUrl(planta.imatgePortada)} alt={planta.nom} />
            </div>
            <div className="planta-card-content">
                <h3>{planta.nom}</h3>
                {planta.nomLlati && (
                    <p className="planta-card-llati">{planta.nomLlati}</p>
                )}
                {planta.descripcio && (
                    <p className="planta-card-desc">{planta.descripcio}</p>
                )}
            </div>

            {isAuthenticated && (
                <div className="planta-card-actions">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(planta);
                        }}
                        className="btn-edit"
                    >
                        Editar
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(planta);
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

export default PlantaCard;
