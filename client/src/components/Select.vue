<template>
  <div class="ai-input-wrap">
    <span class="label">
      {{ label }}
      <slot name="label-link"></slot>
    </span>
    <span class="selectWrapper">
      <select
        v-model="value"
        ref="selectElement"
        :name="label + 'Select'"
        :disabled="disabled"
      >
        <option
          v-for="option in options"
          :value="option.value"
          :key="option.label"
        >
          {{ option.label }}
        </option>
      </select>
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

interface Option {
  label: string;
  value: string | number;
}

export default defineComponent({
  name: 'Select',
  props: {
    modelValue: {
      type: [String, Number, Boolean] as PropType<string | number | boolean>,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    options: {
      type: Array as PropType<Option[]>,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      selectElement: null as HTMLSelectElement | null,
    };
  },
  computed: {
    value: {
      get(): string | number | boolean {
        return this.modelValue;
      },
      set(value: string | number | boolean) {
        this.$emit('update:modelValue', value);
      },
    },
  },
  watch: {
    modelValue(newValue: string | number | boolean) {
      localStorage.setItem(this.label + 'Select', JSON.stringify(newValue));
    },
  },
  mounted() {
    this.selectElement = this.$refs.selectElement as HTMLSelectElement;
    const storedValue = localStorage.getItem(this.label + 'Select');
    if (storedValue) {
      this.$emit('update:modelValue', JSON.parse(storedValue));
    }
  },
  methods: {
    validate() {
      if (this.selectElement) {
        if (!this.modelValue) {
          this.selectElement.setCustomValidity('You must select a value');
        } else {
          this.selectElement.setCustomValidity(''); // Clear any existing validation message
        }
        return this.selectElement.reportValidity(); // Display the validation message and return validation status
      }
      return false;
    },
  },
});
</script>

<style scoped>
.ai-input-wrap {
  display: flex;
  flex-direction: row;
  margin-bottom: 1rem;
  padding-top: 10px;
}
.label {
  font-weight: bold;
  margin-right: 7px;
}
.selectWrapper {
  select {
    width: 100%;
    padding: 5px 10px 5px 5px;
    border-radius: 5px;
    border: 1px solid #ccc;
    font-size: 1rem;
  }
}
</style>
