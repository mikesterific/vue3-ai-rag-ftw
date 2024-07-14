import type { Store } from 'vuex';
import type { ComponentCustomProperties } from 'vue';

// Assuming you have a type definition for your store's state
import type { State } from '../client/src/store/state'; // Adjust the path to where your store's state type is defined

declare module '@vue/runtime-core' {
  // Provide typings for `this.$store`.
  interface ComponentCustomProperties {
    $store: Store<State>;
  }
}
