<template>
  <div class="app" :class="theme" @click="hideDropdown">
    <nav class="nav">
      <ul class="nav__list">
        <li class="nav__list-item">
          <router-link class="nav__link" to="/">主页</router-link>
        </li>
        <li class="nav__list-item">
          <router-link class="nav__link" to="/rooms">房间</router-link>
        </li>
        <li class="nav__list-item">
          <router-link class="nav__link" to="/rank">排行榜</router-link>
        </li>
        <li class="dropdown nav__list-item" @click="toggleDropdown">
          <span class="nav__link dropdown__entry">帮助</span>
          <ul class="dropdown__menu">
            <li class="dropdown__item">
              <router-link class="dropdown__link" to="/intro">说明</router-link>
            </li>
            <span class="dropdown__divisor"></span>
            <li class="dropdown__item">
              <router-link class="dropdown__link" to="/feedback">反馈</router-link>
            </li>
            <li class="dropdown__item">
              <router-link class="dropdown__link" to="/about">关于本站</router-link>
            </li>
          </ul>
        </li>
      </ul>
      <ul v-if="user" class="nav__list nav__list--right">
        <li class="nav__list-item">
          <router-link class="nav__link" :to="'/profile/' + user.username">{{ user.username }}</router-link>
        </li>
        <li class="nav__list-item">
          <a href="#" class="nav__link nav__link--danger" @click="toLogout">退出</a>
        </li>
      </ul>
      <ul v-else class="nav__list nav__list--right">
        <li class="nav__list-item">
          <router-link class="nav__link" to="/login">登录</router-link>
        </li>
      </ul>
    </nav>
    <router-view class="content"></router-view>
    <div class="menu content" v-if="$route.fullPath === '/'">
      <div class="menu__mode">
        <fieldset>
          <legend>语言</legend>
          <label for="radio-cn">简体中文</label>
          <input type="radio" id="radio-cn" name="lang" v-model="lang" value="cn">
          <label for="radio-en">English</label>
          <input type="radio" id="radio-en" name="lang" v-model="lang" value="en">
        </fieldset>
      </div>
      <div>
        <router-link :to="'/pratice/' + lang">练习</router-link>
        <router-link :to="'/match/' + lang">匹配</router-link>
      </div>
    </div>
    <div class="footer">
      <div class="footer__theme-selector">
        <label for="theme">主题</label>
        <select name="theme" id="theme" v-model="theme">
          <option value="theme--light">light</option>
          <option value="theme--dark">dark</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
import jwtDecode from "jwt-decode";

export default {
  watch: {
    theme(value) {}
  },
  data() {
    return {
      lang: "en",
      user: window.$user ? window.$user : "",
      theme: "theme--light"
    };
  },
  created() {
    this.$bus.$on("login", this.toLogin);
    this.$bus.$on("logout", this.toLogout);
  },
  methods: {
    hideDropdown(evt) {
      const dropdownMenu = document.getElementsByClassName("dropdown__menu")[0];
      const dropdown = document.getElementsByClassName("dropdown__entry")[0];
      dropdown.classList.remove("dropdown__entry--active");
      dropdownMenu.style.display = "none";
    },
    toggleDropdown(evt) {
      evt.stopPropagation();
      const dropdownMenu = document.getElementsByClassName("dropdown__menu")[0];
      const dropdown = document.getElementsByClassName("dropdown__entry")[0];
      if (dropdownMenu.style.display === "block") {
        dropdown.classList.remove("dropdown__entry--active");
        dropdownMenu.style.display = "none";
      } else {
        dropdown.classList.add("dropdown__entry--active");
        dropdownMenu.style.display = "block";
      }
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
.theme--dark {
  color: #bbb;
  background: #222;
}
.app {
  min-height: 100%;
  position: relative;
}
.content {
  position: relative;
  margin-left: auto;
  margin-right: auto;
  width: 50%;
  margin-top: 1em;
  padding-bottom: 3em;
}
.footer {
  width: 100%;
  position: absolute;
  bottom: 0;
  height: 3em;
  box-sizing: border-box;
  background: #f1f1f1;
  padding: 0.8em 1.6em;

  font-size: small;
  display: flex;
  flex-direction: column;
  &__theme-selector {
    align-self: flex-end;
    label {
      display: inline-block;
      vertical-align: top;
      margin-right: 0.4em;
    }
  }
}
.theme--dark {
  .footer {
    background: #333;
    color: #aaa;
  }
}
$triWidth: 8px;
$triColor: #333;
.menu {
  $defaultColor: #ffa500;
  $hoverColor: #e59400;
  $activeColor: #cc8400;

  width: 30%;
  display: block;
  position: relative;

  .menu__mode {
    margin-bottom: 1em;
  }

  @mixin tri {
    content: "";
    display: inline-block;

    border-top: $triWidth solid transparent;
    border-bottom: $triWidth solid transparent;

    // vertical center
    position: absolute;
    top: 50%;
    transform: translateY(-50%);

    // animation
    opacity: 0;
    transition: all 0.3s;
  }

  a {
    display: block;
    position: relative;
    padding: 0.2em 0.4em;
    line-height: 2.2;
    text-decoration: none;
    color: $defaultColor;
    transition: color 0.3s;
    text-align: center;
    border-top: 1px solid transparent;
    border-bottom: 1px solid transparent;
    transition: all 0.3s;
    &:after {
      @include tri;
      right: -$triWidth - 10px;
      border-left: $triWidth solid transparent;
      border-right: $triWidth solid $triColor;
    }
    &::before {
      @include tri;
      left: -$triWidth - 10px;
      border-left: $triWidth solid $triColor;
      border-right: $triWidth solid transparent;
    }
    &:visited {
      color: $defaultColor;
    }
    &:hover {
      color: $hoverColor;
      border-top: 1px dashed silver;
      border-bottom: 1px dashed silver;
      &::after {
        opacity: 1;
        right: -$triWidth;
      }
      &::before {
        left: -$triWidth;
        opacity: 1;
      }
    }
    &:active {
      color: $activeColor;
      border-top: 1px solid silver;
      border-bottom: 1px solid silver;
    }
  }
}
.theme--dark {
  .menu {
    a {
      &::after {
        border-right: $triWidth solid #ccc;
      }
      &::before {
        border-left: $triWidth solid #ccc;
      }
    }
  }
}
.nav {
  $linkColor: #666;
  line-height: 2.2;
  background: #eee;
  padding: 0.2em 0.6em;
  display: flex;
  flex-direction: row;
  &__list {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  &__list--right {
    margin-left: auto;
  }
  &__list-item {
    display: inline-block;
    .nav__link {
      padding: 0.2em 0.4em;
      position: relative;
      text-decoration: none;
      transition: all 0.3s;
      color: $linkColor;
      &:visited {
        color: $linkColor;
      }
      &:hover {
        cursor: pointer;
        color: #555;
      }
      &:active {
        color: #444;
        background: #ccc;
        border-radius: 2px;
      }
      &--danger {
        &:active {
          color: #f1f1f1;
          background: crimson;
        }
      }
    }
  }
  &__list-item + &__list-item {
    margin-left: 1em;
  }
}
.dropdown {
  position: relative;
  line-height: 1;

  &__entry {
    &::after {
      content: "▲";
      line-height: 1;
      font-size: 0.8em;

      display: inline-block;
      vertical-align: middle;

      transform-origin: center;
      transition: transform 0.3s;
    }
    &--active::after {
      transform: rotate(180deg);
    }
  }

  .dropdown__menu {
    z-index: 999;
    list-style: none;
    margin: 0;
    padding: 0.4em 0;

    width: 6em;
    line-height: 2.2;
    display: none;
    top: 100%;
    position: absolute;
    background: #fefefe;
    border: 1px solid silver;

    .dropdown__divisor {
      display: block;
      height: 1px;
      background: #eee;
      margin: 0.4em 0;
    }
    .dropdown__link {
      transition: none;
      text-decoration: none;

      color: #666;
      height: 100%;
      display: block;
      padding: 0 0.4em;

      &:hover {
        color: #555;
        cursor: pointer;
        background: #eee;
      }
      &:active {
        color: #444;
        background: #ddd;
        border-radius: 2px;
      }
    }
  }
}
</style>
