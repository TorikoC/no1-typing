<template>
  <button class="button" :type="type">{{ msg }}</button>
</template>

<script>
export default {
  props: {
    msg: {
      type: String,
      default: "button"
    },
    type: {
      type: String,
      default: ""
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
