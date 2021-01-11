<template>
  <div class="dataTable__container elevation-2">
    <rc-data-table-header
      v-if="!hideHeader"
      v-bind="headerOptions"
      :search="search"
      :hide-search="hideSearch"
      :show-help="showHelp"
      :help-data="helpData"
      :labels="mergedLabels.header"
      @update:search="search = $event"
    >
      <template #headerLeft>
        <v-btn
          v-if="showAddButton"
          class="mr-3"
          data-test="table__addButton"
          fab
          color="white"
          small
          @click="$emit('add-button')"
        >
          <v-icon color="secondary">
            mdi-plus
          </v-icon>
        </v-btn>
        <slot
          v-else
          name="headerLeft"
        />
      </template>
    </rc-data-table-header>

    <slot name="filter" />

    <rc-data-table-body
      :hide-default-footer="hideFooter"
      :value="value"
      v-bind="tableOptions"
      :items="items"
      :headers="headers"
      :count="count"
      :options="options"
      :custom-columns="customColumns"
      @input="$emit('input', $event)"
      @click:row="$emit('click:row', $event)"
      @update:options="options = $event"
    >
      <template
        v-for="col in customColumns"
        #[`item.${col}`]="data"
      >
        <slot
          :name="`item.${col}`"
          v-bind="data"
        />
      </template>
    </rc-data-table-body>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import _debounce from 'lodash/debounce';

import RcDataTableHeader from './components/RcDataTableHeader.vue';
import RcDataTableBody from './components/RcDataTableBody.vue';

const debouncedSearch = _debounce((context) => {
  context.emitSearchEvent();
}, 1000);

/**
 * A data table that includes pagination, sorting, searching, exporting to CSV
 */
export default Vue.extend({
  name: 'RcDataTable',

  components: {
    RcDataTableHeader,
    RcDataTableBody,
  },

  props: {
    /**
     * The array of selected items
     */
    value: {
      type: Array,
    },

    /**
     * The array of items to show in the table
     */
    items: {
      type: Array,
      required: true,
    },

    /**
     * The array of headers to show in the table. See https://vuetifyjs.com/en/components/data-tables#api for information on values.
     */
    headers: {
      type: Array,
      required: true,
    },

    /**
     * The array of custom columns for which you are providing templates
     */
    customColumns: {
      type: Array,
      required: false,
    },

    /**
     * The total number of items from the search result
     */
    count: {
      type: Number,
      required: true,
    },

    /**
     * The name of the field to sort on
     */
    sortBy: {
      type: String,
      required: true,
    },

    /**
     * Whether to sort in descending order
     */
    sortDesc: {
      type: Boolean,
      default: false,
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

    /**
     * Show the help button in the header
     */
    showHelp: {
      type: Boolean,
      default: false,
    },

    /**
     * Show the plus button in the header
     */
    showAddButton: {
      type: Boolean,
      default: false,
    },

    /**
     * The parameters for the help data
     *
     * @property {string} url The url of the help article
     * @property {string} text The help text to appear in the popup
     */
    helpData: {
      type: Object,
    },

    /**
     * Vuetify properties for the header bar. See https://vuetifyjs.com/en/components/toolbars#toolbars
     */
    headerProps: {
      type: Object,
    },

    /**
     * Whether or not the header is visible
     */
    hideHeader: {
      type: Boolean,
      default: false,
    },

    /**
     * Vuetify properties for the toolbar. See https://vuetifyjs.com/en/components/toolbars#toolbars
     */
    toolbarProps: {
      type: Object,
    },

    /**
     * Whether or not the search inptu is visible
     */
    hideSearch: {
      type: Boolean,
      default: false,
    },

    /**
     * Vuetify properties for the table. See https://vuetifyjs.com/en/components/data-tables#data-tables
     */
    tableProps: {
      type: Object,
    },

    /**
     * The string labels for the data table and its child components, used for internationalization. See the default for the object structure.
     */
    labels: {
      type: Object,
      default: () => ({
        header: {},
      }),
    },
    /**
     * Hide the footer
     */
    hideFooter: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      search: '',

      headerDefaults: {
        color: 'primary darken-1',
        dark: true,
        height: 56,
      },

      toolbarDefaults: {
        flat: true,
        color: 'grey lighten-5',
        height: 56,
      },

      tableDefaults: {
        footerProps: { 'items-per-page-options': [5, 10, 15, 20] },
      },

      labelDefaults: {
        header: {
          title: 'Data Table',
          searchPlaceholder: 'Quick search...',
          helpCenter: 'Help Center',
        },
      },

      options: {
        page: 1,
        itemsPerPage: 10,
        sortBy: [this.sortBy],
        sortDesc: [this.sortDesc],
      },
    };
  },

  computed: {
    headerOptions(): Record<string, unknown> {
      return {
        ...this.headerDefaults,
        ...this.headerProps,
      };
    },

    toolbarOptions(): Record<string, unknown> {
      return {
        ...this.toolbarDefaults,
        ...this.toolbarProps,
      };
    },

    tableOptions(): Record<string, unknown> {
      return {
        ...this.tableDefaults,
        ...this.tableProps,
      };
    },

    mergedLabels(): Record<string, unknown> {
      return {
        header: {
          ...this.labelDefaults.header,
          ...this.labels.header,
        },
      };
    },
  },

  watch: {
    search() {
      this.debouncedSearch();
    },

    options() {
      this.emitSearchEvent();
    },
  },

  methods: {
    emitSearchEvent() {
      /**
       * Search event. Emitted when the sorting, pagination, or search are changed.
       * @property {string} search The search term
       * @property {number} pageIndex The page of results
       * @property {number} pageSize The number of results to fetch
       * @property {string} orderBy The field to sort on
       * @property {boolean} descending Whether to sort the results in descending order.
       */
      this.$emit('search', {
        search: this.search,
        pageIndex: this.options.page,
        pageSize: this.options.itemsPerPage,
        orderBy: this.options.sortBy[0],
        descending: this.options.sortDesc[0],
        includeCount: true,
      });
    },

    debouncedSearch() {
      debouncedSearch(this);
    },
  },
});
</script>

<style scoped lang="scss">
.dataTable__container {
  position: relative;
  width: 100%;
}
</style>
