<template>
  <div @click="hideDropdown">
    <nav class="nav">
      <ul class="nav__list">
        <li class="nav__list-item">
          <router-link class="nav__link" to="/">练习</router-link>
        </li>
        <li class="nav__list-item">
          <router-link class="nav__link" to="/rooms">房间</router-link>
        </li>
        <li class="nav__list-item">
          <router-link class="nav__link" to="/rank">排行榜</router-link>
        </li>
        <li class="dropdown nav__list-item" @click="toggleDropdown">
          <span class="nav__link">帮助</span>
          <ul class="dropdown__menu">
            <li class="dropdown__item">
              <router-link class="dropdown__link" to="/feedback">反馈</router-link>
            </li>
            <li class="dropdown__item">
              <router-link class="dropdown__link" to="/about">关于</router-link>
            </li>
          </ul>
        </li>
      </ul>
      <ul v-if="user" class="nav__list nav__list--right">
        <li class="nav__list-item">
          <router-link class="nav__link" :to="'/profile/' + user.username">{{ user.username }}</router-link>
        </li>
        <li class="nav__list-item">
          <a href="#" class="nav__link" @click="toLogout">退出</a>
        </li>
      </ul>
      <ul v-else class="nav__list nav__list--right">
        <li class="nav__list-item">
          <router-link class="nav__link" to="/login">登录</router-link>
        </li>
      </ul>
    </nav>
    <router-view></router-view>
    <div v-if="$route.fullPath === '/'" class="menu">
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
.menu {
  $defaultColor: #ffa500;
  $hoverColor: #e59400;
  $activeColor: #cc8400;

  width: 30%;
  display: block;
  position: relative;
  margin: 1em auto;

  .menu__mode {
    margin-bottom: 1em;
  }

  $triWidth: 8px;
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
    border-top: 1px solid #fff;
    border-bottom: 1px solid #fff;
    transition: all 0.3s;
    &:after {
      @include tri;
      right: -$triWidth - 10px;
      border-left: $triWidth solid transparent;
      border-right: $triWidth solid black;
    }
    &::before {
      @include tri;
      left: -$triWidth - 10px;
      border-left: $triWidth solid black;
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
.nav {
  $linkColor: #666;
  line-height: 2.2;
  background: #eee;
  padding: 0.2em 0.6em;
  display: flex;
  flex-direction: row;
  .nav__list {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .nav__list--right {
    margin-left: auto;
  }
  .nav__list-item {
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
    }
  }
  .nav__list-item + .nav__list-item {
    margin-left: 1em;
  }
}
.dropdown {
  position: relative;
  .dropdown__menu {
    list-style: none;

    margin: 0;
    padding: 0.4em 0;

    width: 6em;
    display: none;
    position: absolute;
    background: #fefefe;
    border: 1px solid silver;

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
