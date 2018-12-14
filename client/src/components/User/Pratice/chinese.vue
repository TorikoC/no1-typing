<template>
  <div class="platform platform--cn">
    <cs-back/>
    <cs-progress
      name="游客"
      lang="cn"
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
    <div class="platform__input" contenteditable="false" spellcheck="false"></div>
    <cs-result
      v-if="state === DONE"
      lang="cn"
      :time="time"
      :speed="progress.speed"
      :cover="snippet.cover"
      :name="snippet.name"
      :author="snippet.author"
    />
  </div>
</template>

<script>
import charToSpan from "@/tools/char-to-span.js";
import preventPaste from "@/tools/prevent-paste.js";
import focusEditable from "@/tools/focus-editable.js";
import computePercent from "@/tools/compute-percent";
import computeSpeed from "@/tools/compute-speed";
import commonSubstrLength from "@/tools/common-substr-length";

export default {
  data() {
    return {
      // 状态
      LOADING: 0,
      COUNTING: 1,
      WRITING: 2,
      DONE: 3,
      state: this.LOADING,

      CLOCK: 4,
      // 倒计时
      clock: 4,

      // 花费时间
      time: 0,
      startedAt: 0,

      currentMatchLength: 0,
      currentInputLength: 0,

      progress: {
        percent: 0,
        speed: 0
      },

      snippet: {},
      input: null
    };
  },
  mounted() {
    this.init();
    this.load();
  },
  methods: {
    // init -> load -> count -> start -> done -> restart.
    init() {
      this.input = document.getElementsByClassName("platform__input")[0];
      preventPaste(this.input);
      this.prevenInput(this.input);
    },
    load() {
      this.getSnippet();
    },
    count() {
      this.state = this.COUNTING;
      this.countdown();
    },
    start() {
      this.state = this.WRITING;
      this.startedAt = Date.now();
      this.enableInput(this.input);
      this.watch(this.input);
    },
    done() {
      console.log("hi");
      this.state = this.DONE;
      this.prevenInput(this.input);
      this.post();
    },
    restart(evt) {
      this.reset();
      this.load();
    },
    getSnippet() {
      this.$axios.get(`/snippets/random?lang=cn`).then(resp => {
        this.snippet = resp.data;
        this.count();
      });
    },
    countdown() {
      this.clock -= 1;
      if (this.clock === 0) {
        this.start();
      } else {
        setTimeout(this.countdown, 1000);
      }
    },
    reset() {
      this.state = this.LOADING;

      this.clock = this.CLOCK;
      this.time = 0;
      this.startedAt = 0;

      this.input.innerHTML = "";
      this.input.setAttribute("data-highlight", "");
      this.currentMatchLength = 0;
      this.currentInputLength = 0;

      this.progress.percent = 0;
      this.progress.speed = 0;
    },
    prevenInput(el) {
      el.setAttribute("contenteditable", false);
    },
    enableInput(el) {
      el.setAttribute("contenteditable", true);
    },
    watch(el) {
      const config = {
        attributes: false,
        childList: false,
        subtree: true,
        characterData: true
      };

      const handler = (mutationList, observer) => {
        let s1 = this.snippet.content;
        let s2 = el.textContent;
        let len = commonSubstrLength(s1, s2);

        let match = s2.substr(0, len);
        el.setAttribute("data-highlight", match);

        this.currentMatchLength = len;
        this.currentInputLength = s2.length;

        this.time = Date.now() - this.startedAt;
        this.progress.percent = computePercent(match.length, s1.length);
        this.progress.speed = computeSpeed(match.length, this.time / 1000);
        if (match === s1) {
          observer.disconnect();
          this.done();
        }
      };
      const observer = new MutationObserver(handler);
      observer.observe(el, config);
      focusEditable(el);
    },
    post() {
      const formData = new FormData();
      formData.append("time", this.time);
      formData.append("speed", this.progress.speed);
      formData.append("snippetId", this.snippet._id);
      this.$axios.post(`records`, formData);
    }
  }
};
</script>
<style lang="scss" scoped>
@import "@/assets/css/platform.scss";
@import "@/assets/css/platform-cn.scss";
</style>

