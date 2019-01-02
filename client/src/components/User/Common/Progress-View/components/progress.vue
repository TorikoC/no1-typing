<template>
  <div class="progress">
    <div class="progress__name" :title="name">{{ name }}</div>
    <div class="progress__body-wrapper">
      <div class="progress__body" ref="body">{{ percent }}%</div>
    </div>
    <span class="progress__speed">
      {{ speed }}
      <cs-wpm/>
    </span>
  </div>
</template>

<script>
export default {
  watch: {
    percent(value) {
      if (!this.body) {
        return;
      }
      this.body.style.width = value + "%";
      if (value < 25) {
        this.body.classList.add("progress__body--low");
        this.body.classList.remove("progress__body--high");
        this.body.classList.remove("progress__body--middle");
        this.body.classList.remove("progress__body--complete");
      } else if (value < 50) {
        this.body.classList.add("progress__body--middle");
        this.body.classList.remove("progress__body--high");
        this.body.classList.remove("progress__body--low");
        this.body.classList.remove("progress__body--complete");
      } else if (value < 100) {
        this.body.classList.add("progress__body--high");
        this.body.classList.remove("progress__body--middle");
        this.body.classList.remove("progress__body--low");
        this.body.classList.remove("progress__body--complete");
      } else {
        this.body.classList.add("progress__body--complete");
        this.body.classList.remove("progress__body--high");
        this.body.classList.remove("progress__body--middle");
        this.body.classList.remove("progress__body--low");
      }
    }
  },
  data() {
    return {
      body: null
    };
  },
  props: {
    lang: {
      type: String,
      default: "cn"
    },
    name: {
      type: String
    },
    percent: {},
    speed: {}
  },
  mounted() {
    this.body = this.$refs["body"];
  }
};
</script>
<style lang="scss" scoped>
$lowColor: crimson;
$middleColor: orange;
$highColor: orange;
$completeColor: green;

.progress__body {
  border-left: 1px solid silver;
  width: 0%;
  height: 1.4em;
  transition: all 0.3s;
  color: snow;
  font-size: 0.8em;
  &--low {
    background: $lowColor;
  }
  &--middle {
    background: $middleColor;
  }
  &--high {
    background: $highColor;
  }
  &--complete {
    background: $completeColor;
  }
}

@media screen and (min-width: 640px) {
  .progress {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;

    &__name {
      width: 6em;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    &__body-wrapper {
      flex: 1;
    }
    &__speed {
      width: 6em;
      color: #777;
      margin-left: auto;
      text-align: right;
    }
  }
}
</style>
