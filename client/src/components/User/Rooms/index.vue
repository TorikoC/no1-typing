<template>
  <div class="rooms">
    <h1>房间列表</h1>
    <p class="room__create">
      <router-link to="/add/room">创建房间</router-link>
    </p>
    <table>
      <thead>
        <tr>
          <th>id</th>
          <th>Name</th>
          <th>Lang</th>
          <th>Creator</th>
          <th>Users</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="room in rooms" :key="room._id">
          <td>{{ room._id }}</td>
          <td>{{ room.name }}</td>
          <td>{{ room.lang }}</td>
          <td>{{ room.creator }}</td>
          <td>{{ `${room.users.length}/${room.userLimit}` }}</td>
          <td>
            <button @click="toJoin(room)">Join</button>
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
      rooms: []
    };
  },
  created() {
    this.getRooms();
  },
  beforeRouteEnter(from, to, next) {
    if (!window.$user) {
      alert("请先登录");
      next(false);
    } else {
      next();
    }
  },
  methods: {
    getRooms() {
      this.$axios.get("/rooms").then(result => {
        this.rooms = result.data;
      });
    },
    toJoin(room) {
      if (room.users.length < room.userLimit) {
        this.$router.push(`/rooms/${room.lang}/${room._id}`);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.rooms {
  position: relative;
  width: 50%;
  margin: 1em auto;
  table {
    width: 100%;
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
  .room__create {
    text-align: right;
  }
}
</style>