<template>
  <form class="form" @submit.prevent="toSubmit">
    <legend>
      <h1>Create Room</h1>
      <div class="form-group">
        <label for="name">Name</label>
        <input type="text" id="name" name="name" required>
      </div>
      <div class="form-group">
        <label for="lang">Language</label>
        <select name="lang" id="lang" required>
          <option value="en">English</option>
          <option value="cn">Chinese</option>
        </select>
      </div>
      <div class="form-group">
        <label for="user-limit">Max User</label>
        <input type="number" step="1" min="0" max="10" name="userLimit" id="user-limit" required>
      </div>
      <div class="form-group">
        <label for="public">public</label>
        <input type="radio" name="public" v-model="pub" :value="true" id="public">
      </div>
      <div class="form-group">
        <label for="private">private</label>
        <input type="radio" name="public" v-model="pub" :value="false" id="private">
      </div>
      <div v-if="!pub" class="form-group">
        <label for="secret">secret</label>
        <input type="text" name="secret" id="secret" required>
      </div>
      <div class="form-group">
        <label for></label>
        <button type="submit">Create</button>
      </div>
    </legend>
  </form>
</template>

<script>
export default {
  data() {
    return {
      // public is reserved, use pub instead.
      pub: true
    };
  },
  methods: {
    toSubmit(evt) {
      const formData = new FormData(evt.target);
      this.$axios.post("/rooms", formData).then(result => {
        this.$router.push(`/rooms/${result.data._id}`);
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.form {
  width: 50%;
  margin: 1em auto;
}
</style>
