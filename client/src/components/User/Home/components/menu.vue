<template>
  <div class="menu">
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
</template>

<script>
export default {
  data() {
    return {
      lang: "en"
    };
  }
};
</script>

<style lang="scss" scoped>
$triWidth: 8px;
$triColor: #333;

.menu {
  $defaultColor: #ffa500;
  $hoverColor: #e59400;
  $activeColor: #cc8400;

  width: 30% !important;
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
        border-right: $triWidth solid #bbb;
      }
      &::before {
        border-left: $triWidth solid #bbb;
      }
    }
  }
}
</style>
