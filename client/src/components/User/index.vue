<template>
  <div @click="hideDropdown">
    <nav class="nav">
      <ul>
        <li>
          <router-link to="/">练习</router-link>
        </li>
        <li>
          <router-link to="/rooms">房间</router-link>
        </li>
        <li>
          <router-link to="/rank">排行榜</router-link>
        </li>
        <li class="dropdown" @click="toggleDropdown">帮助
          <ul class="dropdown__menu">
            <li class="dropdown__item">
              <router-link to="/feedback">反馈</router-link>
            </li>
            <li class="dropdown__item">
              <router-link to="/about">关于</router-link>
            </li>
          </ul>
        </li>
      </ul>
      <ul v-if="user" class="nav__right">
        <li>
          <router-link :to="'/profile/' + user.username">{{ user.username }}</router-link>
        </li>
        <li>
          <a href="#" @click="toLogout">退出</a>
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
      <div class="entry__mode">
        <fieldset>
          <legend>语言</legend>
          <label for="radio-cn">简体中文</label>
          <input type="radio" id="radio-cn" name="lang" v-model="lang" value="cn">
          <label for="radio-en">English</label>
          <input type="radio" id="radio-en" name="lang" v-model="lang" value="en">
        </fieldset>
      </div>
      <div class="entry__select">
        <router-link :to="'/pratice/' + lang">练习</router-link>
        <router-link :to="'/match/' + lang">匹配</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import jwtDecode from "jwt-decode";

export default {
  data() {
    return {
      lang: "en",

      user: window.$user ? window.$user : ""
    };
  },
  created() {
    this.$bus.$on("login", this.toLogin);
    this.$bus.$on("logout", this.toLogout);
  },
  methods: {
    hideDropdown(evt) {
      const dropdown = document.getElementsByClassName("dropdown__menu")[0];
      let dropdownRect = dropdown.getBoundingClientRect();
      dropdown.style.display = "none";
    },
    toggleDropdown(evt) {
      evt.stopPropagation();
      const dropdown = document.getElementsByClassName("dropdown__menu")[0];
      if (dropdown.style.display === "block") {
        dropdown.style.display = "none";
      } else {
        dropdown.style.display = "block";
      }
      // let pointerX = evt.pageX;
      // let pointerY = evt.pageY;
      // if (
      //   pointerX >= dropdownRect.x &&
      //   pointerX <= dropdownRect.x + dropdownRect.x + dropdownRect.width &&
      //   pointerY >= dropdownRect.y &&
      //   pointerY <= dropdownRect.y + dropdownRect.y + dropdownRect.height
      // ) {
      // }
    },
    toLogin(jwt) {
      let data = jwtDecode(jwt);
      localStorage.setItem("jwt", jwt);
      this.user = data;
      window.$user = data;
      this.$axios.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;
    },
    toLogout() {
      window.$user = "";
      this.user = "";
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
  .entry__mode {
    margin-bottom: 1em;
  }
  a {
    display: block;
    position: relative;
    padding: 0.2em 0.4em;
    line-height: 2.2;
    text-decoration: none;
    color: $linkColor;
    transition: color 0.3s;
    text-align: center;
    border-top: 1px solid #fff;
    border-bottom: 1px solid #fff;
    transition: all 0.3s;
  }
  a:visited {
    color: $linkColor;
  }
  a:hover {
    color: darken($color: $linkColor, $amount: 10);
    border-top: 1px dashed silver;
    border-bottom: 1px dashed silver;
  }
  $triWidth: 8px;
  a:after {
    content: "";
    display: inline-block;
    position: absolute;
    right: -$triWidth - 10px;
    opacity: 0;
    top: 50%;
    transform: translateY(-50%);
    border-left: $triWidth solid transparent;
    border-right: $triWidth solid black;
    border-top: $triWidth solid transparent;
    border-bottom: $triWidth solid transparent;
    transition: all 0.3s;
  }

  a:hover::after {
    opacity: 1;
    right: -$triWidth;
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
  a::before {
    content: "";
    display: inline-block;
    position: absolute;
    left: -$triWidth - 10px;
    top: 50%;
    transform: translateY(-50%);
    border-left: $triWidth solid black;
    border-right: $triWidth solid transparent;
    border-top: $triWidth solid transparent;
    border-bottom: $triWidth solid transparent;
    transition: all 0.3s;
    opacity: 0;
  }
  a:hover::before {
    left: -$triWidth;
    opacity: 1;
  }
  a:active {
    color: darken($color: $linkColor, $amount: 20);
    border-top: 1px solid silver;
    border-bottom: 1px solid silver;
  }
}
.nav {
  $linkColor: #666;
  line-height: 2.2;
  background: #eee;
  padding: 0.2em 0.6em;
  display: flex;
  flex-direction: row;
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  li {
    display: inline-block;
    a {
      padding: 0.2em 0.4em;
      position: relative;
      text-decoration: none;
      transition: all 0.3s;
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
      background: #ccc;
      border-radius: 2px;
    }
  }
  li + li {
    margin-left: 1em;
  }
  .nav__right {
    margin-left: auto;
  }
}
.dropdown {
  position: relative;
  color: #666;
  align-self: flex-end;
  padding: 0.2em 0.4em;
  position: relative;
  text-decoration: none;
  transition: all 0.3s;
  &:active {
    background: #ccc;
    border-radius: 2px;
  }
  &:hover {
    cursor: pointer;
  }

  .dropdown__menu {
    display: none;
    position: absolute;
    width: 6em;
    border: 1px solid silver;
    background: #fefefe;
    li {
      margin: 0;
      padding: 0;
      display: block;
      a {
        height: 100%;
        display: block;
        padding: 0 0.4em;
        text-decoration: none;
        transition: none;
        color: #333;
        &:visited {
          color: #333;
        }
        &:hover {
          cursor: pointer;
          color: white;
          background: goldenrod;
        }
        &:active {
          background: #ccc;
          border-radius: 2px;
        }
      }
    }
  }
}
</style>
