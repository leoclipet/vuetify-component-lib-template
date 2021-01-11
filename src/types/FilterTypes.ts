/* eslint-disable */
export enum EFilterType {
  Text = 'text',
  Number = 'number',
  Select = 'select',
  MultiSelect = 'multiselect',
  Date = 'date',
}

export enum EFilterOperator {
  Between = 'Between',
  Equal = 'Equal',
  GreaterEqual = 'GreaterEqual',
  GreaterThan = 'GreaterThan',
  LessThan = 'LessThan',
  LessEqual = 'LessEqual',
  In = 'In',
  BeginsWith = 'BeginsWith',
  EndsWith = 'EndsWith',
  Contains = 'Contains'
}

export enum EFilterServiceType {
  GetAll = 'getAll',
  Get = 'get',
  Save = 'save',
  Delete = 'delete',
  Create = 'create',
}

export enum EFilterPanelEvents {
  Load = 'load:all',
  Save = 'save:filter',
  UpdateShow = 'update:show',
  UpdateSelectedFilter = 'update:selectedFilter',
  UpdateAppliedFilter = 'update:appliedFilter',
}

export enum EFilterFormEvents {
  Changed = 'formChanged',
  Validate = 'validate',
  UpdateFormData = 'update:formData',
}

export enum EFilterListEvents {
  loadFilter = 'load:filter',
  copyFilter = 'copy:filter',
  deleteFilter = 'delete:filter',
  newFilter = 'new:filter',
}

export enum EFilterToolbarEvents {
  updateFilter = 'update:filter',
  updateShowFilterPane = 'update:showFilterPanel',
}

export interface IFilterOperator {
  label: string,
  operator: EFilterOperator
}

export interface IFilter {
  name?: string;
  filters?: any;
}

export interface IFilterSettings {
  key: string; // key The key of the field to filter on.
  value?: string | Array<string>; // a filter value, if not provided, a default value will be used.
  operator?: string; // an operator, if not provided a default operator will be selected.
  label: string; // localizable label.
  startLabel?: string;
  endLabel?: string;
  type: EFilterType; // filter type, see EFilterType for details.
  items?: Array<{text: string, value: string}>; // in case of dropdown and multi-select  - a list of available options to select from.
}

// aligned with web-api interface
export interface IFilterDTO {
  id?:string,
  name: string,
  listName: string,
  filteringParameters: Array<Array<string>> // [ [dateRange, between, date1, date2] ]
  isEnabled: true
}

export type FilterItem = { operator: string; value: string | Array<string> };
export type FilterItems = Record<string, FilterItem>;
export type FilterFormData = { id?: string, name: string; values: FilterItems; }
export type FilterListItem = { id: string; name: string; }
export type IFilterTypeOperators = Record<EFilterType, Array<IFilterOperator>>
