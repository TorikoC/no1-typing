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
@import "./assets/css/platform.scss";

html,
body {
  margin: 0px;
  padding: 0px;
  color: #333;
  font-family: "Microsoft Yahei";
}
#app {
  height: 100vh;
  position: relative;
}
</style>
