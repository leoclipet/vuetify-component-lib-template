<template>
  <rc-dialog
    :title="title"
    :show.sync="show"
    :submit-action-label="submitActionLabel"
    :cancel-action-label="cancelActionLabel"
    content-padding="6"
    :content-only-scrolling="true"
    :persistent="true"
    :max-width="450"
    :min-height="200"
    @close="onClose"
    @cancel="onClose"
    @submit="confirmDeleteFilter"
  >
    <div
      class="rc-body14"
      data-test="confirmation-message"
    >
      {{ message }}
    </div>
  </rc-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import RcDialog from '@/components/atoms/RcDialog/RcDialog.vue';

export default Vue.extend({
  name: 'ConfirmationDialogWebUI',
  components: {
    RcDialog,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      default: '',
    },
    /**
     * Title of the window
     */
    title: {
      type: String,
      default: 'Confirmation',
    },
    /**
     * Text display for primary button
     */
    submitActionLabel: {
      type: String,
      default: 'Yes',
    },
    /**
     * Text display for cancel button
     */
    cancelActionLabel: {
      type: String,
      default: 'No',
    },
  },
  methods: {
    onClose() {
      this.$emit('update:show', false);
    },
    confirmDeleteFilter() {
      this.$emit('update:show', false);
      this.$emit('confirm', true);
    },
  },
});
</script>
