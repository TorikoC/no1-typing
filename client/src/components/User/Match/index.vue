<template>
  <div class="match">
    <cs-back/>
    <h1 class="match__header">匹配模式</h1>
    <progress-view :users="users"/>
    <div class="match__control">
      <button class="match__restart button" @click="toReload">重新匹配</button>
      <span v-if="clock > 0" class="match__clock">倒计时 {{ clock }}</span>
    </div>
    <component
      :is="'platform-' + lang"
      :disabled="platformDisabled"
      :text="snippet.content"
      :loading="loadingSnippet"
      @complete="toComplete"
      @match="toMatch"
    />
    <cs-loading v-if="loadingBook || loadingRecords"/>
    <result-view v-else-if="showResult" :record="record" :book="book" :bestRecords="bestRecords"/>
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
      username: window.$user ? window.$user.username : "游客",
      socket: this.$socket,

      clock: 999,

      snippet: {},

      record: {},
      bestRecords: [],
      book: {},
      showResult: false,

      users: [],

      platformDisabled: true,

      loadingBook: false,
      loadingUsers: true,
      loadingSnippet: true,
      loadingRecords: false,

      debug: process.env.NODE_ENV !== "production"
    };
  },
  mounted() {
    window.onbeforeunload = this.toLeave;

    this.socket.emit("match-join", this.lang, this.username);
    this.socket.on("match-update-clock", this.toUpdateClock);
    this.socket.on("match-update-id", this.toUpdateId);
    this.socket.on("match-update-book", this.toUpdateBook);
    this.socket.on("match-update-users", this.toUpdateUsers);
    this.socket.on("match-update-snippet", this.toUpdateSnippet);
    this.socket.on("match-update-progress", this.toUpdateProgress);
    this.socket.on("match-user-join", this.toJoinUser);
    this.socket.on("match-user-leave", this.toRemoveUser);

    this.socket.on("update-best-records", this.toUpdateBestRecords);
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
        lang: this.lang,
        mode: "match",
        username: this.username,
        snippetId: this.snippet._id
      });
      this.platformDisabled = true;
      this.record = data;
      this.showResult = true;
      this.socket.emit("match-done", record);

      this.loadingBook = true;
      this.socket.emit("match-fetch-book", this.snippet.bookId);
      this.loadingRecords = true;
      this.socket.emit("fetch-best-records", this.snippet._id, this.lang);
    },
    toUpdateBook(b) {
      this.loadingBook = false;
      this.book = b;
    },
    toUpdateBestRecords(r) {
      this.loadingRecords = false;
      this.bestRecords = r;
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
    this.socket.off("match-update-clock", this.toUpdateClock);
    this.socket.off("match-update-id", this.toUpdateId);
    this.socket.off("match-update-book", this.toUpdateBook);
    this.socket.off("match-update-users", this.toUpdateUsers);
    this.socket.off("match-update-snippet", this.toUpdateSnippet);
    this.socket.off("match-update-progress", this.toUpdateProgress);
    this.socket.off("match-user-join", this.toJoinUser);
    this.socket.off("match-user-leave", this.toRemoveUser);
    this.socket.off("update-best-records", this.toUpdateBestRecords);
  }
};
</script>

<style lang="scss" scoped>
.match {
  width: 50%;
  margin: 1em auto;

  &__control {
    display: flex;
    flex-direction: column;
  }
  &__restart {
    align-self: flex-end;
  }
  &__clock {
    align-self: flex-end;
  }
}
</style>
