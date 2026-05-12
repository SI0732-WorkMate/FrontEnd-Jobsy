import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from "./app/routers/router.js";
import Aura from '@primeuix/themes/aura';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import 'primeflex/primeflex.css';
import i18n from './i18n'
import PrimeVue from 'primevue/config'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea';


const app = createApp(App);
app.use(i18n)
app.use(router)
app.use(PrimeVue);

app.component('pv-card', Card);
app.component('pv-dialog', Dialog);
app.component('pv-inputtext', InputText)
app.component('pv-password', Password)
app.component('pv-button', Button)
app.component('pv-textarea', Textarea);
app.mount('#app');
