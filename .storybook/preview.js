import { configure, addDecorator } from "@storybook/vue";
import "!style-loader!css-loader!sass-loader!./scss-loader.scss";
import "vuetify/dist/vuetify.css";

import Vue from "vue";
import Vuetify from "vuetify";

import light from "../src/plugins/theme/light-theme";
import dark from "../src/plugins/theme/dark-theme";

Vue.use(Vuetify);

addDecorator(() => ({
  vuetify: new Vuetify({
    theme: {
      options: {
        customProperties: true, // generate a css variable for each theme color, which you can then use in your components' <style> blocks.
      },
      themes: {
        light,
        dark,
      },
    },
  }),
  template:
    '<v-app style="background-color: white"><v-content><story/></v-content></v-app>',
}));

// automatically import all files ending in *.stories.js
configure(require.context("../stories", true, /\.stories\.js$/), module);
