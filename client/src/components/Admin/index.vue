<template>
  <div>
    <nav>
      <ul>
        <li>
          <router-link to="/admin/books">books</router-link>
        </li>
        <li>
          <router-link to="/admin/snippets">snippets</router-link>
        </li>
      </ul>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script>
export default {};
</script>

<style>
</style>
