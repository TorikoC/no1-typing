<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "app",
  components: {}
};
</script>

<style lang="scss">
@import "@/assets/css/button.scss";
@import "@/assets/css/table.scss";
@import "@/assets/css/dl.scss";
@import "@/assets/css/a.scss";

html,
body {
  margin: 0px;
  padding: 0px;

  color: #333;
  font-size: 16px;
  font-family: "Open Sans", "Clear Sans", "Helvetica Neue", Helvetica, Arial,
    sans-serif, "Noto Sans SC", "Microsoft Yahei", sans-serif;
}
#app {
  height: 100vh;
  position: relative;
}
</style>

