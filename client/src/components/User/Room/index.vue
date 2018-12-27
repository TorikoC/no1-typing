<template>
  <div class="room" v-if="!loading">
    {{ room.name }}
    <cs-back/>
    <button v-if="isHost" @click="toStart" :disabled="!canStart">start</button>
    <button v-else @click="toPrepare">Prepare</button>
    <platform-en
      :socket="socket"
      :roomId="room._id"
      :roomState="state"
      :current-users="room.users"
      @ready="ready = true"
      @not-ready="ready = false"
      @host-change="toChangeHost"
      @done="state = $roomState.WAITING"
    />
  </div>
</template>

<script>
import platformCn from "./platform/cn";
import platformEn from "./platform/en";

export default {
  components: {
    platformCn,
    platformEn
  },
  props: {
    id: ""
  },
  computed: {
    canStart() {
      return this.state === this.$roomState.WAITING && this.ready;
    }
  },
  data() {
    return {
      room: {},
      socket: null,
      state: this.$roomState.WAITING,
      username: "",

      ready: true,
      isHost: false,

      loading: true
    };
  },
  beforeRouteUpdate(to, from, next) {
    console.log(window.login);
    if (!window.login) {
      alert("login first");
      next(false);
    } else {
      next();
    }
  },
  created() {
    this.username = window.$user.username;
    window.onbeforeunload = () => {
      this.socket.emit("room-leave", this.room._id, window.$user.username);
      this.socket.close();
    };
    this.socket = this.$io.connect(this.$config.server);
    this.toListen(this.socket);
    this.getRoom();
  },
  methods: {
    toStart() {
      this.state = this.$roomState.ONGOING;
      this.socket.emit("room-start", this.room._id);
    },
    toChangeHost(username) {
      if (this.username === username) {
        this.isHost = true;
        console.log(this.isHost);
      }
    },
    toListen(socket) {
      socket.on("connect", () => {
        console.log("socket connected.");
      });
      socket.on("disconnect", reason => {
        console.log(`socket disconnect ${reason}.`);
      });
    },
    toPrepare(username) {
      this.socket.emit("room-prepared", this.room._id, window.$user.username);
    },
    getRoom() {
      this.$axios
        .get(`/rooms/${this.id}`)
        .then(result => {
          this.loading = false;
          this.room = result.data;
          console.log(this.room);
          this.socket.emit("room-join", result.data._id, this.username);
          if (this.room.users[0].username === this.username) {
            this.isHost = true;
          }
        })
        .catch(error => {
          console.log(error);
          this.$router.replace("/rooms");
        });
    }
  },
  destroyed() {
    this.socket.emit("room-leave", this.room._id, window.$user.username);
    this.socket.close();
  }
};
</script>

<style>
</style>
