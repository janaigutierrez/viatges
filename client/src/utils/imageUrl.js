const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/400x300?text=Sense+Imatge';
    return `${API_BASE_URL}${path}`;
};