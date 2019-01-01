<template>
  <dl v-if="show" class="result">
    <dt>速度</dt>
    <dd>{{ record.speed }} WPM</dd>
    <dt>时间(分:秒)</dt>
    <dd>{{ record.time | formatTime }}</dd>
    <dt>段落来自</dt>
    <dd>
      <div class="source">
        <div class="source__cover">
          <img :src="book.cover" alt="source cover">
        </div>
        <div class="source__name">
          {{ book.name }}
          <br>
          <small>by {{ book.author }}</small>
        </div>
      </div>
    </dd>
  </dl>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: false
    },
    record: {
      type: Object,
      defulat: {
        speed: 0,
        time: 0
      }
    },
    book: {
      type: Object,
      defulat: {
        cover: "default url",
        name: "default name",
        author: "default author"
      }
    }
  }
};
</script>
<style lang='scss' scoped>
.result {
  dt {
    font-size: 0.8em;
    background: #eee;
  }
  dt,
  dd {
    padding: 0.2em 0.4em;
  }
}
</style>

