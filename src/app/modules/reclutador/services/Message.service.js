// RUTA: src/modules/reclutador/services/Message.service.js
import axios from 'axios';

const API_URL = 'http://localhost:5195/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error("No se encontró token de autenticación.");
        return {};
    }
    return {
        headers: { Authorization: `Bearer ${token}` }
    };
};

export const MessageService = {
    /**
     * Envía un nuevo mensaje desde un empleador a un candidato.
     * El backend obtiene el `sender_id` (ID del empleador) del token.
     * @param {object} messageData - Debe contener { receiver_id, content }
     */
    async sendMessage(messageData) {
        // Payload coincide con el `EmployerSendMessageCommand` del backend
        const payload = {
            receiver_id: messageData.receiver_id,
            content: messageData.content
        };

        try {
            const response = await axios.post(`${API_URL}/messages`, payload, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error('Error al enviar el mensaje:', error.response?.data || error.message);
            throw error;
        }
    }
};