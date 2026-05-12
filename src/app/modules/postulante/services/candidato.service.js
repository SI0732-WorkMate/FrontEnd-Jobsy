import axios from 'axios';

const API_URL = 'import.meta.env.VITE_API_URL/api';

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

const mapStatus = (backendStatus) => {
    switch ((backendStatus || 'pending').toLowerCase()) {
        case 'accepted':  return 'Aceptado';
        case 'rejected':  return 'Rechazado';
        default:          return 'Pendiente';
    }
};

export const CandidatoService = {
    async obtenerCandidatosParaMisOfertas() {
        try {
            const [appsResponse, offersResponse] = await Promise.all([
                axios.get(`${API_URL}/applications/my-offers`, getAuthHeaders()),
                axios.get(`${API_URL}/joboffers`, getAuthHeaders())
            ])

            const applications = appsResponse.data
            const ofertas = offersResponse.data || []

            const candidatosFinales = await Promise.all(applications.map(async (app) => {
                let nombre = `Candidato #${app.candidate_id}`
                try {
                    const userRes = await axios.get(`${API_URL}/User/${app.candidate_id}`, getAuthHeaders())
                    nombre = userRes.data?.name || nombre
                } catch {}

                // Buscar el título de la oferta en la lista ya cargada
                const oferta = ofertas.find(o => o.id === app.job_offer_id)
                const publicationTitle = oferta?.title || `Oferta #${app.job_offer_id?.slice(0, 8)}`

                return {
                    id: app.application_id,
                    user_id: app.candidate_id,
                    name: nombre,
                    publicationNumber: app.job_offer_id,
                    publicationTitle,
                    cv: app.cv_url,
                    status: mapStatus(app.status),
                    backendStatus: (app.status || 'pending').toLowerCase(),
                }
            }))

            return candidatosFinales
        } catch (error) {
            console.error('❌ Error al llamar a /api/applications/my-offers:', error.response?.data || error.message)
            return []
        }
    },

    async actualizarEstadoCandidato(applicationId, nuevoEstado) {
        // nuevoEstado debe ser: 'accepted' | 'rejected' | 'pending'
        const response = await axios.patch(
            `${API_URL}/applications/${applicationId}/status`,
            { status: nuevoEstado },
            getAuthHeaders()
        );
        return response.data;
    }
};