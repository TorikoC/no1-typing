<template>
  <div class="room room--en">
    <div v-if="state === roomState.WAITING">
      <button v-if="isHost" @click="toStart" :disabled="!allPrepared">start</button>
      <button v-else @click="toPrepare(username)" :disabled="prepared">prepare</button>
    </div>
    <p>clock: {{ clock }}</p>
    <progress-view :users="users"/>
    <component
      :is="'platform-' + lang"
      :disabled="platformDisabled"
      :text="snippet.content"
      @complete="toComplete"
      @match="toMatch"
    />
    <result-view :show="showResult && !first" :book="book" :record="record"/>
  </div>
</template>

<script>
import PlatformCn from "@/components/User/Common/Platform/cn";
import PlatformEn from "@/components/User/Common/Platform/en";

import ProgressView from "@/components/User/Common/Progress-View/index";
import ResultView from "@/components/User/Common/Result-View/index";

import removeFromArray from "@/tools/find-one-and-remove.js";

export default {
  components: {
    PlatformEn,
    PlatformCn,
    ProgressView,
    ResultView
  },
  computed: {
    isHost() {
      return this.users[0] && this.users[0].username === this.username;
    }
  },
  props: {
    id: {
      type: String,
      required: true
    },
    lang: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      socket: this.$socket,
      username: window.$user ? window.$user.username : "",

      clock: 999,
      state: 0,
      roomState: {
        WAITING: 0,
        ONGOING: 1
      },

      snippet: {},

      book: {},
      record: {},

      users: [],

      showResult: true,

      platformDisabled: true,

      prepared: false,
      allPrepared: true,

      first: true,

      loading: true
    };
  },
  mounted() {
    window.onbeforeunload = this.toLeave;

    this.socket.emit("test");
    this.socket.on("room-update-clock", this.toUpdateClock);
    this.socket.on("room-update-state", this.toUpdateState);
    this.socket.on("room-update-snippet", this.toUpdateSnippet);
    this.socket.on("room-update-book", this.toUpdateBook);
    this.socket.on("room-update-progress", this.toUpdateProgress);
    this.socket.on("room-user-join", this.toJoinUser);
    this.socket.on("room-user-leave", this.toRemoveUser);
    this.socket.on("room-user-prepare", this.toPrepare);

    this.enterRoom();
  },
  destroyed() {
    this.toLeave();

    this.socket.off("room-update-clock", this.toUpdateClock);
    this.socket.off("room-update-state", this.toUpdateState);
    this.socket.off("room-update-snippet", this.toUpdateSnippet);
    this.socket.off("room-update-book", this.toUpdateBook);
    this.socket.off("room-update-progress", this.toUpdateProgress);
    this.socket.off("room-user-join", this.toJoinUser);
    this.socket.off("room-user-leave", this.toRemoveUser);
    this.socket.off("room-user-prepare", this.toPrepare);
  },
  methods: {
    /**
     * functions in work flow.
     */

    // no more http request after this function
    enterRoom() {
      this.$axios.get(`/rooms/${this.id}`).then(result => {
        // success
        if (!result.data.users.some(user => user.username === this.username)) {
          result.data.users.push({ username: this.username });
        }
        this.resetUsers(result.data.users);
        this.socket.emit("room-join", this.id, this.username);
      });
    },
    toStart() {
      this.socket.emit("room-start", this.id);
    },
    toUpdateState(state) {
      this.state = state;
      switch (state) {
        case this.roomState.WAITING: {
          // if guest
          this.prepared = false;

          // if host
          this.updateAllPrepared();
          break;
        }
        case this.roomState.ONGOING: {
          if (this.first) {
            this.first = false;
          }
          this.resetUsers(this.users);
          this.toggleshowResult();
          break;
        }
      }
    },
    toUpdateBook(b) {
      this.book = b;
    },
    toPrepare(username) {
      this.users.forEach(user => {
        if (user.username === username) {
          user.prepared = true;
        }
      });

      let self = this.username === username;
      if (self) {
        this.prepared = true;
        this.socket.emit("room-prepare", this.id, this.username);
      } else {
        this.updateAllPrepared();
      }
      console.log(this.username, "prepared");
    },
    toUpdateSnippet(snippet) {
      this.snippet = snippet;

      this.socket.emit("room-snippet-updated", this.id, this.username);
      console.log("snippet loaded: ", snippet);
    },

    toUpdateClock(clock) {
      if (clock < 0) {
        console.error("unexpect situation: clock < 0.");
        return;
      }
      this.clock = clock;
      if (this.clock === 0) {
        this.togglePlatformDisabled();
      }
    },

    toUpdateProgress(username, progress) {
      let self = username === this.username;
      this.users.forEach(user => {
        if (user.username === username) {
          Object.assign(user, progress);
        }
      });
      if (self) {
        this.socket.emit("room-update-progress", this.id, username, progress);
      }
      console.log("update progress", progress);
    },

    toJoinUser(username) {
      this.users.push(this.getPlainUser(username));
      this.updateAllPrepared();

      console.log("user join: ", username);
    },
    toRemoveUser(username) {
      removeFromArray(this.users, user => user.username === username);
      this.updateAllPrepared();
      console.log("user leave: ", username);
    },
    toComplete(data) {
      this.record = data;

      this.toggleshowResult();

      this.togglePlatformDisabled();

      this.updateAllPrepared();

      const record = Object.assign(data, {
        lang: "en",
        mode: "match",
        username: this.username || "guest",
        snippetId: this.snippet._id
      });

      this.socket.emit("room-complete", this.id, this.username, record);
      this.socket.emit("room-fetch-book", this.snippet.bookId);
    },
    toMatch(progress) {
      this.toUpdateProgress(this.username, progress);
    },
    toLeave() {
      this.socket.emit("room-leave", this.id, this.username);
    },

    /**
     * helper functions, not in work flow.
     */
    resetUsers(users) {
      this.users = users.map(user => {
        return this.getPlainUser(user.username);
      });
    },
    togglePlatformDisabled() {
      this.platformDisabled = !this.platformDisabled;
    },
    toggleshowResult() {
      this.showResult = !this.showResult;
    },
    getPlainUser(username) {
      return {
        username: username,
        speed: 0,
        percent: 0,
        done: false,
        prepared: false
      };
    },
    updateAllPrepared() {
      this.allPrepared = !this.users.slice(1).some(user => !user.prepared);
    }
  }
};
</script>

<style lang="scss" scoped>
.room {
  width: 50%;
  margin: 1em auto;
}
</style>
