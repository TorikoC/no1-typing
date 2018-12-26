<template>
  <div class="room">
    {{ room.name }}
    <cs-back/>
    <button @click="toPrepare" :disabled="state === $roomState.ONGOING">Prepare</button>
    <platform-en
      :socket="socket"
      :roomState="state"
      :roomId="room._id"
      @done="state = $roomState.WAITTING"
    />
  </div>
</template>

<script>
import platformCn from "@/components/common/platform-cn.vue";
import platformEn from "@/components/common/platform-en.vue";

export default {
  components: {
    platformCn,
    platformEn
  },
  props: {
    id: ""
  },
  data() {
    return {
      room: {},
      socket: null,
      prepared: false,
      state: this.$roomState.WAITTING
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
    window.onbeforeunload = () => {
      this.socket.emit("leave-room", this.room._id, window.$user.username);
      this.socket.close();
    };
    this.socket = this.$io.connect(this.$config.server);
    this.getRoom();
  },
  methods: {
    toPrepare() {
      this.socket.emit("room-prepare", this.room._id, window.$user.username);
      this.state = this.$roomState.ONGOING;
    },
    getRoom() {
      this.$axios
        .get(`/rooms/${this.id}`)
        .then(result => {
          this.room = result.data;
          this.isCreator = result.data.creator === window.$user.username;
          this.socket.emit("join-room", result.data._id, window.$user.username);
        })
        .catch(error => {
          this.$router.replace("/rooms");
        });
    }
  },
  destroyed() {
    this.socket.emit("leave-room", this.room._id, window.$user.username);
    this.socket.close();
  }
};
</script>

<style>
</style>
