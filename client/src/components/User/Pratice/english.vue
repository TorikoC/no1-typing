<template>
  <div class="platform">
    <cs-back/>
    <cs-progress
      name="游客"
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
        console.log(this.currentIndex, this.snippetArray.length);
        if (this.currentIndex === this.snippetArray.length - 1) {
          last = true;
        }
        console.log(s1, s2);
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
        console.log("last: ", last, "period", period, "match", match);
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
    },
    load() {
      this.$axios.get("/snippets/en/random").then(resp => {
        console.log(resp);
        this.snippet = resp.data;
        this.snippetArray = resp.data.content.split(" ");
        console.log(this.snippetArray);
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
.platform {
  width: 50%;
  margin: 1em auto;
  font-size: 1em;
  .platform__progress {
    margin: 0.4em 0;
  }
  .platform__meta {
    color: #777;
    text-align: right;
    margin: 0.2em;
  }
  .platform__word {
    transition: border color 0.3s;
  }
  .platform__snippet {
    background: #eee;
    border-radius: 2px;
    padding: 0.2em 0.4em;
    font-size: 1.2em;
    font-weight: bold;
  }
  .platform__input {
    font-family: inherit;
    resize: none;
    width: 100%;
    box-sizing: border-box;
    padding: 0.2em 0.4em;
    height: 2em;
    overflow: hidden;
    line-height: 1.6;
    position: relative;
    border: 1px solid silver;
    font-size: 1.2em;
    font-weight: bold;

    &:focus {
      outline-style: solid;
      outline-width: medium;
    }
  }
  .platform__input--not-valid {
    background: lightcoral;
  }
  dt {
    background: #eee;
  }
  .source {
    display: flex;
    flex-direction: row;
    .source__cover {
      display: block;
      width: 200px;
      img {
        max-width: 100%;
        height: auto;
        display: block;
      }
    }
    .source__name {
      padding: 0.2em 0.4em;
    }
  }
  .platform__next-word {
    border-bottom: 2px solid black;
  }
  .platform__word--match {
    color: green !important;
  }
  .platform__word--not-match {
    color: crimson !important;
  }
}
</style>
