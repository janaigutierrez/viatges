// src/components/layout/Footer.jsx
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <p>&copy; {new Date().getFullYear()} Viatges - Tots els drets reservats</p>
            </div>
        </footer>
    );
};

export default Footer;