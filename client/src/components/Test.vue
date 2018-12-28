<template>
  <div v-if="!loading">
    <h1>Pratice</h1>
    <button v-if="state === $platformState.WAITING" @click="toStart">start</button>
    <platform
      :text="snippet.content"
      :state="state"
      :clock="clock"
      :record="record"
      :show-record="showRecord"
      :show-users="showUsers"
      :users="users"
      @complete="toComplete"
      @update-progress="toUpdateProgress"
    />
  </div>
</template>

<script>
import Platform from "./User/Common/platform-en/index.vue";

export default {
  components: {
    Platform
  },
  data() {
    return {
      clock: this.$constant.PRATICE_MODE_CLOCK,
      state: this.$platformState.WAITING,

      snippet: {},

      record: {},
      showRecord: false,

      users: [
        {
          username: window.$user ? window.$user.username : "annoymous",
          speed: 0,
          percent: 0
        }
      ],
      showUsers: true,

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
          this.state = this.$platformState.COUNTING;
          this.countdown();
        }
      });
    },
    toStart() {
      this.showRecord = false;

      if (this.fresh) {
        this.state = this.$platformState.COUNTING;
        this.countdown();
      } else {
        this.loading = true;
        this.getSnippet(this.fresh);
      }
    },
    toUpdateProgress(progress) {
      this.users[0] = Object.assign(this.users[0], progress);
    },
    toComplete(data) {
      this.postRecord(data);

      if (this.fresh) {
        this.fresh = false;
      }
      this.state = this.$platformState.WAITING;

      this.showRecord = true;
      this.clock = this.$constant.PRATICE_MODE_CLOCK;
      this.record = Object.assign(this.record, data);
    },
    postRecord(data) {
      const formData = new FormData();
      formData.append("mode", "pratice");
      formData.append("time", data.time);
      formData.append("speed", data.speed);
      formData.append("snippetId", this.snippet._id);

      this.$axios.post("/records", formData);
    },
    countdown() {
      this.clock -= 1;
      if (this.clock > 0) {
        setTimeout(() => {
          this.countdown();
        }, 1000);
      } else {
        this.state = this.$platformState.WRITING;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
