import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../utils/imageUrl';
import './PlantaCard.css';

const ETIQUETA_COLORS = {
    planta: '#48734c',
    'crases-suculentes': '#f59e0b',
    cactus: '#ef4444',
};

const ETIQUETA_LABELS = {
    planta: 'Planta',
    'crases-suculentes': 'Crasa/Suculenta',
    cactus: 'Cactus',
};

const UBICACIO_LABELS = {
    interior: 'Interior',
    exterior: 'Exterior',
};

const PlantaCard = ({ planta, onEdit, onDelete }) => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="planta-card">
            <div className="planta-card-image">
                <img src={getImageUrl(planta.imatgePortada)} alt={planta.nom} />
                <span
                    className="planta-card-tag"
                    style={{ background: ETIQUETA_COLORS[planta.etiqueta] || '#48734c' }}
                >
                    {ETIQUETA_LABELS[planta.etiqueta] || planta.etiqueta}
                </span>
                {planta.etiqueta === 'planta' && planta.ubicacio && (
                    <span className="planta-card-ubicacio">
                        {UBICACIO_LABELS[planta.ubicacio]}
                    </span>
                )}
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
