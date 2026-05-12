// RUTA: src/modules/postulante/services/Notification.service.js
import axios from 'axios';

const API_URL = 'http://localhost:5195/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

/**
 * Obtiene todos los mensajes de la bandeja de entrada para el CANDIDATO logueado.
 * Llama al endpoint protegido que el backend ya filtra por el ID del token.
 */
export const getMyInboxMessages = async () => {
    try {
        const response = await axios.get(`${API_URL}/messages/inbox`, getAuthHeaders());
        return response.data; // Esto debería ser un array de MessageDto
    } catch (error) {
        console.error("Error al obtener la bandeja de entrada:", error.response?.data || error.message);
        throw error;
    }
};