import { useEffect, useCallback } from 'react';
import { getFullSizeUrl } from '../utils/imageUrl';
import './Lightbox.css';

const Lightbox = ({ imatges, indexActiu, onClose, onPrev, onNext }) => {
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowLeft') onPrev();
        if (e.key === 'ArrowRight') onNext();
    }, [onClose, onPrev, onNext]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [handleKeyDown]);

    return (
        <div className="lightbox-overlay" onClick={onClose}>
            <button className="lightbox-close" onClick={onClose}>✕</button>

            {imatges.length > 1 && (
                <>
                    <button
                        className="lightbox-nav lightbox-prev"
                        onClick={(e) => { e.stopPropagation(); onPrev(); }}
                    >
                        ‹
                    </button>
                    <button
                        className="lightbox-nav lightbox-next"
                        onClick={(e) => { e.stopPropagation(); onNext(); }}
                    >
                        ›
                    </button>
                </>
            )}

            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                <img
                    src={getFullSizeUrl(imatges[indexActiu])}
                    alt={`Imatge ${indexActiu + 1}`}
                />
            </div>

            {imatges.length > 1 && (
                <div className="lightbox-counter">
                    {indexActiu + 1} / {imatges.length}
                </div>
            )}
        </div>
    );
};

export default Lightbox;
