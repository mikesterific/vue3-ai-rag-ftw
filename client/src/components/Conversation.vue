<template>
  <div class="chat" ref="content">
    <div
      v-for="(message, index) in filteredConversation"
      :key="index"
      class="outputCell"
    >
      <div v-html="message.content"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick } from 'vue';
import hljs from 'highlight.js';
import 'highlight.js/styles/dark.css';
import { mapGetters } from 'vuex';
import DOMPurify from 'dompurify';
import type { Config as DOMPurifyConfig } from 'dompurify';

interface Message {
  role: string;
  content: string;
}

export default defineComponent({
  name: 'Conversation',
  computed: {
    ...mapGetters(['conversation']),
    filteredConversation(): Message[] {
      return (this.conversation as Message[])
        .filter((message: Message) => message.role !== 'system')
        .map((message: Message) => ({
          ...message,
          content: this.processMessage(message.content),
        }));
    },
  },
  methods: {
    processMessage(content: string): string {
      const codeProcessed = this.parseCodeBlocks(content);
      return this.sanitizeContent(codeProcessed);
    },
    sanitizeContent(content: string): string {
      const options: DOMPurifyConfig = {
        ALLOWED_TAGS: [
          'b',
          'i',
          'em',
          'strong',
          'a',
          'code',
          'pre',
          'div',
          'span',
          'button',
        ],
        ALLOWED_ATTR: ['href', 'class', 'style', 'aria-label'],
      };
      return DOMPurify.sanitize(content, options);
    },
    parseCodeBlocks(content: string): string {
      const regex = /```(\w+)?\n([\s\S]*?)```/g;
      return content.replace(regex, (match, lang, code) => {
        const language = lang || 'text';
        const trimmedCode = code.trim();
        return `<div class="highlight">
                  <div class="code-language">${language}</div>
                  <button class="copy-button" aria-label="Copy code">Copy</button>
                  <pre><code class="hljs ${language}">${
          hljs.highlight(trimmedCode, { language }).value
        }</code></pre>
                </div>`;
      });
    },
    highlightCodeBlocks(): void {
      const codeBlocks = this.$el.querySelectorAll('pre code');
      codeBlocks.forEach((block: Element) => {
        hljs.highlightElement(block as HTMLElement);
      });
    },
    copyCode(event: MouseEvent): void {
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
    updateCopyButtonText(button: HTMLButtonElement): void {
      button.textContent = 'Copied';
      setTimeout(() => {
        button.textContent = 'Copy';
      }, 5000);
    },
    setupEventListeners(): void {
      this.$el.addEventListener('click', this.copyCode);
    },
    removeEventListeners(): void {
      this.$el.removeEventListener('click', this.copyCode);
    },
  },
  mounted() {
    this.setupEventListeners();
    nextTick(() => {
      this.highlightCodeBlocks();
    });
  },
  updated() {
    nextTick(() => {
      this.highlightCodeBlocks();
    });
  },
  beforeUnmount() {
    this.removeEventListeners();
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
