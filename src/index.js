import Vue from 'vue';
import Vuetify from 'vuetify/lib';

import RcTab from './components/atoms/RcTab/RcTab.vue';
import RcPhone from './components/atoms/RcPhone/RcPhone.vue';
import RcPhoneDisplay from './components/atoms/RcPhoneDisplay/RcPhoneDisplay.vue';
import RcDataTable from './components/organisms/RcDataTable/RcDataTable.vue';
import RcFilterToolbar from './components/molecules/RcFilterToolbar/RcFilterToolbar.vue';
import RcDialog from './components/atoms/RcDialog/RcDialog.vue';
import RcFileUpload from './components/molecules/RcFileUpload/RcFileUpload.vue';
import RcCsvBatchProcess from './components/molecules/RcCsvBatchProcess/RcCsvBatchProcess.vue';
import RcGoogleAutocomplete from './components/atoms/RcGoogleAutocomplete/RcGoogleAutocomplete.vue';
import RcCountrySelect from './components/atoms/RcCountrySelect/RcCountrySelect.vue';
import RcNestedTable from './components/organisms/RcNestedTable/RcNestedTable.vue';

Vue.use(Vuetify);

const Components = {
  RcTab,
  RcPhone,
  RcPhoneDisplay,
  RcDataTable,
  RcFilterToolbar,
  RcDialog,
  RcFileUpload,
  RcCsvBatchProcess,
  RcGoogleAutocomplete,
  RcCountrySelect,
  RcNestedTable,
};

Vue.component('RcTab', RcTab);
Vue.component('RcPhone', RcPhone);
Vue.component('RcPhoneDisplay', RcPhoneDisplay);
Vue.component('RcPhoneDisplay', RcDataTable);
Vue.component('RcFilterToolbar', RcFilterToolbar);
Vue.component('RcDialog', RcDialog);
Vue.component('RcFileUpload', RcFileUpload);
Vue.component('RcCsvBatchProcess', RcCsvBatchProcess);
Vue.component('RcGoogleAutocomplete', RcGoogleAutocomplete);
Vue.component('RcCountrySelect', RcCountrySelect);
Vue.component('RcNestedTable', RcNestedTable);

export { RcTab };
export { RcPhone };
export { RcPhoneDisplay };
export { RcDataTable };
export { RcFilterToolbar };
export { RcDialog };
export { RcFileUpload };
export { RcCsvBatchProcess };
export { RcGoogleAutocomplete };
export { RcCountrySelect };
export { RcNestedTable };

// Export the library as a plugin
export default Components;
