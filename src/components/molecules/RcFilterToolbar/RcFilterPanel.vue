<template>
  <v-scroll-y-transition>
    <div
      v-if="show"
      id="FilterPanelContainer"
      class="elevation-3 rc-RCFilterToolbar__customFilters"
    >
      <div class="rc-panelContainer">
        <div class="filterList__container">
          <rc-filter-list
            :labels="labels"
            :filters="availableFilters"
            :selected-filter-id.sync="selectedFilterId"
            v-on="$listeners"
            @copy:filter="onCopy"
            @new:filter="onNew"
          />
        </div>

        <v-divider
          class="grey-lighten-4"
          vertical
        />

        <div class="filterForm__container">
          <rc-filter-form
            ref="filterForm"
            :labels="labels"
            :filter-options="filterOptions"
            :filter-operators="filterOperators"
            :form-data.sync="formData"
            @validate="formValid = $event"
            @formChanged="formChanged = $event"
          />
        </div>
      </div>

      <div class="rc-panelContent__actions">
        <v-btn
          data-test="filterToolbar__btn-cancel"
          @click="onCancel"
        >
          {{ labels.cancel }}
        </v-btn>

        <v-btn
          color="primary white--text"
          data-test="filterToolbar__btn-apply"
          :disabled="!formValid"
          @click="onApply"
        >
          {{ labels.apply }}
        </v-btn>

        <v-btn
          color="primary white--text"
          data-test="filterToolbar__btn-save"
          :disabled="!formValid || !formChanged"
          :loading="loading"
          @click="onSave"
        >
          {{ labels.save }}
        </v-btn>
      </div>

      <rc-error-dialog
        :show.sync="showErrorDialog"
        :title="labels.errorDialogTitle"
        :submit-action-label="labels.errorDialogButton"
        :message="errorMessage"
      />
    </div>
  </v-scroll-y-transition>
</template>

<script lang="ts">
import Vue from 'vue';
import _slice from 'lodash/slice';
import RcErrorDialog from '@/components/atoms/RcDialogs/RcErrorDialog.vue';
import {
  IFilterToolbarLabels,
  IFilterSettings,
  IRestResponse,
  IFilterTypeOperators,
  IFilter,
  IFilterDTO,
  EFilterServiceType,
  EFilterPanelEvents,
  FilterListItem,
  EFilterType,
  FilterFormData,
  EFilterOperator,
} from '@/types';
import RcFilterForm from './RcFilterForm.vue';
import RcFilterList from './RcFilterList.vue';

/**
 * A filter toolbar which allows the user to build preset filters used for search queries.
 *
 */
export default Vue.extend({
  name: 'RcFilterPanel',

  components: {
    RcFilterForm,
    RcFilterList,
    RcErrorDialog,
  },

  props: {
    /**
     * Control whether to show panel or not.
     */
    show: {
      type: Boolean,
      default: false,
    },
    /**
     * Contains localizable labels that are used by component.
     */
    labels: {
      type: Object as () => IFilterToolbarLabels,
    },
    filterKey: {
      type: String,
      required: true,
    },
    /**
     * The array of filters to show in the filter panel.
     * @property {string} key The key of the field to filter on
     * @property {string} type The type of filter. Options are text, number, date, daterange, select, multiselect.
     * @property {string} label The label for the filter input.
     * @property {Array<Record<string, string>>} items The items to render in a select or multiselect.
     */
    filterOptions: {
      type: Array as () => Array<IFilterSettings>,
      required: true,
    },
    /** filter types operators */
    filterOperators: {
      type: Object as () => IFilterTypeOperators,
      required: true,
    },
    /** The application crud response */
    response: Object as () => IRestResponse,
    /** Once apply filter triggered, a filter marked as selected and will appear on FilterToolbar. */
    selectedFilter: Object as () => IFilter,
  },

  data() {
    return {
      errorMessage: '',
      loading: false,
      formValid: false,
      formChanged: false,
      showErrorDialog: false,
      selectedFilterId: '', // selected filter on list component.
      availableFilters: [] as Array<FilterListItem>, // user filters on list component.
      formData: {} as FilterFormData, // filter values on form component.
      showPanelEvent: EFilterPanelEvents.UpdateShow, // control whether to show panel component or not.
    };
  },
  watch: {
    show(newValue) {
      if (newValue === false) {
        this.formValid = false;
        this.formChanged = false;
        this.selectedFilterId = '';
        this.formData = this.getFormData({ data: {} });
      }
    },
    response(newResponse: IRestResponse) {
      this.loading = false;
      if (!newResponse.success) {
        this.errorMessage = this.getErrorMessage(newResponse.statusText);
        this.showErrorDialog = true;
      }

      switch (newResponse.source) {
        case EFilterServiceType.GetAll:
          this.availableFilters = this.getAvailableFilters(newResponse);
          break;
        case EFilterServiceType.Create:
          if (newResponse.data) { // data contains a filter id that just created
            this.formData = { ...this.formData, id: newResponse.data };
            this.selectedFilterId = newResponse.data;
            this.$emit(EFilterPanelEvents.Load);
          }
          break;
        case EFilterServiceType.Save:
          this.selectedFilterId = newResponse.data.id;
          this.$emit(EFilterPanelEvents.Load);
          break;
        case EFilterServiceType.Get:
          this.formData = this.getFormData(newResponse); // set form data
          break;
        case EFilterServiceType.Delete:
          this.selectedFilterId = ''; // clear selected filter from list
          this.formData = this.getFormData(newResponse); // clear form data
          (this.$refs.filterForm as any).$refs.form.resetValidation();

          this.$emit(EFilterPanelEvents.Load);
          break;
        default:
          break;
      }
    },
  },
  mounted() {
    this.loading = true;
    this.formData = this.getFormData({ data: {} });
    this.$emit(EFilterPanelEvents.Load);
  },
  methods: {
    onNew() {
      this.formData = this.getFormData({ data: {} });
      (this.$refs.filterForm as any).$refs.form.resetValidation();
    },
    onCopy(filterId: string) {
      const tmpName = `${this.formData.name} ${this.labels.filterCopySuffix}`;
      const tmpId = (this.availableFilters.length + 1).toString();
      this.selectedFilterId = tmpId;

      // clear the form key fields
      this.formData.name = tmpName;
      this.formData.id = '';
    },
    onCancel() {
      this.$emit(`${this.showPanelEvent}`, false);
    },
    onApply() {
      let counter = 0;
      const filter: IFilter = { name: this.formData.name, filters: [] };
      this.filterOptions.forEach((option, i) => {
        const filterValue = this.formData.values[option.key];
        if (filterValue.value) {
          filter.filters[counter] = {
            key: option.key,
            type: option.type,
            operator: filterValue.operator,
            value: filterValue.value,
          };
          counter += 1;
        }
      });

      this.$emit(EFilterPanelEvents.UpdateSelectedFilter, filter);
      this.$emit(`${this.showPanelEvent}`, false);
    },
    onSave() {
      this.loading = true;

      const filter: IFilterDTO = {
        id: this.formData.id,
        name: this.formData.name,
        listName: this.filterKey,
        filteringParameters: [],
        isEnabled: true,
      };

      this.filterOptions.forEach((option, i) => {
        const filterValue = this.formData.values[option.key];
        const hasValue = filterValue.value ? filterValue.value.toString().length > 0 : false;
        if (filterValue && hasValue) {
          let flItems: Array<string> = [];
          flItems = flItems.concat(option.key, filterValue.operator, filterValue.value);
          filter.filteringParameters.push(flItems);
        }
      });

      this.$emit(EFilterPanelEvents.Save, filter);
    },
    getAvailableFilters(response: Partial<IRestResponse>): Array<FilterListItem> {
      const filters: Array<FilterListItem> = [];
      if (response.data) {
        const data = response.data as Array<IFilterDTO>;
        data.forEach((item) => {
          const listItem = {
            id: item.id,
            name: item.name,
          } as FilterListItem;
          filters.push(listItem);
        });
      }

      return filters;
    },
    getFormData(response: Partial<IRestResponse>): FilterFormData {
      const dto = response.data as IFilterDTO;
      let filter: FilterFormData = { name: '', values: {} };

      // structure: <key, {operator, value1}> or <key, {operator, [value1, value2...]}>
      const dic: Record<string, {operator: string; value: string | Array<string>}> = {};
      if (dto && dto.filteringParameters) {
        filter = { id: dto.id, name: dto.name, values: {} }; // set values

        dto.filteringParameters.forEach((params) => {
          dic[params[0]] = { operator: params[1], value: _slice(params, 2, params.length) };
        });
      }

      for (let index = 0; index < this.filterOptions.length; index += 1) {
        const flOption = this.filterOptions[index];
        const vl = dic[flOption.key];
        let itemValue: string | Array<string>;
        let itemOperator: string = this.filterOperators[flOption.type][0].operator;

        if (vl) {
          itemOperator = vl.operator;
        }

        switch (flOption.type) {
          case EFilterType.MultiSelect:
            itemValue = vl ? vl.value : [];
            filter.values[flOption.key] = { operator: itemOperator, value: itemValue };
            break;
          case EFilterType.Date:
          case EFilterType.Number:
            if (itemOperator === EFilterOperator.Between) {
              itemValue = vl ? vl.value : [];
              filter.values[flOption.key] = { operator: itemOperator, value: itemValue };
            } else {
              itemValue = vl ? vl.value.toString() : '';
              filter.values[flOption.key] = { operator: itemOperator, value: itemValue };
            }
            break;
          default:
            itemValue = vl ? vl.value.toString() : '';
            filter.values[flOption.key] = { operator: itemOperator, value: itemValue };
            break;
        }
      }

      return filter;
    },
    getErrorMessage(errorCode: string | any): string {
      if (typeof (errorCode) === 'string') {
        let errMsg = this.labels.errors[errorCode];
        errMsg = errMsg || this.labels.errors['500'];
        return errMsg;
      }

      if ('status' in errorCode) {
        const code = errorCode.status;
        let errMsg = this.labels.errors[code];
        errMsg = errMsg || this.labels.errors['500'];
        return errMsg;
      }

      return this.labels.errors['500'];
    },
  },
});
</script>

<style scoped lang="scss">
.rc-RCFilterToolbar__customFilters {
  background-color: white;
  position: absolute;
  width: 100%;
  left: 0;
  right: 0;
  top: 57px;
  z-index: 2;
}
.rc-panelContent__actions {
  width: 100%;
  border-top: 1px solid var(--v-grey-lighten3);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 24px;
  & button {
    margin: 0 0 0 16px;
  }
}
.rc-panelContainer {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.filterList__container {
  flex: 1;
  padding: 32px;
}
.filterForm__container {
  flex: 2;
  padding: 32px;
}
</style>
