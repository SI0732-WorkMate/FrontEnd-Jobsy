import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const applyToJob = async (applicationData) => {
    return axios.post(`${API_URL}/Applications`, applicationData, getAuthHeaders());
};

export const getMyApplicationsData = async () => {
    return axios.get(`${API_URL}/applications/my-applications`, getAuthHeaders());
};

export const withdrawApplication = (applicationId) => {
    return axios.delete(`${API_URL}/Applications/${applicationId}`, getAuthHeaders());
};