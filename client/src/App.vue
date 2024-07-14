<template>
  <Testing />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Testing from './pages/Testing.vue';

export default defineComponent({
  name: 'App',
  data() {
    return {
      modelType: 'testing' as 'testing' | 'slack', // Assuming these are the only two possible values
    };
  },
  components: {
    Testing,
  },
});
</script>

<style scoped>
body {
  padding-bottom: 20px;
  margin-bottom: 20px;
}
</style>
