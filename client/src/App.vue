<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "app",
  data() {
    return {
      theme: "theme--light"
    };
  },
  mounted() {
    this.$bus.$on("theme-change", this.changeTheme);
  },
  methods: {
    changeTheme(t) {
      this.theme = t;
    }
  }
};
</script>

<style lang="scss">
@import "@/assets/css/button.scss";
@import "@/assets/css/form.scss";
@import "@/assets/css/table.scss";
@import "@/assets/css/dl.scss";
@import "@/assets/css/a.scss";

html,
body {
  margin: 0px;
  padding: 0px;
  font-size: 16px;
  height: 100%;
  font-family: "Open Sans", "Clear Sans", "Helvetica Neue", Helvetica, Arial,
    sans-serif, "Noto Sans SC", "Microsoft Yahei", sans-serif;

  color: #333;
}

#app {
  height: 100%;
  position: relative;
}
</style>


