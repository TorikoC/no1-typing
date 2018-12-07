<template>
  <form class="form" @submit.prevent="submit">
    <div class="form-group">
      <label class="form-label" for="name">name:</label>
      <input type="text" name="name" id="name" required autofocus>
    </div>
    <div class="form-group">
      <label for="author">author:</label>
      <input type="text" name="author" id="author" required>
    </div>
    <button type="submit">submit</button>
  </form>
</template>

<script>
export default {
  methods: {
    submit(evt) {
      const formData = new FormData(evt.target);
      this.$axios
        .post(`${this.$config.server}/api/books`, formData)
        .then(resp => {
          evt.target.reset();
        });
    }
  }
};
</script>

<style>
</style>
