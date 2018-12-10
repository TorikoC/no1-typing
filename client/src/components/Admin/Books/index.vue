<template>
  <form class="book-form" @submit.prevent="submit">
    <div class="form-group">
      <label for="name">名字:</label>
      <input type="text" name="name" id="name" required autofocus>
    </div>
    <div class="form-group">
      <label for="author">作者:</label>
      <input type="text" name="author" id="author" required>
    </div>
    <div class="form-group">
      <label for></label>
      <button type="submit">提交</button>
    </div>
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

<style lang="scss" scoped>
.book-form {
  width: 50%;
  margin: 1em auto;
  .form-group {
    display: flex;
    flex-direction: row;
    label {
      width: 20%;
      align-self: flex-start;
    }
    input,
    button,
    select,
    textarea {
      width: 100%;
    }
    textarea {
      resize: vertical;
    }
  }
  .form-group + .form-group {
    margin-top: 0.6em;
  }
}
</style>
