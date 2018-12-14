<template>
  <div class="progress">
    <div class="progress__name" :title="name">{{ name }}</div>
    <div class="progress__body" ref="body"></div>
    <span class="progress__percent">{{ percent }}%</span>
    <span class="progress__speed">{{ speed }} 字/分钟</span>
  </div>
</template>

<script>
export default {
  watch: {
    percent(value) {
      console.log(value);
      if (!this.body) {
        return;
      }
      console.log(value);
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
.progress {
  display: flex;
  flex-direction: row;
  color: #333;
}
.progress__name {
  width: 6em;
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
.progress__body {
  border-left: 1px solid silver;
  width: 0%;
  height: 1.4em;
  transition: all 0.3s;
}
.progress__body--low {
  background: crimson;
}
.progress__body--middle {
  background: gold;
}
.progress__body--high {
  background: orange;
}
.progress__body--complete {
  background: green;
}
.progress__percent {
  color: #777;
}
.progress__speed {
  flex-shrink: 0;
  width: 8em;
  color: #777;
  margin-left: auto;
  text-align: right;
}
</style>
