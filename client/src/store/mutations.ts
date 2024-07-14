import type { State, Conversation } from './state'; // Assuming you've exported these from your state file

type Mutations = {
  SET_LLM_PROVIDER(state: State, provider: string): void;
  SET_LLM_SERVICE_INSTANCE(state: State, instance: any): void;
  ADD_COMPONENT(
    state: State,
    component: { content: string; name: string }
  ): void;
  SET_TESTING_TYPE(state: State, newType: string): void;
  SET_ITERATION(state: State, newIteration: number): void;
  UPDATE_FILE_PATH(state: State, newPath: string): void;
  ADD_MESSAGE(state: State, message: { role: string; content: string }): void;
  ADD_TEST(state: State, test: string): void;
  SET_ERROR(state: State, error: any): void;
  SET_LOADING(state: State, isLoading: boolean): void;
  RESET_CONVERSATION(state: State): void;
};

const mutations: Mutations = {
  SET_LLM_PROVIDER(state, provider) {
    state.llmProvider = provider;
    localStorage.setItem('llmProvider', provider);
  },
  SET_LLM_SERVICE_INSTANCE(state, instance) {
    state.llmServiceInstance = instance;
  },
  ADD_COMPONENT(state, component) {
    console.log('ADD_COMPONENT mutation triggered');
    state.component = component;
  },
  SET_TESTING_TYPE(state, newType) {
    state.testingType = newType;
  },
  SET_ITERATION(state, newIteration) {
    state.iteration = newIteration;
    localStorage.setItem('iteration', newIteration.toString());
  },
  UPDATE_FILE_PATH(state, newPath) {
    state.filePath = newPath;
  },
  ADD_MESSAGE(state, message) {
    const errorMessages = {
      invalidMessage: 'message must be a non-null object',
      emptyContent: 'message content must be a non-empty string',
      emptyRole: 'message role must be a non-empty string',
      consecutiveRoles: 'consecutive messages cannot have the same role',
    };

    const isValid = (value: any, type: string, allowEmpty = false): boolean =>
      typeof value === type && (allowEmpty || value.trim() !== '');

    const checkAndLogError = (
      condition: boolean,
      errorKey: keyof typeof errorMessages
    ): boolean => {
      if (!condition) {
        console.error(
          `ADD_MESSAGE mutation error: ${errorMessages[errorKey]}`,
          message
        );
        return false;
      }
      return true;
    };

    if (
      !checkAndLogError(
        typeof message === 'object' && message !== null,
        'invalidMessage'
      )
    )
      return;

    const { role, content } = message;

    if (!checkAndLogError(isValid(content, 'string', true), 'emptyContent'))
      return;

    if (!checkAndLogError(isValid(role, 'string'), 'emptyRole')) return;

    const lastMessage = state.conversation[state.conversation.length - 1];

    if (
      !checkAndLogError(
        !(lastMessage && lastMessage.role === role),
        'consecutiveRoles'
      )
    )
      return;

    console.log(`ADD_MESSAGE mutation triggered for ${role}`);

    state.conversation.push({ role, content } as Conversation);
  },
  ADD_TEST(state, test) {
    console.log('ADD_TEST mutation triggered, is empty:', test === '');
    state.test = test;
  },
  SET_ERROR(state, error) {
    console.log('SET_ERROR mutation triggered', error);
    state.error = error;
  },
  SET_LOADING(state, isLoading) {
    console.log('SET_LOADING mutation triggered', isLoading);
    state.isLoading = isLoading;
  },
  RESET_CONVERSATION(state) {
    if (state.conversation.length > 0) {
      state.conversation = [state.conversation[0]]; // Keep only the first message (system message)
    } else {
      console.warn('No messages found in conversation to reset');
    }
  },
};

export default mutations;
