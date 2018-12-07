<template>
  <form @submit.prevent="submit">
    <div class="form-gruop">
      <label for="source-type">source type:</label>
      <select name="sourceType" id="source-type" v-model="type" required>
        <option value="book">book</option>
      </select>
    </div>
    <div class="form-gruop">
      <label for="source-id">source name:</label>
      <select name="sourceId" id="source-id" required>
        <option v-for="option in options" :key="option" :value="option">{{ option }}</option>
      </select>
    </div>
    <div class="form-gruop">
      <label for="content">snippet:</label>
      <textarea name="content" id="content" cols="30" rows="10" required></textarea>
    </div>
    <button type="submit">Submit</button>
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
      this.$axios
        .post(`${this.$config.server}/api/snippets`, formData)
        .then(resp => {
          console.log(resp);
        });
    },
    getData() {
      this.$axios.get(`${this.$config.server}/api/${this.type}s`).then(resp => {
        console.log(resp);
        this.options = resp.data;
      });
    }
  }
};
</script>

<style>
</style>
