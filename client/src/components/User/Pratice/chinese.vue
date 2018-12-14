<template>
  <div class="pratice">
    <cs-back/>
    <cs-progress name="游客" class="pratice__progress" :progress="progress" :speed="speed"/>
    <div class="pratice__meta">
      <span v-if="state === COUNTING" class="pratice__clock">倒计时: {{ clock }} 秒</span>
      <button v-else-if="state === DONE" @click="restart">再来一次</button>
      <span v-else-if="state === WRITING">已经开始了</span>
    </div>
    <div class="pratice__snippet"></div>
    <div class="pratice__input" contenteditable="false" spellcheck="false"></div>
    <dl v-if="state === DONE">
      <dt>用时</dt>
      <dd>{{ time | formatTime }}</dd>
      <dt>速度</dt>
      <dd>约 {{ speed }} 字/分钟</dd>
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
import charToSpan from "@/tools/char-to-span.js";
import preventPaste from "@/tools/prevent-paste.js";
import focusEditable from "@/tools/focus-editable.js";
import commonSubstrLength from "@/tools/common-substr-length";

export default {
  data() {
    return {
      LOADING: 0,
      COUNTING: 1,
      WRITING: 2,
      DONE: 3,

      state: this.LOADING,

      clock: 4,

      snippetHTML: "",
      snippet: {},

      time: 0,
      speed: 0,
      progress: 0,

      startedAt: 0,

      input: null
    };
  },
  mounted() {
    this.input = document.getElementsByClassName("pratice__input")[0];
    preventPaste(this.input);

    this.prevenInput(this.input);
    this.getSnippet();
  },
  methods: {
    getSnippet() {
      this.$axios.get(`/snippets/cn/random`).then(resp => {
        this.snippet = resp.data;
        this.state = this.COUNTING;

        document.getElementsByClassName(
          "pratice__snippet"
        )[0].innerHTML = charToSpan(resp.data.content, "pratice__word");

        this.countdown();
      });
    },
    countdown() {
      this.clock -= 1;
      if (this.clock === 0) {
        this.state = this.WRITING;
        this.startedAt = Date.now();

        this.enableInput(this.input);
        this.watch(this.input);
      } else {
        setTimeout(this.countdown, 1000);
      }
    },
    restart(evt) {
      this.reset();
      this.getSnippet();
    },
    reset() {
      this.clock = 4;
      this.input.innerHTML = "";
      this.input.setAttribute("data-highlight", "");
      this.startedAt = 0;
      this.speed = 0;
      this.progress = 0;
      this.state = this.LOADING;
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
        let len = commonSubstrLength(this.snippet.content, el.textContent);

        this.colorfy(
          document.getElementsByClassName("pratice__word"),
          len,
          el.textContent.length,
          len + 1
        );

        let match = el.textContent
          .split("")
          .slice(0, len)
          .join("");
        match = match.replace(String.fromCharCode(32), "&nbsp;");
        el.setAttribute("data-highlight", match);

        this.progress = Math.floor((match.length / this.snippet.length) * 100);
        this.speed = (
          (match.length / ((Date.now() - this.startedAt) / 1000)) *
          60
        ).toFixed(1);

        if (match === this.snippet.content) {
          observer.disconnect();
          this.state = this.DONE;
          this.prevenInput(this.input);

          this.time = Date.now() - this.startedAt;
          this.speed = (
            (this.snippet.length / (this.time / 1000)) *
            60
          ).toFixed(1);
          this.post();
        }
      };

      var observer = new MutationObserver(handler);
      observer.observe(el, config);
      focusEditable(el);
    },
    post() {
      const formData = new FormData();
      formData.append("time", this.time);
      formData.append("speed", this.speed);
      formData.append("snippetId", this.snippet._id);

      this.$axios.post(`records`, formData).then(resp => {});
    },
    colorfy(els, successIndex = -1, failIndex = -1, nextIndex = -1) {
      if (!els) {
        return;
      }
      if (~successIndex) {
        for (let i = 0; i < successIndex && i < els.length; i += 1) {
          els[i].classList.remove("pratice__next-word");
          els[i].classList.remove("pratice__word--not-match");
          els[i].classList.add("pratice__word--match");
        }
        for (let i = successIndex; i < els.length; i += 1) {
          els[i].classList.remove("pratice__word--match");
        }
      }
      if (~failIndex) {
        for (let i = successIndex; i < failIndex && i < els.length; i += 1) {
          els[i].classList.remove("pratice__next-word");
          els[i].classList.remove("pratice__word--match");
          els[i].classList.add("pratice__word--not-match");
        }
        for (let i = failIndex; i < els.length; i += 1) {
          els[i].classList.remove("pratice__word--not-match");
        }
      }
      if (~nextIndex) {
        for (let i = successIndex; i < nextIndex && i < els.length; i += 1) {
          els[i].classList.add("pratice__next-word");
        }
        for (let i = nextIndex; i < els.length; i += 1) {
          els[i].classList.remove("pratice__next-word");
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.pratice {
  width: 50%;
  margin: 1em auto;
  .pratice__progress {
    margin: 0.4em 0;
  }
  .pratice__meta {
    color: #777;
    text-align: right;
    margin: 0.2em;
  }
  .pratice__word {
    transition: border color 0.3s;
  }
  .pratice__snippet {
    background: #eee;
    border-radius: 2px;
    padding: 0.2em 0.4em;
    font-size: 1.2em;
    font-weight: bold;
  }
  .pratice__input {
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
}
</style>
<style>
.pratice__next-word {
  border-bottom: 2px solid black;
}
.pratice__word--match {
  color: green !important;
}
.pratice__word--not-match {
  color: crimson !important;
}
</style>

