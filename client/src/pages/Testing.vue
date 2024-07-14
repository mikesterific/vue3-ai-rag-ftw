<template>
  <main class="appWrap">
    <section class="masthead">
      <img src="/ccLogo.svg" class="logo" alt="logo" />
      <Select
        :label="'Type'"
        :modelValue="testingType"
        @update:modelValue="updateTestingType"
        :options="[
          { label: 'Vue/Jest', value: 'vue_jest' },
          { label: 'JS/Mocha', value: 'js_mocha' },
          { label: 'LazyPrompt', value: 'lazy_prompt' },
        ]"
      />
      <Select
        :label="'Service'"
        :modelValue="currentLlmProvider"
        @update:modelValue="updateLlmService"
        :options="[
          { label: 'OpenAI', value: 'openai' },
          { label: 'Claude', value: 'claude' },
        ]"
      />
      <Select
        :label="'Test Iterations:'"
        :modelValue="currentIterations"
        @update:modelValue="updateIteration"
        v-if="showIterations"
        :options="[
          { label: '0', value: 0 },
          { label: '1', value: 1 },
          { label: '2', value: 2 },
          { label: '3', value: 3 },
          { label: '4', value: 4 },
          { label: '5', value: 5 },
          { label: '6', value: 6 },
          { label: '7', value: 7 },
          { label: '8', value: 8 },
          { label: '9', value: 9 },
          { label: '10', value: 10 },
        ]"
      />
      <div class="filePath" v-if="showFilePath">
        <label>@ File Path</label>
        <input type="text" v-model="filePath" @input="updateFilePath" />
      </div>
    </section>
    <Conversation />
    <!-- <NewChat /> -->
    <hr class="hr-separator" />
    <section class="inputWrap" v-if="showInputWrap">
      <Input
        @triggerSend="(message) => sendMessage({ message })"
        :file="selectedFile"
      />
    </section>
    <DropFile v-if="showDropFile" />
  </main>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import Conversation from '@c/Conversation.vue';
import Input from '@c/Input.vue';
import DropFile from '@c/DropFile.vue';
import Select from '@c/Select.vue';

export default {
  data() {
    return {
      filePath: '',
    };
  },
  computed: {
    ...mapState(['testingType', 'llmProvider', 'iteration', 'conversation']),
    currentLlmProvider() {
      return this.llmProvider || 'openai'; // Fallback to 'openai' if llmProvider is null or undefined
    },
    currentIterations() {
      return this.iteration || 3; // Fallback to 'openai' if llmProvider is null or undefined
    },
    showIterations() {
      return this.testingType === 'vue_jest';
    },
    showFilePath() {
      return this.testingType !== 'lazy_prompt';
    },
    showDropFile() {
      return this.testingType !== 'lazy_prompt';
    },
    showInputWrap() {
      return this.testingType === 'lazy_prompt' || this.conversation.length > 1;
    },
  },
  methods: {
    ...mapActions([
      'updateTestingType',
      'updateLlmService',
      'sendMessage',
      'updateIteration',
    ]),
    updateFilePath(e) {
      this.$store.commit('UPDATE_FILE_PATH', e.target.value);
    },
  },
  mounted() {
    this.$store.dispatch('initializeLLMService');
  },
  components: {
    Input,
    Conversation,
    DropFile,
    Select,
  },
};
</script>
<style lang="less">
:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

* {
  box-sizing: border-box;
}

h1 {
  margin-bottom: 64px;
}

html,
body {
  height: 100%;
  padding: 0 40px;
}

.hr-separator {
  border: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.531);
  margin: 24px 0;
}

.inputWrap {
  display: flex;
  margin-bottom: 20px;
  justify-content: space-between;
  align-items: top;
  div:first-child {
    flex: 1;
    margin-right: 20px;
  }
  div:last-child {
    margin-top: 10px;
  }
}
.logo {
  width: 100px;
}
.masthead {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 40px;
  margin-top: 20px;
  > div {
    display: flex;
    align-items: center;
  }
}

.filePath {
  label {
    margin-right: 10px;
    font-weight: bold;
  }
  input {
    width: 300px;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
  }
}
</style>
