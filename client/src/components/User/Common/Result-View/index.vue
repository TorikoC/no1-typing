<template>
  <dl v-if="show">
    <dt>Speed</dt>
    <dd>{{ record.speed }}</dd>
    <dt>Time</dt>
    <dd>{{ record.time | formatTime }}</dd>
    <dt>Snippet you just type from:</dt>
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
