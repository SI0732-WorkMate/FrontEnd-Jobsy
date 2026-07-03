import { createRouter, createWebHistory } from 'vue-router'
import RoleSelectionComponents from "../modules/authentication/components/RoleSelection.components.vue"
import LoginComponent from "../modules/authentication/components/Login.component.vue";
import RegisterComponent from "../modules/authentication/components/Register.component.vue";
import OfertasEmpleo from "../modules/postulante/pages/OfertaEmpleo.vue";
import LayoutPostulanteComponent from "../modules/postulante/components/LayoutPostulante.component.vue";
import PricipalPostulante from "../modules/postulante/pages/PricipalPostulante.vue";
import Postulaciones from "../modules/postulante/pages/Postulaciones.vue";
import BandejaEntrada from "../modules/postulante/pages/BandejaEntrada.vue";

import PerfilPostulante from "../modules/postulante/pages/PerfilPostulante.vue";

import LayoutReclutadorComponent from "../modules/reclutador/components/LayoutReclutador.component.vue";
import PrincipalReclutador from "../modules/reclutador/pages/PrincipalReclutador.vue";
import Publicaciones from "../modules/reclutador/pages/Publicaciones.vue";
import Candidatos from "../modules/reclutador/pages/Candidatos.vue";
import Analiticas from "../modules/reclutador/pages/Analiticas.vue";
import AsitenciaAI from "../modules/reclutador/pages/AsitenciaAI.vue";
import PerfilReclutador from "../modules/reclutador/pages/PerfilReclutador.vue";
import AsistenciaIA from '../modules/postulante/pages/AsistenciaIA.vue'

import Entrevistas from "../modules/reclutador/pages/Entrevistas.vue";
import MisEntrevistas from "../modules/postulante/pages/MisEntrevistas.vue";

const routes = [
    {path:"/", redirect: "/select-role"},
    {path: "/select-role", component: RoleSelectionComponents},
    {path: '/login', component: LoginComponent },
    {path: '/register', component: RegisterComponent },
    {
        path: '/postulante',
        component: LayoutPostulanteComponent,
        redirect: '/postulante/panel-principal',
        children: [
            { path: 'panel-principal', component: PricipalPostulante, name: 'PostulantePanelPrincipal' },
            { path: 'ofertas-empleo', component: OfertasEmpleo, name: 'PostulanteBuscarEmpleo' },
            { path: 'postulaciones', component: Postulaciones, name: 'PostulantePostulaciones' },
            { path: 'bandeja-entrada', component: BandejaEntrada, name: 'PostulanteBandejaEntrada' },
            { path: 'perfil', component: PerfilPostulante, name: 'PostulantePerfil' },
            { path: 'asistencia-ia', component: AsistenciaIA, name: 'PostulanteAsistenciaIA' },
            { path: 'mis-entrevistas', component: MisEntrevistas, name: 'PostulanteMisEntrevistas' },
        ]
    },

    {
        path: '/reclutador',
        component: LayoutReclutadorComponent,
        redirect: '/reclutador/panel-principal',
        children: [
            { path: 'panel-principal', component: PrincipalReclutador, name: 'ReclutadorPanelPrincipal' },
            { path: 'publicaciones', component: Publicaciones, name: 'ReclutadorPublicaciones' },
            { path: 'candidatos', component: Candidatos, name: 'ReclutadorCandidatos' },
            { path: 'analiticas', component: Analiticas, name: 'ReclutadorAnaliticas' },
            { path: 'asistencia-ia', component: AsitenciaAI, name: 'ReclutadorAsistenciaIA' },
            { path: 'perfil', component: PerfilReclutador, name: 'ReclutadorPerfil' },
            { path: 'entrevistas', component: Entrevistas, name: 'ReclutadorEntrevistas' }
        ]
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router;