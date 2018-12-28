<template>
  <div class="platform platform--en">
    <ul>
      <li v-for="user in users" :key="user.id">
        <cs-progress
          class="platform__progress"
          :name="user.username"
          :percent="user.percent"
          :speed="user.speed"
          :done="user.done"
        />
      </li>
    </ul>
    <div class="platform__meta">
      <span v-if="state === COUNTING" class="platform__clock">倒计时: {{ clock }} 秒</span>
    </div>
    <div class="platform__snippet">
      <span
        v-for="(char,index) in snippet.content"
        :key="index"
        :class="{
          'platform__word--match': index < currentMatchLength, 
          'platform__word--not-match': index >= currentMatchLength && index < currentInputLength,
          'platform__next-word': index === currentMatchLength
          }"
        class="platform__word"
      >{{ char }}</span>
    </div>
    <textarea
      v-model="input"
      class="platform__input"
      :class="{'platform__input--not-valid': !inputValid}"
      cols="30"
      rows="10"
      spellcheck="false"
    ></textarea>
    <dl v-if="state === DONE">
      <dt>用时</dt>
      <dd>{{ time | formatTime }}</dd>
      <dt>速度</dt>
      <dd>约 {{ progress.speed }} 字/分钟</dd>
      <dt>段落来自</dt>
      <dd>
        <div class="source">
          <div class="source__cover">
            <img :src="snippet.cover" alt="source cover">
          </div>
          <div class="source__name">
            {{ snippet.name }}
            <br>
            <small>by {{ snippet.author }}</small>
          </div>
        </div>
      </dd>
      <dt>段落排行</dt>
      <dd>
        <ul class="records">
          <li
            v-for="record in records"
            :key="record._id"
          >{{ record.user }}, {{ record.speed }} 字/分钟, {{ record.createdAt | formatDate }}</li>
        </ul>
      </dd>
    </dl>
  </div>
</template>

<script>
import charToSpan from "@/tools/char-to-span.js";
import findOneAndRemove from "@/tools/find-one-and-remove";
import getLongestCommonSubstrLength from "@/tools/common-substr-length.js";

export default {
  watch: {
    input(value) {
      if (value.length <= 0) {
        this.inputValid = true;
        this.currentMatchLength = this.previouseMatchLength;
        this.currentInputLength = this.previouseMatchLength;
        return;
      }
      let pattern = this.snippetArray[this.currentIndex];
      let userInput = value;

      let space = false;
      let match = false;
      let period = false;
      let last = false;
      let subStr = false;

      if (userInput[userInput.length - 1] === " ") {
        userInput = userInput.substr(0, userInput.length - 1);
        space = true;
      }

      if (userInput[userInput.length - 1] === ".") {
        period = true;
      }

      let matchedLen = getLongestCommonSubstrLength(pattern, userInput);
      this.currentMatchLength = this.previouseMatchLength + matchedLen;
      this.currentInputLength = this.previouseMatchLength + userInput.length;

      if (
        matchedLen === userInput.length &&
        pattern.length === userInput.length
      ) {
        match = true;
      }
      if (space) {
        this.inputValid = match;
      } else {
        this.inputValid = matchedLen === userInput.length;
      }
      if (this.currentIndex === this.snippetArray.length - 1) {
        last = true;
      }
      if (match) {
        if (space) {
          this.updateProgress();
        }
        if (period && last) {
          this.updateProgress();
          this.done();
        }
      }
    },
    roomState(state) {
      if (state === this.$roomState.ONGOING) {
        this.reset();
      }
    }
  },
  props: {
    socket: {
      type: Object
    },
    roomId: {
      type: String
    },
    roomState: {
      type: Number
    },
    currentUsers: {
      type: Array
    }
  },
  data() {
    return {
      users: [],
      LOADING: 0,
      COUNTING: 1,
      WRITING: 2,
      DONE: 3,

      state: this.LOADING,
      startedAt: 0,
      time: 0,
      clock: 1000,

      progress: {
        percent: 0,
        speed: 0
      },

      records: [],

      elInput: null,
      input: "",
      snippetArray: [],
      currentIndex: -1,
      previouseMatchLength: 0,
      currentMatchLength: 0,
      currentInputLength: 0,
      inputValid: true,

      snippet: {
        content: "",
        length: 0,
        bookName: "",
        author: "",
        cover: ""
      },

      username: ""
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.elInput = document.getElementsByClassName("platform__input")[0];
      this.elInput.setAttribute("disabled", true);
      this.username = window.$user.username;
      this.users = this.currentUsers.map(user => {
        return {
          username: user.username,
          percent: 0,
          speed: 0,
          done: user.done,
          prepared: false
        };
      });
      this.listen(this.socket);
    },
    listen(socket) {
      socket.on("user-done", username => {
        this.users.forEach(user => {
          if (user.username === username) {
            user.done = true;
          }
        });
      });
      socket.on("user-prepared", username => {
        this.users.forEach(user => {
          if (user.username === username) {
            user.prepared = true;
          }
        });
        if (!this.users.slice(1).some(user => !user.prepared)) {
          this.$emit("ready");
        }
      });
      socket.on("user-leave", username => {
        console.log("user leave", username);
        if (this.users.length > 1) {
          this.$emit("host-change", this.users[1].username);
        }
        findOneAndRemove(this.users, user => user.username === username);
        console.log(this.users);
        if (!this.users.slice(1).some(user => !user.prepared)) {
          this.$emit("ready");
        }
      });
      socket.on("user-join", username => {
        console.log("user-join", username);
        this.users.push({
          username: username,
          percent: 0,
          speed: 0,
          done: false,
          prepared: false
        });
        console.log(this.users);
        this.$emit("not-ready");
      });
      socket.on("all-done", () => {
        this.$emit("done");
      });
      socket.on("update-clock", data => {
        console.log("clock", data);
        if (this.state !== this.COUNTING) {
          this.state = this.COUNTING;
        }
        this.clock = data;
        if (this.clock < 1 && this.state !== this.WRITING) {
          this.start();
        }
      });
      socket.on("update-progress", data => {
        console.log("progress", data);
        let user = this.users.find(user => user.username === data.username);
        if (user) {
          Object.assign(user, data);
        }
      });
      socket.on("update-snippet", data => {
        console.log("update-snippet", data);
        this.snippet = data;
        this.snippetArray = data.content.split(" ");
        this.currentIndex = 0;
        socket.emit("room-snippet-updated", this.roomId, this.username);
      });
    },
    start() {
      this.state = this.WRITING;
      this.startedAt = Date.now();
      this.elInput.removeAttribute("disabled");
      this.elInput.focus();
    },
    updateProgress() {
      this.currentIndex += 1;
      this.previouseMatchLength = this.currentMatchLength + 1;
      this.currentMatchLength = this.previouseMatchLength;
      this.currentInputLength = this.previouseMatchLength;

      this.time = Date.now() - this.startedAt;
      this.input = "";

      this.progress.percent = Math.floor(
        (this.previouseMatchLength / this.snippet.content.length) * 100
      ).toFixed(1);
      this.progress.speed = Math.floor(
        (this.currentIndex / (this.time / 1000)) * 60
      ).toFixed(0);
      this.updateProgressSelf();
      this.socket.emit("room-update-progress", this.roomId, this.getProgress());
    },
    done() {
      this.state = this.DONE;

      const record = this.getRecord();
      const progress = this.getProgress();
      this.updateProgressSelf();
      this.socket.emit("room-update-progress", this.roomId, progress);
      this.socket.emit("room-done", this.roomId, this.username, record);

      this.elInput.setAttribute("disabled", true);

      // TODO:
      // let socket handler this, its faster
      this.$axios.get(`/records?snippetId=${this.snippet._id}`).then(resp => {
        this.records = resp.data;
      });
    },
    reset() {
      this.state = this.LOADING;
      this.users = this.users.map(user => {
        return {
          speed: 0,
          percent: 0,
          done: false,
          prepared: false,
          username: user.username
        };
      });
      this.clock = 1000;
      this.startedAt = 0;
      this.time = 0;
      this.progress.percent = 0;
      this.progress.speed = 0;
      this.input = "";
      this.currentIndex = -1;
      this.previouseMatchLength = 0;
      this.currentMatchLength = 0;
      this.currentInputLength = 0;
      this.inputValid = true;
    },
    updateProgressSelf() {
      this.users.forEach(user => {
        if (user.username === this.username) {
          Object.assign(user, this.progress);
          if (this.state === this.DONE) {
            user.done = true;
          }
        }
      });
    },
    getRecord() {
      return {
        mode: "match",
        time: this.time,
        lang: this.snippet.lang,
        speed: this.progress.speed,
        snippetId: this.snippet._id,
        username: window.$user.username
      };
    },
    getProgress() {
      return {
        username: this.username,
        speed: this.progress.speed,
        percent: this.progress.percent
      };
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/platform.scss";
@import "@/assets/css/platform-en.scss";
</style>
