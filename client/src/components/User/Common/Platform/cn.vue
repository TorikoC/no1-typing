<template>
  <div class="platform platform--cn">
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
    <div class="platform__input" contenteditable="false" spellcheck="false"></div>
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
      if (yes) {
        clearInterval(this.timerHanler);
        this.timerHanler = null;

        this.elInput.setAttribute("contenteditable", false);
        this.reset();
      } else {
        this.timerHanler = setInterval(this.tick, 1000);

        this.startTime = Date.now();

        this.watch(this.elInput);
        this.elInput.setAttribute("contenteditable", true);
        this.focusEditable(this.elInput);
      }
    }
  },
  data() {
    return {
      elInput: null,
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
    },
    watch(el) {
      const config = {
        attributes: false,
        childList: false,
        subtree: true,
        characterData: true
      };

      const handler = (mutationList, observer) => {
        let s1 = this.text;
        let s2 = el.textContent;
        let len = this.getMatchLen(s1, s2);

        let match = s2.substr(0, len);
        el.setAttribute("data-highlight", match);

        this.currentMatchLength = len;
        this.currentInputLength = s2.length;

        this.progress.time = Date.now() - this.startTime;
        this.progress.percent = ((len / s1.length) * 100).toFixed(0);
        this.progress.speed = (
          (len / (this.progress.time / 1000)) *
          60
        ).toFixed(0);

        this.updateProgress(match.length === s1.length);
        if (match.length === s1.length) {
          observer.disconnect();
        }
      };
      const observer = new MutationObserver(handler);
      observer.observe(el, config);
    },
    tick() {
      this.timer = Date.now() - this.startTime;
    },
    updateProgress(done) {
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
    focusEditable(el) {
      let s = window.getSelection();
      let r = document.createRange();
      el.innerHTML = "\u00a0";
      r.selectNodeContents(el);
      s.removeAllRanges();
      s.addRange(r);
      document.execCommand("delete", false, null);
    },
    reset() {
      this.progress = {
        speed: 0,
        percent: 0,
        time: 0
      };
      this.elInput.setAttribute("data-highlight", "");
      this.elInput.textContent = "";
      this.timer = 0;
      this.currentInputLength = 0;
      this.currentMatchLength = 0;
    }
  }
};
</script>

<style lang="scss" scoped>
.platform--cn {
  margin: 1em auto;
  font-family: "Microsoft Yahei", "Noto Sans SC", sans-serif;
  .platform__meta {
    color: #777;
    text-align: right;
    margin: 0.2em;
  }
  .platform__text {
    position: relative;
    background: #eee;
    border-radius: 2px;
    padding: 0.2em 0.4em;
    font-size: 1.2em;
    line-height: 1.6;
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
  .platform__input[contenteditable="false"] {
    background: #eee;
  }
  .platform__input {
    font-family: inherit;
    box-sizing: border-box;
    padding: 0.2em 0.4em;
    min-height: 1.8em;
    height: auto;
    position: relative;
    border: 1px solid silver;
    font-size: 1.2em;
    font-weight: bold;
    color: crimson;
    &::before {
      content: attr(data-highlight);
      display: block;
      padding: 0.2em 0.4em;
      color: green;
      position: absolute;
      top: 0;
      left: 0;
    }
    &:focus {
      outline-style: solid;
      outline-width: medium;
      outline-color: #4d90fe;
    }
  }
  .platform__next-word {
    border-bottom: 2px solid black;
  }
}
</style>
