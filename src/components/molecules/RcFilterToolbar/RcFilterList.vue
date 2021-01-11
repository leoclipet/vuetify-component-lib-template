<template>
  <div>
    <div class="d-flex justify-space-between">
      <span class="rc-heading-5 fw-bold">
        {{ labels.yourFilters }} ({{ count }})
      </span>

      <div>
        <v-tooltip bottom>
          <template #activator="{ on }">
            <v-btn
              icon
              color="secondary"
              data-test="rcFilterList__newButton"
              v-on="on"
              @click="onNew"
            >
              <v-icon size="24">
                mdi-plus
              </v-icon>
            </v-btn>
          </template>

          <span>{{ labels.tooltipNew }}</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template #activator="{ on }">
            <v-btn
              icon
              color="secondary"
              data-test="rcFilterList__copyButton"
              :disabled="!filterId"
              v-on="on"
              @click="onCopy"
            >
              <v-icon size="24">
                mdi-content-copy
              </v-icon>
            </v-btn>
          </template>

          <span>{{ labels.tooltipCopy }}</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template #activator="{ on }">
            <v-btn
              icon
              color="secondary"
              data-test="rcFilterList__deleteButton"
              :disabled="!filterId"
              v-on="on"
              @click="onDelete"
            >
              <v-icon size="24">
                mdi-delete
              </v-icon>
            </v-btn>
          </template>

          <span>{{ labels.tooltipDelete }}</span>
        </v-tooltip>
      </div>
    </div>

    <v-divider class="grey-lighten-4" />

    <v-radio-group
      v-model="filterId"
      column
    >
      <template v-for="filter in filters">
        <v-radio
          :key="filter.id"
          class="break-word"
          :data-test="`rcFilterList__radio--${filter.id}`"
          :label="filter.name"
          :value="filter.id"
          :checked="filter === filterId"
          @click="onFilterSelect(filter.id)"
        />
      </template>
    </v-radio-group>

    <rc-confirmation-dialog
      data-test="rcFilterList__deleteDialog"
      :title="labels.removeTitle"
      :message="labels.removeBody"
      :show.sync="showDeleteFilterDialog"
      @confirm="onDeleteConfirmation"
    />

    <rc-error-dialog
      :show.sync="showErrorDialog"
      :title="labels.errorDialogTitle"
      :submit-action-label="labels.errorDialogButton"
      :message="errorMessage"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import RcConfirmationDialog from '@/components/atoms/RcDialogs/RcConfirmationDialog.vue';
import RcErrorDialog from '@/components/atoms/RcDialogs/RcErrorDialog.vue';

import {
  IFilterToolbarLabels,
  IFilter,
  FilterListItem,
  EFilterListEvents,
} from '@/types';

const regexGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * A filter toolbar which allows the user to build preset filters used for search queries.
 *
 */
export default Vue.extend({
  name: 'RcFilterList',

  components: {
    RcErrorDialog,
    RcConfirmationDialog,
  },

  props: {
    /**
     * Contains localizable labels that are used by component.
     */
    labels: {
      type: Object as () => IFilterToolbarLabels,
    },
    filters: {
      type: Array as () => Array<FilterListItem>,
      required: true,
    },
    selectedFilterId: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      showErrorDialog: false,
      errorMessage: '',
      showDeleteFilterDialog: false,
      filterId: this.selectedFilterId,
    };
  },

  computed: {
    count(): number {
      if (this.filters && this.filters.length) {
        return this.filters.length;
      }

      return 0;
    },
  },

  watch: {
    selectedFilterId(newId) {
      this.filterId = newId;
    },
    filterId(newId) {
      const isGuid = regexGuid.test(newId);
      if (newId && isGuid) {
        this.$emit(EFilterListEvents.loadFilter, newId);
      }
    },
  },
  methods: {
    /** gets result from confirmation dialog and respond accordingly. */
    onDeleteConfirmation(operationConfirmed: boolean) {
      if (operationConfirmed && this.filterId) {
        this.$emit(EFilterListEvents.deleteFilter, this.filterId);
      }
    },
    onFilterSelect(id: string) {
      this.filterId = id;
    },
    onNew() {
      this.filterId = '';
      this.$emit(EFilterListEvents.newFilter);
    },
    onCopy() {
      if (this.filterId) {
        const isGuid = regexGuid.test(this.filterId);

        if (!isGuid) {
          this.errorMessage = this.labels.errors.FE_NoSelectedFilter;
          this.showErrorDialog = true;
          return;
        }
        this.$emit(EFilterListEvents.copyFilter, this.filterId);
        this.$nextTick(() => {
          this.filterId = '';
        });
      }
    },
    /**
     * Show the dialog to confirm filter delete operation.
     */
    onDelete() {
      if (this.filterId) {
        this.showDeleteFilterDialog = true;
      }
    },
  },
});
</script>

<style scoped lang="scss">
.break-word {
  white-space: break-all;
}
</style>
