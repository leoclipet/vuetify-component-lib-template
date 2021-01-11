import Vue from 'vue';
import Vuetify from 'vuetify/lib';

import light from './theme/light-theme';
import dark from './theme/dark-theme';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    options: {
      customProperties: true, // generate a css variable for each theme color, which you can then use in your components' <style> blocks.
    },
    themes: {
      light,
      dark,
    },
  },
});
