<template>
  <form class="form" @submit.prevent="toSubmit">
    <legend>
      <h1>Login</h1>
    </legend>
    <div class="form-group">
      <label for="email">Email</label>
      <input type="email" name="email" id="email" required>
    </div>
    <div class="form-group">
      <label for="password">Password</label>
      <input type="password" name="password" id="password" required>
    </div>
    <div class="form-group">
      <label></label>
      <button type="submit">Login</button>
    </div>
  </form>
</template>

<script>
export default {
  methods: {
    toSubmit(evt) {
      const formData = new FormData(evt.target);
      this.$axios.post("/login", formData).then(result => {
        if (result.status === 200) {
          this.$bus.$emit("login", result.data);
          this.$router.push("/");
        } else {
          alert(result.data);
        }
      });
    }
  }
};
</script>

<<style lang="scss">
@import "@/assets/css/form.scss";
</style>

<style lang="scss" scoped>
.form {
  width: 30%;
  margin: 0 auto;
}
</style>
