<template>
  <div class="index">
    <nav class="nav">
      <ul>
        <li>
          <router-link to="/rank">排行</router-link>
        </li>
        <li>
          <router-link to="/about">关于</router-link>
        </li>
        <li>
          <router-link to="/feedback">反馈</router-link>
        </li>
      </ul>
    </nav>
    <router-view></router-view>
    <div v-if="$route.fullPath === '/'" class="entry">
      <!-- custom Index Page -->
      <div class="entry__mode">
        <fieldset>
          <legend>语言</legend>
          <label for="index-radio-cn">中文</label>
          <input type="radio" id="index-radio-cn" name="lang" v-model="lang" value="cn">
          <label for="index-radio-en">English</label>
          <input type="radio" id="index-radio-en" name="lang" v-model="lang" value="en">
        </fieldset>
      </div>
      <router-link :to="'/pratice/' + lang">练习</router-link>
      <router-link :to="'/match/' + lang">匹配</router-link>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      lang: "cn"
    };
  }
};
</script>

<style lang="scss" scoped>
.index {
  height: 100%;
  position: relative;
}
.entry {
  position: relative;
  display: block;
  width: 30%;
  margin: 2em auto;
  $linkColor: orange;
  .entry__mode {
    color: #333;
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
  }
  a:visited {
    color: $linkColor;
  }
  a:hover {
    color: darken($color: $linkColor, $amount: 10);
  }
  $triWidth: 10px;
  a:hover::after {
    content: "";
    display: inline-block;
    position: absolute;
    right: -$triWidth;
    top: 50%;
    transform: translateY(-50%);
    // border: 10px solid black;
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
    // border: 10px solid black;
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
    color: darken($color: $linkColor, $amount: 10);
  }
  a:active {
    color: darken($color: $linkColor, $amount: 20);
  }
}
</style>
