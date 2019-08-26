import Vue from 'vue'
import router from './router';

Vue.config.productionTip = false

import App from './App.vue'

/** Import vue material */
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'

Vue.use(VueMaterial)

/** Import vue-snotify notifincation lib */
import Snotify from 'vue-snotify';
Vue.use(Snotify, {
  toast : {
    timeout : 3500,
    position : 'rightTop'
  }
});

/** Import form validation lib */
import Vuelidate from 'vuelidate'
Vue.use(Vuelidate);

/** Bootsrape the app */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
