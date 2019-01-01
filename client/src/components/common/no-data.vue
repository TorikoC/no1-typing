<template>
  <div class="no-data">{{ msg }}</div>
</template>

<script>
export default {
  props: {
    msg: {
      type: String,
      default: "没有数据"
    }
  }
};
</script>

<style lang="scss" scoped>
.no-data {
  position: absolute;
  margin: 2em auto;
  text-align: center;
  color: inherit;
}
</style>
