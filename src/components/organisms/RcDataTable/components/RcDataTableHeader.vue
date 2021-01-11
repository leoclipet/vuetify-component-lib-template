<template>
  <v-toolbar
    v-bind="$attrs"
    class="border-radius-top"
  >
    <slot name="headerLeft" />

    <v-toolbar-title
      v-if="labels.title"
      class="rc-title-3 white--text"
    >
      {{ labels.title }}
    </v-toolbar-title>

    <v-spacer />

    <v-toolbar-items>
      <v-text-field
        v-if="!hideSearch"
        class="dataTableHeader__search border-radius-all"
        data-test="dataTableHeader__search"
        :value="search"
        filled
        flat
        :label="labels.searchPlaceholder"
        prepend-inner-icon="mdi-magnify"
        background-color="primary"
        single-line
        hide-details
        dense
        @input="emitSearchEvent"
      />

      <v-menu
        v-if="showHelp"
        offset-y
        left
        data-test="dataTableHeader__helpMenu"
      >
        <template #activator="{ on }">
          <v-btn
            text
            icon
            class="ml-2"
            data-test="dataTableHeader__helpButton"
            v-on="on"
          >
            <v-icon color="primary lighten-1">
              mdi-help-circle-outline
            </v-icon>
          </v-btn>
        </template>
        <v-card class="pa-4">
          <v-card-text>{{ helpData.text }}</v-card-text>
          <v-btn
            color="primary"
            data-test="dataTableHeader__openHelpButton"
            @click="openHelpCenter"
          >
            {{ labels.helpCenter }}
          </v-btn>
        </v-card>
      </v-menu>
    </v-toolbar-items>
  </v-toolbar>
</template>

<script lang="ts">
import Vue from 'vue';
import helpers from '@/helpers';

export default Vue.extend({
  name: 'RcDataTableHeader',

  props: {
    showHelp: {
      type: Boolean,
    },

    helpData: {
      type: Object,
    },

    search: {
      type: String,
    },

    hideSearch: {
      type: Boolean,
    },

    labels: {
      type: Object,
    },
  },
  methods: {
    openHelpCenter() {
      helpers.openHelpCenterWindow(this.helpData.url, 500);
    },

    emitSearchEvent(search: string) {
      this.$emit('update:search', search);
    },
  },
});
</script>

<style scoped lang="scss">
.v-toolbar__items {
  align-items: center;
}

.dataTableHeader__search {
  & ::v-deep .v-input__slot::before {
    display: none;
  }
}
</style>
