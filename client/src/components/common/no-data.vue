<template>
  <span class="no-data">{{ msg }}</span>
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
  position: relative;
  display: inline-block;
}
</style>
