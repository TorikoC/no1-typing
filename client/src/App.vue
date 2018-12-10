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

<style>
html,
body {
  margin: 0px;
  padding: 0px;
  font-family: "Microsoft Yahei";
}
#app {
  height: 100vh;
  position: relative;
}
</style>
