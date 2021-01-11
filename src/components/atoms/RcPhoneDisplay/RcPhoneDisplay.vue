<template>
  <span v-bind="$attrs">{{ formattedPhoneNumber }}</span>
</template>

<script lang="ts">
import Vue from 'vue';
import PhoneNumber from 'awesome-phonenumber';

/**
   * A phone number label with automatic formatting.
   */
export default Vue.extend({
  name: 'RcPhoneDisplay',

  props: {
    /**
       * The value for the phone label. Example: { number: '514-521-9999', countryISO2: 'CA', e164Number: '+514521999' }
       */
    value: {
      type: Object as () => { number: string; countryISO2: string; e164Number: string },
      default: () => ({ number: '', countryISO2: '', e164Number: '' }),
    },

    /**
       * The default country to select when the label is rendered with no value. Example 'CA', 'US', 'AL'
       */
    defaultCountry: {
      type: String,
      default: 'CA',
    },
  },

  computed: {
    phoneObject(): PhoneNumber {
      return new PhoneNumber(this.value.number, this.value.countryISO2 || this.defaultCountry);
    },
    formattedPhoneNumber(): string {
      if (this.value && this.phoneObject.isValid()) {
        const stringRegex = '/^[a-z0-9]+$/i';
        if (this.value.number.match(stringRegex)) {
          return '';
        }
        return `${this.phoneObject.getCountryCode()} ${this.phoneObject.getNumber('national')}`;
      }
      return '';
    },
  },
});
</script>
