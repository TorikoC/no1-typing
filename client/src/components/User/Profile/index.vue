<template>
  <div class="profile">
    <h1>个人信息</h1>
    <cs-loading v-if="loadingProfile"/>
    <dl v-else class="dl">
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
        <cs-no-data v-else-if="noBestRecord"/>
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
      <dd class="profile__loading-field">
        <cs-loading v-if="loadingRecentRecords"/>
        <cs-no-data v-else-if="noRecentRecords"/>
        <table v-else class="table">
          <thead>
            <tr>
              <th>时间</th>
              <th>语言</th>
              <th>速度
                <cs-wpm/>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in recentRecords" :key="r._id">
              <td>{{ r.createdAt | formatDate }}</td>
              <td>{{ r.lang }}</td>
              <td>{{ r.speed }}</td>
            </tr>
          </tbody>
        </table>
        <pager :active="page" :total="totalPage" @change="toPage"/>
      </dd>
    </dl>
  </div>
</template>

<script>
import Pager from "@/components/User/Common/Pager";

export default {
  components: {
    Pager
  },
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
      user: {},

      pageSize: 10,
      totalPage: 0,
      page: 1,

      bestRecord: {},
      recentRecords: [],

      noBestRecord: false,
      noRecentRecords: false,

      loadingProfile: false,
      loadingBestRecord: false,
      loadingRecentRecords: false
    };
  },
  mounted() {
    this.getProfile();
    this.getBestRecord();
    this.getRecentRecords();
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
          this.noBestRecord = result.data.records[0] ? false : true;
          this.bestRecord = result.data.records[0];
          this.loadingBestRecord = false;
        });
    },
    getRecentRecords() {
      if (this.loadingRecentRecords) {
        return;
      }
      this.loadingRecentRecords = true;
      let skip = (this.page - 1) * this.pageSize;
      this.$axios
        .get(
          `/records?sort=createdAt|desc&limit=10&username=${
            this.username
          }&skip=${skip}`
        )
        .then(resp => {
          this.noRecentRecords = resp.data.records.length === 0;
          this.recentRecords = resp.data.records;
          this.loadingRecentRecords = false;
          this.totalPage = Math.floor(resp.data.total / this.pageSize);
          if (resp.data.total % this.pageSize) {
            this.totalPage += 1;
          }
        });
    },
    getProfile() {
      if (this.loadingProfile) {
        return;
      }
      this.loadingProfile;
      this.$axios.get(`/users?username=${this.username}`).then(result => {
        this.user = result.data[0];
        this.loadingProfile = false;
      });
    },
    toPage(page) {
      this.page = page;
      this.getRecentRecords();
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
