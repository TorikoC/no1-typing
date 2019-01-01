<template>
  <div class="profile">
    <h1>个人信息</h1>
    <dl>
      <dt>用户名</dt>
      <dd>{{ user.username }}</dd>
      <dt>邮箱</dt>
      <dd>{{ user.email }}</dd>
      <dt>注册时间</dt>
      <dd>{{ user.createdAt | formatDate }}</dd>
      <dt>最佳比赛记录</dt>
      <dd>
        英文: {{ bestEnRecord.speed }}
        <br>
        中文: {{ bestCnRecord.speed || 'no record'}}
      </dd>
      <dt>最佳练习记录</dt>
      <dd>暂无</dd>
      <dt>最近活动</dt>
      <dd>
        <ul>
          <li
            v-for="record in latestRecords"
            :key="record._id"
          >{{ record.speed | formatSpeed }} - {{ record.lang }} - {{ record.mode }}- {{ record.createdAt | formatDate }}</li>
        </ul>
      </dd>
    </dl>
  </div>
</template>

<script>
export default {
  props: {
    username: ""
  },
  data() {
    return {
      user: "",
      bestCnRecord: "",
      bestEnRecord: "",
      latestRecords: []
    };
  },
  created() {
    this.$axios.get(`/users?username=${this.username}`).then(result => {
      this.user = result.data.user;
      this.bestEnRecord = result.data.bestEnRecord;
      this.bestCnRecord = result.data.bestCnRecord;
      // this.bestPraticeRecord =
      //   (result.data.bestPraticeRecord &&
      //     result.data.bestPraticeRecord.speed) ||
      //   "no record";
      // this.bestMatchRecord =
      //   (result.data.bestMatchRecord && result.data.bestMatchRecord.speed) ||
      //   "no record";
      this.latestRecords = result.data.latestRecords;
    });
  }
};
</script>

<style lang="scss" scoped>
.profile {
  width: 50%;
  margin: 0 auto;
  dt {
    background: #eee;
  }
  dt,
  dd {
    padding: 0.2em 0.4em;
  }
}
</style>
