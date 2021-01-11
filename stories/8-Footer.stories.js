import RcTab from '../src/components/atoms/RcTab/RcTab.vue';

export default {
  title: 'RcTab',
  parameters: {
    componentSubtitle:
      'RcTab',
  },
};

export const Default = () => ({
  components: { RcTab },
  template: '<RcTab :label="\'coucou\'"/>',
});
