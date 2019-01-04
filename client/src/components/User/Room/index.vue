<template>
  <div class="room">
    <dl class="room__info">
      <dt>房间名</dt>
      <dd>{{ room.name }}</dd>
      <dt>语言</dt>
      <dd>{{ room.lang }}</dd>
      <dt>人数限制:</dt>
      <dd>{{ room.userLimit }}</dd>
      <dt>状态</dt>
      <dd>
        <ul class="room__user-state">
          <li
            v-for="user in users"
            :key="user.username"
            :title="user.prepared ? 'prepared':  'not prepread'"
            :class="user.prepared ? 'room__user-state--prepared' : ''"
          >{{ user.username }}</li>
        </ul>
      </dd>
      <dt>说明</dt>
      <dd>所有人准备好之后, 房主可以开始.</dd>
    </dl>
    <div class="room__main">
      <cs-back/>
      <div class="room__control">
        <div class="room__button" v-if="state === roomState.WAITING">
          <button class="button" v-if="isHost" @click="toStart" :disabled="!allPrepared">start</button>
          <button
            class="button"
            v-else
            @click="toPrepare(username)"
            :disabled="prepared"
          >{{ prepared ? "prepared" : 'prepare' }}</button>
        </div>
        <cs-clock
          v-if="state === roomState.ONGOING && clock > 0"
          :clock="clock"
          class="room__clock"
        />
      </div>
      <progress-view :users="users"/>
      <component
        :is="'platform-' + lang"
        :disabled="platformDisabled"
        :text="snippet.content"
        :loading="loadingSnippet"
        @complete="toComplete"
        @match="toMatch"
      />
      <cs-loading v-if="loadingBook || loadingRecords"/>
      <result-view v-else-if="showResult" :book="book" :record="record" :bestRecords="bestRecords"/>
    </div>
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
      room: {},

      book: {},
      record: {},
      bestRecords: [],

      users: [],

      showResult: false,

      platformDisabled: true,

      prepared: false,
      allPrepared: true,

      first: true,

      loading: true,
      loadingBook: false,
      loadingSnippet: false,
      loadingRecords: false
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

    this.socket.on("update-best-records", this.toUpdateBestRecords);

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

    this.socket.off("update-best-records", this.toUpdateBestRecords);
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
          if (
            !result.data.users.some(user => user.username === this.username)
          ) {
            result.data.users.push({ username: this.username });
          }
          this.room = result.data;
          this.resetUsers(result.data.users);
          this.socket.emit("room-join", this.id, this.username);
        })
        .catch(error => {
          this.$router.replace("/rooms");
        });
    },
    toStart() {
      this.socket.emit("room-start", this.id);
      this.loadingSnippet = true;
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
          this.showResult = false;
          break;
        }
      }
    },
    toUpdateBook(b) {
      this.loadingBook = false;
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
      if (window.$debug) {
        console.log(this.username, "prepared");
      }
    },
    toUpdateSnippet(snippet) {
      this.snippet = snippet;

      this.loadingSnippet = false;
      this.socket.emit("room-snippet-updated", this.id, this.username);
      if (window.$debug) {
        console.log("snippet loaded: ", snippet);
      }
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
      if (window.$debug) {
        console.log("update progress", progress);
      }
    },

    toJoinUser(username) {
      this.users.push(this.getPlainUser(username));
      this.updateAllPrepared();
      if (window.$debug) {
        console.log("user join: ", username);
      }
    },
    toRemoveUser(username) {
      removeFromArray(this.users, user => user.username === username);
      this.updateAllPrepared();
      if (window.$debug) {
        console.log("user leave: ", username);
      }
    },
    toComplete(data) {
      this.record = data;

      this.showResult = true;

      this.togglePlatformDisabled();

      this.updateAllPrepared();

      const record = Object.assign(data, {
        lang: this.lang,
        mode: "match",
        username: this.username || "guest",
        snippetId: this.snippet._id
      });

      this.socket.emit("room-complete", this.id, this.username, record);

      this.loadingBook = true;
      this.socket.emit("room-fetch-book", this.snippet.bookId);
      this.loadingRecords = true;
      this.socket.emit("fetch-best-records", this.snippet._id, this.lang);
    },
    toUpdateBestRecords(r) {
      this.loadingRecords = false;
      this.bestRecords = r;
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
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-left: 0;
  margin-right: 0;
  margin-top: 1em;
  .room__info {
    width: 20%;
    align-self: flex-start;
    color: #555;
    font-size: 0.8em;
    box-shadow: 1px 1px 6px 0px silver;
    background: #eee;
    margin-left: 2.5%;
    margin-right: 2.5%;
    dt,
    dd {
      padding: 0.2em 0.4em;
    }
    dt {
      background: #dddddd;
    }
  }
  &__user-state {
    list-style: none;
    margin: 0;
    padding: 0;
    &--prepared {
      position: relative;
      &::before {
        content: url("../../../assets/icons/hand-paper-solid.svg");
        position: absolute;
        display: inline-block;
        top: 50%;
        transform: translateY(-50%);
        left: -1.2em;
        width: 0.8em;
        height: 0.8em;
      }
    }
    li + li {
      margin-top: 0.6em;
    }
  }
  &__message {
    margin: 1em 0;
  }
  .room__main {
    width: 50%;
    .room__control {
      display: flex;
      flex-direction: column;
      .room__button,
      .room__clock {
        margin-left: auto;
      }
    }
  }
}
</style>
