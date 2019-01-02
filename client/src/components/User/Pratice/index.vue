<template>
  <div class="pratice">
    <cs-back/>
    <div class="pratice__header">
      <h1>练习模式</h1>
    </div>
    <div class="pratice__control">
      <button
        class="pratice__start button"
        v-if="state === WAITING && !loadingSnippet"
        @click="toStart"
      >Start</button>
      <span class="pratice__clock" v-if="state === COUNTING">倒计时 {{ clock }}</span>
      <span v-if="state === ONGOING">进行中</span>
    </div>
    <progress-view :users="users"/>
    <component
      :is="'platform-' + lang"
      :disabled="platformDisabled"
      :text="snippet.content"
      :loading="loadingSnippet"
      @complete="toComplete"
      @match="toMatch"
    />
    <cs-loading v-if="loadingBook || loadingRecords"/>
    <result-view
      v-else-if="state === WAITING && !fresh"
      :record="record"
      :book="book"
      :bestRecords="bestRecords"
    />
  </div>
</template>

<script>
import PlatformCn from "@/components/User/Common/Platform/cn";
import PlatformEn from "@/components/User/Common/Platform/en";
import ResultView from "@/components/User/Common/Result-View/index";
import ProgressView from "@/components/User/Common/Progress-View/index";

export default {
  props: {
    lang: {
      type: String,
      required: true
    }
  },
  components: {
    PlatformEn,
    PlatformCn,
    ResultView,
    ProgressView
  },
  data() {
    return {
      WAITING: 0,
      COUNTING: 1,
      ONGOING: 2,
      state: 0,

      clock: 5,

      snippet: {},

      record: {},
      bestRecords: [],
      book: {},

      users: [
        {
          username: window.$user ? window.$user.username : "游客",
          speed: 0,
          percent: 0
        }
      ],

      fresh: true,

      platformDisabled: true,

      loadingBook: false,
      loadingRecords: false,
      loadingSnippet: false
    };
  },
  mounted() {
    this.getSnippet(this.fresh);
  },
  methods: {
    getSnippet(fresh) {
      if (this.loadingSnippet) {
        return;
      }
      this.loadingSnippet = true;
      this.$axios.get(`/random-snippet?lang=${this.lang}`).then(result => {
        this.snippet = result.data[0];
        this.loadingSnippet = false;
        if (!fresh) {
          this.state = this.COUNTING;
          this.countdown();
        }
      });
    },
    toStart() {
      this.resetUsers(this.users);

      if (this.fresh) {
        this.state = this.COUNTING;
        this.countdown();
      } else {
        this.getSnippet(this.fresh);
      }
    },
    toMatch(progress) {
      this.users[0] = Object.assign(this.users[0], progress);
    },
    toComplete(data) {
      this.platformDisabled = true;
      this.postRecord(data);

      if (this.fresh) {
        this.fresh = false;
      }

      this.clock = 5;

      this.state = this.WAITING;

      this.record = data;
      this.getBook(this.snippet.bookId);
      this.getRecords(this.snippet._id);
    },
    getBook(id) {
      if (this.loadingBook) {
        return;
      }
      this.loadingBook = true;
      this.$axios.get(`/books/${id}`).then(result => {
        this.book = result.data;
        this.loadingBook = false;
      });
    },
    getRecords(id) {
      if (this.loadingRecords) {
        return;
      }
      this.loadingRecords = true;
      this.$axios
        .get(`/records?snippetId=${id}&lang=${this.lang}`)
        .then(resp => {
          this.bestRecords = resp.data;
          this.loadingRecords = false;
        });
    },
    postRecord(data) {
      const formData = new FormData();
      formData.append(
        "username",
        window.$user ? window.$user.username : "guest"
      );
      formData.append("mode", "pratice");
      formData.append("lang", this.lang);
      formData.append("time", data.time);
      formData.append("speed", data.speed);
      formData.append("snippetId", this.snippet._id);

      this.$axios.post("/records", formData);
    },
    resetUsers(users) {
      this.users = users.map(user => {
        return {
          username: user.username,
          speed: 0,
          percent: 0
        };
      });
    },
    countdown() {
      this.clock -= 1;
      if (this.clock > 0) {
        setTimeout(() => {
          this.countdown();
        }, 1000);
      } else {
        this.state = this.ONGOING;
        this.platformDisabled = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.pratice {
  width: 50%;
  margin: 1em auto;
  position: relative;

  &__control {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
  }
  &__clock {
    font-size: 2em;
  }
}
</style>
