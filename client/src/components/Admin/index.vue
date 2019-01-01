<template>
  <div>
    <nav class="nav">
      <ul>
        <li>
          <router-link to="/admin/books">书籍</router-link>
        </li>
        <li>
          <router-link to="/admin/snippets">段落</router-link>
        </li>
        <li>
          <router-link to="/admin/users">用户</router-link>
        </li>
        <li class="nav-link--right">
          <router-link to="/">用户主页</router-link>
        </li>
      </ul>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  beforeRouteEnter(to, from, next) {
    if (!window.$user || !window.$user.isAdmin) {
      next(false);
    } else {
      next();
    }
  }
};
</script>

<style lang="scss" scoped>
.nav {
  $linkColor: #666;
  line-height: 2.2;
  background: #eee;
  padding: 0.2em 0.6em;
  ul {
    width: 100%;
    display: flex;
    flex-direction: row;
  }
  ul,
  li {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  li + li {
    margin-left: 1em;
  }
  .nav-link--right {
    margin-left: auto;
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
