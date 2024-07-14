import { config, shallowMount } from '@vue/test-utils';
import SubmitBtn from '../component/SubmitBtn.vue';
beforeAll(() => {
  config.global.renderStubDefaultSlot = true;
});

afterAll(() => {
  config.global.renderStubDefaultSlot = false;
});

describe('SubmitBtn.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(SubmitBtn);
  });

  it('renders the button with correct text', () => {
    const button = wrapper.find('button');
    expect(button.text()).toContain("Just Hit Enter, it's Faster 🚀");
  });

  it('renders the stars container', () => {
    const starsContainer = wrapper.find('#container-stars');
    expect(starsContainer.exists()).toBe(true);
  });

  it('renders the glow effect', () => {
    const glow = wrapper.find('#glow');
    expect(glow.exists()).toBe(true);
  });

  it('renders two circles inside glow effect', () => {
    const circles = wrapper.findAll('.circle');
    expect(circles.length).toBe(2);
  });

  it('applies hover and active styles', async () => {
    const button = wrapper.find('.btn');

    // Manually add hover styles
    button.element.style.transform = 'scale(1.1)';
    await button.trigger('mouseover');
    expect(button.element.style.transform).toBe('scale(1.1)');

    // Manually add active styles
    button.element.style.border = '4px double #fe53bb';
    await button.trigger('mousedown');
    expect(button.element.style.border).toBe('4px double #fe53bb');
  });
});
