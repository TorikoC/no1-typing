<template>
  <div class="pratice">
    <p class="pratice__snippet" v-html="snippetHTML"></p>
    <div class="pratice__input" contenteditable spellcheck="false"></div>
    <div class="test" contenteditable></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
      snippetRaw: "",
      snippetHTML: "",
      time: 0,

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
        this.loading = false;
        this.snippetRaw = resp.data.content;
        this.snippetHTML = this.snippetToHTML(resp.data.content);
        this.enableInput(this.praticeInput);
        this.watch(this.praticeInput);
      });
    },
    preventPaste(el) {
      el.addEventListener("paste", evt => evt.preventDefault(), false);
    },
    prevenInput(el) {
      el.addEventListener("keypress", this.keypressHandler, false);
    },
    enableInput(el) {
      el.removeEventListener("keypress", this.keypressHandler, false);
    },
    keypressHandler(evt) {
      evt.preventDefault();
    },
    watch(el) {
      el.focus();
      const config = {
        attributes: false,
        childList: true,
        subtree: true,
        characterData: true
      };
      const handler = (mutationList, observer) => {
        // debugger;
        let len = this.colorfy(el.textContent);
        const text = el.textContent;
        let part1 = text
          .split("")
          .slice(0, len)
          .join("");
        let part2 = text
          .split("")
          .slice(len)
          .join("");
        console.log(part1, part2);
        part1 = part1.replace(String.fromCharCode(32), "&nbsp;");
        part2 = part2.replace(String.fromCharCode(32), "&nbsp;");
        part1 = `<span class='pratice__word--match'>${part1}</span>`;
        part2 = `<span class='pratice__word--not-match'>${part2}</span>`;
        observer.disconnect();
        // el.innerHTML = part1 + part2;
        // var range = document.createRange();
        // var sel = window.getSelection();
        // range.setStart(
        //   el.lastChild.lastChild ? el.lastChild.lastChild : el.lastChild,
        //   el.lastChild.lastChild ? el.lastChild.lastChild.data.length : 0
        // );
        // range.collapse(true);
        // sel.removeAllRanges();
        // sel.addRange(range);
        observer.observe(el, config);
      };
      var observer = new MutationObserver(handler);
      observer.observe(el, config);
    },

    snippetToHTML(snippet) {
      const els = snippet.split("").map(word => {
        return `<span class='pratice__word'>${word}</span>`;
      });
      return els.join("");
    },
    colorfy(str) {
      const s1 = this.snippetRaw.replace(
        String.fromCharCode(10),
        String.fromCharCode(32)
      );
      let s2 = str;
      let len = 0;
      console.log(s1, s2);
      for (let i = 0; i < s1.length && i < s2.length; i += 1) {
        if (
          s1[i] !== s2[i] &&
          !(s1.charCodeAt(i) === 32 && s2.charCodeAt(i) === 160)
        ) {
          console.log(s1.charCodeAt(i), s2.charCodeAt(i));
          len = i;
          break;
        }
      }
      if (len === 0 && s1[0] === s2[0]) {
        len = s2.length;
      }
      const els = document.getElementsByClassName("pratice__word");

      for (let i = 0; i < len; i += 1) {
        els[i].classList.add("pratice__word--match");
        els[i].classList.remove("pratice__next-word");
        els[i].classList.remove("pratice__word--not-match");
      }
      els[len].classList.add("pratice__next-word");
      for (let i = len; i < els.length; i += 1) {
        els[i].classList.remove("pratice__word--match");
        els[i].classList.remove("pratice__word--not-match");
      }
      for (let i = len; i < s2.length; i += 1) {
        els[i].classList.add("pratice__word--not-match");
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
    font-family: "Microsoft Yahei";
  }
  .pratice__word {
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
.test {
  height: 100px;
  border: 1px solid black;
}
</style>
