<template>
  <form @submit.prevent="submit" class="snippet-form">
    <div class="form-group">
      <label for="source-type">类型:</label>
      <select name="sourceType" id="source-type" v-model="type" required>
        <option value="book">书籍</option>
        <option value="movie">电影</option>
      </select>
    </div>
    <div class="form-group">
      <label for="source-id">名字:</label>
      <select name="sourceId" id="source-id" required>
        <option v-for="option in options" :key="option" :value="option">{{ option }}</option>
      </select>
    </div>
    <div class="form-group">
      <label for="content">段落:</label>
      <textarea name="content" id="content" cols="30" rows="10" required></textarea>
    </div>
    <div class="form-group">
      <label for></label>
      <button type="submit" class="snippet-form__button">提交</button>
    </div>
  </form>
</template>

<script>
export default {
  watch: {
    type(value) {
      this.getData();
    }
  },
  data() {
    return {
      type: "",
      options: []
    };
  },
  methods: {
    submit(evt) {
      const formData = new FormData(evt.target);
      formData.append("length", formData.get("content").length);
      this.$axios
        .post(`${this.$config.server}/api/snippets`, formData)
        .then(() => {
          evt.target.reset();
        });
    },
    getData() {
      this.$axios.get(`${this.$config.server}/api/${this.type}s`).then(resp => {
        this.options = resp.data;
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.snippet-form {
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