import { createApp } from 'vue';
import { createPinia } from 'pinia'
// Plugins
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import Notifications from '@kyvg/vue3-notification'
import App from './App.vue';
import { router } from './router';
import vuetify from './plugins/vuetify';
import '@/scss/style.scss';
import { PerfectScrollbarPlugin } from 'vue3-perfect-scrollbar';
// import VueApexCharts from 'vue3-apexcharts';
import VueTablerIcons from 'vue-tabler-icons';
import 'vue3-carousel/dist/carousel.css';

// import Maska from 'maska';


// Services
import authService from '@/services/auth'


// Plugins
import authPlugin from '@/plugins/auth'


// Utilities
import _ from 'lodash'


//i18
// import { createI18n } from 'vue-i18n';
// import messages from '@/utils/locales/messages';
// const i18n = createI18n({
//     locale: 'en',
//     messages: messages,
//     silentTranslationWarn: true,
//     silentFallbackWarn: true
// });

//ScrollTop
import VueScrollTo from 'vue-scrollto';

//LightBox
import VueEasyLightbox from 'vue-easy-lightbox';

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const renderApp = () => {
  const app = createApp(App)
  app.use(pinia)
	app.use(Notifications)
  app.use(authPlugin, { pinia })
  app.use(_)
  app.use(router)
  app.use(PerfectScrollbarPlugin)
  app.use(VueTablerIcons)

  // app.use(i18n);
  // app.use(Maska);
  // app.use(VueApexCharts);
  app.use(vuetify).mount('#app');  
  //ScrollTop Use
  app.use(VueScrollTo, {
      duration: 1000,
      easing: "ease"
  });
  //Lightbox
  app.use(VueEasyLightbox)

}

authService.init(renderApp)
