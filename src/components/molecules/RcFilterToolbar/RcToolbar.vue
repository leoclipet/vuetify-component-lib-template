<template>
  <v-toolbar
    class="grey lighten-5"
    height="56"
    elevation="0"
  >
    <template>
      <v-tooltip
        :open-delay="openDelay"
        bottom
      >
        <template #activator="{ on }">
          <v-btn
            icon
            data-test="filterToolbar__showFilterBtn"
            v-on="on"
            @click="onToggleFilterPanel"
          >
            <v-icon>mdi-filter-variant</v-icon>
          </v-btn>
        </template>
        {{ labels.tooltipAdd }}
      </v-tooltip>
      <v-tooltip
        v-if="!isEmpty(appliedFilter)"
        :key="filter.name"
        :open-delay="openDelay"
        right
      >
        <template #activator="{ on }">
          <v-chip
            :key="filter.name"
            small
            close
            color="primary"
            class="white--text"
            :value="filter"
            :data-test="`filterToolbar__chip-${filter.name}`"
            v-on="on"
            @click:close="onFilterClose"
          >
            {{ filter.name }}
          </v-chip>
        </template>
        {{ labels.tooltipCloseFilter }}
      </v-tooltip>
      <v-spacer />
      <v-divider
        v-if="exportable || importable || $slots.toolbarActions"
        class="mr-3"
        vertical
      />
      <slot name="toolbarActions" />
      <template v-if="exportable">
        <v-btn
          class="white--text"
          small
          color="primary"
          data-test="filterToolbar__export"
          @click="showExportDialog = true"
        >
          <v-icon left>
            mdi-file-export-outline
          </v-icon>
          {{ labels.exportLabel }}
        </v-btn>
      </template>
      <template v-if="importable">
        <v-btn
          text
          small
          data-test="filterToolbar__import"
          @click="$emit('import')"
        >
          <v-icon left>
            mdi-file-import-outline
          </v-icon>
          {{ labels.importLabel }}
        </v-btn>
      </template>
    </template>
    <toolbar-export-dialog
      v-if="exportable"
      :show.sync="showExportDialog"
      :labels="labels"
      :count="count"
      @export="$emit('export')"
    />
  </v-toolbar>
</template>

<script lang="ts">
import Vue from 'vue';
import { IFilterToolbarLabels, IFilter, EFilterToolbarEvents } from '@/types';
import ToolbarExportDialog from './RcToolbarExportDialog.vue';

/**
 * A filter toolbar which allows the user to build preset filters used for search queries.
 *
 */
export default Vue.extend({
  name: 'RcToolbar',

  components: {
    ToolbarExportDialog,
  },

  props: {
    /**
     * Contains localizable labels that are used by component.
     */
    labels: {
      type: Object as () => IFilterToolbarLabels,
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
    /** the counter */
    count: {
      type: Number,
      default: 0,
    },
    /** selected filters */
    filter: {
      type: Object as () => IFilter,
      default: null,
    },
    /**
     * Show or hide filter panel.
     */
    showFilterPanel: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      openDelay: 900,
      errors: false,
      showExportDialog: false,
      appliedFilter: this.filter,
    };
  },
  watch: {
    filter: {
      handler(item) {
        this.appliedFilter = this.filter;
      },
    },
  },
  methods: {
    isEmpty(obj: Record<string, unknown>): boolean {
      return Object.keys(obj).length === 0;
    },
    onFilterClose() {
      this.$emit(EFilterToolbarEvents.updateFilter, {});
    },
    onToggleFilterPanel() {
      this.$emit(EFilterToolbarEvents.updateShowFilterPane, !this.showFilterPanel);
    },
  },
});
</script>
