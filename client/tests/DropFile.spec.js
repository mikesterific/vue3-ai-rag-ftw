import { shallowMount, createLocalVue } from '@vue/test-utils';
import DropFile from '../components/DropFile.vue';
import Vuex from '../components/DropFile.vue';

// Mock FileReader
jest.mock('FileReader', () => {
  return jest.fn().mockImplementation(() => {
    return {
      readAsText: jest.fn(),
      onload: jest.fn(),
    };
  });
});

describe('DropFile.vue', () => {
  let actions;
  let store;

  beforeEach(() => {
    actions = {
      commit: jest.fn(),
    };

    store = new Vuex.Store({
      actions,
    });
  });

  it('renders the drop zone', () => {
    const wrapper = shallowMount(DropFile, {
      global: {
        mocks: {
          $store: store,
        },
      },
    });
    expect(wrapper.find('.dropzone').exists()).toBe(true);
  });

  it('displays file upload prompt when no file is present', () => {
    const wrapper = shallowMount(DropFile, {
      global: {
        mocks: {
          $store: store,
        },
      },
    });
    expect(wrapper.find('p').text()).toBe('Drop a text file here or click to select a file');
  });

  it('displays file uploaded message when file is present', async () => {
    const wrapper = shallowMount(DropFile, {
      global: {
        mocks: {
          $store: store,
        },
      },
    });
    await wrapper.setData({ file: new File(['content'], 'test.txt', { type: 'text/plain' }) });
    expect(wrapper.find('p').text()).toBe('file uploaded');
  });

  it('handles file drop', async () => {
    const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(mockFile);

    const wrapper = shallowMount(DropFile, {
      global: {
        mocks: {
          $store: store,
        },
      },
    });

    const dropZone = wrapper.find('.dropzone');
    await dropZone.trigger('drop', { dataTransfer });

    expect(wrapper.vm.file).toBe(mockFile);
    expect(store.commit).toHaveBeenCalledWith('RUN_TEST_GEN', 'true');
  });

  it('handles file selection', async () => {
    const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });

    const wrapper = shallowMount(DropFile, {
      global: {
        mocks: {
          $store: store,
        },
      },
    });

    const fileInput = wrapper.find('input[type="file"]');
    await fileInput.trigger('change', { target: { files: [mockFile] } });

    expect(wrapper.vm.file).toBe(mockFile);
  });

  it('reads file content', async () => {
    const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
    const reader = new FileReader();

    const wrapper = shallowMount(DropFile, {
      global: {
        mocks: {
          $store: store,
        },
      },
    });

    wrapper.vm.file = mockFile;
    wrapper.vm.readFileContent();

    reader.onload();
    expect(wrapper.vm.fileContent).toBe('content');
    expect(store.commit).toHaveBeenCalledWith('ADD_COMPONENT', { content: 'content', name: 'test.txt' });
  });
});