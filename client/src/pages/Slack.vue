<template>
  <main class="appWrap">
    <Conversation />
    <hr class="hr-separator" />
    <Input @triggerSend="sendMessage" />
  </main>
</template>

<script>
import Conversation from '@c/Conversation.vue';
import Input from '@c/Input.vue';
export default {
  data() {
    return {
      newMessage: '',
    };
  },
  props: {
    modelType: {
      type: String,
      default: 'testing',
    },
  },
  methods: {
    sendMessage(message) {
      const promptServer = './prompts';
      this.newMessage = message; // Update newMessage with the emitted message

      if (this.newMessage.trim()) {
        this.$store.dispatch('sendMessage', {
          message: this.modelType,
          returnTemplatePath: `${promptServer}/slack.js`,
        });
        this.newMessage = ''; // Clear the newMessage data property
      }
    },
  },
  components: {
    Input,
    Conversation,
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
  padding: 0;
}

.hr-separator {
  border: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.531);
  margin: 24px 0;
}
</style>
