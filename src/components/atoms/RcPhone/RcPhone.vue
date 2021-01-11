<template>
  <v-text-field
    v-model="innerValue"
    autocomplete="off"
    :disabled="disabled"
    v-bind="$attrs"
    type="tel"
    :prefix="'+' + selectedCountry.dialCode"
    :placeholder="placeholder"
    v-on="{
      ...$listeners,
      input: event => {}
    }"
    @keypress="isNumber($event)"
  >
    <template #prepend-inner>
      <v-menu
        v-model="countryListOpen"
        transition="slide-y-transition"
      >
        <template #activator="{ on }">
          <button
            class="countryButton"
            :disabled="disabled"
            v-on="on"
          >
            <div
              :class="[
                'vti__flag',
                selectedCountry.iso2.toLowerCase()
              ]"
            />
            <v-icon size="16">
              keyboard_arrow_down
            </v-icon>
          </button>
        </template>

        <v-list
          v-if="countryListOpen"
          ref="countryList"
          class="countryList"
        >
          <CountryListItem
            v-if="selectedCountry"
            :key="'selected_' + selectedCountry.iso2"
            :country="selectedCountry"
          />

          <v-divider v-if="selectedCountry" />

          <CountryListItem
            v-for="country in countries"
            :key="country.iso2"
            :country="country"
            @select-country="selectCountry"
          />
        </v-list>
      </v-menu>
    </template>
  </v-text-field>
</template>

<script lang="ts">
import Vue from 'vue';
import _find from 'lodash/find';
import PhoneNumber from 'awesome-phonenumber';
import CountryListItem from './components/CountryListItem.vue';
import countries, { ICountry } from './all-countries';

let countrySearchBuffer = '';

interface IValue {
  number: string;
  countryISO2: string;
  e164Number: string;
}

function getInitialNumber(number: string, defaultCountry: string): string {
  const pn: PhoneNumber = new PhoneNumber(number, defaultCountry);

  if (pn.isValid()) {
    return pn.getNumber('national');
  }

  return number;
}

function getInitialCountry(value: IValue, defaultCountry: string): ICountry {
  const countryISO2 = value.countryISO2 ? value.countryISO2.toUpperCase() : defaultCountry.toUpperCase();

  const pn: PhoneNumber = new PhoneNumber(
    value.number,
    countryISO2,
  );

  const regionCode = pn.getRegionCode();

  if (regionCode) {
    const country = _find(countries, { iso2: regionCode.toUpperCase() });
    if (country) return country;
  }

  const country = _find(countries, { iso2: defaultCountry.toUpperCase() });
  if (country) return country;

  return {
    name: 'Canada',
    iso2: 'CA',
    dialCode: '1',
    priority: 1,
  };
}

/**
 * A phone number input with automatic formatting and country selection.
 *
 * Implements all props for **v-text-field**: https://vuetifyjs.com/en/components/text-fields
 */
export default Vue.extend({
  name: 'RcPhone',

  components: {
    CountryListItem,
  },

  props: {
    /**
     * The value for the input, bound with v-model. Example: { number: '514-521-9999', countryISO2: 'CA', e164Number: '+514521999' }
     */
    value: {
      type: Object as () => { number: string; countryISO2: string; e164Number: string },
      default: () => ({ number: '', countryISO2: '', e164Number: '' }),
    },

    /**
     * The default country to select when the input is rendered with no value. Example 'CA', 'US', 'AL'
     */
    defaultCountry: {
      type: String,
      default: 'CA',
    },

    disabled: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      innerValue: '',
      countryListOpen: false,
      selectedCountry: getInitialCountry(this.value, this.defaultCountry),
    };
  },

  computed: {
    countries(): Array<ICountry> {
      return countries;
    },

    placeholder(): string {
      return PhoneNumber.getExample(this.selectedCountry.iso2, 'mobile').getNumber('national');
    },

    phoneObject(): PhoneNumber {
      return new PhoneNumber(this.innerValue, this.selectedCountry.iso2);
    },
    e164Number(): string {
      return this.phoneObject.getNumber('e164');
    },
  },

  watch: {
    value: {
      deep: true,
      handler(newValue) {
        const value = {
          number: newValue.number || '',
          countryISO2: newValue.countryISO2 || this.defaultCountry,
          e164Number: this.e164Number,
        };
        this.innerValue = getInitialNumber(value.number, value.countryISO2);
        this.selectedCountry = getInitialCountry(value, this.defaultCountry);
      },
    },
    innerValue() {
      if (this.phoneObject.isValid()) {
        this.innerValue = this.phoneObject.getNumber('national') || '';
        /**
         * The input event when the text field value or country is changed
         * @property {{ number: string, country: string }} value
         */
        this.$emit('input', {
          number: this.phoneObject.getNumber('national'),
          countryISO2: this.selectedCountry.iso2,
          e164Number: this.e164Number,
        });
      } else {
        this.$emit('input', {
          number: this.phoneObject.getNumber('national'),
          countryISO2: this.selectedCountry.iso2,
          e164Number: this.e164Number,
        });
      }
    },

    countryListOpen(newValue) {
      if (newValue) {
        this.removeActiveClasses();
      }
    },
  },
  mounted() {
    this.innerValue = getInitialNumber(this.value.number, this.defaultCountry);
  },
  created() {
    document.body.addEventListener('keydown', this.scrollCountryMenu);
  },

  beforeDestroy() {
    document.body.removeEventListener('keydown', this.scrollCountryMenu);
  },
  methods: {
    /**
     * Handles selecting the country from the country list
     * @param {ICountry} country The selected country
     */
    selectCountry(country: ICountry) {
      this.selectedCountry = country;
      this.innerValue = this.phoneObject.getNumber('national') || '';
    },

    /**
     * Remove the active class from country list items that are no longer highlighted
     */
    removeActiveClasses() {
      const previousActiveElems = document.getElementsByClassName('countryList__item--active');

      for (let x = 0; x < previousActiveElems.length; x += 1) {
        previousActiveElems[x].classList.remove('countryList__item--active');
      }
    },

    /**
     * Handles scrolling the country menu when the user starts typing
     */
    scrollCountryMenu(e: KeyboardEvent) {
      if (this.countryListOpen) {
        if (e.keyCode === 40 || e.keyCode === 38) {
          const currentActiveElem = document.getElementsByClassName('countryList__item--active')[0];

          if (currentActiveElem) {
            let sibling: Element | null;

            if (e.keyCode === 38) {
              sibling = currentActiveElem.previousElementSibling;
            } else {
              sibling = currentActiveElem.nextElementSibling;
            }

            if (sibling) {
              sibling.classList.add('countryList__item--active');
              sibling.scrollIntoView();
              currentActiveElem.classList.remove('countryList__item--active');
            }
          } else {
            document.getElementsByClassName('countryList__item')[0].classList.add('countryList__item--active');
          }
        } else if (e.keyCode === 13) {
          const currentActiveElem = document.getElementsByClassName('countryList__item--active')[0];

          if (currentActiveElem) {
            const countryISO2 = currentActiveElem.getAttribute('data-iso');

            if (countryISO2) {
              const country = _find(countries, { iso2: countryISO2 });

              if (country) {
                this.selectCountry(country);
              }
            }
          }

          this.countryListOpen = false;
        } else {
          countrySearchBuffer += e.key;

          countrySearchBuffer = countrySearchBuffer.toLowerCase();

          const country = _find(countries, (c) => c.name.toLowerCase().startsWith(countrySearchBuffer));

          if (country) {
            const elem = document.getElementsByClassName(`country__${country.iso2}`)[0];

            if (elem) {
              elem.scrollIntoView();

              this.removeActiveClasses();

              elem.classList.add('countryList__item--active');
            }
          }

          setTimeout(() => {
            countrySearchBuffer = '';
          }, 1000);
        }
      }
    },

    /**
     * Check keyboard character to accept only numbers for phone number.
     * @param evt The event of pressing the keyboard
     */
    isNumber(e: KeyboardEvent): boolean {
      const charCode = ((e) || window.event).key.charCodeAt(0);
      if ((charCode > 31 && (charCode < 48 || charCode > 57))) {
        e.preventDefault();
        return false;
      }
      return true;
    },
  },
});
</script>

<style scoped lang="scss">
.countryButton {
  cursor: pointer;
  padding: 6px;
  margin-right: -4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.countryButton:hover {
  background-color: #f5f5f5;
}

.countryList {
  max-height: 260px;
  max-width: 500px;
}

::v-deep .v-label.v-label--active {
  left: -48px!important;
}
</style>
