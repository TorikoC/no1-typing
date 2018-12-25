<template>
  <div class="admin-users">
    <h1>Users</h1>
    <table>
      <thead>
        <tr>
          <th>Username</th>
          <th>Email</th>
          <th>Join Date</th>
          <th>Pratice Count</th>
          <th>Match Count</th>
          <th>Best Pratice Speed</th>
          <th>Best Match Speed</th>
          <th>Last login</th>
          <th>Last login ip</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.username">
          <td>{{ user.username }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.createdAt | formatDate}}</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      users: []
    };
  },
  created() {
    this.getUsers();
  },
  methods: {
    getUsers() {
      this.$axios.get("/users").then(result => {
        this.users = result.data;
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.admin-users {
  width: 80%;
  margin: 1em auto;
  table {
    border-collapse: collapse;
    tr,
    th,
    td {
      border: 1px solid silver;
    }
    th,
    td {
      padding: 0.2em 0.4em;
    }
  }
}
</style>
