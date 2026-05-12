// RUTA: src/modules/postulante/services/JobBoard.service.js
import axios from 'axios';

const API_URL = 'import.meta.env.VITE_API_URL/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: { Authorization: `Bearer ${token}` }
    };
};

export const getJobBoardData = async () => {
    try {
        const response = await axios.get(`${API_URL}/joboffers`, getAuthHeaders());
        const offers = response.data.map(offer => ({
            ...offer,
            status: offer.status === 0 ? "Activa" : "Borrador"
        }));
        return offers;
    } catch (error) {
        console.error("Error al obtener ofertas:", error);
        throw error;
    }
};

export const applyToJob = async (applicationData) => {
    try {
        const response = await axios.post(`${API_URL}/applications`, applicationData, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Error al postular:", error);
        throw error;
    }
};