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
                    matchScore: app.match_score ?? null,
                    hasCvPdf: !!app.has_cv_pdf,
                }
            }))

            // Ya viene ordenado del backend, pero lo reforzamos por si acaso
            return candidatosFinales.sort((a, b) => (b.matchScore ?? -1) - (a.matchScore ?? -1))
        } catch (error) {
            console.error('❌ Error al llamar a /api/applications/my-offers:', error.response?.data || error.message)
            return []
        }
    },

    async actualizarEstadoCandidato(applicationId, nuevoEstado, motivo = null) {
        const body = { status: nuevoEstado };
        if (nuevoEstado === 'rejected' && motivo) {
            body.reason = motivo;
        }
        const response = await axios.patch(
            `${API_URL}/applications/${applicationId}/status`,
            body,
            getAuthHeaders()
        );
        return response.data;
    },

    // US016 - Match Score
    async calcularMatchScore(applicationId, pdfFile = null) {
        const formData = new FormData();
        if (pdfFile) formData.append('cv_pdf', pdfFile);

        const token = localStorage.getItem('token');
        const response = await axios.post(
            `${API_URL}/applications/${applicationId}/calculate-match`,
            formData,
            { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
        );
        return response.data;
    },

    async obtenerDetalleMatch(applicationId) {
        const response = await axios.get(
            `${API_URL}/applications/${applicationId}/match-detail`,
            getAuthHeaders()
        );
        return response.data;
    }
};