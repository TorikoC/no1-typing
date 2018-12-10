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
      </ul>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
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
