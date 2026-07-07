import axios from 'axios';
import router from '../../../routers/router.js';

const API_URL = import.meta.env.VITE_API_URL;

export async function register(userData) {
    const selectedRole = localStorage.getItem('selectedRole');
    if (!selectedRole) {
        throw new Error('No se ha seleccionado un rol.');
    }

    const newUserPayload = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: selectedRole === 'reclutador' ? 1 : 0,
        description: "",
        ruc: userData.ruc || null,
        cv_url: userData.cv_url || null,
        cv_pdf_base64: userData.cv_pdf_base64 || null
    };

    const { data: newUser } = await axios.post(`${API_URL}/User`, newUserPayload);

    localStorage.removeItem('selectedRole');
    return newUser;
}

export async function login(credentials) {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('selectedRole');

    const { data } = await axios.post(`${API_URL}/User/login`, credentials);
    const { token } = data;

    localStorage.setItem('token', token);

    const { data: user } = await axios.get(`${API_URL}/User/me`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    localStorage.setItem('user', JSON.stringify(user));

    const redirectPath = user.role === 1 ? '/reclutador' : '/postulante';
    router.push(redirectPath);
    return user;
}

export async function updateUserProfile(updatedUserData) {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!user || !token) {
        throw new Error("Usuario no autenticado.");
    }

    const payload = {
        name: updatedUserData.name,
        description: updatedUserData.description,
        email: updatedUserData.email,
        ruc: updatedUserData.ruc ?? undefined,
        cv_url: updatedUserData.cv_url ?? undefined,
        cv_pdf_base64: updatedUserData.cv_pdf_base64 ?? undefined,
        vacancy_notifications_enabled: updatedUserData.vacancy_notifications_enabled ?? undefined,
        vacancy_notification_keywords: updatedUserData.vacancy_notification_keywords ?? undefined
    };

    const { data: updatedProfile } = await axios.put(
        `${API_URL}/User/${user.id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
    );

    const updatedUser = { ...user, ...updatedProfile };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
}

export function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('selectedRole');
    router.push('/select-role');
}

export function selectRole(role) {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.setItem('selectedRole', role);
    router.push('/register');
}
