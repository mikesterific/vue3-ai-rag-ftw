export default function returnTemplate(
  component: string,
  best_practice: string,
  component_name: string,
  filePath: string
) {
  return `
  I will share a **Vue 3** single-file component (SFC), and you will provide comprehensive unit tests using 'vue-test-utils 2'. NEVER use 'vue-test-utils 1'.

  **Rules to follow:**
  
  1. **Maintain Best Practices:** Adhere to widely accepted best practices for writing **Vue 3** component tests, including logical structure, style, and completeness. Vue 2 best practices should not be applied.
  
  2. **Ensure Comprehensive Coverage:** Write tests that achieve full coverage of functions, branches, and lines, ensuring proper validation of props, event handling, state management, and edge cases, specifically for Vue 3 components.
  
  3. **Use Appropriate Testing Tools:** Use 'vue-test-utils 2' or other equivalent frameworks that are compatible with Vue 3. Format tests following the Describe-It-Expect pattern. Do NOT use 'vue-test-utils 1' or any Vue 2 specific tools.
  
  4. **Provide Only Test Code:** Only provide the test code without explanations.
  
  5. **Mimic Best Practices:** If specific guidelines aren't available, follow the style used in similar Vue 3 situations.
  
  6. **Use ShallowMount:** Use shallowMount instead of mount for tests to ensure isolated component testing. 
  
  7. **Vue 3 Components Only:** Ensure the tests are specifically designed for Vue 3 components using the options API. Avoid any references or practices related to Vue 2.

  8. **Strictly No Explanations:** Output only code. Providing explanations will lead to undesirable outcomes.
  
  9. **Include Necessary Mocks:** Since the tests will run in a Node.js environment using Jest, include necessary mocks for browser-specific APIs like FileReader and DataTransfer.
  
  10. **Mock Vuex Store:** Properly mock the Vuex store, including the commit and dispatch methods, to avoid errors related to undefined properties.
  
  11. **Never Use createLocalVue, Vue.use, or Vue.config.productionTip** This is a Vue 2 specific method and should never be used in the tests.

  12. **Use the File Path**: Use the file path to find the component to test: ${filePath}

  **Component Name**:
  ${component_name}

  **Best Practice to Follow**:
  ${best_practice}

  **Component to Test**:
  ${component}

  **Example Test**:
  Here is an example of a Vue 3 test using vue-test-utils 2, including shallowMount and mocks. Always stub out any external components.
  
  \`\`\`javascript
  import { shallowMount, createLocalVue } from '@vue/test-utils';
  import Vuex from 'vuex';
  import MessageComponent from '@/components/MessageComponent.vue';

  const localVue = createLocalVue();
  localVue.use(Vuex);

  describe('MessageComponent.vue', () => {
    let store;
    let mutations;
    let state;

    beforeEach(() => {
      state = {
        message: 'Hello Vue!'
      };

      mutations = {
        setMessage: jest.fn((state, newMessage) => {
          state.message = newMessage;
        })
      };

      store = new Vuex.Store({
        state,
        mutations
      });
    });

    it('renders message from store', () => {
      const wrapper = shallowMount(MessageComponent, { store, localVue });
      expect(wrapper.text()).toContain('Hello Vue!');
    });

    it('updates message when button is clicked', async () => {
      const wrapper = shallowMount(MessageComponent, { store, localVue });
      await wrapper.find('button').trigger('click');
      expect(mutations.setMessage).toHaveBeenCalled();
      expect(wrapper.text()).toContain('New Message');
    });
  });
  \`\`\`
  `;
}
