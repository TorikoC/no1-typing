<template>
  <div class="platform platform--en">
    <div class="platform__meta">
      <div class="platform__progress">
        计时器
        <span>{{ timer | formatTime }}</span>
        速度
        <span>
          {{ progress.speed }}
          <cs-wpm/>
        </span>
        进度
        <span>{{ progress.percent }}%</span>
      </div>
    </div>
    <div class="platform__text">
      <cs-loading v-if="loading"/>
      <template v-else>
        <span
          v-for="(char,index) in text"
          class="platform__char"
          :key="index"
          :class="{
          'platform__word--match': index < currentMatchLength, 
          'platform__word--not-match': index >= currentMatchLength && index < currentInputLength,
          'platform__next-word': index === currentMatchLength
          }"
        >{{ char }}</span>
      </template>
    </div>
    <textarea
      v-model="input"
      class="platform__input"
      cols="30"
      rows="10"
      spellcheck="false"
      disabled
      :class="{'platform__input--invalid': !inputValid}"
    ></textarea>
  </div>
</template>

<script>
export default {
  props: {
    disabled: {
      type: Boolean,
      default: true
    },
    text: {
      type: String,
      default: ""
    },
    loading: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    disabled(yes) {
      if (!yes) {
        this.timerHanler = setInterval(this.tick, 1000);

        this.words = this.text.split(" ");
        this.startTime = Date.now();

        this.elInput.removeAttribute("disabled");
        this.elInput.focus();
      } else {
        clearInterval(this.timerHanler);
        this.timerHanler = null;

        this.reset();
        this.elInput.setAttribute("disabled", true);
      }
    },
    input(value) {
      if (!value) {
        // input was deleted.
        this.inputValid = true;
        this.currentMatchLength = this.previouseMatchLength;
        this.currentInputLength = this.previouseMatchLength;
        return;
      }

      let space = false;
      let period = false;
      let last = false;

      let text = value;
      let lastChar = text[text.length - 1];
      if (lastChar === " ") {
        text = text.substr(0, text.length - 1);
        space = true;
      } else if (lastChar === ".") {
        period = true;
      }

      if (this.currentIndex === this.words.length - 1) {
        last = true;
      }
      let pattern = this.words[this.currentIndex];

      let matchLen = this.getMatchLen(text, pattern);

      this.currentMatchLength = this.previouseMatchLength + matchLen;
      this.currentInputLength = this.previouseMatchLength + text.length;

      this.inputValid = matchLen === text.length;

      // full match
      if (matchLen === text.length && pattern.length === text.length) {
        if (space || (period && last)) {
          this.updateProgress(period && last);
        }
      }
    }
  },
  data() {
    return {
      words: [],

      input: "",
      elInput: null,
      inputValid: true,
      currentIndex: 0,
      previouseMatchLength: 0,
      currentMatchLength: 0,
      currentInputLength: 0,

      timer: 0,
      startTime: 0,
      timerHanler: null,

      progress: {
        time: 0,
        speed: 0,
        percent: 0
      }
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.elInput = document.getElementsByClassName("platform__input")[0];
      this.elInput.onpaste = function(e) {
        e.preventDefault();
      };
    },

    tick() {
      this.timer = Date.now() - this.startTime;
    },
    updateProgress(done) {
      this.input = "";
      this.currentIndex += 1;
      this.previouseMatchLength = this.currentMatchLength;
      if (!done) {
        // 1 space
        this.previouseMatchLength += 1;
      }

      this.progress.percent = Math.floor(
        (this.previouseMatchLength / this.text.length) * 100
      ).toFixed(1);

      this.progress.time = Date.now() - this.startTime;
      this.progress.speed = Math.floor(
        (this.currentIndex / (this.progress.time / 1000)) * 60
      ).toFixed(0);

      this.$emit("match", this.progress);

      if (done) {
        const record = {
          time: this.progress.time,
          speed: this.progress.speed
        };
        this.$emit("complete", record);
      }
    },
    getMatchLen(s1, s2) {
      let i = 0;
      while (i < s1.length && i < s2.length && s1[i] === s2[i]) {
        i += 1;
      }
      return i;
    },
    reset() {
      this.progress = {
        speed: 0,
        percent: 0,
        time: 0
      };
      this.timer = 0;
      this.currentIndex = 0;
      this.currentInputLength = 0;
      this.currentMatchLength = 0;
      this.previouseMatchLength = 0;
    }
  }
};
</script>

<style lang="scss" scoped>
.platform--en {
  font-family: Consolas, monospace, "Microsoft Yahei";

  .platform__meta {
    color: #777;
    text-align: right;
    margin: 0.2em;
  }
  .platform__text {
    color: #333;
    background: #eee;
    border-radius: 2px;
    padding: 0.2em 0.4em;
    font-size: 1.2em;
    font-weight: bold;
    min-height: 1.2em;
  }
  .platform__record:nth-child(odd) {
    background: #eee;
    color: #333;
  }

  .platform__word--match {
    color: green !important;
  }
  .platform__word--not-match {
    color: crimson !important;
  }
  .platform__input {
    &:disabled {
      background: #ccc;
    }
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
      outline-color: #4d90fe;
    }
  }
  .platform__next-word {
    transition: background 0.3s;
    background: #2196f3;
    color: snow;
  }
  .platform__input--invalid {
    background: lightcoral;
  }
}
</style>
