// src/components/layout/Navbar.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { isAuthenticated, logout, user } = useAuth();

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    🗺️ Viatges
                </Link>

                <div className="navbar-menu">
                    <Link to="/" className="navbar-link">
                        Inici
                    </Link>

                    {isAuthenticated ? (
                        <>
                            <span className="navbar-user">
                                Hola, {user?.email}
                            </span>
                            <button onClick={logout} className="btn-logout">
                                Sortir
                            </button>
                        </>
                    ) : (
                        <Link to="/admin" className="btn-admin">
                            Admin
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;