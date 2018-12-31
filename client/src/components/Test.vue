<template>
  <div>test</div>
</template>

<script>
export default {
  mounted() {
    this.$axios.get("/users").then(resp => {
      console.log(resp);
    });
  }
};
</script>

<style>
</style>
