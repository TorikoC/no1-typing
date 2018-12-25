<template>
  <form class="form" @submit.prevent="toSubmit">
    <legend>
      <h1>Register</h1>
    </legend>
    <div class="form-group">
      <label for="username">Username</label>
      <input type="text" name="username" id="username" required>
    </div>
    <div class="form-group">
      <label for="email">Email</label>
      <input type="email" name="email" id="email" required>
    </div>
    <div class="form-group">
      <label for="password">Password</label>
      <input type="password" name="password" id="password" required>
    </div>
    <div class="form-group">
      <label for="password2">Re-enter Password</label>
      <input type="password" name="password2" id="password2" required>
    </div>
    <div class="form-group">
      <label for></label>
      <button type="submit">Register</button>
    </div>
  </form>
</template>

<script>
export default {
  methods: {
    toSubmit(evt) {
      const form = evt.target;
      const formData = new FormData(form);
      const pw1 = formData.get("password");
      const pw2 = formData.get("password2");

      if (pw1 !== pw2) {
        alert("password did not match.");
        return;
      }
      this.$axios
        .post("/users", formData)
        .then(result => {
          console.log(result);
        })
        .catch(error => {
          console.log(error);
        });
    }
  }
};
</script>

<style lang="scss">
@import "@/assets/css/form.scss";
</style>

<style lang="scss" scoped>
.form {
  width: 30%;
  margin: 0 auto;
}
</style>

