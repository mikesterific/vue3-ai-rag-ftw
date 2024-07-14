// src/types/vite-env.d.ts
/// <reference types="vite/client" />

import { Store } from 'vuex';
import type { State } from '../store/state';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: Store<State>;
  }
}

export { Store };
