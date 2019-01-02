<template>
  <div v-if="!loading" class="admin-books">
    <h1>书籍</h1>
    <h2>添加书籍</h2>
    <form class="book-form" @submit.prevent="submit">
      <div class="form-group">
        <label for="name">书名:</label>
        <input type="text" name="name" id="name" required autofocus>
      </div>
      <div class="form-group">
        <label for="author">作者:</label>
        <input type="text" name="author" id="author" required>
      </div>
      <div class="form-group">
        <label for="cover">封面</label>
        <input type="text" name="cover" id="cover">
      </div>
      <div class="form-group">
        <label for="isbn">isbn(optional)</label>
        <input type="text" name="isbn" id="isbn">
      </div>
      <div class="form-group">
        <label for></label>
        <button type="submit">提交</button>
      </div>
    </form>
    <h2>书籍列表</h2>
    <table>
      <thead>
        <tr>
          <th>名字</th>
          <th>作者</th>
          <th>封面</th>
          <th>创建时间</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(book, index) in books" :key="book._id">
          <td>{{ book.name }}</td>
          <td>{{ book.author }}</td>
          <td>
            <a :href="book.cover" target="_blank">封面</a>
          </td>
          <td>{{ book.createdAt | formatDate }}</td>
          <td>
            <button @click="del(book._id, index)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
      books: []
    };
  },
  mounted() {
    this.getBooks();
  },
  methods: {
    submit(evt) {
      const formData = new FormData(evt.target);
      this.$axios.post(`/books`, formData).then(resp => {
        this.books.push(resp.data);
      });
    },
    getBooks() {
      this.$axios.get(`/books`).then(resp => {
        this.books = resp.data;
        this.loading = false;
      });
    },
    del(id, index) {
      this.$axios.delete(`/books/${id}`).then(result => {
        this.books.splice(index, 1);
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.admin-books {
  width: 50%;
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
    td {
      text-align: center;
    }
  }
}
</style>
