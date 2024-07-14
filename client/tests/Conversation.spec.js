import { shallowMount } from '@vue/test-utils';
import Conversation from '../components/Conversation.vue';
import hljs from '../components/Conversation.vue';
import Vuex from '../components/Conversation.vue';

jest.mock('highlight.js', () => ({
  highlightBlock: jest.fn(),
}));

describe('Conversation.vue', () => {
  let getters;
  let store;

  beforeEach(() => {
    getters = {
      conversation: () => [
        { content: 'Message 1' },
        { content: 'Message 2' },
      ],
    };

    store = new Vuex.Store({
      getters,
    });
  });

  it('renders conversation messages', () => {
    const wrapper = shallowMount(Conversation, { global: { plugins: [store] } });
    const messages = wrapper.findAll('.outputCell');
    expect(messages).toHaveLength(2);
    expect(messages.at(0).html()).toContain('Message 1');
    expect(messages.at(1).html()).toContain('Message 2');
  });

  it('calls highlightCodeBlocks on update', async () => {
    const wrapper = shallowMount(Conversation, { global: { plugins: [store] } });
    const highlightCodeBlocksSpy = jest.spyOn(wrapper.vm, 'highlightCodeBlocks');
    await wrapper.vm.$nextTick();
    expect(highlightCodeBlocksSpy).toHaveBeenCalled();
  });

  it('highlights code blocks correctly', () => {
    const wrapper = shallowMount(Conversation, { global: { plugins: [store] } });
    const blocks = wrapper.findAll('.highlight pre code');
    wrapper.vm.highlightCodeBlocks();
    blocks.wrappers.forEach((block) => {
      expect(hljs.highlightBlock).toHaveBeenCalledWith(block.element);
    });
  });

  it('copies code to clipboard when copy button is clicked', async () => {
    const wrapper = shallowMount(Conversation, { global: { plugins: [store] } });
    const mockClipboardWriteText = jest.fn();
    global.navigator.clipboard = { writeText: mockClipboardWriteText };

    const button = document.createElement('button');
    button.classList.add('copy-button');
    const code = document.createElement('code');
    code.innerText = 'code content';
    const pre = document.createElement('pre');
    pre.appendChild(code);
    const nextElementSibling = document.createElement('div');
    nextElementSibling.appendChild(pre);
    button.nextElementSibling = nextElementSibling;

    await wrapper.vm.copyCode({ target: button });
    expect(mockClipboardWriteText).toHaveBeenCalledWith('code content');
  });
});