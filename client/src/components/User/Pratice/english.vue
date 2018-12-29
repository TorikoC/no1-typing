<template>
  <div class="pratice-en" v-if="!loading">
    <h1>Pratice</h1>
    <p v-if="state === COUNTING">clock {{ clock }}</p>
    <button v-if="state === WAITING" @click="toStart">start</button>
    <users-view :users="users"/>
    <platform
      :disabled="platformDisabled"
      :text="snippet.content"
      @complete="toComplete"
      @match="toMatch"
    />

    <record-view :show="showRecord" :record="record"/>
  </div>
</template>

<script>
import Platform from "@/components/User/Platform/en";

import UsersView from "@/components/Views/users";
import RecordView from "@/components/Views/record";

export default {
  components: {
    Platform,
    UsersView,
    RecordView
  },
  data() {
    return {
      WAITING: 0,
      COUNTING: 1,
      ONGOING: 2,
      state: 0,

      clock: this.$constant.PRATICE_MODE_CLOCK,

      snippet: {},

      record: {},
      showRecord: false,

      platformDisabled: true,

      users: [
        {
          username: window.$user ? window.$user.username : "annoymous",
          speed: 0,
          percent: 0
        }
      ],

      fresh: true,

      loading: true
    };
  },
  mounted() {
    this.getSnippet(this.fresh);
  },
  methods: {
    getSnippet(fresh) {
      this.$axios.get("/snippets/random?lang=en").then(result => {
        this.snippet = result.data;

        this.record = {
          cover: this.snippet.cover,
          name: this.snippet.name,
          author: this.snippet.author
        };

        this.loading = false;
        if (!fresh) {
          this.countdown();
        }
      });
    },
    toStart() {
      this.showRecord = false;
      this.state = this.ONGOING;
      this.resetUsers(this.users);

      if (this.fresh) {
        this.countdown();
      } else {
        this.loading = true;
        this.getSnippet(this.fresh);
      }
    },
    toMatch(progress) {
      this.users[0] = Object.assign(this.users[0], progress);
    },
    toComplete(data) {
      this.platformDisabled = true;
      this.postRecord(data);

      if (this.fresh) {
        this.fresh = false;
      }

      this.clock = this.$constant.PRATICE_MODE_CLOCK;

      this.state = this.WAITING;

      this.record = Object.assign(this.record, data);
      this.showRecord = true;
    },
    postRecord(data) {
      const formData = new FormData();
      formData.append("mode", "pratice");
      formData.append("time", data.time);
      formData.append("speed", data.speed);
      formData.append("snippetId", this.snippet._id);

      this.$axios.post("/records", formData);
    },
    resetUsers(users) {
      this.users = users.map(user => {
        return {
          username: user.username,
          speed: 0,
          percent: 0
        };
      });
    },
    countdown() {
      if (this.state !== this.COUNTING) {
        this.state = this.COUNTING;
      }
      this.clock -= 1;
      if (this.clock > 0) {
        setTimeout(() => {
          this.countdown();
        }, 1000);
      } else {
        this.state = this.ONGOING;
        this.platformDisabled = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.pratice-en {
  width: 50%;
  margin: 1em auto;
}
</style>
