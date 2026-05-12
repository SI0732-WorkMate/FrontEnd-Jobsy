import axios from 'axios';
import router from '../../../routers/router.js';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * REGISTRO: Crea un nuevo usuario con su nombre directamente en la tabla 'User'.
 */
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
        description: ""
    };

    const { data: newUser } = await axios.post(`${API_URL}/User`, newUserPayload);

    // Limpiar selectedRole después del registro para evitar que quede contaminado
    localStorage.removeItem('selectedRole');

    return newUser;
}

/**
 * LOGIN: Valida credenciales, guarda el token y redirige según el rol.
 */
export async function login(credentials) {
    // Limpiar sesión anterior antes de iniciar una nueva
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

    // user.role: 0 = CANDIDATE → /postulante, 1 = EMPLOYER → /reclutador
    const redirectPath = user.role === 1 ? '/reclutador' : '/postulante';
    router.push(redirectPath);
    return user;
}

/**
 * ACTUALIZAR PERFIL: Actualiza los datos del usuario.
 */
export async function updateUserProfile(updatedUserData) {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!user || !token) {
        throw new Error("Usuario no autenticado.");
    }

    // Solo mandamos los campos que el backend acepta
    const payload = {
        name: updatedUserData.name,
        description: updatedUserData.description,
        email: updatedUserData.email // agregar
    };

    const { data: updatedProfile } = await axios.put(
        `${API_URL}/User/${user.id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
    );

    // Actualizar localStorage con los datos nuevos
    const updatedUser = { ...user, ...updatedProfile };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
}

/**
 * LOGOUT: Limpia sesión y redirige al selector de rol.
 */
export function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('selectedRole');
    router.push('/select-role');
}

/**
 * SELECCIONAR ROL: Limpia estado previo, guarda el rol y redirige a registro.
 */
export function selectRole(role) {
    // Limpiar sesión anterior para evitar contaminación entre cuentas
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.setItem('selectedRole', role);
    router.push('/register');
}