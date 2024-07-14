<template>
  <div>
    <Loading v-if="$store.getters.isLoading" />
    <div v-if="$store.getters.error">{{ $store.getters.error }}</div>
    <textarea
      v-model="newMessage"
      class="input"
      @keyup.enter="handleSendMessage"
      placeholder="Type your message..."
      tabindex="1"
      dir="auto"
      rows="1"
      style="overflow-y: hidden"
      focus
    />
    <SubmitBtn @click="handleSendMessage" />
  </div>
</template>

<script lang="ts">
import { mapActions, mapMutations } from 'vuex';
import { defineComponent } from 'vue';
import SubmitBtn from './SubmitBtn.vue';
import Loading from './Loading.vue';
import type { PropType } from 'vue';
import store from '@/store/index';

interface InputData {
  newMessage: string;
  isFirstRun: boolean;
  queryVector: string;
  selectedFile: {
    fileName: string;
    fileContent: string;
  };
}

export default defineComponent({
  name: 'Input',
  data(): InputData {
    return {
      newMessage: '',
      isFirstRun: true,
      queryVector: '',
      selectedFile: {
        fileName: '',
        fileContent: '',
      },
    };
  },
  props: {
    file: {
      type: Object as PropType<{ fileName: string; fileContent: string }>,
      default() {
        return {
          fileName: '',
          fileContent: '',
        };
      },
    },
  },
  methods: {
    ...mapActions(['sendMessage']),
    ...mapMutations(['SET_ERROR']),
    async handleSendMessage(event?: KeyboardEvent) {
      if (event && (event.shiftKey || event.ctrlKey)) {
        return;
      }
      try {
        const messageToSend = this.newMessage.trim();
        if (messageToSend) {
          this.newMessage = ''; // Clear the input before sending
          await store.dispatch('sendMessage', {
            message: messageToSend,
          });
        }
      } catch (error) {
        console.error('Error in handleSendMessage:', error);
        this.SET_ERROR('Failed to send message. Please try again.');
      }
    },
  },
  components: {
    SubmitBtn,
    Loading,
  },
});
</script>

<style lang="less" scoped>
.input {
  width: 100%;
  height: 70px;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-bottom: 10px;
  margin: 10px 0;
}
</style>
