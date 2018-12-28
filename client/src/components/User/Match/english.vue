<template>
  <div class="match-en">
    <button @click="toReload">restart</button>
    <platform
      v-if="!loading"
      :text="snippet.content"
      :state="state"
      :clock="clock"
      :record="record"
      :show-record="showRecord"
      :show-users="showUsers"
      :users="users"
      @complete="toComplete"
      @match="toMatch"
    />
  </div>
</template>

<script>
import Platform from "@/components/User/Common/platform-en/index.vue";
import removeFromArray from "@/tools/find-one-and-remove.js";

export default {
  components: {
    Platform
  },
  data() {
    return {
      id: "",
      username: window.$user ? window.$user.username : "",
      socket: this.$socket,

      clock: 999,
      state: this.$platformState.WAITING,

      snippet: {},

      record: {},
      showRecord: false,

      users: [],
      showUsers: true,

      fresh: true,

      loading: true,
      loadingUsers: true,
      loadingSnippet: true
    };
  },
  mounted() {
    window.onbeforeunload = this.toLeave;
    this.socket.emit("match-join", "en", this.username);

    this.socket.on("update-clock", this.toUpdateClock);

    this.$bus.$on("update-id", this.toUpdateId);
    this.$bus.$on("update-users", this.toUpdateUsers);
    this.$bus.$on("update-snippet", this.toUpdateSnippet);
    this.$bus.$on("update-progress", this.toUpdateProgress);

    this.$bus.$on("user-join", this.toJoinUser);
    this.$bus.$on("user-leave", this.toRemoveUser);
  },
  methods: {
    toUpdateId(id) {
      this.id = id;
    },
    toUpdateUsers(users) {
      this.users = users.map(username => {
        return {
          username: username,
          percent: 0,
          speed: 0
        };
      });
      this.loadingUsers = false;
      if (!this.loadingSnippet) {
        this.loading = false;
      }
      console.log("users loaded: ", users);
    },
    toUpdateSnippet(snippet) {
      this.snippet = snippet;
      this.loadingSnippet = false;
      if (!this.loadingUsers) {
        this.loading = false;
      }
      this.record = {
        cover: this.snippet.cover,
        author: this.snippet.author,
        name: this.snippet.name
      };
      console.log("snippet loaded: ", snippet);
    },

    toUpdateClock(clock) {
      if (this.state !== this.$platformState.COUNTING) {
        this.state = this.$platformState.COUNTING;
      }
      this.clock = clock;
      console.log("clock", clock);
      if (this.clock === 0) {
        this.state = this.$platformState.WRITING;
      }
    },
    toUpdateProgress(progress) {
      console.log("update progress", progress);
      this.users.forEach(user => {
        if (user.username === progress.username) {
          Object.assign(user, progress);
        }
      });
    },
    toJoinUser(username) {
      this.users.push({
        username: username,
        speed: 0,
        percent: 0
      });
      console.log("user join: ", username);
    },
    toRemoveUser(username) {
      console.log("user leaving: ", username);
      removeFromArray(this.users, user => user.username === username);
      console.log("user leave: ", username);
    },
    toComplete(data) {
      const record = Object.assign(data, {
        lang: "en",
        mode: "match",
        username: this.username || "guest",
        snippetId: this.snippet._id
      });
      Object.assign(this.record, data);
      this.showRecord = true;
      this.socket.emit("match-done", record);
      this.state = this.$platformState.WAITING;
    },
    toMatch(data) {
      this.$socket.emit(
        "match-update-progress",
        this.id,
        Object.assign(data, {
          username: this.username
        })
      );
    },
    toLeave() {
      this.socket.emit("match-leave", this.id, this.username);
    },
    toReload() {
      window.location.reload();
    }
  },
  destroyed() {
    this.toLeave();

    this.$bus.$off("update-id", this.toUpdateId);
    this.$bus.$off("update-users", this.toUpdateUsers);
    this.$bus.$off("update-snippet", this.toUpdateSnippet);
    this.$bus.$off("update-progress", this.toUpdateProgress);

    this.$bus.$off("user-join", this.toJoinUser);
    this.$bus.$off("user-leave", this.toRemoveUser);
  }
};
</script>

<style lang="scss" scoped>
.match-en {
  width: 50%;
  margin: 1em auto;
}
</style>
