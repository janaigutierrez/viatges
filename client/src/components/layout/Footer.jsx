import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <p>&copy; {new Date().getFullYear()} Viatges</p>
            </div>
        </footer>
    );
};

export default Footer;