<template>
  <form class="form" @submit.prevent="toSubmit">
    <legend>
      <h1>注册</h1>
    </legend>
    <div class="form-group">
      <label for="username">用户名</label>
      <input type="text" name="username" id="username" required>
    </div>
    <div class="form-group">
      <label for="email">邮箱</label>
      <input type="email" name="email" id="email" required>
    </div>
    <div class="form-group">
      <label for="password">密码</label>
      <input type="password" name="password" id="password" required>
    </div>
    <div class="form-group">
      <label for="password2">确认密码</label>
      <input type="password" name="password2" id="password2" required>
    </div>
    <div class="form-group">
      <label for></label>
      <button class="button button--success reg-btn" type="submit">注册</button>
    </div>
    <router-link class="link footer-link" to="/login">登录</router-link>
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
        alert("password not match.");
        return;
      }
      this.$axios.post("/users", formData).then(result => {
        this.$router.push("/login");
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.reg-btn,
.footer-link {
  margin-left: auto;
}
.footer-link {
  margin-top: 1em;
}
</style>

