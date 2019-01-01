<template>
  <div class="rank">
    <h1>排行榜</h1>
    <p>只显示前10位</p>
    <p>只显示匹配记录</p>
    <div class="rank__control">
      <select name="rank-lang" id="rank-lang" v-model="lang">
        <option value="cn">中文</option>
        <option value="en">英文</option>
      </select>
    </div>
    <table class="table">
      <thead>
        <tr>
          <th>用户</th>
          <th>速度(WPM)</th>
          <th>时间</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="record in records" :key="record._id">
          <td>{{ record.username }}</td>
          <td>{{ record.speed }}</td>
          <td>{{ record.createdAt | formatDate }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  watch: {
    lang(value) {
      this.getRecords();
    }
  },
  data() {
    return {
      lang: "cn",
      records: []
    };
  },
  mounted() {
    this.getRecords();
  },
  methods: {
    getRecords() {
      this.$axios.get(`/records?lang=${this.lang}`).then(resp => {
        this.records = resp.data;
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.rank {
  width: 50%;
  margin: 1em auto;
  .table {
    table-layout: fixed;
    width: 100%;
    border-collapse: collapse;

    tbody tr:nth-child(1) {
      border: 1px solid crimson;
      color: red;
    }
    tbody tr:nth-child(2) {
      border: 1px solid orange;
      color: orange;
    }
    tbody tr:nth-child(3) {
      border: 1px solid purple;
      color: purple;
    }
    td {
      text-align: center;
    }
  }
  .rank__control {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
  }
}
</style>
