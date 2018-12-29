<template>
  <div class="platform">
    <div class="platform__meta">
      <div class="platform__progress">
        timer
        <span>{{ timer | formatTime }}</span>
        speed
        <span>{{ progress.speed }}</span> wpm
        percent
        <span>{{ progress.percent }}</span>
      </div>
    </div>
    <div class="platform__text">
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
    </div>

    <div class="platform__input" contenteditable="false" spellcheck="false"></div>
  </div>
</template>

<script>
import commonSubstrLength from "@/tools/common-substr-length";
import computePercent from "@/tools/compute-percent";
import computeSpeed from "@/tools/compute-speed";
import focusEditable from "@/tools/focus-editable.js";

export default {
  props: {
    disabled: {
      type: Boolean,
      default: true
    },
    text: {
      type: String,
      default: ""
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
        focusEditable(this.elInput);
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
        let len = commonSubstrLength(s1, s2);

        let match = s2.substr(0, len);
        el.setAttribute("data-highlight", match);

        this.currentMatchLength = len;
        this.currentInputLength = s2.length;

        this.progress.time = Date.now() - this.startTime;
        this.progress.percent = computePercent(match.length, s1.length);
        this.progress.speed = computeSpeed(
          match.length,
          this.progress.time / 1000
        );
        console.log(this.progress.time, this.progress.speed);

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
.platform {
  margin: 1em auto;
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
    font-family: "Noto Sans SC Sliced", sans-serif;
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
    }
  }
  .platform__next-word {
    border-bottom: 2px solid black;
  }
}
</style>
