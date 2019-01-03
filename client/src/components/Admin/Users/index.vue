<template>
  <div class="admin-users">
    <h1>Users</h1>
    <table class="table">
      <thead>
        <tr>
          <th>Username</th>
          <th>Email</th>
          <th>Join Date</th>
          <th>Play Count</th>
          <th>Last login</th>
          <th>Last login ip</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in users" :key="u.username">
          <td>{{ u.username }}</td>
          <td>{{ u.email }}</td>
          <td>{{ u.createdAt | formatDate}}</td>
          <td></td>
          <td>{{ u.lastLoginTime | formatDate }}</td>
          <td>{{ u.lastLoginIp }}</td>
          <td>
            <button class="button button--danger" @click.prevent="toDel(u._id)">Del</button>
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
      users: [],
      deleting: false
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
    },
    toDel(id) {
      if (this.deleting) {
        return;
      }
      this.deleting = true;
      this.$axios.delete(`/users/${id}`).then(resp => {
        this.deleting = false;
        let idx = this.users.findIndex(user => user._id === id);
        if (~idx) {
          this.users.splice(idx, 1);
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.admin-users {
  width: 80%;
  
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
