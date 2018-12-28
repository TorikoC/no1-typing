<template>
  <dl>
    <dt>Speed</dt>
    <dd>{{ record.speed }}</dd>
    <dt>Time</dt>
    <dd>{{ record.time | formatTime }}</dd>
    <dt>Snippet</dt>
    <dd>
      <div class="source">
        <div class="source__cover">
          <img :src="record.cover" alt="source cover">
        </div>
        <div class="source__name">
          {{ record.name }}
          <br>
          <small>by {{ record.author }}</small>
        </div>
      </div>
    </dd>
  </dl>
</template>

<script>
export default {
  props: {
    record: {
      type: Object,
      required: true
    }
  }
};
</script>

<style>
</style>
