<template>
  <rc-dialog
    v-bind="$attrs"
    :show="show"
    :title="dialogTitle"
    :submit-action-label="computedSubmitLabel"
    :submit-button-disabled="disableSubmit"
    :show-submit="showSubmitButton"
    :cancel-action-label="computedCancelLabel"
    :show-help="false"
    @cancel="cancel"
    @close="close"
    @submit="submit"
  >
    <div class="parent-container">
      <template v-if="!internalLoading && !internalDone">
        <p
          v-if="titleContent"
          class="rc-body16 fw-bold"
          data-test="titleContent"
        >
          {{ titleContent }}
        </p>
        <p
          v-if="subtitleContent"
          class="rc-body14"
          data-test="subtitleContent"
        >
          {{ subtitleContent }}
        </p>
        <v-file-input
          v-model="files"
          counter
          :multiple="multiple"
          show-size
          :accept="acceptedTypes"
          :error-messages="errorMessages"
          :error-count="2"
          :label="labelFileInput"
          :placeholder="placeHolderFileInput"
          prepend-icon="mdi-paperclip"
          outlined
          @change="checkRules"
          @focus="checkRules"
        />
      </template>
      <template v-if="internalLoading">
        <div class="loading">
          <p
            class="rc-heading-5"
            data-test="loadingText"
          >
            {{ loadingText }}
          </p>
          <v-progress-circular
            data-test="progress-bar"
            :indeterminate="indeterminateLoading"
            :rotate="360"
            :size="50"
            :value="percentCompleted"
            color="primary"
          >
            <template
              v-if="!indeterminateLoading"
              slot="default"
            >
              {{ percentCompleted }}
            </template>
          </v-progress-circular>
        </div>
      </template>
      <template v-if="internalDone && !errorRequest">
        <slot name="done" />
      </template>
      <template v-if="internalDone && errorRequest">
        <slot name="done-error">
          <div class="done-error error">
            {{ errorUploadTitle }}
            <template v-if="response">
              {{ response }}
            </template>
          </div>
        </slot>
      </template>
    </div>
  </rc-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import axios, { CancelTokenSource, CancelTokenStatic } from 'axios';
import RcDialog from '@/components/atoms/RcDialog/RcDialog.vue';
import helpers from '@/helpers';
import http from '@/services/http';
import mimeTypes from '@/components/constant/mimeTypes';

export default Vue.extend({
  name: 'RcFileUpload',
  components: {
    RcDialog,
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
     * Whether the dialog would show
     */
    autoClose: {
      type: Boolean,
      default: true,
    },
    /**
     * Loading state
     */
    loading: {
      type: Boolean,
      default: false,
    },
    /**
     * Done state
     */
    done: {
      type: Boolean,
      default: false,
    },
    /**
     * Request URL
     */
    url: {
      type: String,
      required: true,
    },
    dialogTitle: {
      type: String,
      default: 'File upload',
    },
    /**
     * Label of file input
     */
    labelFileInput: {
      type: String,
      default: 'File input',
    },
    /**
     * Placeholder of file input
     */
    placeHolderFileInput: {
      type: String,
      default: 'Select your file',
    },
    /**
     * Title displayed
     */
    titleContent: {
      type: String,
      default: '',
    },
    /**
     * Subtitle displayed
     */
    subtitleContent: {
      type: String,
      default: '',
    },
    /**
     * Submit label
     */
    submitLabel: {
      type: String,
      default: 'Upload',
    },
    /**
     * Submit label
     */
    doneLabel: {
      type: String,
      default: 'Close',
    },
    /**
     * Cancel label
     */
    cancelLabel: {
      type: String,
      default: 'Cancel',
    },
    /**
     * Text displayed when upload is done
     */
    loadingText: {
      type: String,
      default: 'Uploading ...',
    },
    /**
     * Array of allowed extension to be uploaded
     */
    allowedExtensions: {
      type: Array,
      default: () => [],
    },
    /**
     * Upload size limit
     */
    maxSize: {
      type: [Number, String],
      default: 2000000, // 2Mb
    },
    /**
     * Whether or not the user can select multiple files to upload
     */
    multiple: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether the component will emit events submit, cancel, abort, close, done
     * so they can be handle in a custom way
     */
    customEventHandler: {
      type: Boolean,
      default: false,
    },
    /**
     * If some steps are needed before uploading this will trigger the upload when ready
     */
    triggerUploadProcess: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether the loading progress is indeterminate or not
     */
    indeterminateLoading: {
      type: Boolean,
      default: false,
    },
    /**
     * Title displayed when there is an error during upload
     */
    errorUploadTitle: {
      type: String,
      default: 'Some error during upload',
    },
    /**
     * Error message regarding size of file
     */
    errorSize: {
      type: String,
      default: 'The size should not exceed',
    },
    /**
     * Error message regarding size of file
     */
    errorExtensions: {
      type: String,
      default: 'files only are authorized',
    },
    /**
     * Error message regarding mime type
     */
    errorMimeType: {
      type: String,
      default: 'The MIME type is not authorized',
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
      internalLoading: false,
      internalDone: false,
      errorRequest: false,
      source: {} as CancelTokenSource,
      files: [] as unknown as FileList,
      errorMessages: [] as Array<string>,
      mimeTypes: mimeTypes as { [key: string]: Array<string> },
      percentCompleted: 0,
      response: {},
    };
  },
  computed: {
    currentFile(): File {
      return this.files[0];
    },
    /**
     * Computes an array containing all authorized extensions based on props
     */
    mergedAuthorizedTypes(): Array<string> {
      let mergedAuthorizedTypes = [] as Array<string>;
      (this.allowedExtensions as Array<string>).forEach((ext: string) => {
        mergedAuthorizedTypes = [...this.mimeTypes[ext], ...mergedAuthorizedTypes];
      });
      return mergedAuthorizedTypes;
    },
    disableSubmit(): boolean {
      if (this.internalLoading || !this.currentFile) return true;
      return !this.isFileTypeAuthorized(this.currentFile.type)
          || !this.isFileExtensionAuthorized(this.getFileExtension(this.currentFile))
          || !this.isFileSizeOK(this.currentFile.size);
    },
    fileExtension(): string {
      return this.currentFile && this.getFileExtension(this.currentFile);
    },
    computedSubmitLabel(): string {
      return this.internalDone ? this.doneLabel : this.submitLabel;
    },
    computedCancelLabel(): string {
      return this.internalDone ? this.doneLabel : this.cancelLabel;
    },
    showSubmitButton(): boolean {
      return !this.internalDone && !this.internalLoading;
    },
    /**
     * Filter the selection of files based on extensions
     * Example '.csv, .jpg'
     */
    acceptedTypes(): string {
      if (this.allowedExtensions.length === 0) {
        return `.${this.allowedExtensions[0]}`;
      }
      return this.allowedExtensions.map((ext) => `.${ext}`).join(', ');
    },
  },
  watch: {
    triggerUploadProcess(bool) {
      if (bool) {
        this.uploadFile(this.currentFile, this.url);
      }
    },
    loading(bool) {
      this.internalLoading = bool;
    },
    done(bool) {
      this.internalDone = bool;
    },
    internalLoading(bool) {
      this.$emit('update:loading', bool);
    },
  },
  methods: {
    /**
     * Abort the ongoing upload
     */
    abort() {
      if (this.customEventHandler) this.$emit('abort');
      this.source.cancel('cancel');
    },
    /**
     * Handle the submit action. Triggered when one click on submit3
     */
    async submit() {
      // If user click submit button when uploading is done we close dialog
      if (this.internalDone) {
        this.close();
        return;
      }
      // If custom event handler is on we emit submit event otherwise we upload the file
      if (this.customEventHandler) {
        this.$emit('submit', this.currentFile);
      } else { // we start upload process
        await this.uploadFile(this.currentFile, this.url);
      }
    },
    /**
     * Handle the cancel action, triggered when one click on the cross
     */
    async cancel() {
      // If user click cancel when uploading we go back to file input selection
      if (this.internalLoading) {
        this.abort();
      } else if (this.customEventHandler) {
        this.$emit('cancel');
      } else {
        this.$emit('update:show', false);
      }
    },
    /**
     * Handle the close action, triggered when one click on the cross
     */
    close() {
      // If user close the dialog when loading we abort. In any case, we close
      this.internalLoading && this.abort();
      if (this.customEventHandler) {
        this.$emit('close');
      } else {
        this.$emit('update:show', false);
      }
    },
    /**
     * Verify that the selected file is compliant with rules
     * Triggered when user select a file.
     */
    checkRules(files: FileList) {
      const file = files[0];
      if (!file) {
        this.errorMessages = [];
      } else {
        // We check if the size of the file does not exceed the limit
        if (!this.isFileSizeOK(file.size)) this.errorMessages.push(`${this.errorSize} ${helpers.formatBytes(this.maxSize as number, 2)}`);
        // We check if extension of the file is authorized
        if (!this.isFileExtensionAuthorized(this.getFileExtension(file))) {
          this.errorMessages.push(`${this.allowedExtensions.join(', ')} ${this.errorExtensions}`);
        }
        // We check if the MIME type of the file is authorized
        if (!this.isFileTypeAuthorized(file.type)) this.errorMessages.push(this.errorMimeType);
      }
    },
    /**
     * Get the extension of a file
     */
    getFileExtension(file: File): string {
      if (file.name && file.name.split('.').length > 0) {
        return file.name.split('.').pop() as string;
      } return '';
    },
    /**
     * Check if the file does not exceed the max size
     */
    isFileSizeOK(size: number) {
      return size <= this.maxSize;
    },
    /**
     * Check if the file type is authorized
     */
    isFileTypeAuthorized(type: string) {
      return this.mergedAuthorizedTypes.includes(type);
    },
    /**
     * Check if the file extension is authorized
     */
    isFileExtensionAuthorized(ext: string) {
      return this.allowedExtensions.includes(ext);
    },
    /**
     * Upload file to URL passed in props
     */
    async uploadFile(file: File, url: string) {
      const cancelToken = axios.CancelToken as CancelTokenStatic;
      this.source = cancelToken.source();
      const formData = new FormData();
      formData.append('file', file);
      this.percentCompleted = 0;
      this.internalLoading = true;
      try {
        const headers = { ...this.headers, 'Content-Type': 'multipart/form-data' };
        this.response = await http.post(url, formData, {
          headers,
          cancelToken: this.source.token,
          onUploadProgress: (progressEvent) => {
            this.percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          },
        });
        this.internalDone = true;
        this.internalLoading = false;
        this.customEventHandler && this.$emit('done', this.response);
        this.autoClose && this.close();
      } catch (e) {
        this.internalLoading = false;
        if (axios.isCancel(e)) {
          this.internalDone = false;
          this.errorRequest = false;
        } else {
          this.customEventHandler && this.$emit('error', e);
          this.internalDone = true;
          this.errorRequest = true;
        }
        // Only close if autoclose and no error
        !this.errorRequest && this.autoClose && this.close();
      }
    },
  },
});
</script>
<style lang="scss">
  .parent-container {
    display: flex;
    flex-direction: column;
    width: 100%
  }
  .loading {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    height: 100%;
  }
</style>
