import { Link } from 'react-router-dom';
import { RACONS } from '../config/racons';
import SeccioDescripcio from '../components/public/SeccioDescripcio';
import './Home.css';

const Home = () => {
    return (
        <div className="home">
            <div className="home-hero">
                <div className="home-hero-texture"></div>
                <img
                    src="/logo_cajon.png"
                    alt="Desastre de cajón"
                    className="home-hero-logo"
                />
                <div className="home-hero-content">
                    <p>Un cajón desordenado de viajes, plantas, recetas y experimentos</p>
                </div>
            </div>

            <div className="home-content">
                <SeccioDescripcio
                    slug="home"
                    placeholder="Aquí puedes presentar la web a quien la visite."
                />

                <h2>Rincones</h2>
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
        <div
            className={`raco-card raco-card--${raco.slug} ${!raco.actiu ? 'raco-card--aviat' : ''}`}
            style={{ '--raco-color': raco.color }}
        >
            <div className="raco-card-accent"></div>
            <div className="raco-card-inner">
                <div className="raco-card-emoji">{raco.emoji}</div>
                <div className="raco-card-body">
                    <h3>{raco.nom}</h3>
                    <p>{raco.descripcio}</p>
                </div>
                {!raco.actiu && <span className="raco-badge">Próximamente</span>}
                {raco.actiu && <span className="raco-arrow">→</span>}
            </div>
        </div>
    );

    if (!raco.actiu) return inner;
    return <Link to={raco.ruta} className="raco-link">{inner}</Link>;
};

export default Home;
