import { shallowMount } from '@vue/test-utils'
import Loading from '../components/Loading.vue'

describe('Loading.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Loading)
  });

  it('should render the loader container', () => {
    expect(wrapper.find('.loader').exists()).toBe(true)
  });

  it('should render the SVG element', () => {
    expect(wrapper.find('svg').exists()).toBe(true)
  });

  it('should render three rect elements inside the SVG', () => {
    const rects = wrapper.findAll('rect')
    expect(rects.length).toBe(3)
  });

  it('should apply the correct initial attributes to the rect elements', () => {
    const rects = wrapper.findAll('rect')
    expect(rects.at(0).attributes().x).toBe('0')
    expect(rects.at(0).attributes().y).toBe('10')
    expect(rects.at(0).attributes().width).toBe('4')
    expect(rects.at(0).attributes().height).toBe('10')
    expect(rects.at(0).attributes().fill).toBe('#333')
    expect(rects.at(0).attributes().opacity).toBe('0.2')
  });

  it('should have the correct animations on the rect elements', () => {
    const rects = wrapper.findAll('rect')

    expect(rects.at(0).find('animate[attributeName="opacity"]').attributes().values).toBe('0.2; 1; .2')
    expect(rects.at(0).find('animate[attributeName="height"]').attributes().values).toBe('10; 20; 10')
    expect(rects.at(0).find('animate[attributeName="y"]').attributes().values).toBe('10; 5; 10')

    expect(rects.at(1).find('animate[attributeName="opacity"]').attributes().begin).toBe('0.15s')
    expect(rects.at(1).find('animate[attributeName="height"]').attributes().begin).toBe('0.15s')
    expect(rects.at(1).find('animate[attributeName="y"]').attributes().begin).toBe('0.15s')

    expect(rects.at(2).find('animate[attributeName="opacity"]').attributes().begin).toBe('0.3s')
    expect(rects.at(2).find('animate[attributeName="height"]').attributes().begin).toBe('0.3s')
    expect(rects.at(2).find('animate[attributeName="y"]').attributes().begin).toBe('0.3s')
  });
});