import {
  IFilterToolbarLabels, IFilterTypeOperators, EFilterOperator,
} from '@/types';

const labels: IFilterToolbarLabels = {
  save: 'Save',
  cancel: 'Cancel',
  apply: 'Apply',
  download: 'Download',
  filterCopySuffix: 'copy',
  yourFilters: 'Your filters',
  tooltipNew: 'New filter',
  tooltipAdd: 'Add filter',
  tooltipCopy: 'Copy filter',
  tooltipDelete: 'Delete filter',
  tooltipCloseFilter: 'Click to close filter',
  removeTitle: 'Delete filter',
  removeBody: 'Are you sure you want delete this filter?',
  removeCancel: 'Keep it',
  removeConfirm: 'Delete it',
  importLabel: 'Import',
  exportLabel: 'Export',
  exportTitle: 'Export to CSV',
  exportCancel: 'Cancel',
  exportDownload: 'Download',
  exportFormat: 'Format',
  exportItems: 'Items',
  formFilterName: 'Filter Name',
  formRequiredField: 'This field is required',
  errorDialogTitle: 'Error',
  errorDialogButton: 'Close',
  operators: {
    [EFilterOperator.Between]: 'Between',
    [EFilterOperator.Equal]: 'Equal',
    [EFilterOperator.GreaterEqual]: 'Greater than or equal',
    [EFilterOperator.GreaterThan]: 'Greater than',
    [EFilterOperator.LessThan]: 'Less than',
    [EFilterOperator.LessEqual]: 'Less than or equal',
    [EFilterOperator.In]: 'In',
    [EFilterOperator.BeginsWith]: 'Begins with',
    [EFilterOperator.EndsWith]: 'Ends with',
    [EFilterOperator.Contains]: 'Contains',
  },
  errors: {
    maxLength: 'Maximum length exceeded.',
    maxGreaterThanMin: 'Must be greater than start value.',
    401: 'Please make sure that you are signed-in.',
    500: 'Something has gone wrong, please contact customer support service for more details.',
    NoSelectedFilter: 'Please select filter to continue.',
    Error409002CustomFilterDuplicateName: 'The filter name is already in use, please use a different filter name.',
  },
};

const filterOperators: IFilterTypeOperators = {
  text: [
    { label: 'Equal', operator: EFilterOperator.Equal },
    { label: 'Begins With', operator: EFilterOperator.BeginsWith },
    { label: 'Ends With', operator: EFilterOperator.EndsWith },
    { label: 'Contains', operator: EFilterOperator.Contains },
  ],
  number: [
    { label: 'Equal', operator: EFilterOperator.Equal },
    { label: 'Between', operator: EFilterOperator.Between },
    { label: 'More Than', operator: EFilterOperator.GreaterThan },
    { label: 'Less Than', operator: EFilterOperator.LessThan },
  ],
  select: [
    { label: 'Equal', operator: EFilterOperator.Equal },
  ],
  multiselect: [
    { label: 'In', operator: EFilterOperator.In },
  ],
  date: [
    { label: 'Equal', operator: EFilterOperator.Equal },
    { label: 'After', operator: EFilterOperator.GreaterThan },
    { label: 'Before', operator: EFilterOperator.LessThan },
    { label: 'Between', operator: EFilterOperator.Between },
  ],
};

export default { labels, filterOperators };
