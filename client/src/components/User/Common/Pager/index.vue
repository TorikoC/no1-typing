<template>
  <div class="pager-wrapper">
    <div class="pager" @click="toPage">
      <span
        class="pager__item"
        v-for="i in pages"
        :key="i"
        :class="active === i ? 'pager__item--active' : ''"
        :data-index="i"
      >{{ i }}</span>
    </div>
    <span class="pager__info">总页数:{{this.total }}</span>
  </div>
</template>

<script>
export default {
  computed: {
    pages() {
      let result = [];
      if (this.total < 5) {
        for (let i = 1; i <= this.total; i += 1) {
          result.push(i);
        }
        return result;
      }
      if (this.active > 2 && this.active < this.total - 2) {
        for (let i = this.active - 2; i <= this.active + 2; i += 1) {
          result.push(i);
        }
        return result;
      }
      if (this.active <= 2) {
        return [1, 2, 3, 4, 5];
      }
      if (this.active >= this.total - 2) {
        for (let i = this.total - 4; i <= this.total; i += 1) {
          result.push(i);
        }
        return result;
      }
    }
  },
  props: {
    total: {
      type: Number,
      required: true
    },
    active: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      page: 1
    };
  },
  methods: {
    toPage(evt) {
      let index = +evt.target.getAttribute("data-index");
      this.$emit("change", index);
    }
  }
};
</script>

<style lang="scss" scoped>
.pager-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  .pager__info {
    font-size: 0.8em;
    color: #333;
    align-self: flex-end;
  }
}
.pager {
  align-self: flex-end;
  display: flex;
  flex-direction: row;
  flex-flow: row;
  &__item {
    border: 1px solid silver;
    padding: 0.2em 0.4em;
    color: #666;
    &:hover {
      cursor: pointer;
      color: #333;
    }
    &--active {
      color: orange;
      &:hover {
        color: orange;
      }
    }
  }
}
.theme--dark {
  .pager__info {
    color: #bbb;
  }
  .pager {
    &__item {
      &:hover {
        color: #bbb;
      }
    }
  }
}
</style>
