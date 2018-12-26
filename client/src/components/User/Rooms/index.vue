<template>
  <div class="rooms">
    <h1>Rooms</h1>
    <p>
      <router-link to="/add/room">Create Room</router-link>
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
  methods: {
    getRooms() {
      this.$axios.get("/rooms").then(result => {
        this.rooms = result.data;
      });
    },
    toJoin(room) {
      if (room.users.length < room.userLimit) {
        this.$router.push(`/rooms/${room._id}`);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.rooms {
  width: 50%;
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
