<template>
  <span class="wpm">
    wpm
    <span class="wpm__tooltip">中文按字符计算, 英文按单词计算.</span>
  </span>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.wpm {
  color: inherit;
  font-family: consolas, monospace;
  display: inline-block;
  position: relative;
  line-height: 1.6;
  font-size: 0.8em;
  &:hover {
    cursor: help;
    .wpm__tooltip {
      display: inline-block;
      opacity: 1;
    }
  }
  &__tooltip {
    z-index: 999;
    font-size: 0.8em;
    line-height: 1.2;
    text-align: left;

    position: absolute;

    height: auto;
    width: 8em;

    top: -3.44em;
    left: -50%;
    color: 333;

    border-radius: 2px;
    background: #ddd;
    padding: 0.4em;
    transition: all 0.3s;

    opacity: 0;
    display: none;
    &::after {
      content: "";
      position: absolute;
      display: inline-block;
      top: 100%;
      left: 20%;
      border-top: 0.4em solid #ddd;
      border-left: 0.4em solid transparent;
      border-bottom: 0.4em solid transparent;
      border-right: 0.4em solid transparent;
    }
  }
}
</style>
