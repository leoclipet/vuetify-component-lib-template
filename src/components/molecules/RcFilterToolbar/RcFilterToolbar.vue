<template>
  <div class="rc-RCFilterToolbar__container">
    <rc-toolbar
      :labels="labels"
      :filter.sync="selectedFilter"
      :show-filter-panel.sync="showFilterPanel"
      :exportable="exportable"
      :importable="importable"
      :count="count"
      @import="$emit('import')"
      @export="$emit('export')"
    >
      <template #toolbarActions>
        <slot name="toolbarActions" />
      </template>
    </rc-toolbar>
    <rc-filter-panel
      :labels="labels"
      :filter-operators="filterOperators"
      :show.sync="showFilterPanel"
      :filter-key="filterKey"
      :filter-options="filterOptions"
      :response="response"
      :selected-filter.sync="selectedFilter"
      v-on="$listeners"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import _isArray from 'lodash/isArray';
import { parse, add } from 'date-fns';
import {
  IFilter,
  IFilterSettings,
  IFilterToolbarLabels,
  IRestResponse,
  IFilterTypeOperators,
  EFilterPanelEvents,
  EFilterOperator,
} from '@/types';
import RcToolbar from './RcToolbar.vue';
import RcFilterPanel from './RcFilterPanel.vue';
import FilterToolbarDefaults from './FilterToolbarDefaults';

import { ISO_FORMAT } from './inputs/constants';

/**
 * A filter toolbar which allows the user to build preset filters used for search queries.
 */
export default Vue.extend({
  name: 'RcFilterToolbar',
  components: {
    RcToolbar,
    RcFilterPanel,
  },
  props: {
    /** Localizable labels, if not provided by the application, will use English locale values by default */
    labels: {
      type: Object as () => IFilterToolbarLabels,
      default: () => FilterToolbarDefaults.labels,
    },
    /** Localizable filter operators, if not provided by the application, will use English locale values by default */
    filterOperators: {
      type: Object as () => IFilterTypeOperators,
      default: () => FilterToolbarDefaults.filterOperators,
    },
    /**
     * Filter identifier that used to associate filters with a specific application page/control.
     * Example: caseFileFilters, eventFilters...
     */
    filterKey: {
      type: String,
      required: true,
    },
    /**
     * The array of filters to show in the filter panel.
     * @property {Array<IFilterSettings>} filterOptions. See IFilterSettings for details
     */
    filterOptions: {
      type: Array as () => Array<IFilterSettings>,
      required: true,
    },
    /**
     * Enables the export feature for this table
     */
    exportable: {
      type: Boolean,
      default: false,
    },
    /**
     * Enables the import feature for this table
     */
    importable: {
      type: Boolean,
      default: false,
    },
    count: {
      type: Number,
      required: true,
    },
    /**
     * An application response for crud events: create, update, read and delete
     */
    response: Object as () => IRestResponse,
  },

  data() {
    return {
      showFilterPanel: false,
      selectedFilter: {} as IFilter,
    };
  },
  watch: {
    selectedFilter(newValue) {
      const filters: Array<string> = [];

      if (newValue.filters && newValue.filters.length) {
        newValue.filters.forEach((filter: any) => {
          let { value, operator } = filter;

          if (_isArray(filter.value) && !filter.value.length) {
            return;
          }

          if (filter.type === 'date') {
            // If the date is Equal to, we need to search between the selected day and the next day
            if (filter.operator === EFilterOperator.Equal) {
              operator = EFilterOperator.Between;

              const nextDay = add(parse(value, ISO_FORMAT, new Date()), { days: 1 });

              value = [
                new Date(value).toISOString(),
                nextDay.toISOString(),
              ];
            } else if (filter.operator === EFilterOperator.Between) {
              const nextDay = add(parse(value[1], ISO_FORMAT, new Date()), { days: 1 });

              value = [
                new Date(value[0]).toISOString(),
                nextDay.toISOString(),
              ];
            } else {
              value = new Date(value).toISOString();
            }
          }

          if (_isArray(value)) {
            value = value.join(',');
          }

          filters.push([filter.key, operator, value].join(','));
        });
      }

      this.$emit(EFilterPanelEvents.UpdateAppliedFilter, filters);
    },
  },
});
</script>

<style scoped lang="scss">
.rc-RCFilterToolbar__container {
  position: relative;
  border-bottom: 1px solid;
  border-color: var(--v-grey-lighten2);

  & ::v-deep .v-btn {
    margin-right: 12px;
    color: var(--v-grey-darken4);
  }

  & ::v-deep .v-btn:last-child {
    margin-right: 0;
  }
}
</style>
