<template>
  <div class="profile">
    <h1>个人信息</h1>
    <cs-loading v-if="loading"/>
    <dl v-else>
      <dt>用户名</dt>
      <dd>{{ user.username }}</dd>
      <dt>邮箱</dt>
      <dd>{{ user.email }}</dd>
      <dt>注册时间</dt>
      <dd>{{ user.createdAt | formatDate }}</dd>
      <dt class>
        最高记录
        <select name="lang" id="lang" v-model="lang">
          <option value="cn">中文</option>
          <option value="en">英文</option>
        </select>
      </dt>
      <dd class="profile__loading-field">
        <cs-loading v-if="loadingBestRecord"/>
        <table v-else class="table">
          <thead>
            <tr>
              <th>时间</th>
              <th>速度
                <cs-wpm/>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{ bestRecord.createdAt | formatDate }}</td>
              <td>{{ bestRecord.speed }}</td>
            </tr>
          </tbody>
        </table>
      </dd>
      <dt>最近记录</dt>
      <dd>
        <table class="table">
          <thead>
            <tr>
              <th>时间</th>
              <th>模式</th>
              <th>语言</th>
              <th>速度
                <cs-wpm/>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in latestRecords" :key="r._id">
              <td>{{ r.createdAt | formatDate }}</td>
              <td>{{ r.mode }}</td>
              <td>{{ r.lang }}</td>
              <td>{{ r.speed }}</td>
            </tr>
          </tbody>
        </table>
      </dd>
    </dl>
  </div>
</template>

<script>
export default {
  watch: {
    lang(value) {
      this.getBestRecord();
    }
  },
  props: {
    username: ""
  },
  data() {
    return {
      lang: "cn",
      user: "",
      bestRecord: {},
      latestRecords: [],

      loading: false,
      loadingBestRecord: false
    };
  },
  mounted() {
    this.getProfile();
    this.getBestRecord();
  },
  methods: {
    getBestRecord() {
      if (this.loadingBestRecord) {
        return;
      }
      this.loadingBestRecord = true;
      this.$axios
        .get(
          `/records?sort=speed|desc&limit=1&lang=${this.lang}&username=${
            this.username
          }`
        )
        .then(result => {
          this.loadingBestRecord = false;
          this.bestRecord = result.data[0];
        });
    },

    getProfile() {
      if (this.loading) {
        return;
      }
      this.loading = true;
      this.$axios.get(`/users?username=${this.username}`).then(result => {
        this.user = result.data.user;
        this.latestRecords = result.data.latestRecords;
        this.loading = false;
      });
    }
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

  &__loading-field {
    position: relative;
    display: block;
    min-height: 1em;
  }
}
</style>
