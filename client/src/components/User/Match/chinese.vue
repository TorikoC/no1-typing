<template>
  <div class="platform--cn platform">
    <cs-back/>
    <ul class="platform__users">
      <li v-for="user in users" :key="user.id">
        <cs-progress :name="user.ip" :percent="user.percent" :speed="user.speed"/>
      </li>
    </ul>
    <div class="platform__meta">
      <span v-if="state === COUNTING">倒计时: {{ clock }} 秒</span>
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
    <div class="platform__input" contenteditable="false" data-highlight spellcheck="false"></div>
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

      currentMatchLength: 0,
      currentInputLength: 0,

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
      this.input = document.getElementsByClassName("platform__input")[0];
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
        // document.getElementsByClassName(
        //   "match__snippet"
        // )[0].innerHTML = charToSpan(data.content, "match__word");
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
      this.currentMatchLength = 0;
      this.currentInputLength = 0;

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

        let match = el.textContent
          .split("")
          .slice(0, len)
          .join("");
        match = match.replace(String.fromCharCode(32), "&nbsp;");

        this.currentMatchLength = len;
        this.currentInputLength = el.textContent.length;

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
@import "@/assets/css/platform.scss";
@import "@/assets/css/platform-cn.scss";
</style>


