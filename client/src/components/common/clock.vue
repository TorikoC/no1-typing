<template>
  <span class="clock">倒计时 {{clock}}</span>
</template>

<script>
export default {
  props: {
    clock: ""
  }
};
</script>

<style lang="scss" clock>
.clock {
  display: inline-block;
  font-size: 2em;
  font-weight: bold;
  color: #333;
}
.dark--theme {
  color: #fafafa;
}
</style>
