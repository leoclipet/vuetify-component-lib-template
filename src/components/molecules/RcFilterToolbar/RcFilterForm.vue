<template>
  <v-form
    ref="form"
    v-model="formModel"
  >
    <v-container
      class="pa-0"
      fluid
    >
      <v-row>
        <v-col
          class="py-0"
          cols="12"
        >
          <v-text-field
            v-model="filterName"
            outlined
            data-test="filterToolbar__filterName"
            :label="labels.formFilterName"
            :rules="[rules.required, rules.max255]"
            max="255"
          />
        </v-col>
      </v-row>

      <v-row
        v-for="filter in filterOptions"
        :key="filter.key"
      >
        <v-col
          cols="12"
          class="py-0"
        >
          <div class="rc-body16 fw-bold">
            {{ filter.label }}
          </div>
        </v-col>

        <template v-if="filter.type === EFilterType.Text">
          <v-col
            class="py-0"
            cols="4"
          >
            <v-select
              v-model="filterValues[filter.key].operator"
              class="flex-right"
              :menu-props="menuProps"
              outlined
              :items="filterOperators[filter.type]"
              :item-text="(item) => labels.operators[item.operator]"
              :item-value="(item) => item.operator"
            />
          </v-col>

          <v-col
            class="py-0"
            cols="8"
          >
            <v-text-field
              v-model="filterValues[filter.key].value"
              v-bind="filter.props"
              :data-test="`filterToolbar__input-${filter.key}-${filter.type}`"
              clearable
              outlined
              :rules="[rules.max255]"
              :label="filter.label"
            />
          </v-col>
        </template>

        <template v-if="filter.type === EFilterType.Number">
          <v-col
            class="py-0"
            cols="4"
          >
            <v-select
              v-model="filterValues[filter.key].operator"
              class="flex-right"
              :menu-props="menuProps"
              outlined
              :items="filterOperators[filter.type]"
              :item-text="(item) => labels.operators[item.operator]"
              :item-value="(item) => item.operator"
              @change="filterValues[filter.key].value = ''"
            />
          </v-col>

          <number
            v-if="filterValues[filter.key].operator === EFilterOperator.Between"
            :id="filter.key"
            v-model="filterValues[filter.key].value"
            :filter="filter"
            :labels="labels"
            :start-label="filter.startLabel"
            :end-label="filter.endLabel"
          />

          <v-col
            v-else
            class="py-0"
            cols="8"
          >
            <v-text-field
              v-model="filterValues[filter.key].value"
              v-bind="filter.props"
              :data-test="`filterToolbar__input-${filter.key}-${filter.type}`"
              clearable
              outlined
              :label="filter.label"
              type="number"
            />
          </v-col>
        </template>

        <v-col
          v-if="filter.type === EFilterType.Select || filter.type === EFilterType.MultiSelect"
          class="py-0"
          cols="12"
        >
          <v-select
            v-model="filterValues[filter.key].value"
            :menu-props="menuProps"
            outlined
            clearable
            v-bind="filter.props"
            :data-test="`filterToolbar__input-${filter.key}-${filter.type}`"
            :label="filter.label"
            :items="filter.items"
            :multiple="filter.type === EFilterType.MultiSelect"
            :chips="filter.type === EFilterType.MultiSelect"
          />
        </v-col>

        <template v-if="filter.type === EFilterType.Date">
          <v-col
            class="py-0"
            cols="4"
          >
            <v-select
              v-model="filterValues[filter.key].operator"
              class="flex-right"
              :menu-props="menuProps"
              outlined
              :items="filterOperators[filter.type]"
              :item-text="(item) => labels.operators[item.operator]"
              :item-value="(item) => item.operator"
              @change="filterValues[filter.key].value = ''"
            />
          </v-col>

          <v-col
            class="py-0"
            cols="8"
          >
            <date-range
              v-if="filterValues[filter.key].operator === EFilterOperator.Between"
              :id="filter.key"
              v-model="filterValues[filter.key].value"
              :label="filter.label"
              :labels="labels"
              :start-label="filter.startLabel"
              :end-label="filter.endLabel"
            />

            <date
              v-else
              :id="filter.key"
              v-model="filterValues[filter.key].value"
              :label="filter.label"
              :operators="filterOperators[filter.type]"
              :selected-operator.sync="filterValues[filter.key].operator"
            />
          </v-col>
        </template>
      </v-row>
    </v-container>
  </v-form>
</template>

<script lang="ts">
import Vue from 'vue';
import _isArray from 'lodash/isArray';
import {
  IFilterToolbarLabels,
  IFilterSettings,
  EFilterType,
  IFilterTypeOperators,
  FilterItems,
  EFilterFormEvents,
  FilterFormData,
  EFilterOperator,
} from '@/types';
import Number from './inputs/Number.vue';
import Date from './inputs/Date.vue';
import DateRange from './inputs/DateRange.vue';

/**
 * Maps the filterOptions to filter values. The filter values are bound to UI controls and
 * could change by used through UI interface.
 * @param {Array<IFilterSettings>} filterOptions The list of filter settings from the filterOptions prop
 * @param {IFilterTypeOperators} operators The list of available operators per filter type
 */
function generateFilters(filterOptions: Array<IFilterSettings>,
  operators: IFilterTypeOperators): FilterItems {
  const filterItems: FilterItems = {};

  filterOptions.forEach((filter) => {
    if (filter.value && filter.operator) {
      filterItems[filter.key] = { value: filter.value, operator: filter.operator };
    } else {
      // take a first available operator as default operator.
      const defaultOperator = operators[filter.type][0].operator;
      switch (filter.type) {
        case EFilterType.MultiSelect:
          filterItems[filter.key] = { value: [], operator: defaultOperator };
          break;
        default:
          filterItems[filter.key] = { value: '', operator: defaultOperator };
          break;
      }
    }
  });

  return filterItems;
}

/**
 * A filter toolbar which allows the user to build preset filters used for search queries.
 *
 */
export default Vue.extend({
  name: 'RcFilterForm',

  components: {
    Number,
    Date,
    DateRange,
  },

  props: {
    /**
     * Contains localizable labels that are used by component.
     */
    labels: {
      type: Object as () => IFilterToolbarLabels,
      // eslint-disable-next-line
      default: () => ({} as any),
    },
    /**
     * filter types operators.
     * */
    filterOperators: {
      type: Object as () => IFilterTypeOperators,
      required: true,
    },
    /**
     * The array of filter settings to show in the filter form.
     * @property {string} key The key of the field to filter on
     * @property {string} type The type of filter. Options are text, number, date, daterange, select, multiselect.
     * @property {string} label The label for the filter input.
     * @property {Array<Record<string, string>>} items The items to render in a select or multiselect.
     */
    filterOptions: {
      type: Array as () => Array<IFilterSettings>,
      required: true,
    },
    /** A filter values that loaded from storage. */
    formData: {
      type: Object as () => FilterFormData,
      // eslint-disable-next-line
      default: () => ({} as any),
    },
  },

  data() {
    return {
      filterName: '',
      filterValues: generateFilters(this.filterOptions, this.filterOperators),
      rules: {
        required: (value: string) => !!value || this.labels.formRequiredField,
        max255: (value: string) => {
          if (value && value.length > 255) {
            return this.labels.errors.maxLength;
          }

          return true;
        },
      },
      formModel: true,
      EFilterType,
      EFilterOperator,
      menuProps: {
        bottom: true,
        offsetY: true,
      },
    };
  },
  watch: {
    formModel() {
      this.emitValidation();
    },
    filterValues: {
      handler(newValues) {
        this.formData.values = newValues;

        // notify that form has been changed.
        this.$emit(EFilterFormEvents.Changed, true);
        this.emitValidation();
      },
      deep: true,
    },
    filterName(newName: string) {
      this.formData.name = newName;

      // notify that form has been changed.
      this.$emit(EFilterFormEvents.Changed, true);

      this.emitValidation();
    },
    formData: {
      handler(newData: FilterFormData) {
        this.filterName = newData.name;
        this.filterValues = newData.values;
      },
      deep: true,
    },
  },
  methods: {
    emitValidation() {
      // validate the form.
      if (this.validateForm(this.formData.values)) {
        this.$emit(EFilterFormEvents.UpdateFormData, this.formData);
        this.$emit(EFilterFormEvents.Validate, true);
      } else {
        this.$emit(EFilterFormEvents.Validate, false);
      }
    },

    validateForm(formFilters: FilterItems): boolean {
      if (this.formModel === false) {
        return false;
      }

      let valid = true;

      if (!this.filterName || this.filterName.length < 1) {
        valid = false;
      }

      let filtersCount = 0;

      this.filterOptions.forEach((option) => {
        const filterValue = formFilters[option.key];

        if (filterValue && filterValue.value) {
          let flValue = filterValue.value.toString();
          if (_isArray(filterValue.value)) {
            flValue = flValue.replace(',', ''); // remove array item separator
          }
          if (flValue.length > 0 && flValue.length <= 255) {
            filtersCount += 1;
          }
        }
      });

      if (filtersCount <= 0) {
        valid = false;
      }

      return valid;
    },
  },
});
</script>

<style scoped lang="scss">
.flex-right {
  flex: 1;
}
</style>
