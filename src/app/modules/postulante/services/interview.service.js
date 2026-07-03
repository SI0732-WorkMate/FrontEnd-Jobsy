import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

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

export const InterviewService = {
    async scheduleInterview({ application_id, scheduled_at, duration_minutes, notes }) {
        const response = await axios.post(
            `${API_URL}/interviews`,
            { application_id, scheduled_at, duration_minutes, notes },
            getAuthHeaders()
        );
        return response.data;
    },

    async obtenerMisEntrevistas() {
        const response = await axios.get(`${API_URL}/interviews/my-interviews`, getAuthHeaders());
        return response.data;
    },

    async obtenerMiAgenda() {
        const response = await axios.get(`${API_URL}/interviews/my-schedule`, getAuthHeaders());
        return response.data;
    },

    async actualizarEstadoEntrevista(interviewId, nuevoEstado) {
        const response = await axios.patch(
            `${API_URL}/interviews/${interviewId}/status`,
            { status: nuevoEstado },
            getAuthHeaders()
        );
        return response.data;
    },

    async reprogramarEntrevista(interviewId, { scheduled_at, duration_minutes, notes }) {
        const response = await axios.put(
            `${API_URL}/interviews/${interviewId}`,
            { scheduled_at, duration_minutes, notes },
            getAuthHeaders()
        );
        return response.data;
    }
};