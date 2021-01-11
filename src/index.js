import Vue from 'vue';
import Vuetify from 'vuetify/lib';

import RcPhone from './components/atoms/RcTab/RcTab.vue';

Vue.use(Vuetify);

const Components = {
  RcPhone,
};

Vue.component('RcPhone', RcPhone);

export { RcPhone };

// Export the library as a plugin
export default Components;
