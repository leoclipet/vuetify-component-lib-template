import Vue from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false;

/* eslint-disable */

new Vue({
  components: { App },
  // @ts-ignore
  vuetify,
  render: (h) => h(App),
}).$mount('#app');
