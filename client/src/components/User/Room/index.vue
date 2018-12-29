<template>
  <div class="match-en">
    <div v-if="roomState === $roomState.WAITING">
      <button v-if="isHost" @click="toStart" :disabled="!allPrepared">start</button>
      <button v-else @click="toPrepare" :disabled="prepared">prepare</button>
    </div>
    <platform
      :text="snippet.content"
      :state="state"
      :clock="clock"
      :record="record"
      :loading="loading"
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
  computed: {
    isHost() {
      return this.users[0] && this.users[0].username === this.username;
    }
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      username: window.$user ? window.$user.username : "",
      socket: this.$socket,

      clock: 999,
      state: this.$platformState.WAITING,
      roomState: this.$roomState.WAITING,

      snippet: {},

      record: {},
      showRecord: false,

      users: [],
      showUsers: true,

      prepared: false,
      allPrepared: true,

      loading: true
    };
  },
  mounted() {
    window.onbeforeunload = this.toLeave;

    this.socket.on("update-clock", this.toUpdateClock);

    this.$bus.$on("update-snippet", this.toUpdateSnippet);
    this.$bus.$on("update-progress", this.toUpdateProgress);
    this.$bus.$on("update-room-state", this.toUpdateRoomState);

    this.$bus.$on("user-join", this.toJoinUser);
    this.$bus.$on("user-leave", this.toRemoveUser);
    this.$bus.$on("user-prepared", this.toPrepareUser);

    this.getRoom();
  },
  methods: {
    getRoom() {
      this.$axios
        .get(`/rooms/${this.id}`)
        .then(result => {
          this.users = result.data.users.map(user => {
            return {
              username: user.username,
              speed: 0,
              percent: 0,
              done: false,
              prepared: false
            };
          });
          this.socket.emit("room-join", this.id, this.username);
        })
        .catch(error => {
          console.log("error", error);
          this.$router.replace("/rooms");
        });
    },
    toStart() {
      this.reset();
      this.socket.emit("room-start", this.id);
      this.allPrepared = false;
      console.log("start", this.id);
    },
    toUpdateRoomState(state) {
      this.roomState = state;
    },
    toPrepareUser(username) {
      this.users.forEach(user => {
        if (user.username === username) {
          user.prepared = true;
        }
      });
      this.allPrepared = !this.users.slice(1).some(user => !user.prepared);
      console.log(this.allPrepared);
    },
    toPrepare() {
      this.reset();
      this.prepared = true;
      this.users.forEach(user => {
        if (user.username === this.username) {
          user.prepared = true;
        }
      });
      this.socket.emit("room-prepared", this.id, this.username);

      console.log(this.username, "prepared");
    },
    toUpdateSnippet(snippet) {
      this.snippet = snippet;

      this.record = {
        cover: this.snippet.cover,
        author: this.snippet.author,
        name: this.snippet.name
      };
      this.socket.emit("room-snippet-updated", this.id, this.username);
      this.loading = false;
      console.log("snippet loaded: ", snippet);
    },

    toUpdateClock(clock) {
      if (this.state !== this.$platformState.COUNTING) {
        this.state = this.$platformState.COUNTING;
      }
      this.clock = clock;
      if (this.clock === 0) {
        this.state = this.$platformState.WRITING;
        console.log("start");
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
        percent: 0,
        done: false,
        prepared: false
      });
      console.log("user join: ", username);
      this.allPrepared = false;
    },
    toRemoveUser(username) {
      removeFromArray(this.users, user => user.username === username);
      this.allPrepared = !this.users.slice(1).some(user => !user.prepared);
    },
    toComplete(data) {
      this.state = this.$platformState.WAITING;

      if (this.isHost && this.users.length === 1) {
        this.allPrepared = true;
      }

      this.prepared = false;
      this.users.forEach(user => {
        if (user.username === user.username) {
          user.prepared = false;
        }
      });

      this.showRecord = true;
      Object.assign(this.record, data);

      const record = Object.assign(data, {
        lang: "en",
        mode: "match",
        username: this.username || "guest",
        snippetId: this.snippet._id
      });
      this.socket.emit("room-done", this.id, this.username, record);
    },
    toMatch(data) {
      this.users.forEach(user => {
        if (user.username === this.username) {
          Object.assign(user, data);
        }
      });
      this.$socket.emit(
        "room-update-progress",
        this.id,
        Object.assign(data, {
          username: this.username
        })
      );
    },
    toLeave() {
      this.socket.emit("room-leave", this.id, this.username);
    },
    reset() {
      this.showRecord = false;
      this.users.forEach(user => {
        user.speed = 0;
        user.percent = 0;
      });
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
.match-en {
  width: 50%;
  margin: 1em auto;
}
</style>
