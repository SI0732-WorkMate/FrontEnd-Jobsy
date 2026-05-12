import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

// Se llama sin employerId, ya que el endpoint no lo soporta.
// El filtrado se hará en el componente Publicaciones.vue
export const getAllPublications = () => {
    return axios.get(API_URL, getAuthHeaders());
};

export const addPublication = (publication) => {
    const payload = {
        title: publication.title,
        description: publication.description,
        requirements: publication.requirements,
        location: publication.location,
        salary_range: parseFloat(publication.salary_range) || 0
    };
    return axios.post(API_URL, payload, getAuthHeaders());
};

export const updatePublication = (id, publication) => {
    // El payload debe coincidir con UpdateJobOfferCommand
    const payload = {
        id: id,
        title: publication.title,
        description: publication.description,
        requirements: publication.requirements,
        location: publication.location,
        salary_range: parseFloat(publication.salary_range) || 0,
        // Tu backend espera el Status como número (Enum: 0=Activa, 1=Borrador)
        status: publication.status === 'Activa' ? 0 : 1
    };
    return axios.put(`${API_URL}/${id}`, payload, getAuthHeaders());
};

export const deletePublication = (id) => {
    return axios.delete(`${API_URL}/${id}`, getAuthHeaders());
};