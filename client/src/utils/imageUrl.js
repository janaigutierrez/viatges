export const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/400x300?text=Sense+Imatge';

    // Si ja és una URL completa de Cloudinary, retornar-la directament
    if (path.startsWith('http')) {
        return path;
    }

    // Si és un path relatiu (per compatibilitat amb imatges antigues de Render)
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    return `${API_BASE_URL}${path}`;
};

// Insereix transformacions de Cloudinary a la URL per servir miniatures optimitzades
// Ex: getCloudinaryUrl(url, 'w_600,c_fill,q_auto,f_auto')
export const getCloudinaryUrl = (url, transformations) => {
    if (!url || !url.includes('cloudinary.com') || !transformations) {
        return getImageUrl(url);
    }
    return url.replace('/upload/', `/upload/${transformations}/`);
};

// Miniatura per galeries (grid) — ~60-100KB vs 300-500KB de l'original
export const getThumbnailUrl = (url) => {
    return getCloudinaryUrl(url, 'w_600,c_fill,q_auto,f_auto');
};

// Imatge gran per lightbox — màxima qualitat, ample limitat
export const getFullSizeUrl = (url) => {
    return getCloudinaryUrl(url, 'w_1920,q_auto,f_auto');
};
