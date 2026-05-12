import Ingles from './Locales/en.json';
import Español from './Locales/es.json';
import {createI18n} from "vue-i18n";

const i18n = createI18n({
    legacy: false,
    locale: "Español",
    fallbackLocale: "Ingles",
    globalInjection: true,
    messages: {Ingles , Español},
});
export default i18n;
