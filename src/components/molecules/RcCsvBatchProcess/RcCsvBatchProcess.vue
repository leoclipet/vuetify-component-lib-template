<template>
  <RcFileUpload
    :url="url"
    :headers="headers"
    :auto-close="false"
    :show.sync="show"
    :loading="loading"
    :done="done"
    v-bind="$attrs"
    :max-width="maxWidth"
    :max-size="maxSize"
    :multiple="multiple"
    :submit-label="submitLabel"
    :loading-text="ongoingActionText"
    :place-holder-file-input="placeHolderFileInput"
    :dialog-title="dialogTitle"
    :title-content="titleContent"
    :subtitle-content="subtitleContent"
    :custom-event-handler="true"
    :trigger-upload-process="triggerUploadProcess"
    :indeterminate-loading="indeterminateLoading"
    :allowed-extensions="['csv']"
    @abort="abort"
    @submit="submit"
    @cancel="cancel"
    @close="close"
    @error="error"
    @done="uploadFinished"
  >
    <template slot="done">
      <template v-if="csvValidationError">
        <div
          class="title text-center red--text"
          data-test="title-error-validation"
        >
          {{ titleErrorValidation }}
        </div>
        <div
          class="subtitle-1 text-center mt-3"
          data-test="subtitle-error-validation"
        >
          {{ subtitleErrorValidation }}
        </div>
        <div>
          <ul
            class="error-list rc-body14"
            data-test="summary-error-messages"
          >
            <li
              v-for="(err, index) in csvData.inValidMessages"
              :key="index"
            >
              {{ err }}
            </li>
          </ul>
        </div>
      </template>

      <template v-else>
        <div class="summary">
          <template v-if="fileError">
            <v-icon
              size="70"
              color="status_warning"
              class="mb-2 mt-4"
            >
              mdi-alert-outline
            </v-icon>
            <p
              class="status_warning--text rc-heading-3"
              data-test="summary-file-error-title"
            >
              {{ summaryTitle }}
            </p>
            <p
              class="rc-body14"
              data-test="file-error-text"
            >
              {{ fileErrorText }}
            </p>
            <div class="rows-container">
              <div class="row-success">
                <div
                  class="icon-container"
                  data-test="success-rows"
                >
                  <v-icon
                    size="24"
                    color="status_success"
                    class="mr-2"
                  >
                    mdi-check-circle-outline
                  </v-icon>

                  <div class="rc-body14">
                    {{ responseFromServer.data.succeedRows }} {{ responseFromServer.data.succeedRows === 1 ? successRowsText: successRowsTextPlural }}
                  </div>
                </div>
              </div>
              <div class="row-errors">
                <div
                  class="icon-container"
                  data-test="errors-rows"
                >
                  <v-icon
                    size="24"
                    color="status_error"
                    class="mr-2"
                  >
                    mdi-close-circle-outline
                  </v-icon>

                  <div class="rc-body14">
                    {{ responseFromServer.data.failedRows }} {{ responseFromServer.data.failedRows === 1 ? errorRowsText : errorRowsTextPlural }}
                  </div>
                </div>
              </div>
            </div>
            <v-btn
              class="mt-4"
              color="primary"
              data-test="download-failed-csv"
              @click="downloadCsvFile"
            >
              <v-icon left>
                mdi-download
              </v-icon>

              {{ downloadButtonText }}
            </v-btn>
          </template>

          <template v-if="serverSuccess">
            <v-icon
              size="70"
              color="status_success"
              class="mb-2 mt-4"
            >
              mdi-check-circle-outline
            </v-icon>
            <p
              class="status_success--text rc-heading-3"
              data-test="summary-success-title"
            >
              {{ summaryTitle }}
            </p>

            <p
              v-if="successMessage"
              class="rc-body14"
              data-test="text-success-2"
            >
              {{ successMessage }}
            </p>

            <p
              class="rc-body14"
              data-test="text-success"
            >
              {{ responseFromServer.data.succeedRows }} {{ responseFromServer.data.succeedRows === 1 ? rowsUpdatedLabel : rowsUpdatedLabelPlural }}
            </p>
          </template>
        </div>
      </template>
    </template>

    <!-- Override the default slot content -->
    <template
      v-if="serverError"
      slot="done-error"
    >
      <div class="summary">
        <v-icon
          size="70"
          color="status_error"
          class="mb-2 mt-4"
        >
          mdi-close-circle-outline
        </v-icon>
        <p
          class="status_error--text rc-heading-3"
          data-test="summary-error-title"
        >
          {{ summaryTitle }}
        </p>
        <div>
          <ul
            class="error-list rc-body14"
            data-test="summary-error-messages"
          >
            <li
              v-for="(err, index) in responseFromServer.data.errorMessages"
              :key="index"
            >
              {{ err }}
            </li>
          </ul>
        </div>
      </div>
    </template>
  </RcFileUpload>
</template>

<script lang="ts">
import Vue from 'vue';
import { AxiosResponse, AxiosError } from 'axios';
import RcFileUpload from '@/components/molecules/RcFileUpload/RcFileUpload.vue';
import helpers from '@/helpers';

// eslint-disable-next-line
const CSVFileValidator = require('csv-file-validator');

export default Vue.extend({
  name: 'RcFileUploadCSV',

  components: {
    RcFileUpload,
  },
  props: {
    /**
     * Whether the dialog would show
     */
    show: {
      type: Boolean,
      required: true,
    },
    /**
     * Request URL
     */
    url: {
      type: String,
      required: true,
    },
    /**
     * Placeholder of file input
     */
    placeHolderFileInput: {
      type: String,
      default: 'Select your CSV file',
    },
    /**
     * Title of content displayed
     */
    titleContent: {
      type: String,
      default: 'To update please select a file',
    },
    /**
     * Title of dialog
     */
    dialogTitle: {
      type: String,
      default: 'Batch update',
    },
    /**
     * Subtitle displayed
     */
    subtitleContent: {
      type: String,
      default: 'Any additional text, could be here as well',
    },
    /**
     * Submit label
     */
    submitLabel: {
      type: String,
      default: 'Process',
    },
    /**
     *  Text displayed when uploading
     */
    uploadingText: {
      type: String,
      default: 'Uploading...',
    },
    /**
     * Text displayed when validating
     */
    validationText: {
      type: String,
      default: 'Validation of your file...',
    },
    /**
     * Upload size limit
     */
    maxSize: {
      type: [Number, String],
      default: 2000000, // 2Mb
    },
    /**
     * Whether or not to allow multiple files to be uploaded
     */
    multiple: {
      type: Boolean,
      default: false,
    },
    /**
     * Choose to validate CSV before uploading or not
     */
    validateCsv: {
      type: Boolean,
      default: false,
    },
    /**
     * Title of error validation
     */
    titleErrorValidation: {
      type: String,
      default: 'Validation failed',
    },
    /**
     * Subtitle of error validation
     */
    subtitleErrorValidation: {
      type: String,
      default: 'Please fix your file or check the validation configuration',
    },
    /**
     * Whether the component will emit events done, cancel, abort, close
     * so they can be handle in a custom way
     */
    customEventHandler: {
      type: Boolean,
      default: false,
    },
    /**
     * Summary error title
     */
    summaryErrorTitle: {
      type: String,
      default: 'Error',
    },
    /**
     * Summary success title
     */
    summarySuccessTitle: {
      type: String,
      default: 'Success',
    },
    successMessage: {
      type: String,
      default: '',
    },
    /**
     * Rows updated label
     */
    rowsUpdatedLabel: {
      type: String,
      default: ' row updated',
    },
    rowsUpdatedLabelPlural: {
      type: String,
      default: ' rows updated',
    },
    /**
     * Summary partial error title
     */
    summaryFileErrorTitle: {
      type: String,
      default: 'File error',
    },
    /**
     * Success rows text
     */
    successRowsText: {
      type: String,
      default: 'successful row',
    },
    successRowsTextPlural: {
      type: String,
      default: 'successful rows',
    },
    /**
     * Error rows text
     */
    errorRowsText: {
      type: String,
      default: 'error to resolve',
    },
    errorRowsTextPlural: {
      type: String,
      default: 'errors to resolve',
    },
    /**
     * Partial error text
     */
    fileErrorText: {
      type: String,
      default: 'The file has been processed but there are some issues. So far, no update has been made',
    },
    /**
     * Text in download button
     */
    downloadButtonText: {
      type: String,
      default: 'Download failed rows',
    },
    maxWidth: {
      type: Number,
      default: 750,
    },
    /**
     * Filename for errors rows file
     */
    failedCsvFileName: {
      type: String,
      default: 'failed.csv',
    },
    /**
     * CSV configuration file used to validate CSV before upload (if activated)
     */
    csvConfig: {
      type: Object,
      default: () => ({}),
    },
    /**
     * Request headers
     */
    headers: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      csvData: {} as { inValidMessages: Array<string>; data: Array<string> },
      ongoingActionText: '',
      triggerUploadProcess: false,
      loading: false,
      done: false,
      indeterminateLoading: false,
      responseFromServer: {
        data: {
          failedRows: 0,
          succeedRows: 0,
          file: {
            contentType: null,
            enableRangeProcessing: false,
            fileContents: null,
            fileDownloadName: null,
          },
          errorMessages: [],
        },
      } as AxiosResponse,
    };
  },
  computed: {
    csvValidationError(): boolean {
      return this.csvData.inValidMessages && this.csvData.inValidMessages.length > 0;
    },
    /**
     * True if status is success
     */
    serverSuccess(): boolean {
      return this.responseFromServer.status === 200 && this.responseFromServer.data.failedRows === 0;
    },
    /**
     * True if some rowsData are sent back
     */
    fileError(): boolean {
      return this.responseFromServer.status === 200 && this.responseFromServer.data.failedRows > 0;
    },
    serverError(): boolean {
      return this.responseFromServer.status !== 200;
    },
    summaryTitle(): string {
      if (this.serverSuccess) {
        return this.summarySuccessTitle;
      }
      if (this.fileError) {
        return this.summaryFileErrorTitle;
      }
      if (this.serverError) {
        return this.summaryErrorTitle;
      }
      return 'unknown edge case';
    },
  },
  methods: {
    /**
     *  Method use to validate a CSV structure and content
     *  https://github.com/shystruk/csv-file-validator
     */
    validateCSV(file: File, config: Record<string, unknown>): Promise<{ inValidMessages: Array<string>; data: Array<string> }> {
      return new Promise((resolve, reject) => {
        CSVFileValidator(file, config)
          .then((csvData: any) => {
            resolve(csvData);
          })
          .catch((err: Error) => {
            reject(err);
          });
      });
    },
    /**
     * Clean csvData
     */
    resetCSVData() {
      this.csvData = {
        inValidMessages: [],
        data: [],
      };
    },
    /**
     * Submit the CSV file
     */
    async submit(file: File) {
      this.loading = true;
      if (!this.validateCsv) {
        // If not verification, we perform update directly
        this.triggerUpload();
      } else {
        // we perform verification
        this.ongoingActionText = this.validationText;
        this.indeterminateLoading = true;
        this.csvData = await this.validateCSV(file, this.csvConfig);
        this.indeterminateLoading = false;
        // If validation error we show them, otherwise to trigger upload
        this.csvValidationError ? this.goToDoneState() : this.triggerUpload();
      }
    },
    /**
     * Close is triggered when users close the dialog
     */
    close() {
      this.$emit('update:show', false);
      this.customEventHandler && this.$emit('close');
    },
    /**
     * Close is triggered when users click on cancel
     */
    cancel() {
      this.$emit('update:show', false);
      this.customEventHandler && this.$emit('cancel');
    },
    /**
     * Error is triggered when backend return error
     */
    error(e: AxiosError) {
      if (e.response && e.response.data && e.response.data.errorMessages) {
        this.responseFromServer = e.response;
      } else {
        this.responseFromServer.data.errorMessages = [e.message];
      }

      this.customEventHandler && this.$emit('error', e);
    },
    /**
     * Close is triggered when users click on cancel and when an action is ongoing
     */
    abort() {
      this.loading = false;
      this.triggerUploadProcess = false;
      this.resetCSVData();
      this.customEventHandler && this.$emit('abort');
    },
    /**
     * Close is triggered when users click on cancel
     */
    goToDoneState() {
      this.loading = false;
      this.done = true;
    },
    /**
     * Send signal to RCFileUpload to trigger the upload of the file
     *  Typically it happens directly or after validation if the mode is on
     */
    triggerUpload() {
      this.ongoingActionText = this.uploadingText;
      this.triggerUploadProcess = true;
    },
    /**
     * Triggered when upload of file is done and server has sent its response
     */
    uploadFinished(res: any) {
      this.responseFromServer = res;
      this.customEventHandler && this.$emit('done', res);
    },
    /**
     * Triggered when user wants to download failed rows
     */
    downloadCsvFile() {
      const csv = atob(this.responseFromServer.data.file.fileContents);
      helpers.downloadCsv(csv, this.responseFromServer.data.file.fileDownloadName);
    },
  },
});
</script>
<style lang="scss">
.summary {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  height: 100%;
}
.error-list {
  list-style-type: none;
  padding-left: 0!important;
}
.rows-container {
  text-align: right;
  width: 80%;
  padding: 10px;
  margin: 0px 100px;
  & .row-success,
  .row-errors {
    margin: 10px 0px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    & .icon-container {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>
