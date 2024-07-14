import { shallowMount, createLocalVue } from '@vue/test-utils';
import SimilaritySearch from '../components/SimilaritySearch.vue';
import Vuex from '../components/SimilaritySearch.vue';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('SimilaritySearch.vue', () => {
  let actions;
  let getters;
  let store;

  beforeEach(() => {
    actions = {
      performSimilaritySearch: jest.fn(),
    };
    getters = {
      searchResults: () => [],
      isLoading: () => false,
      error: () => null,
    };
    store = new Vuex.Store({
      actions,
      getters,
    });
  });

  it('renders the component', () => {
    const wrapper = shallowMount(SimilaritySearch, { store, localVue });
    expect(wrapper.find('h1').text()).toBe('Similarity Search');
  });

  it('performs search on form submit', async () => {
    const wrapper = shallowMount(SimilaritySearch, { store, localVue });
    const input = wrapper.find('input[type="text"]');
    await input.setValue('test query');
    await wrapper.find('form').trigger('submit.prevent');

    expect(actions.performSimilaritySearch).toHaveBeenCalled();
    expect(actions.performSimilaritySearch.mock.calls[0][1]).toEqual({ query: 'test query' });
  });

  it('displays loading message when isLoading is true', () => {
    getters.isLoading = () => true;
    store = new Vuex.Store({ actions, getters });
    const wrapper = shallowMount(SimilaritySearch, { store, localVue });

    expect(wrapper.find('div').text()).toContain('Loading...');
  });

  it('displays error message when error exists', () => {
    getters.error = () => 'Some error';
    store = new Vuex.Store({ actions, getters });
    const wrapper = shallowMount(SimilaritySearch, { store, localVue });

    expect(wrapper.find('div').text()).toContain('Some error');
  });

  it('displays results when searchResults exist', () => {
    getters.searchResults = () => [
      { id: 1, title: 'Result 1', content: 'Content 1', similarity: 0.9 },
      { id: 2, title: 'Result 2', content: 'Content 2', similarity: 0.8 },
    ];
    store = new Vuex.Store({ actions, getters });
    const wrapper = shallowMount(SimilaritySearch, { store, localVue });

    expect(wrapper.findAll('li').length).toBe(2);
    expect(wrapper.find('li').text()).toContain('Result 1');
  });
});