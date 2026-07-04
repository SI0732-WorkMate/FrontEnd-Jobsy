import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const EvaluationService = {
    async obtenerEscenarios() {
        const response = await axios.get(`${API_URL}/evaluations/scenarios`, getAuthHeaders());
        return response.data;
    },

    async obtenerEstado(applicationId) {
        const response = await axios.get(`${API_URL}/evaluations/status`, {
            ...getAuthHeaders(),
            params: { application_id: applicationId }
        });
        return response.data;
    },

    async obtenerFeedback(scenarioId, optionId) {
        const response = await axios.post(
            `${API_URL}/evaluations/answer-feedback`,
            { scenario_id: scenarioId, option_id: optionId },
            getAuthHeaders()
        );
        return response.data;
    },

    async enviarRespuestas(applicationId, answers) {
        const response = await axios.post(
            `${API_URL}/evaluations`,
            { application_id: applicationId, answers },
            getAuthHeaders()
        );
        return response.data;
    },

    async obtenerResultadoParaReclutador(applicationId) {
        const response = await axios.get(`${API_URL}/evaluations/by-application/${applicationId}`, getAuthHeaders());
        return response.data;
    }
};