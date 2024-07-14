<template>
  <div class="dropzone" @click="triggerFileInput">
    <p v-if="file === null">
      Drop a file to test anywhere <br />or click here to select a file
    </p>
    <div v-else>
      <p>File uploaded: {{ file.name }}</p>
    </div>
    <input
      type="file"
      accept=".txt"
      @change="handleFileSelect"
      style="display: none"
      ref="fileInput"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import store from '@/store/index';

export default defineComponent({
  name: 'DropFile',
  data() {
    return {
      file: null as File | null,
      fileContent: '' as string,
    };
  },
  methods: {
    handleDragOver(e: DragEvent) {
      e.preventDefault();
    },
    handleDrop(e: DragEvent) {
      e.preventDefault();
      if (e.dataTransfer?.files.length) {
        this.file = e.dataTransfer.files[0];
        store.commit('RESET_CONVERSATION');
        this.readFileContent();
      }
    },
    handleFileSelect(e: Event) {
      const target = e.target as HTMLInputElement;
      if (target.files?.length) {
        this.file = target.files[0];
        this.readFileContent();
      }
    },
    readFileContent() {
      if (!this.file) return;
      const reader = new FileReader();
      reader.onload = async (e) => {
        this.fileContent = (e.target?.result as string) || '';
        await store.commit('ADD_COMPONENT', {
          content: this.fileContent,
          name: this.file!.name,
        });
        store.dispatch('generateInitialTest');
      };
      reader.readAsText(this.file);
    },
    triggerFileInput() {
      (this.$refs.fileInput as HTMLInputElement)?.click();
    },
  },
  mounted() {
    document.body.addEventListener('dragover', this.handleDragOver);
    document.body.addEventListener('drop', this.handleDrop);
  },
  beforeUnmount() {
    document.body.removeEventListener('dragover', this.handleDragOver);
    document.body.removeEventListener('drop', this.handleDrop);
  },
});
</script>

<style scoped>
.dropzone {
  border: 2px dashed #ccc;
  padding: 20px;
  text-align: center;
  cursor: pointer;
}
</style>
