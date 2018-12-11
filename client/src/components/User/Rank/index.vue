<template>
  <div class="rank">
    <h1>榜单</h1>
    <p>只显示前10位</p>
    <table class="table">
      <thead>
        <tr>
          <th>用户</th>
          <th>速度(字/分钟)</th>
          <th>时间</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="record in records" :key="record._id">
          <td>{{ record.user }}</td>
          <td>{{ record.speed }}</td>
          <td>{{ record.createdAt | formatDate }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      records: []
    };
  },
  mounted() {
    this.getRecords();
  },
  methods: {
    getRecords() {
      this.$axios.get(`${this.$config.server}/api/records`).then(resp => {
        console.log(this.records);
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
}
</style>
