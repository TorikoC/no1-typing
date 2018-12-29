<template>
  <div class="room room--en">
    <div v-if="state === $roomState.WAITING">
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
    <result-view :show="showRecord && !first" :record="record"/>
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
      state: this.$roomState.WAITING,

      snippet: {},

      users: [],

      record: {},
      showRecord: true,

      platformDisabled: true,

      prepared: false,
      allPrepared: true,

      first: true,

      loading: true
    };
  },
  mounted() {
    console.log(this.lang);
    window.onbeforeunload = this.toLeave;

    this.socket.on("update-clock", this.toUpdateClock);

    this.$bus.$on("update-snippet", this.toUpdateSnippet);
    this.$bus.$on("update-progress", this.toUpdateProgress);
    this.$bus.$on("update-room-state", this.toUpdateRoomState);

    this.$bus.$on("user-join", this.toJoinUser);
    this.$bus.$on("user-leave", this.toRemoveUser);
    this.$bus.$on("user-prepared", this.toPrepare);

    this.enterRoom();
  },
  methods: {
    /**
     * functions in work flow.
     */

    // no more http request after this function
    enterRoom() {
      this.$axios
        .get(`/rooms/${this.id}`)
        .then(result => {
          // success
          this.resetUsers(result.data.users);
          this.emit("room-join", this.id, this.username);
        })
        .catch(error => {
          // fail
          console.log("error", error);
          this.$router.replace("/rooms");
        });
    },
    toStart() {
      this.emit("room-start", this.id);
    },
    toUpdateRoomState(state) {
      this.state = state;
      switch (state) {
        case this.$roomState.WAITING: {
          // if guest
          this.prepared = false;

          // if host
          this.updateAllPrepared();
          break;
        }
        case this.$roomState.ONGOING: {
          if (this.first) {
            this.first = false;
          }
          this.resetUsers(this.users);
          this.toggleShowRecord();
          break;
        }
      }
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
        this.emit("room-prepared", this.id, this.username);
      } else {
        this.updateAllPrepared();
      }
      console.log(this.username, "prepared");
    },
    toUpdateSnippet(snippet) {
      this.snippet = snippet;

      this.record = {
        cover: this.snippet.cover,
        author: this.snippet.author,
        name: this.snippet.name
      };

      this.emit("room-snippet-updated", this.id, this.username);
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

    toUpdateProgress(progress) {
      let self = progress.username === this.username;
      this.users.forEach(user => {
        if (user.username === progress.username) {
          Object.assign(user, progress);
        }
      });
      if (self) {
        this.emit("room-update-progress", this.id, progress);
      }
      console.log("update progress", progress);
    },

    toJoinUser(username) {
      this.users.push(this.getPlainUser(username));
      this.updateAllPrepared();

      console.log("user join: ", username);
    },
    toRemoveUser(username) {
      console.log("user leave start.");
      removeFromArray(this.users, user => user.username === username);
      this.updateAllPrepared();
      console.log("user leave: ", username);
    },
    toComplete(data) {
      Object.assign(this.record, data);
      console.log(data);
      this.toggleShowRecord();

      this.togglePlatformDisabled();

      this.updateAllPrepared();

      const record = Object.assign(data, {
        lang: "en",
        mode: "match",
        username: this.username || "guest",
        snippetId: this.snippet._id
      });

      this.emit("room-done", this.id, this.username, record);
    },
    toMatch(progress) {
      const progressWithUsername = Object.assign(progress, {
        username: this.username
      });
      this.toUpdateProgress(progressWithUsername);
    },
    toLeave() {
      this.emit("room-leave", this.id, this.username);
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
    toggleShowRecord() {
      this.showRecord = !this.showRecord;
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
    },
    emit(eventName, ...payload) {
      this.socket.emit(eventName, ...payload);
    }
  },
  destroyed() {
    this.toLeave();

    this.$bus.$off("update-snippet", this.toUpdateSnippet);
    this.$bus.$off("update-progress", this.toUpdateProgress);
    this.$bus.$off("update-room-state", this.toUpdateRoomState);

    this.$bus.$off("user-join", this.toJoinUser);
    this.$bus.$off("user-leave", this.toRemoveUser);
    this.$bus.$off("user-prepared", this.toPrepareUser);
  }
};
</script>

<style lang="scss" scoped>
.room {
  width: 50%;
  margin: 1em auto;
}
</style>
