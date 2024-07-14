<template>
  <div class="chat" ref="content">
    <div
      v-for="(message, index) in filteredConversation"
      :key="index"
      class="outputCell"
      :ref="`message-${index}`"
    >
      <div v-html="message.content"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import hljs from 'highlight.js';
import 'highlight.js/styles/dark.css';
import { mapGetters } from 'vuex';

export default defineComponent({
  name: 'Conversation',
  computed: {
    ...mapGetters(['conversation']),
    filteredConversation() {
      return this.conversation
        .filter((message: any) => message.role !== 'system')
        .map((message: any) => {
          return {
            ...message,
            content: this.parseCodeBlocks(message.content),
          };
        });
    },
  },
  watch: {
    conversation(newVal: any[], oldVal: any[]) {
      if (newVal.length !== oldVal.length) {
        this.$nextTick(() => {
          this.highlightCodeBlocks();
        });
      }
    },
  },
  methods: {
    parseCodeBlocks(content: string): string {
      const regex = /```(\w+)?\n([\s\S]*?)```/g;
      return content.replace(regex, (match, lang, code) => {
        const language = lang || 'text';
        const trimmedCode = code.trim();
        return `<div class="highlight">
                  <div class="code-language">${language}</div>
                  <button class="copy-button">Copy</button>
                  <pre><code class="hljs ${language}">${
          hljs.highlight(language, trimmedCode).value
        }</code></pre>
                </div>`;
      });
    },
    highlightCodeBlocks() {
      this.$nextTick(() => {
        this.filteredConversation.forEach((_: any, index: number) => {
          const messageElements = this.$refs[`message-${index}`] as
            | HTMLElement
            | HTMLElement[];
          if (Array.isArray(messageElements)) {
            messageElements.forEach((messageElement) => {
              const blocks = messageElement.querySelectorAll('pre code');
              blocks.forEach((block) => {
                hljs.highlightBlock(block as HTMLElement);
              });
            });
          } else if (messageElements) {
            const blocks = messageElements.querySelectorAll('pre code');
            blocks.forEach((block) => {
              hljs.highlightBlock(block as HTMLElement);
            });
          }
        });
      });
    },
    copyCode(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (target.classList.contains('copy-button')) {
        const codeBlock = target.nextElementSibling?.querySelector('code');
        if (codeBlock) {
          const code = codeBlock.textContent || '';
          navigator.clipboard.writeText(code).then(() => {
            this.updateCopyButtonText(target as HTMLButtonElement);
          });
        }
      }
    },
    updateCopyButtonText(button: HTMLButtonElement) {
      button.textContent = 'Copied';
      setTimeout(() => {
        button.textContent = 'Copy';
      }, 5000);
    },
  },
  mounted() {
    this.highlightCodeBlocks();
    const content = this.$refs.content as HTMLElement;
    content.addEventListener('click', this.copyCode);
  },
  updated() {
    this.highlightCodeBlocks();
  },
  beforeDestroy() {
    const content = this.$refs.content as HTMLElement;
    content.removeEventListener('click', this.copyCode);
  },
});
</script>

<style lang="less">
.chat {
  flex: 1;
  margin: 30px 0 0 0;
}

.outputCell {
  background-color: rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.4);
  padding: 20px;
  line-height: 175%;
  margin-bottom: 10px;
}

.highlight {
  background-color: #282c34;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 10px;
  position: relative;
}

.code-language {
  background-color: #444;
  color: #fff;
  font-size: 0.8em;
  padding: 3px 6px;
  border-radius: 5px 5px 0 0;
  display: inline-block;
  margin-bottom: 5px;
}

.copy-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #444;
  color: #fff;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 5px;
}

.copy-button:hover {
  background-color: #666;
}

.highlight pre {
  margin: 0;
}

.highlight code {
  display: block;
  color: #abb2bf;
}
</style>
