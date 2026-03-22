// src/components/layout/Navbar.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
    const { isAuthenticated, logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

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

                {/* Menú */}
                <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
                    <Link to="/" className="navbar-link" onClick={closeMenu}>
                        Inici
                    </Link>

                    <button
                        className="btn-theme-toggle"
                        onClick={toggleTheme}
                        aria-label="Canviar tema"
                        title={theme === 'light' ? 'Mode fosc' : 'Mode clar'}
                    >
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>

                    {isAuthenticated ? (
                        <>
                            <span className="navbar-user">{user?.email}</span>
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
