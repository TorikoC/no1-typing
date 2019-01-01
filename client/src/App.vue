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
html,
body {
  margin: 0px;
  padding: 0px;
  color: #333;
  font-size: 16px;
  font-family: "Open Sans", "Clear Sans", "Helvetica Neue", Helvetica, Arial,
    sans-serif, "Microsoft Yahei";
}
#app {
  height: 100vh;
  position: relative;
}
</style>

