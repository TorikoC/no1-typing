<template>
  <div id="app" class="dark-theme">
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
  font-size: 16px;
  font-family: "Open Sans", "Clear Sans", "Helvetica Neue", Helvetica, Arial,
    sans-serif, "Noto Sans SC", "Microsoft Yahei", sans-serif;

  color: #333;
}

#app {
  height: 100vh;
  overflow: auto;
  position: relative;
}
.dark-theme {
  color: #bbb;
  background: #222;
}
</style>


