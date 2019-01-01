<template>
  <span class="prev-link" @click.prevent="$router.go(-1)">← 返回</span>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
$color: blue;
.prev-link {
  font-size: 0.8em;
  transition: background 0.3s;
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
  background: #eee;
  color: darken($color: $color, $amount: 10%);
}
</style>
