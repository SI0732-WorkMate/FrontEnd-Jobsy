import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const applyToJob = async (formData) => {
    const token = localStorage.getItem('token');
    return axios.post(`${API_URL}/Applications`, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const getMyApplicationsData = async () => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/applications/my-applications`, { headers: { Authorization: `Bearer ${token}` } });
};

export const withdrawApplication = (applicationId) => {
    const token = localStorage.getItem('token');
    return axios.delete(`${API_URL}/Applications/${applicationId}`, { headers: { Authorization: `Bearer ${token}` } });
};