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
      <button type="submit">登录</button>
    </div>
    <div class="form__footer">
      <router-link to="/register">注册</router-link>
    </div>
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

<<style lang="scss">
@import "@/assets/css/form.scss";
</style>

<style lang="scss" scoped>
.form {
  width: 30%;
  margin: 0 auto;

  input {
    outline: none;
    border-style: none;
    padding: 0.4em 0em;
    border-bottom: 1px dashed silver;
    font-family: Consolas, monospace;
  }
  input:invalid {
    border-color: crimson;
  }
  input:valid {
    border-color: green;
  }

  button {
    margin-left: auto;
  }
  .form__footer {
    margin-top: 1em;
    text-align: right;
  }
}
</style>
