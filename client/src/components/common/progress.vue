<template>
  <div class="progress">
    <div class="progress-name" :title="name">{{ name }}</div>
    <div class="progress-body"></div>
    <span class="progress-percent">{{ percent }}%</span>
  </div>
</template>

<script>
export default {
  watch: {
    current(value) {
      if (!this.body) {
        return;
      }
      this.percent = Math.floor((value / this.total) * 100);
      this.body.style.width = this.percent + "%";
      if (this.percent < 25) {
        this.body.classList.remove("progress-body--high");
        this.body.classList.remove("progress-body--middle");
        this.body.classList.add("progress-body--low");
      } else if (this.percent < 75) {
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
    total: {
      type: Number
    },
    current: {
      type: Number
    }
  },
  mounted() {
    this.body = document.getElementsByClassName("progress-body")[0];
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
</style>
