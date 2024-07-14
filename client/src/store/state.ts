import { getSystemMessageContent } from './helpers';

// Define types for nested objects
export interface Component {
  content: string;
  name: string;
}

export interface Conversation {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Define the main State interface
export interface State {
  OPENAI_API_KEY: string;
  SUPABASE_KEY: string;
  SUPABASE_URL: string;
  CLAUDE_API_KEY: string | undefined;
  llmProvider: string;
  llmServiceInstance: any | null; // You might want to define a more specific type for this
  bestPractice: string;
  iteration: number;
  component: Component;
  conversation: Conversation[];
  filePath: string;
  testingType: string;
  error: any | null; // Consider defining a more specific error type if possible
  isInitial: boolean;
  isLoading: boolean;
  searchResults: any[]; // Consider defining a more specific type for search results
  test: string;
  token: string | null;
  user: any | null; // Consider defining a User interface if you have user data
}

// Create the state object with type annotations
export const state: State = {
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
  SUPABASE_KEY: import.meta.env.VITE_SUPABASE_KEY || '',
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  CLAUDE_API_KEY: import.meta.env.VITE_CLAUDE_API_KEY,
  llmProvider: localStorage.getItem('llmService') || 'openai',
  llmServiceInstance: null,
  bestPractice: '',
  component: {
    content: '',
    name: '',
  },
  conversation: [],
  iteration: parseInt(localStorage.getItem('iteration')) || 3,
  filePath: '',
  testingType: 'vue_jest',
  error: null,
  isInitial: false,
  isLoading: false,
  searchResults: [],
  test: '',
  token: null,
  user: null,
};

// Add the initial system message to the conversation
state.conversation.push({
  role: 'system',
  content: getSystemMessageContent(state.testingType),
});
