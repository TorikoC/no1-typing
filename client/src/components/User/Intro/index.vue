<template>
  <div class="intro">
    <cs-back/>
    <h1>介绍</h1>
    <dl class="dl">
      <dt>WPM</dt>
      <dd>
        <p>Words Per Minute</p>
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
      <dd>
        <p>用户可以创建和加入房间。</p>
        <p>最后一名用户离开房间后，房间会自动删除。</p>
      </dd>
      <dt>主题</dt>
      <dd>目前有 light 和 dark 两种主题。</dd>
    </dl>
  </div>
</template>

<script>
import Pager from "@/components/User/Common/Pager";
export default {
  data() {
    return {
      total: 10,
      page: 1
    };
  },
  components: {
    Pager
  },
  methods: {
    toChange(index) {
      this.page = index;
    }
  }
};
</script>