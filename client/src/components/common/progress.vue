<template>
  <div class="progress">
    <div class="progress-name" :title="name">{{ name }}</div>
    <div class="progress-body" ref="body"></div>
    <span class="progress-percent">{{ progress }}%</span>
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
        this.body.classList.remove("progress-body--high");
        this.body.classList.remove("progress-body--middle");
        this.body.classList.add("progress-body--low");
      } else if (value < 75) {
        this.body.classList.remove("progress-body--high");
        this.body.classList.add("progress-body--middle");
        this.body.classList.remove("progress-body--low");
      } else {
        this.body.classList.add("progress-body--high");
        this.body.classList.remove("progress-body--middle");
        this.body.classList.remove("progress-body--low");
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
    }
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
  width: 10%;
  overflow: hidden;
  text-overflow: ellipsis;
}
.progress-body {
  width: 0%;
  transition: all 0.3s;
}
.progress-body--low {
  background: crimson;
}
.progress-body--middle {
  background: orange;
}
.progress-body--high {
  background: green;
}
.progress-percent {
  color: #777;
}
</style>
