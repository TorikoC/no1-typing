<template>
  <ul v-if="show">
    <li v-for="user in users" :key="user.username">
      <cs-progress :name="user.username" :percent="user.percent" :speed="user.speed"/>
    </li>
  </ul>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: true
    },
    users: {
      type: Array,
      default: []
    }
  }
};
</script>