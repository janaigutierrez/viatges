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