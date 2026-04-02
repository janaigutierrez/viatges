import { Link } from 'react-router-dom';
import { RACONS } from '../config/racons';
import './Home.css';

const Home = () => {
    return (
        <div className="home">
            <div className="home-hero">
                <div className="home-hero-content">
                    <h1>Desastre de cajón</h1>
                </div>
            </div>

            <div className="home-content">
                <h2>Racons</h2>
                <div className="racons-grid">
                    {RACONS.map((raco) => (
                        <RacoCard key={raco.slug} raco={raco} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const RacoCard = ({ raco }) => {
    const inner = (
        <div className={`raco-card ${!raco.actiu ? 'raco-card--aviat' : ''}`}>
            <div className="raco-card-emoji">{raco.emoji}</div>
            <div className="raco-card-body">
                <h3>{raco.nom}</h3>
                <p>{raco.descripcio}</p>
            </div>
            {!raco.actiu && <span className="raco-badge">Pròximament</span>}
            {raco.actiu && <span className="raco-arrow">→</span>}
        </div>
    );

    if (!raco.actiu) return inner;
    return <Link to={raco.ruta} className="raco-link">{inner}</Link>;
};

export default Home;
