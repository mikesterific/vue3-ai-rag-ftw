import { shallowMount } from '@vue/test-utils';
import Select from '../components/Select.vue';

describe('Select.vue', () => {
  let wrapper;

  const options = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
  ];

  beforeEach(() => {
    wrapper = shallowMount(Select, {
      props: {
        modelValue: '',
        label: 'Test Select',
        options,
        disabled: false,
      },
    });
  });

  it('renders correctly with given props', () => {
    expect(wrapper.find('.label').text()).toBe('Test Select');
    expect(wrapper.findAll('option').length).toBe(options.length);
  });

  it('emits "update:modelValue" when a new option is selected', async () => {
    const select = wrapper.find('select');
    await select.setValue('1');
    expect(wrapper.emitted()['update:modelValue']).toBeTruthy();
    expect(wrapper.emitted()['update:modelValue'][0]).toEqual(['1']);
  });

  it('disables the select element when disabled prop is true', async () => {
    await wrapper.setProps({ disabled: true });
    const select = wrapper.find('select');
    expect(select.element.disabled).toBe(true);
  });

  it('validates selection correctly', async () => {
    const validateSpy = jest.spyOn(wrapper.vm, 'validate');
    await wrapper.vm.validate();
    expect(validateSpy).toHaveBeenCalled();
  });

  it('sets custom validity message when no option is selected', async () => {
    const selectElement = wrapper.find('select').element;
    selectElement.setCustomValidity = jest.fn();
    await wrapper.vm.validate();
    expect(selectElement.setCustomValidity).toHaveBeenCalledWith('You must select a value');
  });

  it('clears custom validity message when an option is selected', async () => {
    const selectElement = wrapper.find('select').element;
    selectElement.setCustomValidity = jest.fn();
    await wrapper.setProps({ modelValue: '1' });
    await wrapper.vm.validate();
    expect(selectElement.setCustomValidity).toHaveBeenCalledWith('');
  });

  it('renders slot content for label link', async () => {
    wrapper = shallowMount(Select, {
      props: {
        modelValue: '',
        label: 'Test Select',
        options,
        disabled: false,
      },
      slots: {
        'label-link': '<a href="#">Label Link</a>',
      },
    });
    expect(wrapper.find('.label a').exists()).toBe(true);
  });
});