<template>
  <dl class="result">
    <dt>用时</dt>
    <dd>{{ time | formatTime }}</dd>
    <dt>速度</dt>
    <dd>{{ speed | formatSpeed(lang) }}</dd>
    <dt>段落来自</dt>
    <dd>
      <div class="source">
        <div class="source__cover">
          <img :src="cover" alt="source cover">
        </div>
        <div class="source__name">
          {{ name }}
          <br>
          <small>by {{ author }}</small>
        </div>
      </div>
    </dd>
  </dl>
</template>

<script>
export default {
  props: {
    time: { type: Number },
    lang: {
      type: String,
      default: "cn"
    },
    speed: {},
    cover: {
      type: String
    },
    name: {
      type: String
    },
    author: {
      type: String
    }
  }
};
</script>

<style lang="scss" scoped>
.result {
  dt {
    background: #eee;
  }
  .source {
    display: flex;
    flex-direction: row;
    .source__cover {
      display: block;
      width: 200px;
      img {
        max-width: 100%;
        height: auto;
        display: block;
      }
    }
    .source__name {
      padding: 0.2em 0.4em;
    }
  }
}
</style>
