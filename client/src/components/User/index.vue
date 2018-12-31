<template>
  <div>
    <nav class="nav">
      <ul>
        <li>
          <router-link to="/">练习</router-link>
        </li>
        <li>
          <router-link to="/rank">榜单</router-link>
        </li>
        <li>
          <router-link to="/about">关于</router-link>
        </li>
        <li>
          <router-link to="/feedback">反馈</router-link>
        </li>
        <li>
          <router-link to="/rooms">房间</router-link>
        </li>
      </ul>
      <ul v-if="login" class="nav__right">
        <li>
          <router-link :to="'/profile/' + jwtData.username">{{ jwtData.username }}</router-link>
        </li>
        <li>
          <a @click="toLogout">退出</a>
        </li>
      </ul>
      <ul v-else class="nav__right">
        <li>
          <router-link to="/login">登录</router-link>
        </li>
      </ul>
    </nav>
    <router-view></router-view>
    <div v-if="$route.fullPath === '/'" class="entry">
      <!-- custom Index Page -->
      <div class="entry__mode">
        <fieldset>
          <legend>语言</legend>
          <label for="radio-cn">中文</label>
          <input type="radio" id="radio-cn" name="lang" v-model="lang" value="cn">
          <label for="radio-en">English</label>
          <input type="radio" id="radio-en" name="lang" v-model="lang" value="en">
          <label for="radio-jp" title="开发中">日本語</label>
          <input type="radio" id="radio-jp" name="lang" v-model="lang" value="jp" disabled>
        </fieldset>
        <fieldset v-if="lang === 'cn'">
          <legend>模式</legend>
          <label for="cn-simplified">简体</label>
          <input type="radio" id="cn-simplified" name="cn" v-model="cnMode" value="simplified">
          <label for="cn-traditional" title="开发中">繁体</label>
          <input
            type="radio"
            id="cn-traditional"
            name="cn"
            v-model="cnMode"
            value="tradtional"
            disabled
          >
        </fieldset>
      </div>
      <router-link :to="'/pratice/' + lang">练习</router-link>
      <router-link :to="'/match/' + lang">匹配</router-link>
    </div>
  </div>
</template>

<script>
import jwtDecode from "jwt-decode";

export default {
  data() {
    return {
      lang: "en",
      cnMode: "simplified",

      login: false,
      jwt: "",
      jwtData: ""
    };
  },
  created() {
    this.$bus.$on("login", this.toLogin);
    this.$bus.$on("logout", this.toLogout);
    if (localStorage.getItem("jwt")) {
      this.toLogin(localStorage.getItem("jwt"));
    }
  },
  methods: {
    toLogin(jwt) {
      this.login = true;
      this.jwt = jwt;
      this.jwtData = jwtDecode(jwt);
      localStorage.setItem("jwt", jwt);
      window.login = true;
      window.$user = this.jwtData;
      this.$axios.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;
    },
    toLogout() {
      this.login = false;
      window.login = false;
      window.$user = "";
      this.$axios.defaults.headers.common["Authorization"] = "";
      localStorage.removeItem("jwt");
    }
  },
  destroyed() {
    this.$bus.$off("login", this.toLogin);
    this.$bus.$off("logout", this.toLogout);
  }
};
</script>

<style lang="scss" scoped>
.entry {
  $linkColor: orange;

  position: relative;
  display: block;
  width: 30%;
  margin: 1em auto;
  a {
    display: block;
    position: relative;
    padding: 0.2em 0.4em;
    line-height: 2.2;
    text-decoration: none;
    color: $linkColor;
    transition: color 0.3s;
    text-align: center;
  }
  a:visited {
    color: $linkColor;
  }
  a:hover {
    color: darken($color: $linkColor, $amount: 10);
  }
  $triWidth: 8px;
  a:hover::after {
    content: "";
    display: inline-block;
    position: absolute;
    right: -$triWidth;
    top: 50%;
    transform: translateY(-50%);
    border-left: $triWidth solid transparent;
    border-right: $triWidth solid black;
    border-top: $triWidth solid transparent;
    border-bottom: $triWidth solid transparent;
    animation-name: blink;
    animation-duration: 1s;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }
  @keyframes blink {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
  a:hover::before {
    content: "";
    display: inline-block;
    position: absolute;
    left: -$triWidth;
    top: 50%;
    transform: translateY(-50%);
    border-left: $triWidth solid black;
    border-right: $triWidth solid transparent;
    border-top: $triWidth solid transparent;
    border-bottom: $triWidth solid transparent;
    animation-name: blink;
    animation-duration: 1s;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }
  a:active {
    color: darken($color: $linkColor, $amount: 20);
  }
}
.nav {
  $linkColor: #666;
  line-height: 2.2;
  background: #eee;
  padding: 0.2em 0.6em;
  display: flex;
  flex-direction: row;
  ul,
  li {
    margin: 0;
    padding: 0;
    list-style: none;
    display: inline-block;
  }
  li + li {
    margin-left: 1em;
  }
  a {
    text-decoration: none;
    transition: color 0.3s;
    color: $linkColor;
  }
  a:visited {
    color: $linkColor;
  }
  a:hover {
    color: darken($color: $linkColor, $amount: 20);
  }
  a:active {
    color: darken($color: $linkColor, $amount: 30);
  }

  .nav__right {
    margin-left: auto;
  }
}
</style>
