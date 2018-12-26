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
      <button v-else-if="state === DONE" @click="restart">再来一次</button>
      <span v-else-if="state === WRITING">已经开始了</span>
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
            :key="record.createdAt"
          >{{ record.user }}, {{ record.speed }} 字/分钟, {{ record.createdAt | formatDate }}</li>
        </ul>
      </dd>
    </dl>
  </div>
</template>

<script>
import getLongestCommonSubstrLength from "@/tools/common-substr-length.js";
import charToSpan from "@/tools/char-to-span.js";
import findOneAndRemove from "@/tools/find-one-and-remove";

export default {
  watch: {
    input(value) {
      if (value.length > 0) {
        let s1 = this.snippetArray[this.currentIndex];
        let s2 = value;
        let space = false;
        let match = false;
        let period = false;
        let last = false;
        let subStr = false;
        if (s2[s2.length - 1] === " ") {
          s2 = s2.substr(0, s2.length - 1);
          space = true;
        } else if (s2[s2.length - 1] === ".") {
          period = true;
        }
        // console.log(this.currentIndex, this.snippetArray.length);
        if (this.currentIndex === this.snippetArray.length - 1) {
          last = true;
        }
        // console.log(s1, s2);
        let len = getLongestCommonSubstrLength(s1, s2);
        this.currentMatchLength = this.previouseMatchLength + len;
        this.currentInputLength = this.currentMatchLength + (s2.length - len);
        if (len === s2.length && s1.length === s2.length) {
          match = true;
        }
        if (space) {
          if (match) {
            this.inputValid = true;
          } else {
            this.inputValid = false;
          }
        } else {
          if (len === s2.length) {
            this.inputValid = true;
          } else {
            this.inputValid = false;
          }
        }
        // console.log("last: ", last, "period", period, "match", match);
        if (last && period && match) {
          this.previouseMatchLength = this.currentMatchLength + 1;
          this.currentMatchLength = this.previouseMatchLength;
          this.currentInputLength = this.previouseMatchLength;
          this.input = "";
          this.currentIndex += 1;
          this.state = this.DONE;
          this.done();
          this.updateProgress();
        } else if (space && match) {
          // +1 space
          this.previouseMatchLength = this.currentMatchLength + 1;
          this.currentMatchLength = this.previouseMatchLength;
          this.currentInputLength = this.previouseMatchLength;
          this.input = "";
          this.currentIndex += 1;
          this.updateProgress();
        }
      } else {
        this.inputValid = true;
        this.currentMatchLength = this.previouseMatchLength;
        this.currentInputLength = this.previouseMatchLength;
      }
    },
    roomState(value) {
      if (value === this.$roomState.ONGOING) {
        this.reset();
      }
    }
  },

  props: {
    socket: null,
    roomId: "",
    roomState: {
      type: Number
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
      }
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.elInput = document.getElementsByClassName("platform__input")[0];
      this.elInput.setAttribute("disabled", true);
      this.listen(this.socket);
    },
    listen(socket) {
      socket.on("users", data => {
        console.log("users", data);
        this.users = data.map(username => {
          return {
            username: username,
            percent: 0,
            speed: 0,
            done: false,
            prepared: false
          };
        });
      });
      socket.on("done", username => {
        this.users.forEach(user => {
          if (user.username === username) {
            user.done = true;
          }
        });
      });
      socket.on("prepare", username => {
        this.users.forEach(user => {
          if (user.username === username) {
            user.prepared = true;
          }
        });
      });
      socket.on("user-leave", username => {
        console.log("user leave", username);
        findOneAndRemove(this.users, user => user.username === username);
        console.log(this.users);
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
      });
      socket.on("all-done", () => {
        this.$emit("done");
      });
      socket.on("clock", data => {
        console.log("clock", data);
        if (this.state !== this.COUNTING) {
          this.state = this.COUNTING;
        }
        this.clock = data;
        if (this.clock < 1 && this.state !== this.WRITING) {
          this.start();
        }
      });
      socket.on("progress", data => {
        console.log("progress", data);
        let user = this.users.find(user => user.username === data.username);
        if (user) {
          Object.assign(user, data);
        }
      });
      socket.on("snippet", data => {
        this.snippet = data;
        this.snippetArray = data.content.split(" ");
        this.currentIndex = 0;
        socket.emit("snippet-received", this.roomId);
      });
    },
    start() {
      this.state = this.WRITING;
      this.startedAt = Date.now();
      this.elInput.removeAttribute("disabled");
      this.elInput.focus();
    },
    reset() {
      this.state = this.LOADING;
      this.users = this.users.map(user => {
        return {
          username: user.username,
          percent: 0,
          speed: 0,
          done: false,
          prepared: false
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
    done() {
      this.state = this.DONE;
      this.socket.emit(
        "room-progress",
        this.roomId,
        this.progress,
        window.$user.username
      );
      const record = {
        username: window.$user.username,
        time: this.time,
        speed: this.progress.speed,
        mode: "match",
        lang: this.snippet.lang,
        snippetId: this.snippet._id
      };
      this.users.forEach(user => {
        if (user.username === window.$user.username) {
          user.done = true;
        }
      });
      this.socket.emit("room-done", this.roomId, record, window.$user.username);
      this.elInput.setAttribute("disabled", true);
      this.$axios.get(`/records?snippetId=${this.snippet._id}`).then(resp => {
        this.records = resp.data;
        console.log("records", this.records);
      });
    },
    restart() {
      this.reset();
      // this.socket.emit("re-join", "en");
    },
    updateProgress() {
      this.time = Date.now() - this.startedAt;
      this.progress.percent = Math.floor(
        (this.previouseMatchLength / this.snippet.content.length) * 100
      ).toFixed(1);
      this.progress.speed = Math.floor(
        (this.currentIndex / (this.time / 1000)) * 60
      ).toFixed(0);
      console.log(window.$user);
      this.socket.emit(
        "room-progress",
        this.roomId,
        this.progress,
        window.$user.username
      );
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/platform.scss";
@import "@/assets/css/platform-en.scss";
</style>
