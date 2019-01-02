<template>
  <div class="intro">
    <h1>介绍</h1>
    <dl class="dl">
      <dt>WPM</dt>
      <dd>
        <p>Word Per Minute</p>
        <p>中文以字符为单位计算，英文以单词为单位计算。</p>
      </dd>
      <dt>练习模式</dt>
      <dd>
        <p>游客和登录用户都能进行。</p>
        <p>未登录用户的记录将以用户名"guest"保存。</p>
      </dd>
      <dt>匹配模式</dt>
      <dd>
        <p>游客和登录用户都能进行。</p>
        <p>与任意的在线用户进行匹配，自动开始。</p>
      </dd>
      <dt>房间(需要登录)</dt>
      <dd>登录用户可以创建和加入房间。</dd>
    </dl>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.intro {
  width: 50%;
  margin: 1em auto;
}
</style>
