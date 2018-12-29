<template>
  <ul v-if="show">
    <li v-for="user in users" :key="user.username">
      <pv-progress :name="user.username" :percent="user.percent" :speed="user.speed"/>
    </li>
  </ul>
</template>

<script>
import pvProgress from "./components/progress.vue";

export default {
  components: {
    pvProgress
  },
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