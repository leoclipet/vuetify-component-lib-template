<template>
  <v-app>
    <RcTab :label="'test'" />
  </v-app>
</template>

<script>
export default {
  name: 'App',
  components: {
    RcTab: () => import('./components/atoms/RcTab/RcTab.vue'),
  },
  data() {
    return {};
  },
};
</script>

<style lang="scss" scoped></style>
