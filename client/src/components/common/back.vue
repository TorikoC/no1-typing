<template>
  <span class="prev-link" @click.prevent="$router.go(-1)">← back</span>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
$color: blue;
.prev-link {
  font-size: 0.8em;
  color: lighten($color: $color, $amount: 10%);
}
.prev-link:visited {
  color: lighten($color: $color, $amount: 10%);
}
.prev-link:hover {
  cursor: pointer;
  color: $color;
}
.prev-link:active {
  cursor: pointer;
  color: darken($color: $color, $amount: 20%);
}
</style>
