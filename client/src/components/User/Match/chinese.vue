<template>
  <div class="match">
    <cs-back/>
    <ul class="match__users">
      <li v-for="user in users" :key="user.id">
        <cs-progress :name="user.ip" :percent="user.percent" :speed="user.speed"/>
      </li>
    </ul>
    <div class="match__meta">
      <span v-if="state === COUNTING">倒计时: {{ clock }} 秒</span>
      <button v-else-if="state === DONE" @click="restart">再来一次</button>
      <span v-else-if="state === WRITING">已经开始了</span>
    </div>
    <div class="match__snippet"></div>
    <div class="match__input" contenteditable="false" data-highlight spellcheck="false"></div>
    <dl v-if="state === DONE">
      <dt>用时</dt>
      <dd>{{ time | formatTime }}</dd>
      <dt>速度</dt>
      <dd>{{ progress.speed }} 字/分钟</dd>
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
          >{{ record.user }}, {{ record.speed }} 字/分钟, {{ record.createdAt | formatDate }}</li>
        </ul>
      </dd>
    </dl>
  </div>
</template>

<script>
import charToSpan from "@/tools/char-to-span.js";
import preventPaste from "@/tools/prevent-paste.js";
import focusEditable from "@/tools/focus-editable.js";
import commonSubstrLength from "@/tools/common-substr-length";
import findOneAndRemove from "@/tools/find-one-and-remove";

export default {
  data() {
    return {
      LOADING: 0,
      COUNTING: 1,
      WRITING: 2,
      DONE: 3,
      state: this.LOADING,

      users: [],
      snippet: {},
      records: [],

      clock: 10000,
      time: 0,
      startedAt: 0,

      progress: {
        percent: 0,
        speed: 0
      },

      socket: null,
      input: null
    };
  },
  mounted() {
    this.init();
    this.join("cn");
  },
  methods: {
    init() {
      this.input = document.getElementsByClassName("match__input")[0];
      preventPaste(this.input);
      this.socket = this.$io.connect(this.$config.server);
      this.listen(this.socket);
    },
    join(lang) {
      this.socket.emit("join", lang);
    },
    listen(socket) {
      socket.on("users", data => {
        this.users = data.map(user => {
          return {
            id: user.id,
            ip: user.ip,
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
      socket.on("snippet", data => {
        this.snippet = data;
        document.getElementsByClassName(
          "match__snippet"
        )[0].innerHTML = charToSpan(data.content, "match__word");
      });
      socket.on("progress", data => {
        if (this.state === this.COUNTING || this.state === this.LOADING) {
          return;
        }
        console.log("progress", data);
        let user = this.users.find(user => user.id === data.id);
        if (user) {
          Object.assign(user, data);
          console.log(this.users);
        }
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
    },
    start() {
      this.state = this.WRITING;
      this.startedAt = Date.now();
      this.enableInput(this.input);
      this.watch(this.input);
    },
    restart() {
      this.reset();
      this.socket.emit("re-join");
    },
    reset() {
      this.state = this.LOADING;
      this.clock = 10000;
      this.progress.percent = 0;
      this.progress.speed = 0;
      this.startedAt = 0;

      this.input.innerHTML = "";
      this.prevenInput(this.input);
      this.input.setAttribute("data-highlight", "");
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

      const send = () => {
        this.socket.emit("progress", this.progress);
        if (this.state === this.WRITING) {
          setTimeout(send, 500);
        }
      };
      setTimeout(send, 500);

      const handler = (mutationList, observer) => {
        let len = commonSubstrLength(this.snippet.content, el.textContent);

        this.colorfy(
          document.getElementsByClassName("match__word"),
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

        this.progress.percent = Math.floor(
          (match.length / this.snippet.length) * 100
        );
        this.time = Date.now() - this.startedAt;
        this.progress.speed = (
          (match.length / (this.time / 1000)) *
          60
        ).toFixed(1);

        if (match === this.snippet.content) {
          observer.disconnect();
          this.done();
        }
      };

      var observer = new MutationObserver(handler);
      observer.observe(el, config);
      focusEditable(el);
    },
    done() {
      this.state = this.DONE;
      this.prevenInput(this.input);
      this.socket.emit("progress", this.progress);
      this.socket.emit("done", {
        time: this.time,
        speed: this.progress.speed
      });
      this.$axios.get(`/records?snippetId=${this.snippet._id}`).then(resp => {
        this.records = resp.data;
      });
    },
    colorfy(els, successIndex = -1, failIndex = -1, nextIndex = -1) {
      if (!els) {
        return;
      }
      if (~successIndex) {
        for (let i = 0; i < successIndex && i < els.length; i += 1) {
          els[i].classList.remove("match__next-word");
          els[i].classList.remove("match__word--not-match");
          els[i].classList.add("match__word--match");
        }
        for (let i = successIndex; i < els.length; i += 1) {
          els[i].classList.remove("match__word--match");
        }
      }
      if (~failIndex) {
        for (let i = successIndex; i < failIndex && i < els.length; i += 1) {
          els[i].classList.remove("match__next-word");
          els[i].classList.remove("match__word--match");
          els[i].classList.add("match__word--not-match");
        }
        for (let i = failIndex; i < els.length; i += 1) {
          els[i].classList.remove("match__word--not-match");
        }
      }
      if (~nextIndex) {
        for (let i = successIndex; i < nextIndex && i < els.length; i += 1) {
          els[i].classList.add("match__next-word");
        }
        for (let i = nextIndex; i < els.length; i += 1) {
          els[i].classList.remove("match__next-word");
        }
      }
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
.match {
  width: 50%;
  margin: 1em auto;

  .match__users {
    li + li {
      margin-top: 0.4em;
    }
  }

  .match__meta {
    color: #777;
    text-align: right;
    margin: 0.2em;
  }
  .match__snippet {
    color: #333;
    background: #eee;
    border-radius: 2px;
    padding: 0.2em 0.4em;
    font-size: 1.2em;
    font-weight: bold;
  }
  .match__input {
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
  .match__record:nth-child(odd) {
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
.match__word {
  transition: color 0.3s;
}
.match__next-word {
  border-bottom: 2px solid black;
}
.match__word--match {
  color: green !important;
}
.match__word--not-match {
  color: crimson !important;
}
</style>
