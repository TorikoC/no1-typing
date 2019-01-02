<template>
  <div v-if="!loading" class="admin-snippet">
    <h1>段落</h1>
    <P>在这里对段落进行管理</P>
    <h2>添加段落</h2>
    <form @submit.prevent="submit" class="snippet-form">
      <div class="form-group">
        <label for="book-name">书名:</label>
        <select name="bookId" id="book-name" required>
          <option v-for="book in books" :key="book._id" :value="book._id">{{ book.name }}</option>
        </select>
      </div>
      <div class="form-group">
        <label for="lang">语言</label>
        <select name="lang" id="lang" required>
          <option value="cn">中文</option>
          <option value="en">英文</option>
        </select>
      </div>
      <div class="form-group">
        <label for="content">内容:</label>
        <textarea name="content" id="content" cols="30" rows="10" required></textarea>
      </div>
      <div class="form-group">
        <label for></label>
        <button type="submit" class="snippet-form__button">添加</button>
      </div>
    </form>
    <h2>段落列表</h2>
    <table>
      <thead>
        <tr>
          <th>Book Id</th>
          <th>语言</th>
          <th>内容</th>
          <th>长度</th>
          <th>创建时间</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(snippet, index) in snippets" :key="snippet._id">
          <td>{{ snippet.bookId }}</td>
          <td>{{ snippet.lang }}</td>
          <td :title="snippet.content">{{ snippet.content }}</td>
          <td>{{ snippet.length }}</td>
          <td>{{ snippet.createdAt | formatDate }}</td>
          <td>
            <button @click="detailIndex = index">详情</button>
            <button @click="del(snippet._id, index)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
    <h2>段落详情</h2>
    <div v-if="snippets[detailIndex]">
      <dl>
        <dt>书ID</dt>
        <dd>{{ snippets[detailIndex].bookId }}</dd>
        <dt>语言</dt>
        <dd>{{ snippets[detailIndex].lang }}</dd>
        <dt>内容</dt>
        <dd>{{ snippets[detailIndex].content }}</dd>
        <dt>长度</dt>
        <dd>{{ snippets[detailIndex].length }}</dd>
        <dt>创建时间</dt>
        <dd>{{ snippets[detailIndex].createdAt | formatDate }}</dd>
      </dl>
    </div>
  </div>
</template>

<script>
export default {
  watch: {
    type(value) {
      this.getBooks();
    }
  },
  data() {
    return {
      loading: true,
      books: [],
      detailIndex: 0,
      snippets: []
    };
  },
  mounted() {
    this.getBooks();
    this.getSnippets();
  },
  methods: {
    submit(evt) {
      const formData = new FormData(evt.target);
      formData.append("length", formData.get("content").length);
      this.$axios.post(`/snippets`, formData).then(resp => {
        this.snippets.push(resp.data);
        evt.target.reset();
      });
    },
    getBooks() {
      this.$axios.get(`/books`).then(resp => {
        this.books = resp.data;
      });
    },
    getSnippets() {
      this.$axios.get(`/snippets`).then(resp => {
        this.snippets = resp.data;
        this.loading = false;
      });
    },
    del(id, index) {
      this.$axios.delete(`/snippets/${id}`).then(() => {
        this.snippets.splice(index, 1);
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.admin-snippet {
  width: 90%;
  margin: 1em auto;
  .form-group {
    display: flex;
    flex-direction: row;
    label {
      width: 20%;
      align-self: flex-start;
    }
    input,
    button,
    select,
    textarea {
      width: 100%;
    }
    textarea {
      resize: vertical;
    }
  }
  .form-group + .form-group {
    margin-top: 0.6em;
  }
  table {
    width: 100%;
    table-layout: fixed;
    td {
      text-overflow: ellipsis;
      overflow: hidden;

      text-align: center;
    }
  }
  dd {
    word-wrap: break-word;
  }
}

@media screen and (min-width: 640px) {
  .admin-snippet {
    width: 50%;
  }
}
</style>