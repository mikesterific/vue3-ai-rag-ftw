import type { State } from './state';

export default {
  conversation: (state: State): State['conversation'] => state.conversation,
  isLoading: (state: State): State['isLoading'] => state.isLoading,
  error: (state: State): State['error'] => state.error,
  searchResults: (state: State): State['searchResults'] => state.searchResults,
  test: (state: State): State['test'] => state.test,
};
