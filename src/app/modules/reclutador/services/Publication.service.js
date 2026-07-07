import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/joboffers';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

const statusToEnum = (status) => {
    if (status === 'Activa' || status === 0) return 0;
    if (status === 'Cerrada' || status === 2) return 2;
    return 1;
};

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
    const payload = {
        id,
        title: publication.title,
        description: publication.description,
        requirements: publication.requirements,
        location: publication.location,
        salary_range: parseFloat(publication.salary_range) || 0,
        status: statusToEnum(publication.status)
    };
    return axios.put(`${API_URL}/${id}`, payload, getAuthHeaders());
};

export const deletePublication = (id) => {
    return axios.delete(`${API_URL}/${id}`, getAuthHeaders());
};
