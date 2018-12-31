<template>
  <div class="profile">
    <h1>Profile</h1>
    <dl>
      <dt>Username</dt>
      <dd>{{ user.username }}</dd>
      <dt>Email</dt>
      <dd>{{ user.email }}</dd>
      <dt>Join Date</dt>
      <dd>{{ user.createdAt | formatDate }}</dd>
      <dt>Best Match Record</dt>
      <dd>{{ bestMatchRecord }}</dd>
      <dt>Best Pratice Record</dt>
      <dd>{{ bestPraticeRecord }}</dd>
      <dt>Latest Records</dt>
      <dd>
        <ul>
          <li
            v-for="record in latestRecords"
            :key="record._id"
          >{{ record.createdAt | formatDate }} - {{ record.speed | formatSpeed }}</li>
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
      bestPraticeRecord: "",
      bestMatchRecord: "",
      latestRecords: []
    };
  },
  created() {
    this.$axios.get(`/users?username=${this.username}`).then(result => {
      this.user = result.data[0];
      this.bestPraticeRecord =
        (result.data.bestPraticeRecord &&
          result.data.bestPraticeRecord.speed) ||
        "no record";
      this.bestMatchRecord =
        (result.data.bestMatchRecord && result.data.bestMatchRecord.speed) ||
        "no record";
      this.latestRecords = result.data.latestRecords;
      console.log(result);
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
}
</style>
