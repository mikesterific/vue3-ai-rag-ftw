import axios from 'axios';
import { supabase } from '../lib/supabase';
import { extractCodeBlock, cosineSimilarity } from './helpers';
import vueTestingPrompt from '../prompts/testing';
import mochaTestingPrompt from '../prompts/mocha';
import lazyPrompt from '../prompts/lazyPrompt';
import createLLMService from '../store/services/llmService';
import type { State } from './state';
import { Store } from 'vuex';

type Context = {
  commit: Store<State>['commit'];
  state: State;
  dispatch: Store<State>['dispatch'];
};

export interface TestResults {
  passed: boolean;
  content: string;
  errorMessage?: string;
  testCoverage?: number;
  executionTime?: number;
}

export type RunTestFunction = (
  dispatch: any,
  testCode: string,
  component: string,
  componentName: string
) => Promise<TestResults>;

export type GenerateNewTestFunction = (
  dispatch: any,
  content: string
) => Promise<string>;

interface Actions {
  initializeLLMService(context: Context): void;
  updateLlmService(context: Context, provider: string): void;
  updateIteration(context: Context, newIteration: number): void;
  sendMessage(
    context: Context,
    payload: { message: string }
  ): Promise<string | undefined>;
  generateInitialTest(context: Context): Promise<void>;
  iterateTests(context: Context): Promise<void>;
  updateTestingType(context: Context, newType: string): void;
  runTest(context: Context): Promise<TestResults | null>;
  vectorizeInput(
    context: Context,
    userQuery: string
  ): Promise<number[] | undefined>;
  fetchAndSearchEmbeddings(
    context: Context,
    payload: { queryEmbedding: number[]; tableName: string }
  ): Promise<Array<{ id: string; similarity: number; content: string }>>;
  generateNewTest(context: Context, testResults: TestResults): Promise<string>;
  processTestResults(
    context: Context,
    testResults: TestResults
  ): Promise<boolean>;
  runTestIteration(context: Context): Promise<boolean>;
  iterateTests(context: Context): Promise<void>;
}

const actions: Actions = {
  initializeLLMService({ commit, state }: Context) {
    const apiKey: string =
      state.llmProvider === 'openai'
        ? state.OPENAI_API_KEY
        : state.CLAUDE_API_KEY || '';
    const llmService = createLLMService(apiKey, state.llmProvider);
    commit('SET_LLM_SERVICE_INSTANCE', llmService);
  },

  updateLlmService({ commit, dispatch }: Context, provider: string) {
    commit('SET_LLM_PROVIDER', provider);
    dispatch('initializeLLMService');
  },

  updateIteration({ commit }: Context, newIteration: number) {
    commit('SET_ITERATION', newIteration);
  },

  async sendMessage(
    { state, commit }: Context,
    { message }: { message: string }
  ): Promise<string | undefined> {
    if (!state.llmServiceInstance) {
      commit('SET_ERROR', 'LLM service is not initialized');
      throw new Error('LLM service is not initialized');
    }
    if (
      state.testingType === 'lazy_prompt' &&
      state.conversation.length === 1
    ) {
      message = lazyPrompt(message);
    }

    const userMessage = {
      role: 'user',
      content: message,
    };

    commit('ADD_MESSAGE', userMessage);

    commit('SET_LOADING', true);
    try {
      const response: string = await state.llmServiceInstance.sendMessage(
        state
      );

      const assistantMessage = {
        role: 'assistant',
        content:
          state.testingType === 'lazy_prompt'
            ? `\`\`\`${lazyPrompt(response)}\`\`\``
            : response,
      };
      commit('SET_LOADING', false);
      commit('ADD_MESSAGE', assistantMessage);

      return response;
    } catch (error: any) {
      console.error('Error sending message:', error);
      let errorMessage: string =
        'An error occurred while communicating with the API';
      if (error.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.response && error.response.status === 403) {
        errorMessage = 'Authentication error. Please check your API key.';
      } else if (error.response && error.response.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
      }
      commit('SET_LOADING', false);

      commit('SET_ERROR', errorMessage);
      throw error;
    }
  },

  async generateInitialTest({
    state,
    dispatch,
    commit,
  }: Context): Promise<void> {
    try {
      if (!state.component || !state.component.content) {
        throw new Error('Component content is missing or invalid.');
      }

      // VECTORIZING PROMPT
      const vectorizedComponent: number[] | undefined = await dispatch(
        'vectorizeInput',
        state.component.content
      );
      if (!vectorizedComponent) {
        throw new Error('Failed to vectorize the component content.');
      }

      let tableName: string = '';
      let promptTemplate: (...args: any[]) => string;

      switch (state.testingType) {
        case 'vue_jest':
          tableName = 'testing';
          promptTemplate = vueTestingPrompt;
          break;
        case 'js_mocha':
          tableName = 'mochatesting';
          promptTemplate = mochaTestingPrompt;
          break;
        default:
          throw new Error('Failed to get table name.');
      }

      // FETCHING BEST PRACTICES
      const bestPractices:
        | Array<{ id: string; similarity: number; content: string }>
        | undefined = await dispatch('fetchAndSearchEmbeddings', {
        queryEmbedding: vectorizedComponent,
        tableName,
      });
      if (
        !bestPractices ||
        !Array.isArray(bestPractices) ||
        bestPractices.length === 0
      ) {
        throw new Error(
          'Failed to fetch best practices or no best practices found.'
        );
      }

      const stringifyBestPractices: string = bestPractices
        .map((doc) => doc.content)
        .join(' ');

      // GENERATING INITIAL TEST QUERY
      const initialQuery: string = promptTemplate(
        state.component.content,
        stringifyBestPractices,
        state.component.name,
        state.testingType === 'vue_jest' ? state.filePath : undefined
      );

      if (!initialQuery) {
        throw new Error('Failed to generate initial query.');
      }

      // SENDING INITIAL TEST QUERY
      const sendMessageResult: string | undefined = await dispatch(
        'sendMessage',
        {
          message: initialQuery,
        }
      );

      if (sendMessageResult === undefined || sendMessageResult === null) {
        throw new Error('Failed to send message to OpenAI.');
      }

      commit('ADD_TEST', sendMessageResult);

      // ITERATING TESTS
      await dispatch('iterateTests', {
        testCode: state.test,
        component: state.component.content,
        componentName: state.component.name,
      });
    } catch (error: any) {
      console.error('Error generating initial test:', error.message);
      commit('SET_ERROR', error.message);
    }
  },
  async generateNewTest(
    { dispatch, commit }: Context,
    testResults: TestResults
  ): Promise<string> {
    const sendMessageResult: string | undefined = await dispatch(
      'sendMessage',
      {
        message: `${testResults.content}`,
      }
    );

    if (!sendMessageResult) {
      throw new Error('Failed to send message to OpenAI or invalid response');
    }

    const newTestCode: string | null = extractCodeBlock(sendMessageResult);

    if (!newTestCode) {
      throw new Error('Failed to extract code block from OpenAI response');
    }

    commit('ADD_TEST', newTestCode);
    return newTestCode;
  },

  async processTestResults(
    { commit, dispatch }: Context,
    testResults: TestResults
  ): Promise<boolean> {
    if (testResults.passed) {
      console.log('Test passed!');
      return true;
    }

    console.log('Test failed, generating new test...');
    await dispatch('generateNewTest', testResults);

    const newTestResults: TestResults = await dispatch('runTest');

    if (newTestResults.passed) {
      console.log('New test passed!');
      return true;
    }

    const userMessage = {
      role: 'user',
      content: newTestResults.content,
    };

    commit('ADD_MESSAGE', userMessage);
      
    return false;
  },

  async runTestIteration({ dispatch }: Context): Promise<boolean> {
    const testResults: TestResults = await dispatch('runTest');
    return dispatch('processTestResults', testResults);
  },

  async iterateTests({ state, dispatch, commit }: Context): Promise<void> {
    const maxIterations: number = (() => {
      if (state.testingType !== 'vue_jest') {
        return 0;
      }
      return typeof state.iteration === 'number' ? state.iteration : 3;
    })();

    try {
      for (let i = 0; i < maxIterations; i++) {
        console.log(`Starting iteration ${i + 1}`);
        const testPassed: boolean = await dispatch('runTestIteration');
        if (testPassed) {
          break;
        }
      }

      if (maxIterations > 0) {
        console.log('Reached maximum iterations without passing the test.');
      }
    } catch (error: any) {
      console.error('Error during test iteration:', error);
      commit('SET_ERROR', `Error during test iteration: ${error.message}`);
    }
  },

  updateTestingType({ commit }: Context, newType: string) {
    commit('SET_TESTING_TYPE', newType);
  },

  async runTest({ state, commit }: Context): Promise<TestResults | null> {
    try {
      console.log('runTest action initiated');

      const testCode: string = state.test,
        component: string = state.component.content,
        componentName: string = state.component.name;

      if (!testCode || !component || !componentName) {
        console.error('Invalid input parameters for runTest', {
          testCode,
          component,
          componentName,
        });
        throw new Error('Invalid input parameters for runTest');
      }

      console.log('Sending API request to run tests');
      const response = await axios.post<TestResults>(
        'http://localhost:3002/run-tests',
        {
          testCode,
          component,
          componentName,
        }
      );

      console.log('API response received:', response);

      if (response.status !== 200) {
        console.error(
          `API request failed with status ${response.status}`,
          response
        );
        throw new Error(`API request failed with status ${response.status}`);
      }
      console.log('API request successful:', response.data);

      const testResults: TestResults = response.data;
      console.log('Received test results:', testResults);

      if (!testResults || typeof testResults !== 'object') {
        console.error('Invalid test results received from API', testResults);
        throw new Error('Invalid test results received from API');
      }

      return testResults;
    } catch (error: any) {
      console.error('Error running tests:', error);
      commit('SET_ERROR', error.message);
      return null;
    }
  },

  async vectorizeInput(
    { state, commit }: Context,
    userQuery: string
  ): Promise<number[] | undefined> {
    console.log(
      `vectorizeInput action triggered with key ${state.OPENAI_API_KEY}`
    );
    try {
      const response = await axios.post<{
        data: Array<{ embedding: number[] }>;
      }>(
        'https://api.openai.com/v1/embeddings',
        {
          model: 'text-embedding-ada-002',
          input: userQuery,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${state.OPENAI_API_KEY}`,
          },
        }
      );
      const embedding: number[] = response.data.data[0].embedding;
      return embedding;
    } catch (error: any) {
      console.error('Error in vectorizing input:', error);
      commit('SET_ERROR', 'Failed to vectorize input');
      throw error;
    }
  },

  async fetchAndSearchEmbeddings(
    { commit }: Context,
    {
      queryEmbedding,
      tableName,
    }: { queryEmbedding: number[]; tableName: string }
  ): Promise<Array<{ id: string; similarity: number; content: string }>> {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('id, title, content, embedding');

      if (error) {
        throw new Error(error.message);
      }

      if (data && data.length > 0) {
        const searchResults = data
          .map((doc) => ({
            id: doc.id,
            similarity: cosineSimilarity(queryEmbedding, doc.embedding),
            content: doc.content,
          }))
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, 3);

        return searchResults;
      } else {
        throw new Error('No search results found');
      }
    } catch (error: any) {
      console.error('Error fetching and searching embeddings:', error);
      commit('SET_ERROR', 'Failed to fetch and search embeddings');
      return [];
    }
  },
};

export default actions;
