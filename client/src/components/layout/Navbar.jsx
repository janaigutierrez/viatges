// src/components/layout/Navbar.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { isAuthenticated, logout, user } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo" onClick={closeMenu}>
                    🗺️ Viatges
                </Link>

                {/* Botó hamburguesa (només mòbil) */}
                <button
                    className={`hamburger ${isMenuOpen ? 'active' : ''}`}
                    onClick={toggleMenu}
                    aria-label="Menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                {/* Menú (desktop sempre visible, mòbil desplegable) */}
                <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
                    <Link to="/" className="navbar-link" onClick={closeMenu}>
                        Inici
                    </Link>

                    {isAuthenticated ? (
                        <>
                            <span className="navbar-user">
                                {user?.email}
                            </span>
                            <button onClick={() => { logout(); closeMenu(); }} className="btn-logout">
                                Sortir
                            </button>
                        </>
                    ) : (
                        <Link to="/admin" className="btn-admin" onClick={closeMenu}>
                            Admin
                        </Link>
                    )}
                </div>
            </div>

            {/* Overlay per tancar el menú en mòbil */}
            {isMenuOpen && <div className="navbar-overlay" onClick={closeMenu}></div>}
        </nav>
    );
};

export default Navbar;