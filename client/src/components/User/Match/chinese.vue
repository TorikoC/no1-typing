<template>
  <div class="pratice">
    <back/>
    <ul class="users">
      <li v-for="user in users" :key="user.id">
        <n1-progress :name="user.ip" :progress="user.progress"/>
      </li>
    </ul>
    <div class="pratice__meta">
      <span v-if="state === COUNTING" class="pratice__clock">倒计时: {{ clock }} 秒</span>
      <button v-else-if="state === DONE" class="pratice__again" @click="restart">再来一次</button>
      <span v-else-if="state === WRITING">已经开始了</span>
    </div>
    <div class="pratice__snippet"></div>
    <div
      class="pratice__input"
      :contenteditable="state === WRITING"
      data-highlight
      spellcheck="false"
    ></div>
    <div v-if="state === DONE">
      <dl>
        <dt>用时</dt>
        <dd>{{ time | formatTime }}</dd>
        <dt>速度</dt>
        <dd>{{ speed }} 字/分钟</dd>
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
            >{{ record.user }} | {{ record.speed }} 字/分钟 | {{ record.createdAt }}</li>
          </ul>
        </dd>
      </dl>
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
      socket: null,

      clock: 0,

      users: [],

      snippetHTML: "",
      snippet: {},

      time: 0,
      speed: 0,
      progress: 0,

      records: [],

      startedAt: 0,

      input: null
    };
  },
  mounted() {
    this.input = document.getElementsByClassName("pratice__input")[0];
    this.preventPaste(this.input);
    this.prevenInput(this.input);
    this.socket = this.$io.connect("http://localhost:3000");
    this.bind();
  },
  methods: {
    bind() {
      this.socket.on("users", data => {
        this.users = data.map(user => {
          return {
            id: user.id,
            ip: user.ip,
            progress: 0,
            speed: 0
          };
        });
      });
      this.socket.on("snippet", data => {
        this.state = this.COUNTING;
        this.snippet = data;
        this.snippetHTML = this.snippetToHTML(data.content);
        document.getElementsByClassName(
          "pratice__snippet"
        )[0].innerHTML = this.snippetHTML;
      });
      this.socket.on("user-leave", data => {
        if (this.state === this.COUNTING) {
          let idx = this.users.findIndex(user => {
            return user.id === data;
          });
          if (idx !== -1) {
            this.users.splice(idx, 1);
          }
        }
      });
      this.socket.on("user-enter", data => {
        this.users.push({
          id: data.id,
          ip: data.ip,
          progress: 0
        });
      });
      this.socket.on("clock", data => {
        this.clock = data;
        if (this.clock === 0) {
          this.start();
        }
      });
    },
    start() {
      this.state = this.WRITING;
      this.enableInput(this.input);
      this.watch(this.input);
    },
    restart(evt) {
      this.reset();
      this.socket.emit("re-match");
    },
    reset() {
      this.state = this.LOADING;
      this.startedAt = 0;
      this.input.innerHTML = "";
      this.input.setAttribute("data-highlight", "");
      this.progress = 0;
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
    watch(el) {
      let s = window.getSelection();
      let r = document.createRange();
      el.innerHTML = "\u00a0";
      r.selectNodeContents(el);
      s.removeAllRanges();
      s.addRange(r);
      document.execCommand("delete", false, null);

      const config = {
        attributes: false,
        childList: false,
        subtree: true,
        characterData: true
      };

      const send = () => {
        let success = el.getAttribute("data-highlight").length || 0;
        let total = this.snippet.length;
        console.log("success", success);
        this.socket.emit("progress", {
          id: this.socket.id,
          progress: this.progress
        });
        if (this.state === this.WRITING) {
          setTimeout(send, 500);
        }
      };
      if (this.state === this.WRITING) {
        setTimeout(send, 500);
      }
      this.socket.on("progress", data => {
        if (this.state === this.WRITING || this.state === this.DONE) {
          this.users.forEach(user => {
            if (user.id === data.id) {
              user.progress = data.progress;
              if (data.speed) {
                user.speed = data.speed;
              }
            }
          });
        }
      });
      const handler = (mutationList, observer) => {
        if (!this.startedAt) {
          this.startedAt = Date.now();
        }
        let len = this.getCommonSubstrLength(
          this.snippet.content,
          el.textContent
        );

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
        this.progress = Math.floor((match.length / this.snippet.length) * 100);
        el.setAttribute("data-highlight", match);
        if (match === this.snippet.content) {
          observer.disconnect();
          this.prevenInput(this.input);
          this.state = this.DONE;
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
    },
    post() {
      this.socket.emit("progress", {
        id: this.socket.id,
        progress: this.progress
      });
      this.socket.emit("done", {
        time: this.time,
        speed: this.speed,
        snippetId: this.snippet._id
      });
      this.$axios
        .get(`${this.$config.server}/api/records?snippetId=${this.snippet._id}`)
        .then(resp => {
          console.log(resp);
          this.records = resp.data;
        });
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
  },
  destroyed() {
    this.state = this.DONE;
    if (this.socket) {
      this.socket.close();
    }
  }
};
</script>

<style lang="scss" scoped>
.pratice {
  width: 50%;
  margin: 1em auto;

  .users {
    li + li {
      margin-top: 0.4em;
    }
  }
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
