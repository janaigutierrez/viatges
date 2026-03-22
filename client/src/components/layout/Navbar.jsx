import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { RACONS } from '../../config/racons';
import './Navbar.css';

const Navbar = () => {
    const { isAuthenticated, logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isRaconsOpen, setIsRaconsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => { setIsMenuOpen(false); setIsRaconsOpen(false); };

    // Tancar dropdown en clicar fora
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsRaconsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Tancar dropdown en canviar de ruta
    useEffect(() => {
        setIsRaconsOpen(false);
        setIsMenuOpen(false);
    }, [location.pathname]);

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    Jose Luis
                </Link>

                {/* Botó hamburguesa (mòbil) */}
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

                    {/* Dropdown racons */}
                    <div className="navbar-dropdown" ref={dropdownRef}>
                        <button
                            className="navbar-dropdown-toggle"
                            onClick={() => setIsRaconsOpen(!isRaconsOpen)}
                            aria-expanded={isRaconsOpen}
                        >
                            Racons <span className={`dropdown-arrow ${isRaconsOpen ? 'open' : ''}`}>▾</span>
                        </button>

                        <div className={`navbar-dropdown-menu ${isRaconsOpen ? 'open' : ''}`}>
                            {RACONS.map((raco) => (
                                raco.actiu ? (
                                    <Link
                                        key={raco.slug}
                                        to={raco.ruta}
                                        className="dropdown-item"
                                    >
                                        <span className="dropdown-item-emoji">{raco.emoji}</span>
                                        <span>{raco.nom}</span>
                                    </Link>
                                ) : (
                                    <div key={raco.slug} className="dropdown-item dropdown-item--disabled">
                                        <span className="dropdown-item-emoji">{raco.emoji}</span>
                                        <span>{raco.nom}</span>
                                        <span className="dropdown-item-badge">Aviat</span>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>

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

            {isMenuOpen && <div className="navbar-overlay" onClick={closeMenu}></div>}
        </nav>
    );
};

export default Navbar;
