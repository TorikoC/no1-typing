<template>
  <div class="pratice">
    <back/>
    <div class="pratice__progress">
      <n1-progress name="游客" :progress="progress"/>
    </div>
    <div class="pratice__meta">
      <span v-if="state === COUNTING" class="pratice__clock">倒计时: {{ clock }} 秒</span>
      <button v-else-if="state === DONE" class="pratice__again" @click="restart">再来一次</button>
      <span v-else-if="state === WRITING">已经开始了</span>
    </div>
    <div class="pratice__snippet"></div>
    <div class="pratice__input" :contenteditable="state === WRITING" spellcheck="false"></div>
    <div v-if="state === DONE">
      <dl>
        <dt>用时</dt>
        <dd>{{ time | formatTime }}</dd>
        <dt>速度</dt>
        <dd>约 {{ speed }} 字/分钟</dd>
      </dl>
      <p>段落来自:</p>
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
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      LOADING: 0,
      COUNTING: 1,
      WRITING: 2,
      DONE: 3,

      state: this.LOADING,

      clock: 3,

      snippetRaw: "",
      snippetHTML: "",
      snippetLength: 0,
      snippetId: "",
      snippet: {},

      time: 0,
      speed: 0,
      progress: 0,

      startedAt: 0,

      praticeInput: null
    };
  },
  mounted() {
    this.praticeInput = document.getElementsByClassName("pratice__input")[0];
    this.preventPaste(this.praticeInput);
    this.prevenInput(this.praticeInput);
    this.getSnippet();
  },
  methods: {
    getSnippet() {
      this.$axios.get(`${this.$config.server}/api/snippets`).then(resp => {
        this.state = this.COUNTING;
        this.snippetRaw = resp.data.content;
        this.snippetHTML = this.snippetToHTML(resp.data.content);
        this.snippet = resp.data;
        document.getElementsByClassName(
          "pratice__snippet"
        )[0].innerHTML = this.snippetHTML;
        this.snippetLength = resp.data.content.length;
        this.snippetId = resp.data._id;
        setTimeout(this.countdown, 1000);
      });
    },
    countdown() {
      this.clock -= 1;
      if (this.clock === 0) {
        this.state = this.WRITING;
        this.enableInput(this.praticeInput);
        this.watch(this.praticeInput);
      } else {
        setTimeout(this.countdown, 1000);
      }
    },
    restart(evt) {
      this.clock = 3;
      this.praticeInput.innerHTML = "";
      this.praticeInput.setAttribute("data-highlight", "");
      this.state = this.LOADING;
      this.startedAt = 0;
      this.getSnippet();
    },
    preventPaste(el) {
      el.addEventListener("paste", evt => evt.preventDefault(), false);
    },
    prevenInput(el) {
      el.setAttribute("contenteditable", false);
    },
    enableInput(el) {
      el.setAttribute("contenteditable", true);
    },
    focus(el) {
      let s = window.getSelection();
      let r = document.createRange();
      el.innerHTML = "\u00a0";
      r.selectNodeContents(el);
      s.removeAllRanges();
      s.addRange(r);
      document.execCommand("delete", false, null);
    },
    watch(el) {
      this.focus(el);

      const config = {
        attributes: false,
        childList: false,
        subtree: true,
        characterData: true
      };

      const handler = (mutationList, observer) => {
        if (!this.startedAt) {
          this.startedAt = Date.now();
        }
        let len = this.getCommonSubstrLength(this.snippetRaw, el.textContent);

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
        this.progress = Math.floor((match.length / this.snippetLength) * 100);
        el.setAttribute("data-highlight", match);
        if (match === this.snippetRaw) {
          observer.disconnect();
          this.prevenInput(this.praticeInput);
          this.state = this.DONE;
          this.time = Date.now() - this.startedAt;
          this.speed = ((this.snippetLength / (this.time / 1000)) * 60).toFixed(
            1
          );
          this.post();
        }
      };

      var observer = new MutationObserver(handler);
      observer.observe(el, config);
    },
    post() {
      const formData = new FormData();
      formData.append("time", this.time);
      formData.append("speed", this.speed);
      formData.append("snippetId", this.snippetId);

      this.$axios
        .post(`${this.$config.server}/api/records`, formData)
        .then(resp => {});
    },
    snippetToHTML(snippet) {
      const els = snippet.split("").map(word => {
        return `<span class='pratice__word'>${word}</span>`;
      });
      return els.join("");
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
    },
    getCommonSubstrLength(s1, s2) {
      let len = 0;
      let hasMatch = false;
      for (let i = 0; i < s1.length && i < s2.length; i += 1) {
        if (
          s1[i] !== s2[i] &&
          !(s1.charCodeAt(i) === 32 && s2.charCodeAt(i) === 160)
        ) {
          console.log("not match: ", s1.charCodeAt(i), s2.charCodeAt(i));
          len = i;
          break;
        }
        hasMatch = true;
      }
      if (hasMatch && len === 0) {
        // s2 is sub string of s1
        len = s2.length;
      }
      return len;
    }
  }
};
</script>

<style lang="scss" scoped>
.pratice {
  width: 50%;
  margin: 1em auto;

  .pratice__meta {
    color: #777;
    text-align: right;
    margin: 0.2em;
  }
  .pratice__snippet {
    color: #333;
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
  }
  .pratice__record:nth-child(odd) {
    background: #eee;
    color: #333;
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

