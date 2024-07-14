// src/types/shims-vuex.d.ts
import { Store } from 'vuex';
import type { State } from '../store/state';

declare module '@vue/runtime-core' {
  // Provide typings for `this.$store`
  interface ComponentCustomProperties {
    $store: Store<State>;
  }
}
