<template>
  <form class="form" @submit.prevent="toSubmit">
    <legend>
      <h1>登录</h1>
    </legend>
    <div class="form-group">
      <label for="email">邮箱</label>
      <input type="email" name="email" id="email" required>
    </div>
    <div class="form-group">
      <label for="password">密码</label>
      <input type="password" name="password" id="password" required>
    </div>
    <div class="form-group">
      <label></label>
      <button class="button button--success login-btn" type="submit">登录</button>
    </div>
    <router-link class="link footer-link" to="/register">注册</router-link>
  </form>
</template>

<script>
export default {
  methods: {
    toSubmit(evt) {
      const formData = new FormData(evt.target);
      this.$axios.post("/login", formData).then(result => {
        this.$bus.$emit("login", result.data);
        this.$router.push("/");
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.login-btn,
.footer-link {
  margin-left: auto;
}
.footer-link {
  margin-top: 1em;
}
</style>
