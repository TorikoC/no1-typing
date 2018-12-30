<template>
  <div class="match">
    <button @click="toReload">restart</button>

    <progress-view :users="users"/>
    <component
      :is="'platform-' + lang"
      :disabled="platformDisabled"
      :text="snippet.content"
      @complete="toComplete"
      @match="toMatch"
    />
    <result-view :show="showResult" :record="record" :book="book"/>
  </div>
</template>

<script>
import PlatformCn from "@/components/User/Common/Platform/cn";
import PlatformEn from "@/components/User/Common/Platform/en";

import ProgressView from "@/components/User/Common/Progress-View/index";
import ResultView from "@/components/User/Common/Result-View/index";

import removeFromArray from "@/tools/find-one-and-remove.js";

export default {
  props: {
    lang: {
      type: String,
      required: true
    }
  },
  components: {
    PlatformEn,
    PlatformCn,
    ProgressView,
    ResultView
  },
  data() {
    return {
      id: "",
      username: window.$user ? window.$user.username : "",
      socket: this.$socket,

      clock: 999,

      snippet: {},

      record: {},
      book: {},
      showResult: false,

      users: [],

      platformDisabled: true,

      loadingUsers: true,
      loadingSnippet: true
    };
  },
  mounted() {
    window.onbeforeunload = this.toLeave;

    this.socket.emit("match-join", this.lang, this.username);

    this.socket.on("match-update-clock", this.toUpdateClock);

    this.$bus.$on("match-update-id", this.toUpdateId);
    this.$bus.$on("match-update-book", this.toUpdateBook);
    this.$bus.$on("match-update-users", this.toUpdateUsers);
    this.$bus.$on("match-update-snippet", this.toUpdateSnippet);
    this.$bus.$on("match-update-progress", this.toUpdateProgress);

    this.$bus.$on("match-user-join", this.toJoinUser);
    this.$bus.$on("match-user-leave", this.toRemoveUser);
  },
  methods: {
    toUpdateId(id) {
      this.id = id;
    },
    toUpdateUsers(users) {
      this.users = users.map(username => {
        return this.getPlainUser(username);
      });
      this.loadingUsers = false;
      console.log("users loaded: ", users);
    },
    toUpdateSnippet(snippet) {
      this.snippet = snippet;
      this.loadingSnippet = false;

      console.log("snippet loaded: ", snippet);
    },
    toUpdateBook(b) {
      this.book = b;
    },

    toUpdateClock(clock) {
      this.clock = clock;
      console.log("clock", clock);

      if (this.clock === 0) {
        this.platformDisabled = false;
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
      this.users.push(this.getPlainUser(username));
      console.log("user join: ", username);
    },
    toRemoveUser(username) {
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
      this.platformDisabled = true;
      this.record = data;
      this.showResult = true;
      this.socket.emit("match-done", record);
      this.socket.emit("match-fetch-book", this.snippet.bookName);
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
    },

    /**
     * helper functions
     */
    getPlainUser(username) {
      return {
        username: username,
        speed: 0,
        percent: 0
      };
    }
  },
  destroyed() {
    this.toLeave();

    this.$bus.$off("match-update-book", this.toUpdateBook);
    this.$bus.$off("match-update-id", this.toUpdateId);
    this.$bus.$off("match-update-users", this.toUpdateUsers);
    this.$bus.$off("match-update-snippet", this.toUpdateSnippet);
    this.$bus.$off("match-update-progress", this.toUpdateProgress);

    this.$bus.$off("match-user-join", this.toJoinUser);
    this.$bus.$off("match-user-leave", this.toRemoveUser);
  }
};
</script>

<style lang="scss" scoped>
.match {
  width: 50%;
  margin: 1em auto;
}
</style>
