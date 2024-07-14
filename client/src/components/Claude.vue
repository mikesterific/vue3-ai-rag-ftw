<template>
  <div>
    <h1>Claude API Demo</h1>
    <button @click="fetchData">Fetch Data</button>
    <pre>{{ output }}</pre>
  </div>
</template>

<script>
export default {
  data() {
    return {
      output: '',
    };
  },
  methods: {
    async fetchData() {
      try {
        const response = await fetch('http://localhost:3002/api/claude', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20240620',
            max_tokens: 1000,
            prompt: 'Why is the ocean salty?',
          }),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        this.output = JSON.stringify(data, null, 2);
      } catch (error) {
        console.error('Error:', error);
        this.output = `Error: ${error.message}`;
      }
    },
  },
};
</script>

<style scoped>
h1 {
  color: #42b983;
}
</style>
