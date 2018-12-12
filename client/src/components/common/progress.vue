<template>
  <div class="progress">
    <div class="progress-name" :title="name">{{ name }}</div>
    <div class="progress-body" ref="body"></div>
    <span class="progress-percent">{{ progress }}%</span>
    <span class="progress-speed">{{ speed }} 字/分钟</span>
  </div>
</template>

<script>
export default {
  watch: {
    progress(value) {
      if (!this.body) {
        return;
      }
      this.body.style.width = value + "%";
      if (value < 25) {
        this.body.classList.add("progress-body--low");
        this.body.classList.remove("progress-body--high");
        this.body.classList.remove("progress-body--middle");
        this.body.classList.remove("progress-body--complete");
      } else if (value < 50) {
        this.body.classList.add("progress-body--middle");
        this.body.classList.remove("progress-body--high");
        this.body.classList.remove("progress-body--low");
        this.body.classList.remove("progress-body--complete");
      } else if (value < 100) {
        this.body.classList.add("progress-body--high");
        this.body.classList.remove("progress-body--middle");
        this.body.classList.remove("progress-body--low");
        this.body.classList.remove("progress-body--complete");
      } else {
        this.body.classList.remove("progress-body--high");
        this.body.classList.remove("progress-body--middle");
        this.body.classList.remove("progress-body--low");
        this.body.classList.add("progress-body--complete");
      }
    }
  },
  data() {
    return {
      percent: 0,
      body: null
    };
  },
  props: {
    name: {
      type: String
    },
    progress: {
      type: Number
    },
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
.progress-name {
  width: 6em;
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
.progress-body {
  border-left: 1px solid silver;
  width: 0%;
  height: 1.4em;
  transition: all 0.3s;
}
.progress-body--low {
  background: crimson;
}
.progress-body--middle {
  background: gold;
}
.progress-body--high {
  background: orange;
}
.progress-body--complete {
  background: green;
}
.progress-percent {
  color: #777;
}
.progress-speed {
  flex-shrink: 0;
  width: 8em;
  color: #777;
  margin-left: auto;
  text-align: right;
}
</style>
