import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Crear instància d'axios
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor per afegir el token automàticament
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// AUTH
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// REGIONS
export const getRegions = () => api.get('/regions');
export const getRegioBySlug = (slug) => api.get(`/regions/${slug}`);
export const createRegio = (formData) => {
    return api.post('/regions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};
export const updateRegio = (id, formData) => {
    return api.put(`/regions/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};
export const deleteRegio = (id) => api.delete(`/regions/${id}`);

// LLOCS
export const getLlocs = (regioId) => {
    const url = regioId ? `/llocs?regio=${regioId}` : '/llocs';
    return api.get(url);
};
export const getLlocBySlug = (regioSlug, llocSlug) => {
    return api.get(`/llocs/${regioSlug}/${llocSlug}`);
};
export const createLloc = (formData) => {
    return api.post('/llocs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};
export const updateLloc = (id, formData) => {
    return api.put(`/llocs/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};
export const addImatgesGaleria = (id, formData) => {
    return api.post(`/llocs/${id}/galeria`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};
export const deleteImatgeGaleria = (id, imatgeUrl) => {
    return api.delete(`/llocs/${id}/galeria`, { data: { imatgeUrl } });
};
export const deleteLloc = (id) => api.delete(`/llocs/${id}`);

// PUNTS D'INTERÈS
export const getPuntsInteres = (llocId) => {
    const url = llocId ? `/punts?lloc=${llocId}` : '/punts';
    return api.get(url);
};
export const getPuntInteresBySlug = (regioSlug, llocSlug, puntSlug) => {
    return api.get(`/punts/${regioSlug}/${llocSlug}/${puntSlug}`);
};
export const createPuntInteres = (formData) => {
    return api.post('/punts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};
export const updatePuntInteres = (id, formData) => {
    return api.put(`/punts/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};
export const addImatgesGaleriaPunt = (id, formData) => {
    return api.post(`/punts/${id}/galeria`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};
export const deleteImatgeGaleriaPunt = (id, imatgeUrl) => {
    return api.delete(`/punts/${id}/galeria`, { data: { imatgeUrl } });
};
export const deletePuntInteres = (id) => api.delete(`/punts/${id}`);

export default api;