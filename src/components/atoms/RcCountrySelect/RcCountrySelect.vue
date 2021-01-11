<template>
  <v-autocomplete
    v-model="innerValue"
    autocomplete="off"
    v-bind="$attrs"
    :items="countries"
    v-on="{
      ...$listeners,
      input: event => {}
    }"
  >
    <template #selection="{item}">
      <div
        v-if="innerValue"
        :class="[
          'flag',
          'vti__flag',
          innerValue.toLowerCase(),
        ]"
      />
      <div
        class="ml-2"
        data-test="selection"
      >
        {{ item.text }}
      </div>
    </template>

    <template #item="{ item }">
      <v-list-item-icon class="mr-2">
        <div
          :class="[
            'mt-1',
            'vti__flag',
            item.value.toLowerCase(),
          ]"
        />
      </v-list-item-icon>

      <v-list-item-content>
        <v-list-item-title :data-test="item.value">
          {{ item.text }}
        </v-list-item-title>
      </v-list-item-content>
    </template>
  </v-autocomplete>
</template>

<script lang="ts">
import Vue from 'vue';
import countries from 'i18n-iso-countries';

/* eslint-disable @typescript-eslint/no-var-requires */
countries.registerLocale(require('i18n-iso-countries/langs/en.json'));
countries.registerLocale(require('i18n-iso-countries/langs/fr.json'));

/**
 * A country select built using v-autocomplete. Uses iso2 country names and codes.
 *
 * * Implements all props for **v-autocomplete**: https://vuetifyjs.com/en/components/autocompletes
 */
export default Vue.extend({
  name: 'RcCountrySelect',

  props: {
    /**
     * The default value
     */
    value: {
      type: String,
      default: '',
    },
    /**
     * The current language to display the countries in
     */
    language: {
      type: String,
      default: 'en',
    },
  },

  data() {
    return {
      innerValue: this.value,
    };
  },

  computed: {
    countries() {
      const countryNames = countries.getNames(this.language);

      const countryOptions = Object.keys(countryNames)
        .map((key) => ({ value: key, text: countryNames[key] }))
        .sort((a, b) => a.text.localeCompare(b.text));

      return countryOptions;
    },
  },

  watch: {
    value() {
      this.innerValue = this.value;
    },

    innerValue(newValue) {
      /**
       * The input event when the country is changed
       * @property {string} value The ISO2 code of the selected country
       */
      this.$emit('input', newValue);
    },
  },
});
</script>

<style scoped lang="scss">
.flag {
  width: 20px;
}
</style>
