<template>
  <v-dialog
    v-model="show"
    persistent
    v-bind="$attrs"
    content-class="verify-identity-dialog"
    @click:outside="persistentClose"
    @keydown.stop="persistentClose"
  >
    <v-card
      class="dialog-card"
      :class="{'content-only-scroll': contentOnlyScrolling}"
    >
      <v-toolbar
        :height="toolbarHeight"
        color="primary darken-1"
        dark
        flat
      >
        <slot name="button" />
        <v-toolbar-title
          class="rc-title-3 white--text"
          data-test="dialog-title"
        >
          {{ title }}
        </v-toolbar-title>
        <v-spacer />
        <v-tooltip
          v-if="showHelp"
          bottom
        >
          <template #activator="{ on }">
            <v-btn
              data-test="showHelp"
              icon
              v-on="on"
              @click="openHelp"
            >
              <v-icon color="primary lighten-2">
                mdi-help-circle-outline
              </v-icon>
            </v-btn>
          </template>
          <span>{{ tooltipLabel }}</span>
        </v-tooltip>
        <v-btn
          v-if="showClose"
          :disabled="loading"
          icon
          data-test="dialog-close"
          @click="close"
        >
          <v-icon color="primary lighten-2">
            mdi-close
          </v-icon>
        </v-btn>
      </v-toolbar>
      <div
        class="content-wrapper"
        :style="contentWrapperStyle"
      >
        <div :class="`content full-width pa-${contentPadding}`">
          <slot name="default" />
        </div>
        <div
          v-if="showCancel || showSubmit"
          class="rc-dialog-actions"
        >
          <v-btn
            v-if="showCancel"
            :small="isDense"
            data-test="dialog-cancel-action"
            :disabled="cancelButtonDisabled || loading"
            @click="$emit('cancel')"
          >
            {{ cancelActionLabel }}
          </v-btn>
          <v-btn
            v-if="showSubmit"
            class="ml-3"
            :small="isDense"
            color="primary"
            data-test="dialog-submit-action"
            :loading="loading"
            :disabled="submitButtonDisabled"
            @click.native="$emit('submit')"
          >
            {{ submitActionLabel }}
          </v-btn>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import helpers from '@/helpers';

export default Vue.extend({
  name: 'RcDialog',
  props: {
    /**
     * Min height of the window
     */
    minHeight: {
      type: [String, Number],
      default: 0,
    },
    /**
     * Height of the toolbar
     */
    toolbarHeight: {
      type: Number,
      default: 56,
    },
    /**
     * Whether the dialog would show
     */
    show: {
      type: Boolean,
      default: false,
    },
    /**
     * The padding around the main content area
     */
    contentPadding: {
      type: String,
      default: '8',
    },
    /**
     * Whether only the content is scrollable. In other words, header and footer fixed
     */
    contentOnlyScrolling: {
      type: Boolean,
      default: false,
    },
    /**
     * Title of the window
     */
    title: {
      type: String,
      required: true,
    },
    /**
     * Text display for primary button
     */
    submitActionLabel: {
      type: String,
      default: 'Primary action',
    },
    /**
     * Text display for cancel button
     */
    cancelActionLabel: {
      type: String,
      default: 'Cancel',
    },
    /**
     * Whether to show or not help button
     */
    showHelp: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether to show or not close button
     */
    showClose: {
      type: Boolean,
      default: true,
    },
    /**
     * Link which is open when clicking on help
     */
    helpLink: {
      type: String,
      default: '',
    },
    /**
     * Label displayed on hover tooltip
     */
    tooltipLabel: {
      type: String,
      default: 'Default message tooltip',
    },
    /**
     * Whether submit action button is disabled
     */
    submitButtonDisabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether cancel action button is disabled
     */
    cancelButtonDisabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether to show submit action
     */
    showSubmit: {
      type: Boolean,
      default: true,
    },
    /**
     * Whether cancel action button is disabled
     */
    showCancel: {
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
    persistent: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showDialog: '',
    };
  },
  computed: {
    isPersistent(): boolean {
      return this.loading || this.persistent;
    },
    isDense(): boolean {
      return helpers.checkAttrs(this.$attrs, 'dense');
    },
    isFullScreenMode(): boolean {
      return helpers.checkAttrs(this.$attrs, 'fullscreen');
    },
    minHeightContent(): string {
      if (this.isFullScreenMode) {
        return `calc(100vh - ${this.toolbarHeight}px)`;
      }

      if (this.contentOnlyScrolling && this.minHeight === 0) {
        return '300px';
      }

      return `${this.minHeight}px`;
    },
    contentWrapperStyle(): Record<string, unknown> {
      if (this.contentOnlyScrolling) {
        return { height: this.minHeightContent };
      }

      return { 'min-height': this.minHeightContent };
    },
  },
  /**
     * Will open a new window containing an contextual help
     * @public
     */
  methods: {
    openHelp() {
      helpers.openHelpCenterWindow(this.helpLink, 300);
    },
    persistentClose() {
      if (this.isPersistent) return;
      this.close();
    },
    close() {
      this.$emit('close', false);
    },
  },
});
</script>

<style lang="scss" scoped>

  .content-only-scroll {
    & .content {
      overflow-y: auto;
      & #actions {
        position: absolute;
        bottom: 0px;
      }
    }
  }
  .content-wrapper {
    display: flex;
    flex-direction: column;
  }
  .content {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow-y: auto;
  }
  .rc-dialog-actions {
    width: 100%;
    border-top: 1px solid var(--v-grey-lighten3);
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 16px;
    & button {
      margin: 0 0 0 16px;
    }
  }
</style>
