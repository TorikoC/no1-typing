<template>
  <form class="add-room form" @submit.prevent="toSubmit">
    <cs-back></cs-back>
    <legend>
      <h1>创建房间</h1>
      <div class="form-group">
        <label for="name">名字</label>
        <input type="text" id="name" name="name" required>
      </div>
      <div class="form-group">
        <label for="lang">语言</label>
        <select name="lang" id="lang" required>
          <option value="en">英文</option>
          <option value="cn">中文</option>
        </select>
      </div>
      <div class="form-group">
        <label for="user-limit">人数限制</label>
        <select name="userLimit" id="user-limit">
          <option v-for="i in 10" :value="i" :key="i">{{ i }}</option>
        </select>
      </div>
      <div class="form-group">
        <label for></label>
        <button class="button" type="submit">创建</button>
      </div>
    </legend>
  </form>
</template>

<script>
export default {
  methods: {
    toSubmit(evt) {
      const formData = new FormData(evt.target);
      this.$axios.post("/rooms", formData).then(result => {
        this.$router.replace(`/rooms/${result.data.lang}/${result.data._id}`);
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.add-room {
  width: 50%;
}
</style>
