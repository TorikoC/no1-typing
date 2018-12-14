<template>
  <div class="platform platform--en">
    <cs-back/>
    <ul>
      <li v-for="user in users" :key="user.id">
        <cs-progress
          class="platform__progress"
          :name="user.ip"
          :percent="user.percent"
          :speed="user.speed"
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
    }
  },
  data() {
    return {
      users: [],
      socket: null,

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
    this.join("en");
  },
  methods: {
    init() {
      this.elInput = document.getElementsByClassName("platform__input")[0];
      this.elInput.setAttribute("disabled", true);
      this.socket = this.$io.connect(this.$config.server);
      this.listen(this.socket);
    },
    listen(socket) {
      socket.on("users", data => {
        this.users = data.map(obj => {
          return {
            id: obj.id,
            ip: obj.ip,
            percent: 0,
            speed: 0
          };
        });
      });
      socket.on("user-leave", userId => {
        if (this.state === this.COUNTING) {
          findOneAndRemove(this.users, user => user.id === userId);
        }
      });
      socket.on("user-join", data => {
        this.users.push({
          id: data.id,
          ip: data.ip,
          percent: 0,
          speed: 0
        });
      });
      socket.on("clock", data => {
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
        let user = this.users.find(user => user.id === data.id);
        console.log(user);
        if (user) {
          Object.assign(user, data);
          console.log(this.users);
        }
      });
      socket.on("snippet", data => {
        console.log("snippet", data);
        this.snippet = data;
        this.snippetArray = data.content.split(" ");
        this.currentIndex = 0;
      });
    },
    join(lang) {
      this.socket.emit("join", lang);
    },
    start() {
      this.state = this.WRITING;
      this.startedAt = Date.now();
      this.elInput.removeAttribute("disabled");
      this.elInput.focus();
    },
    reset() {
      this.state = this.LOADING;
      this.users = [];
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
      this.socket.emit("progress", this.progress);
      this.socket.emit("done", {
        speed: this.progress.speed,
        time: this.time
      });
      this.elInput.setAttribute("disabled", true);
    },
    restart() {
      this.reset();
      this.socket.emit("re-join", "en");
    },
    updateProgress() {
      this.time = Date.now() - this.startedAt;
      this.progress.percent = Math.floor(
        (this.previouseMatchLength / this.snippet.content.length) * 100
      ).toFixed(1);
      this.progress.speed = Math.floor(
        (this.currentIndex / (this.time / 1000)) * 60
      ).toFixed(0);
      this.socket.emit("progress", this.progress);
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/platform.scss";
@import "@/assets/css/platform-en.scss";
</style>
