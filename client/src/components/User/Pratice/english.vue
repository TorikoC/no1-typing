<template>
  <div class="platform platform--en">
    <cs-back/>
    <cs-progress
      name="游客"
      lang="en"
      class="platform__progress"
      :percent="progress.percent"
      :speed="progress.speed"
    />
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
    <cs-result
      v-if="state === DONE"
      lang="en"
      :time="time"
      :speed="progress.speed"
      :cover="snippet.cover"
      :name="snippet.name"
      :author="snippet.author"
    />
  </div>
</template>

<script>
import getLongestCommonSubstrLength from "@/tools/common-substr-length.js";
import charToSpan from "@/tools/char-to-span.js";
import preventPaste from "@/tools/prevent-paste.js";

export default {
  watch: {
    input(value) {
      if (value.length > 0) {
        let s1 = this.snippetArray[this.currentIndex];
        let s2 = value;

        let last = false;
        let space = false;
        let match = false;
        let period = false;
        let subStr = false;

        if (s2[s2.length - 1] === " ") {
          s2 = s2.substr(0, s2.length - 1);
          space = true;
        } else if (s2[s2.length - 1] === ".") {
          period = true;
        }
        if (this.currentIndex === this.snippetArray.length - 1) {
          last = true;
        }

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

        if (last && period && match) {
          this.previouseMatchLength = this.currentMatchLength;
          this.currentMatchLength = this.previouseMatchLength;
          this.currentInputLength = this.previouseMatchLength;

          this.input = "";
          this.currentIndex += 1;
          this.updateProgress();
          this.done();
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
      LOADING: 0,
      COUNTING: 1,
      WRITING: 2,
      DONE: 3,

      state: this.LOADING,
      startedAt: 0,
      time: 0,
      clock: 2,

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
    this.load();
  },
  methods: {
    init() {
      this.elInput = document.getElementsByClassName("platform__input")[0];
      this.elInput.setAttribute("disabled", true);
      preventPaste(this.elInput);
    },
    load() {
      this.$axios.get("/snippets/random?lang=en").then(resp => {
        this.snippet = resp.data;
        this.snippetArray = resp.data.content.split(" ");
        this.currentIndex = 0;
        this.count();
      });
    },
    count() {
      this.state = this.COUNTING;
      this.countdown();
    },
    start() {
      this.state = this.WRITING;
      this.startedAt = Date.now();
      this.elInput.removeAttribute("disabled");
      this.elInput.focus();
    },
    reset() {
      this.state = this.LOADING;
      this.clock = 2;
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
      this.elInput.setAttribute("disabled", true);
    },
    restart() {
      this.reset();
      this.load();
    },
    countdown() {
      const ONE_SECOND = 1000;
      this.clock -= 1;

      if (this.clock < 1) {
        this.start();
      } else {
        setTimeout(this.countdown, ONE_SECOND);
      }
    },
    updateProgress() {
      this.time = Date.now() - this.startedAt;
      this.progress.percent = Math.floor(
        (this.previouseMatchLength / this.snippet.content.length) * 100
      ).toFixed(1);
      this.progress.speed = Math.floor(
        (this.currentIndex / (this.time / 1000)) * 60
      ).toFixed(0);
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/css/platform.scss";
@import "@/assets/css/platform-en.scss";
</style>

