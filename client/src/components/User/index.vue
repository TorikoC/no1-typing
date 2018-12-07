<template>
  <div>
    <nav>
      <ul>
        <li>
          <router-link to="/rank">rank</router-link>
        </li>
        <li>
          <router-link to="/about">about</router-link>
        </li>
        <li>
          <router-link to="/feedback">feedback</router-link>
        </li>
      </ul>
    </nav>
    <router-view></router-view>
    <div v-if="$route.fullPath === '/'">
      <!-- custom Index Page -->
      <div>
        <label for="index-radio-cn">中文</label>
        <input type="radio" id="index-radio-cn" name="lang" v-model="lang" value="cn">
        <label for="index-radio-en">English</label>
        <input type="radio" id="index-radio-en" name="lang" v-model="lang" value="en">
      </div>
      <router-link :to="'/pratice/' + lang">pratice</router-link>
      <br>
      <router-link :to="'/match/' + lang">match</router-link>
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

<style>
</style>
