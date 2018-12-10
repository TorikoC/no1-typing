<template>
  <div class="pratice">
    <ul>
      <li
        v-for="user in users"
        :key="user.id"
      >{{user.id}}, {{user.progress}}, {{ user.speed || '' }}</li>
    </ul>
    <div v-if="state === COUNTING" class="pratice__clock">{{ clock }}</div>
    <button v-if="state === DONE" class="pratice__again" @click="restart">再来一次</button>

    <div class="pratice__snippet"></div>
    <div
      class="pratice__input"
      :contenteditable="state === WRITING"
      data-highlight
      spellcheck="false"
    ></div>
    <div v-if="state === DONE" class="pratice__record">
      <div class="pratice__time">{{ time }}</div>
      <div class="pratice__speed">{{ speed }} WPM</div>
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

      snippetRaw: "",
      snippetHTML: "",
      snippetLength: 0,
      snippetId: "",

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
    this.socket = this.$io.connect("http://localhost:3000");
    this.bind();
    this.getSnippet();
  },
  methods: {
    getSnippet() {
      this.$axios.get(`${this.$config.server}/api/snippets`).then(resp => {
        this.state = this.COUNTING;
        console.log("counting");
        this.snippetRaw = resp.data.content;
        this.snippetHTML = this.snippetToHTML(resp.data.content);
        document.getElementsByClassName(
          "pratice__snippet"
        )[0].innerHTML = this.snippetHTML;
        this.snippetLength = resp.data.length;
        this.snippetId = resp.data._id;
      });
    },
    bind() {
      this.socket.on("users", data => {
        console.log("users:", data);
        this.users = data.map(user => {
          return {
            id: user,
            progress: 0,
            speed: null
          };
        });
      });
      this.socket.on("user-leave", data => {
        console.log("user leave:", data);
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
        console.log("user enter: ", data);
        this.users.push({
          id: data,
          progress: 0
        });
      });
      this.socket.on("done", () => {
        console.log("done");
      });
      this.socket.on("clock", data => {
        console.log("tick: ", data);
        this.clock = data;
        if (this.clock === 0) {
          this.start();
        }
      });
    },
    start() {
      this.state = this.WRITING;
      this.enableInput(this.praticeInput);
      this.watch(this.praticeInput);
    },
    restart(evt) {
      this.reset();
      this.state = this.LOADING;
      this.socket.emit("re-match");
      this.getSnippet();
    },
    reset() {
      this.startedAt = 0;
      this.praticeInput.innerHTML = "";
      this.praticeInput.setAttribute("data-highlight", "");
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
        let total = this.snippetLength;
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
          console.log(data);
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
      // const formData = new FormData();
      // formData.append("time", this.time);
      // formData.append("speed", this.speed);
      // formData.append("snippetId", this.snippetId);
      // this.$axios
      //   .post(`${this.$config.server}/api/records`, formData)
      //   .then(resp => {});
      this.socket.emit("done", {
        time: this.time,
        speed: this.speed,
        snippetId: this.snippetId
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
  .pratice__snippet {
    font-family: "Microsoft Yahei";
  }
  .pratice__input {
    width: 640px;
    height: 320px;
    border: 1px solid silver;
    color: red;
    font-family: "Microsoft Yahei";
    position: relative;
    &::before {
      content: attr(data-highlight);
      color: green;
      position: absolute;
      top: 0;
      left: 0;
    }
  }
  .pratice__next-word {
    text-decoration: underline;
  }
  .pratice__word--match {
    color: green;
  }
  .pratice__word--not-match {
    color: red;
  }
}
</style>
