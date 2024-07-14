import { shallowMount } from '@vue/test-utils';
import Vuex from '../components/Input.vue';
import Component from '../components/Input.vue';
import SubmitBtn from '../components/Input.vue';
import Loading from '../components/Input.vue';

describe('Component.vue', () => {
  let actions;
  let getters;
  let store;

  beforeEach(() => {
    actions = {
      sendMessage: jest.fn(),
    };
    getters = {
      isLoading: () => false,
      error: () => '',
    };
    store = new Vuex.Store({
      actions,
      getters,
    });
  });

  it('renders correctly', () => {
    const wrapper = shallowMount(Component, {
      global: {
        plugins: [store],
      },
    });
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.findComponent(Loading).exists()).toBe(false);
    expect(wrapper.find('.input').exists()).toBe(true);
    expect(wrapper.findComponent(SubmitBtn).exists()).toBe(true);
  });

  it('displays loading component when isLoading is true', () => {
    getters.isLoading = () => true;
    const wrapper = shallowMount(Component, {
      global: {
        plugins: [store],
      },
    });
    expect(wrapper.findComponent(Loading).exists()).toBe(true);
  });

  it('displays error message when error exists', async () => {
    getters.error = () => 'An error occurred';
    const wrapper = shallowMount(Component, {
      global: {
        plugins: [store],
      },
    });
    expect(wrapper.find('div').text()).toContain('An error occurred');
  });

  it('calls handleSendMessage method when SubmitBtn is clicked', async () => {
    const wrapper = shallowMount(Component, {
      global: {
        plugins: [store],
      },
    });
    const handleSendMessage = jest.spyOn(wrapper.vm, 'handleSendMessage');
    await wrapper.findComponent(SubmitBtn).trigger('click');
    expect(handleSendMessage).toHaveBeenCalled();
  });

  it('updates newMessage data when input value changes', async () => {
    const wrapper = shallowMount(Component, {
      global: {
        plugins: [store],
      },
    });
    const textarea = wrapper.find('.input');
    await textarea.setValue('New message');
    expect(wrapper.vm.newMessage).toBe('New message');
  });

  it('handles Ctrl+Enter keyup event', async () => {
    const wrapper = shallowMount(Component, {
      global: {
        plugins: [store],
      },
    });
    const handleSendMessage = jest.spyOn(wrapper.vm, 'handleSendMessage');
    const textarea = wrapper.find('.input');
    await textarea.trigger('keyup.ctrl.enter');
    expect(handleSendMessage).toHaveBeenCalled();
  });

  it('resets newMessage after sending the message', async () => {
    const wrapper = shallowMount(Component, {
      global: {
        plugins: [store],
      },
    });
    wrapper.setData({ newMessage: 'Test message' });
    await wrapper.vm.handleSendMessage();
    expect(wrapper.vm.newMessage).toBe('');
  });

  it('does not send empty message', async () => {
    const wrapper = shallowMount(Component, {
      global: {
        plugins: [store],
      },
    });
    wrapper.setData({ newMessage: '' });
    await wrapper.vm.handleSendMessage();
    expect(actions.sendMessage).not.toHaveBeenCalled();
  });

  it('sends message with combined text when file is provided', async () => {
    const wrapper = shallowMount(Component, {
      global: {
        plugins: [store],
      },
      props: {
        file: {
          fileName: 'test.vue',
          fileContent: '<template></template>',
        },
      },
    });
    wrapper.setData({ newMessage: 'Message content' });
    await wrapper.vm.handleSendMessage();
    expect(actions.sendMessage).toHaveBeenCalledWith({
      message:
        'Message content\n\n The component name is: test.vue\n\n This is the component content: <template></template>',
      apiKey: '',
    });
  });
});
