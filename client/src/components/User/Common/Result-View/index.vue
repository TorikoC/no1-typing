<template>
  <dl class="result-view">
    <dt>速度</dt>
    <dd>
      {{ record.speed }}
      <cs-wpm/>
    </dd>
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
    <dt>该段落的最佳记录(前十)</dt>
    <dd>
      <table class="table table--ranked">
        <thead>
          <tr>
            <th>速度
              <cs-wpm/>
            </th>
            <th>用户</th>
            <th>时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in bestRecords" :key="r._id">
            <td>{{ r.speed }}</td>
            <td>{{ r.username }}</td>
            <td>{{ r.createdAt | formatDate }}</td>
          </tr>
        </tbody>
      </table>
    </dd>
  </dl>
</template>

<script>
export default {
  props: {
    record: {
      type: Object,
      defulat: {
        speed: 0,
        time: 0
      }
    },
    bestRecords: {
      type: Array,
      defulat: []
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
.result-view {
  dt {
    font-size: 0.8em;
    background: #eee;
  }
  dt,
  dd {
    padding: 0.2em 0.4em;
  }
}
.source {
  display: flex;
  flex-direction: row;
  .source__cover {
    max-width: 200px;
    img {
      width: 100%;
    }
  }
  &__name {
    padding: 0.4em;
  }
}
</style>

